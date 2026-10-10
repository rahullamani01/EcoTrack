import { Repository } from './db.js';

// --- Interfaces ---

export type UserRole = 'student' | 'faculty' | 'admin';

export interface StudentRosterRecord {
  id: string; // Internal unique ID
  prn: string; // University PRN (String, 7-10 digits)
  fullName: string;
  officialEmail: string; // Verified SGU email
  department: string;
  program: string;
  yearOfStudy: number;
  enrollmentStatus: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED';
  isActivated: boolean;
  activatedAt?: string;
  isDemonstrationRecord?: boolean; // Clearly marks presentation demo records
}

export interface UserAccountRecord {
  id: string;
  prn?: string; // Present for students
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  residenceHall?: string;
  points: number;
  streakDays: number;
  completedChallengesCount: number;
  joinedAt: string;
  isActive: boolean;
  avatarUrl?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  isDemonstrationRecord?: boolean;
}

export interface SessionRecord {
  id: string; // Session Token (64 hex characters)
  userId: string;
  userRole: UserRole;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface ActivationRequestRecord {
  id: string;
  prn: string;
  verificationCodeHash: string;
  officialEmail: string;
  expiresAt: string;
  attemptsLeft: number;
  isUsed: boolean;
  createdAt: string;
}

export interface PasswordResetRecord {
  id: string;
  userId: string;
  prn?: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface EventRegistrationRecord {
  id: string;
  eventId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

export interface ChallengeSubmissionRecord {
  id: string;
  challengeId: string;
  userId: string;
  studentName: string;
  submissionDate: string;
  evidenceNotes: string;
  pointsAwarded: number;
  status: 'approved' | 'pending' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  verifiedAuditTimestamp?: string;
}

export interface FacilityReportRecord {
  id: string;
  userId?: string;
  reporterName: string;
  reporterEmail?: string;
  type: 'leak' | 'energy' | 'waste' | 'hvac';
  title: string;
  building: string;
  room?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'investigating' | 'resolved';
  reportedAt: string;
  resolvedAt?: string;
  turnaroundHours?: number;
  resolutionNotes?: string;
  resolvedBy?: string;
}

export interface CampusTreeRecord {
  id: string;
  tagNumber: string;
  speciesCommon: string;
  speciesBotanical: string;
  localNameMarathi?: string;
  locationZone: string;
  coordinates?: { lat: number; lng: number };
  plantedDate: string;
  status: 'Healthy' | 'Needs Inspection' | 'Maintenance Required';
  isVerified: boolean;
  canopyDiameterMeters: number;
  heightMeters: number;
  lastInspectionDate: string;
  maintainedBy: string;
  notes: string;
  imageUrl?: string;
  createdByUserId?: string;
  verifiedBy?: string;
  isSampleDemonstration?: boolean;
}

export interface SustainabilityMetricRecord {
  id: string;
  key: string;
  metricType: 'verified_sensor' | 'calculated_estimate' | 'demonstration';
  displayName: string;
  currentValue: number;
  unit: string;
  sourceDescription: string;
  calculationMethodology?: string;
  lastCalibratedAt: string;
  updatedBy?: string;
}

// --- Repositories ---

export const studentRosterCollection = new Repository<StudentRosterRecord>('student_roster');
export const userAccountsCollection = new Repository<UserAccountRecord>('user_accounts');
export const sessionsCollection = new Repository<SessionRecord>('sessions');
export const activationRequestsCollection = new Repository<ActivationRequestRecord>('activation_requests');
export const passwordResetsCollection = new Repository<PasswordResetRecord>('password_resets');
export const eventRegistrationsCollection = new Repository<EventRegistrationRecord>('event_registrations');
export const challengeSubmissionsCollection = new Repository<ChallengeSubmissionRecord>('challenge_submissions');
export const facilityReportsCollection = new Repository<FacilityReportRecord>('facility_reports');
export const campusTreesCollection = new Repository<CampusTreeRecord>('campus_trees');
export const sustainabilityMetricsCollection = new Repository<SustainabilityMetricRecord>('sustainability_metrics');
