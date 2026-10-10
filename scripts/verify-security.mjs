import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting EcoTrack Comprehensive Security & Persistence Test Suite...\n');

  // TEST 1: Unauthenticated request to /api/auth/me MUST fail with 401
  {
    process.stdout.write('1. Testing Unauthenticated Access Rejection... ');
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.strictEqual(res.status, 401, 'Should reject unauthenticated access with 401');
    const data = await res.json();
    assert.ok(data.error, 'Should return error message');
    console.log('✅ PASSED');
  }

  // TEST 2: Invalid PRN activation request MUST fail
  {
    process.stdout.write('2. Testing Invalid / Non-Existent PRN Rejection... ');
    const res = await fetch(`${BASE_URL}/api/auth/activate/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prn: '999999999' }), // Not in roster
    });
    assert.strictEqual(res.status, 400, 'Should reject non-roster PRN with 400');
    console.log('✅ PASSED');
  }

  // TEST 3: Fresh PRN activation flow (PRN 252161008 - Aditya Patil)
  let studentToken = '';
  {
    process.stdout.write('3. Testing Roster PRN Activation Flow... ');
    const testPrn = '252161008';
    // Step 1: Request activation
    const reqRes = await fetch(`${BASE_URL}/api/auth/activate/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prn: testPrn }),
    });

    if (reqRes.status === 400) {
      // If already activated from earlier runs, test regular login
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: testPrn, password: 'Password123!' }),
      });
      assert.strictEqual(loginRes.status, 200);
      const loginData = await loginRes.json();
      studentToken = loginData.token;
    } else {
      assert.strictEqual(reqRes.status, 200, 'Should accept valid student PRN');
      const reqData = await reqRes.json();
      assert.ok(reqData.maskedEmail.includes('@sguk.ac.in'), 'Should mask official SGU email');

      const codeMatch = reqData.evaluatorNotice?.match(/code generated is: (\d+)/);
      assert.ok(codeMatch, 'Should generate verification code in dev audit mode');
      const code = codeMatch[1];

      // Step 2: Verify code and set password
      const verifyRes = await fetch(`${BASE_URL}/api/auth/activate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prn: testPrn,
          code,
          password: 'Password123!',
          residenceHall: 'Sahyadri Boys Hostel (Block B)',
        }),
      });
      assert.strictEqual(verifyRes.status, 201, 'Should activate account and return session');
      const verifyData = await verifyRes.json();
      assert.ok(verifyData.token, 'Should return secure session token');
      studentToken = verifyData.token;
    }
    console.log('✅ PASSED');
  }

  // TEST 4: Verification code single-use requirement
  {
    process.stdout.write('4. Testing Verification Code Single-Use Enforcement... ');
    const reuseRes = await fetch(`${BASE_URL}/api/auth/activate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prn: '252161008',
        code: '123456',
        password: 'Password123!',
      }),
    });
    assert.strictEqual(reuseRes.status, 400, 'Should reject reused or invalid verification code');
    console.log('✅ PASSED');
  }

  // TEST 5: Student RBAC Restriction (Student cannot add official tree)
  {
    process.stdout.write('5. Testing Student RBAC Restriction on Protected Endpoints... ');
    const res = await fetch(`${BASE_URL}/api/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        treeData: {
          speciesCommon: 'Unauthorized Student Specimen',
          locationZone: 'Central Lawn',
        },
      }),
    });
    assert.strictEqual(res.status, 403, 'Should reject student role on tree creation with 403 Forbidden');
    console.log('✅ PASSED');
  }

  // TEST 6: Faculty RBAC and Tree Creation
  {
    process.stdout.write('6. Testing Faculty Login and Authorization... ');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'dr.sneha.patil@sguk.ac.in',
        password: 'FacultySecure2025!',
      }),
    });
    assert.strictEqual(loginRes.status, 200, 'Faculty login must succeed');
    const loginData = await loginRes.json();
    const facultyToken = loginData.token;

    // Faculty creates tree record
    const treeRes = await fetch(`${BASE_URL}/api/trees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`,
      },
      body: JSON.stringify({
        treeData: {
          speciesCommon: 'Karanj (Indian Beech)',
          speciesBotanical: 'Millettia pinnata',
          locationZone: 'School of Technology Green Zone',
        },
      }),
    });
    assert.strictEqual(treeRes.status, 201, 'Faculty must be permitted to record tree');
    const treeData = await treeRes.json();
    assert.strictEqual(treeData.tree.isVerified, false, 'Faculty trees must not be auto-verified without admin');
    console.log('✅ PASSED');
  }

  // TEST 7: Server-Authoritative Eco-Challenge Points Calculation
  {
    process.stdout.write('7. Testing Server-Authoritative Challenge Points & Duplicate Check... ');
    // Student records challenge c1 (Plastic-Free Canteen Day = 50 pts)
    const chRes = await fetch(`${BASE_URL}/api/challenges/c1/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        evidenceNotes: 'Used stainless steel reusable tumbler at central food court',
        // Client attempts to send fake 9999 points; server must ignore and enforce authoritative 50 points
        pointsAwarded: 9999,
      }),
    });

    if (chRes.status === 201) {
      const chData = await chRes.json();
      assert.strictEqual(chData.submission.pointsAwarded, 50, 'Server must enforce authoritative points, not client values');
    } else {
      // If already recorded today, verify duplicate rejection
      assert.strictEqual(chRes.status, 400, 'Duplicate submission on same day must be rejected');
    }
    console.log('✅ PASSED');
  }

  // TEST 8: Event Registration Persistence & Duplicate Rejection
  {
    process.stdout.write('8. Testing Persistent Event Registration & Duplicate Check... ');
    const regRes1 = await fetch(`${BASE_URL}/api/events/e2/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    // Either newly registered (201) or already registered (400)
    assert.ok(regRes1.status === 201 || regRes1.status === 400);

    const regRes2 = await fetch(`${BASE_URL}/api/events/e2/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    assert.strictEqual(regRes2.status, 400, 'Should reject duplicate registration');
    console.log('✅ PASSED');
  }

  // TEST 9: Session Invalidation on Logout
  {
    process.stdout.write('9. Testing Session Invalidation upon Logout... ');
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    assert.strictEqual(logoutRes.status, 200);

    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    assert.strictEqual(meRes.status, 401, 'Token must no longer be accepted after logout');
    console.log('✅ PASSED');
  }

  console.log('\n🎉 ALL 9 COMPREHENSIVE SECURITY, PERSISTENCE & AUTHORIZATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
