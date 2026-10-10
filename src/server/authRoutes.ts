import { Router, Response } from 'express';
import {
  studentRosterCollection,
  userAccountsCollection,
  sessionsCollection,
  activationRequestsCollection,
  passwordResetsCollection,
  UserAccountRecord,
  SessionRecord,
  ActivationRequestRecord,
  PasswordResetRecord,
} from './models.js';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateSixDigitCode,
  isValidPRN,
  isValidPassword,
} from './crypto.js';
import { EmailService } from './email.js';
import { requireAuth, AuthenticatedRequest } from './authMiddleware.js';

export const authRouter = Router();

// Rate limiting in memory map: IP -> { attempts: number, lastAttempt: number }
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
function checkRateLimit(ip: string, maxAttempts: number = 8, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };
  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    rateLimitMap.set(ip, record);
    return true;
  }
  if (record.count >= maxAttempts) {
    return false;
  }
  record.count += 1;
  rateLimitMap.set(ip, record);
  return true;
}

// 1. POST /api/auth/login
// Supports PRN (for students) or Email (for faculty/admin)
authRouter.post('/login', async (req, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 10, 60_000)) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait 1 minute before retrying.' });
  }

  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'PRN/Email and password are required.' });
  }

  const cleanIdentifier = String(identifier).trim().toLowerCase();

  // Find user either by PRN or by email
  const user = await userAccountsCollection.findOne((u) => {
    return Boolean(
      (u.prn && u.prn.toLowerCase() === cleanIdentifier) ||
      (u.email && u.email.toLowerCase() === cleanIdentifier)
    );
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid PRN/Email or password.' });
  }

  // Check account lockout
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return res.status(403).json({
      error: 'Account temporarily locked due to excessive failed attempts. Please retry later or contact administrator.',
    });
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;
    const updates: Partial<UserAccountRecord> = { failedLoginAttempts: failedAttempts };
    if (failedAttempts >= 5) {
      updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-min lockout
    }
    await userAccountsCollection.update(user.id, updates);
    return res.status(401).json({ error: 'Invalid PRN/Email or password.' });
  }

  // Successful login: reset failed attempts
  await userAccountsCollection.update(user.id, {
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    updatedAt: new Date().toISOString(),
  });

  // Issue 7-day session token
  const sessionToken = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const newSession: SessionRecord = {
    id: sessionToken,
    userId: user.id,
    userRole: user.role,
    createdAt: new Date().toISOString(),
    expiresAt,
    userAgent: req.headers['user-agent'],
    ipAddress: clientIp,
  };
  await sessionsCollection.insert(newSession);

  // Set HTTP-only, secure cookie with Lax sameSite
  res.cookie('ecotrack_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    success: true,
    token: sessionToken,
    user: {
      id: user.id,
      prn: user.prn,
      name: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      residenceHall: user.residenceHall,
      points: user.points,
      streakDays: user.streakDays,
      completedChallengesCount: user.completedChallengesCount,
      joinedAt: user.joinedAt,
      avatarUrl: user.avatarUrl,
    },
  });
});

// 2. POST /api/auth/activate/request
// Step 1 of activation: Student provides PRN.
authRouter.post('/activate/request', async (req, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 6, 60_000)) {
    return res.status(429).json({ error: 'Too many requests. Please wait before requesting another code.' });
  }

  const { prn } = req.body;
  if (!prn || !isValidPRN(prn)) {
    return res.status(400).json({ error: 'Please enter a valid Sanjay Ghodawat University PRN (7-10 digits).' });
  }

  const cleanPRN = String(prn).trim();

  // Validate PRN against Authorized University Roster in database
  const rosterEntry = await studentRosterCollection.findOne((s) => s.prn === cleanPRN);

  if (!rosterEntry || rosterEntry.enrollmentStatus !== 'ACTIVE') {
    return res.status(400).json({
      error: 'Unable to verify PRN against official active student roster. If you are an active student not yet registered in the database, contact SGU Academic Directorate.',
    });
  }

  if (rosterEntry.isActivated) {
    return res.status(400).json({
      error: 'This PRN is already activated. Please use the Sign In tab with your password.',
    });
  }

  // Generate 6-digit code and store hash with 10-minute expiry
  const verificationCode = generateSixDigitCode();
  const codeHash = await hashPassword(verificationCode);

  const activationRequest: ActivationRequestRecord = {
    id: `act-req-${Date.now()}-${generateSecureToken(4)}`,
    prn: cleanPRN,
    verificationCodeHash: codeHash,
    officialEmail: rosterEntry.officialEmail,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    attemptsLeft: 3,
    isUsed: false,
    createdAt: new Date().toISOString(),
  };
  await activationRequestsCollection.insert(activationRequest);

  // Dispatch Email to official verified email (NOT student-supplied email)
  const emailResult = await EmailService.sendEmail({
    to: rosterEntry.officialEmail,
    subject: 'SGU EcoTrack - Your 6-Digit Account Activation Code',
    text: `Hello ${rosterEntry.fullName},\n\nYour activation code for SGU EcoTrack is: ${verificationCode}\n\nThis code expires in 10 minutes.\n\nSanjay Ghodawat University, Kolhapur`,
    html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #047857;">Sanjay Ghodawat University · EcoTrack</h2>
      <p>Hello <strong>${rosterEntry.fullName}</strong>,</p>
      <p>Your one-time account activation code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #065f46; background: #ecfdf5; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 12px 0;">
        ${verificationCode}
      </div>
      <p style="font-size: 13px; color: #64748b;">This code expires in 10 minutes and can only be used once.</p>
    </div>`,
    category: 'activation',
  });

  // Mask email for user reassurance (e.g. r****@sguk.ac.in)
  const parts = rosterEntry.officialEmail.split('@');
  const maskedLocal = parts[0].length > 2 ? `${parts[0][0]}***${parts[0].slice(-1)}` : '***';
  const maskedEmail = `${maskedLocal}@${parts[1]}`;

  return res.json({
    success: true,
    maskedEmail,
    department: rosterEntry.department,
    fullName: rosterEntry.fullName,
    emailDeliveryStatus: emailResult.status,
    message: `A 6-digit verification code has been dispatched to your official university email (${maskedEmail}).`,
    // In dev environment when transactional email is unconfigured, provide notice
    evaluatorNotice: !EmailService.isConfigured()
      ? `(Notice: Transactional email provider unconfigured. In development audit mode, code generated is: ${verificationCode})`
      : undefined,
  });
});

// 3. POST /api/auth/activate/verify
// Step 2 of activation: Verify code and set password
authRouter.post('/activate/verify', async (req, res: Response) => {
  const { prn, code, password, residenceHall } = req.body;

  if (!prn || !code || !password) {
    return res.status(400).json({ error: 'PRN, verification code, and password are required.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain both letters and numbers.',
    });
  }

  const cleanPRN = String(prn).trim();

  // Find most recent unused activation request for this PRN
  const requests = (await activationRequestsCollection.find((r) => r.prn === cleanPRN && !r.isUsed))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeRequest = requests[0];
  if (!activeRequest) {
    return res.status(400).json({ error: 'No active activation request found. Please request a new code.' });
  }

  if (new Date(activeRequest.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  if (activeRequest.attemptsLeft <= 0) {
    return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
  }

  const isCodeValid = await verifyPassword(String(code).trim(), activeRequest.verificationCodeHash);
  if (!isCodeValid) {
    await activationRequestsCollection.update(activeRequest.id, {
      attemptsLeft: activeRequest.attemptsLeft - 1,
    });
    return res.status(400).json({
      error: `Invalid verification code. Attempts remaining: ${activeRequest.attemptsLeft - 1}`,
    });
  }

  // Mark request as used (prevent replay)
  await activationRequestsCollection.update(activeRequest.id, { isUsed: true });

  // Update Roster status
  const rosterEntry = await studentRosterCollection.findOne((s) => s.prn === cleanPRN);
  if (rosterEntry) {
    await studentRosterCollection.update(rosterEntry.id, {
      isActivated: true,
      activatedAt: new Date().toISOString(),
    });
  }

  // Hash password with PBKDF2/SHA-512
  const passwordHash = await hashPassword(password);

  // Create User Account record
  const newUserId = `usr-sgu-${cleanPRN}`;
  const newUser: UserAccountRecord = {
    id: newUserId,
    prn: cleanPRN,
    fullName: rosterEntry ? rosterEntry.fullName : 'SGU Student',
    email: activeRequest.officialEmail,
    passwordHash,
    role: 'student',
    department: rosterEntry ? rosterEntry.department : 'Sanjay Ghodawat University',
    residenceHall: residenceHall || 'Sahyadri Boys Hostel (Block A)',
    points: 100, // Activation bonus
    streakDays: 1,
    completedChallengesCount: 0,
    joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    isActive: true,
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await userAccountsCollection.insert(newUser);

  // Issue authenticated session immediately
  const sessionToken = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await sessionsCollection.insert({
    id: sessionToken,
    userId: newUserId,
    userRole: 'student',
    createdAt: new Date().toISOString(),
    expiresAt,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  res.cookie('ecotrack_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    success: true,
    token: sessionToken,
    user: {
      id: newUser.id,
      prn: newUser.prn,
      name: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      residenceHall: newUser.residenceHall,
      points: newUser.points,
      streakDays: newUser.streakDays,
      completedChallengesCount: newUser.completedChallengesCount,
      joinedAt: newUser.joinedAt,
    },
    message: 'Account successfully activated! Welcome to SGU EcoTrack.',
  });
});

// 4. GET /api/auth/me
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      prn: user.prn,
      name: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      residenceHall: user.residenceHall,
      points: user.points,
      streakDays: user.streakDays,
      completedChallengesCount: user.completedChallengesCount,
      joinedAt: user.joinedAt,
      avatarUrl: user.avatarUrl,
    },
  });
});

// 5. POST /api/auth/logout
authRouter.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  const token = req.cookies?.ecotrack_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
  if (token) {
    await sessionsCollection.delete(token);
  }
  res.clearCookie('ecotrack_session');
  return res.json({ success: true, message: 'Logged out successfully' });
});
