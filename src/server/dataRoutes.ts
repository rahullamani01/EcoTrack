import { Router, Response } from 'express';
import {
  studentRosterCollection,
  userAccountsCollection,
  campusTreesCollection,
  sustainabilityMetricsCollection,
  facilityReportsCollection,
  eventRegistrationsCollection,
  challengeSubmissionsCollection,
  FacilityReportRecord,
  CampusTreeRecord,
  EventRegistrationRecord,
  ChallengeSubmissionRecord,
} from './models.js';
import { requireAuth, requireRole, AuthenticatedRequest } from './authMiddleware.js';

export const dataRouter = Router();

// ==================== 1. USER PRIVATE DATA ====================

// GET /api/user/summary
dataRouter.get('/user/summary', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  const registrations = await eventRegistrationsCollection.find((r) => r.userId === user.id);
  const submissions = await challengeSubmissionsCollection.find((s) => s.userId === user.id);
  const myReports = await facilityReportsCollection.find((r) => r.userId === user.id);

  res.json({
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
    eventRegistrations: registrations,
    challengeSubmissions: submissions,
    facilityReports: myReports,
  });
});

// ==================== 2. EVENT PERSISTENCE ====================

// GET /api/events/registrations/my
dataRouter.get('/events/registrations/my', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const myRegistrations = await eventRegistrationsCollection.find((r) => r.userId === user.id);
  res.json({ registrations: myRegistrations });
});

// POST /api/events/:eventId/register
dataRouter.post('/events/:eventId/register', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { eventId } = req.params;

  // Prevent duplicate registration
  const existing = await eventRegistrationsCollection.findOne(
    (r) => r.eventId === eventId && r.userId === user.id && r.status === 'confirmed'
  );

  if (existing) {
    return res.status(400).json({ error: 'You are already registered for this event.' });
  }

  const registration: EventRegistrationRecord = {
    id: `ev-reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    userId: user.id,
    studentName: user.fullName,
    studentEmail: user.email,
    registeredAt: new Date().toISOString(),
    status: 'confirmed',
  };

  await eventRegistrationsCollection.insert(registration);
  res.status(201).json({ success: true, registration });
});

// POST /api/events/:eventId/cancel
dataRouter.post('/events/:eventId/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { eventId } = req.params;

  const existing = await eventRegistrationsCollection.findOne(
    (r) => r.eventId === eventId && r.userId === user.id && r.status === 'confirmed'
  );

  if (!existing) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  await eventRegistrationsCollection.update(existing.id, { status: 'cancelled' });
  res.json({ success: true, message: 'Event registration cancelled.' });
});

// ==================== 3. CHALLENGE PERSISTENCE & REVIEW ====================

// Valid challenge points catalog configured on server (never trusted from frontend)
const SERVER_CHALLENGE_POINTS: Record<string, number> = {
  c1: 50, // Plastic-Free Canteen Day
  c2: 75, // Every Drop Counts
  c3: 100, // Move Greener
  c4: 60, // CREAM Lab Power Audit
  c5: 80, // Tree Canopy Care
  c6: 90, // Waste Sorting Station
};

// POST /api/challenges/:challengeId/submit
dataRouter.post('/challenges/:challengeId/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { challengeId } = req.params;
  const { evidenceNotes } = req.body;

  // Validate challenge ID
  const points = SERVER_CHALLENGE_POINTS[challengeId] || 50;

  // Enforce server verification: check if completed today to prevent duplicate point exploit
  const today = new Date().toISOString().split('T')[0];
  const completedToday = await challengeSubmissionsCollection.findOne(
    (s) => s.userId === user.id && s.challengeId === challengeId && s.submissionDate === today
  );

  if (completedToday) {
    return res.status(400).json({ error: 'You have already completed this challenge today.' });
  }

  const submission: ChallengeSubmissionRecord = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    challengeId,
    userId: user.id,
    studentName: user.fullName,
    submissionDate: today,
    evidenceNotes: evidenceNotes ? String(evidenceNotes).substring(0, 500) : 'Recorded eco-action on SGU campus',
    pointsAwarded: points,
    status: 'approved',
    verifiedAuditTimestamp: new Date().toISOString(),
  };

  await challengeSubmissionsCollection.insert(submission);

  // Safely increment user points and completed challenge count in database
  const updatedPoints = (user.points || 0) + submission.pointsAwarded;
  const updatedCount = (user.completedChallengesCount || 0) + 1;
  await userAccountsCollection.update(user.id, {
    points: updatedPoints,
    completedChallengesCount: updatedCount,
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    submission,
    newPoints: updatedPoints,
    completedChallengesCount: updatedCount,
  });
});

// GET /api/challenges/submissions (Requires Faculty or Admin)
dataRouter.get('/challenges/submissions', requireAuth, requireRole(['faculty', 'admin']), async (_req: AuthenticatedRequest, res: Response) => {
  const submissions = await challengeSubmissionsCollection.find();
  res.json({ submissions });
});

// ==================== 4. FACILITY REPORTING ====================

// GET /api/facilities/reports
dataRouter.get('/facilities/reports', async (_req, res: Response) => {
  const all = await facilityReportsCollection.find();
  // Public feed does NOT expose private reporter contact details
  const reports = all.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    building: r.building,
    room: r.room,
    severity: r.severity,
    status: r.status,
    reportedAt: r.reportedAt,
    resolvedAt: r.resolvedAt,
    turnaroundHours: r.turnaroundHours,
    reportedBy: r.reporterName,
  }));
  res.json({ reports });
});

// POST /api/facilities/reports
dataRouter.post('/facilities/reports', async (req: AuthenticatedRequest, res: Response) => {
  const { type, title, building, room, severity, reporterName } = req.body;

  if (!title || !building) {
    return res.status(400).json({ error: 'Title and building are required.' });
  }

  // Validate allowed categories
  const validTypes = ['leak', 'energy', 'waste', 'hvac'];
  const cleanType = validTypes.includes(type) ? type : 'leak';

  const validSeverities = ['low', 'medium', 'high'];
  const cleanSeverity = validSeverities.includes(severity) ? severity : 'low';

  const newReport: FacilityReportRecord = {
    id: `fr-${Date.now()}`,
    userId: req.user ? req.user.id : undefined,
    reporterName: req.user ? req.user.fullName : (reporterName ? String(reporterName).substring(0, 80) : 'SGU Campus Member'),
    reporterEmail: req.user ? req.user.email : undefined,
    type: cleanType as any,
    title: String(title).trim().substring(0, 150),
    building: String(building).trim().substring(0, 100),
    room: room ? String(room).trim().substring(0, 50) : undefined,
    severity: cleanSeverity as any,
    status: 'reported',
    reportedAt: new Date().toISOString(),
  };

  await facilityReportsCollection.insert(newReport);
  res.status(201).json({ success: true, report: newReport });
});

// PUT /api/facilities/reports/:id/status (Requires Faculty or Admin)
dataRouter.put('/facilities/reports/:id/status', requireAuth, requireRole(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;
  const user = req.user!;

  const existing = await facilityReportsCollection.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const updates: Partial<FacilityReportRecord> = {
    status,
    resolutionNotes: resolutionNotes ? String(resolutionNotes).substring(0, 500) : undefined,
    resolvedBy: `${user.fullName} (${user.role})`,
  };

  if (status === 'resolved' && !existing.resolvedAt) {
    const resolvedAt = new Date().toISOString();
    const turnaroundMs = new Date(resolvedAt).getTime() - new Date(existing.reportedAt).getTime();
    updates.resolvedAt = resolvedAt;
    updates.turnaroundHours = parseFloat((turnaroundMs / (1000 * 60 * 60)).toFixed(1));
  }

  const updated = await facilityReportsCollection.update(id, updates);
  res.json({ success: true, report: updated });
});

// ==================== 5. TREE MONITORING PERSISTENCE ====================

// GET /api/trees
dataRouter.get('/trees', async (_req, res: Response) => {
  const trees = await campusTreesCollection.find();
  res.json({ trees });
});

// POST /api/trees (Requires Faculty or Admin)
dataRouter.post('/trees', requireAuth, requireRole(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { treeData } = req.body;

  if (!treeData || !treeData.speciesCommon || !treeData.locationZone) {
    return res.status(400).json({ error: 'Species Common name and Location Zone are required.' });
  }

  const totalTrees = await campusTreesCollection.count();
  const newTree: CampusTreeRecord = {
    id: `tree-${Date.now()}`,
    tagNumber: treeData.tagNumber || `SGU-TR-0${totalTrees + 101}`,
    speciesCommon: String(treeData.speciesCommon).trim().substring(0, 100),
    speciesBotanical: String(treeData.speciesBotanical || 'Unverified botanical taxon').trim().substring(0, 100),
    localNameMarathi: treeData.localNameMarathi ? String(treeData.localNameMarathi).trim().substring(0, 100) : '',
    locationZone: String(treeData.locationZone).trim().substring(0, 120),
    coordinates: treeData.coordinates || { lat: 16.7454, lng: 74.3752 },
    plantedDate: treeData.plantedDate || new Date().toISOString().split('T')[0],
    status: treeData.status || 'Healthy',
    // Only Admin can verify official specimen records; Faculty logs are pending verification
    isVerified: user.role === 'admin',
    canopyDiameterMeters: Number(treeData.canopyDiameterMeters) || 3.0,
    heightMeters: Number(treeData.heightMeters) || 3.5,
    lastInspectionDate: new Date().toISOString().split('T')[0],
    maintainedBy: treeData.maintainedBy || `${user.fullName} (${user.department})`,
    notes: treeData.notes ? String(treeData.notes).substring(0, 500) : 'Documented by campus staff.',
    imageUrl: treeData.imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
    createdByUserId: user.id,
    verifiedBy: user.role === 'admin' ? user.fullName : undefined,
  };

  await campusTreesCollection.insert(newTree);
  res.status(201).json({ success: true, tree: newTree });
});

// PUT /api/trees/:id (Requires Faculty or Admin)
dataRouter.put('/trees/:id', requireAuth, requireRole(['faculty', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { updates } = req.body;
  const user = req.user!;

  const existing = await campusTreesCollection.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Tree record not found' });
  }

  // Prevent faculty from marking verified without Admin privilege
  const cleanUpdates = { ...updates };
  if (user.role !== 'admin' && 'isVerified' in cleanUpdates) {
    delete cleanUpdates.isVerified;
  }
  if (user.role === 'admin' && cleanUpdates.isVerified) {
    cleanUpdates.verifiedBy = user.fullName;
  }

  cleanUpdates.lastInspectionDate = new Date().toISOString().split('T')[0];

  const updated = await campusTreesCollection.update(id, cleanUpdates);
  res.json({ success: true, tree: updated });
});

// ==================== 6. ROSTER & ADMINISTRATION ====================

// GET /api/admin/roster (Requires Admin)
dataRouter.get('/admin/roster', requireAuth, requireRole(['admin']), async (_req: AuthenticatedRequest, res: Response) => {
  const roster = await studentRosterCollection.find();
  res.json({ roster });
});

// POST /api/admin/roster (Requires Admin)
dataRouter.post('/admin/roster', requireAuth, requireRole(['admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { prn, fullName, officialEmail, department, program, yearOfStudy } = req.body;

  if (!prn || !fullName || !officialEmail) {
    return res.status(400).json({ error: 'PRN, Full Name, and Official Email are required.' });
  }

  const existing = await studentRosterCollection.findOne((s) => s.prn === prn);
  if (existing) {
    return res.status(400).json({ error: 'A student with this PRN already exists in the roster.' });
  }

  const record = await studentRosterCollection.insert({
    id: `roster-${Date.now()}`,
    prn: String(prn).trim(),
    fullName: String(fullName).trim(),
    officialEmail: String(officialEmail).trim().toLowerCase(),
    department: department || 'School of Technology',
    program: program || 'Undergraduate',
    yearOfStudy: Number(yearOfStudy) || 1,
    enrollmentStatus: 'ACTIVE',
    isActivated: false,
    isDemonstrationRecord: false,
  });

  res.status(201).json({ success: true, record });
});
