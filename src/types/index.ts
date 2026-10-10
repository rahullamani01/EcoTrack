export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  prn?: string;
  name: string;
  email: string;
  role: UserRole;
  residenceHall?: string;
  department?: string;
  points: number;
  streakDays: number;
  completedChallengesCount: number;
  joinedAt: string;
  avatarUrl?: string;
}

export type ChallengeCategory = 'waste' | 'water' | 'mobility' | 'energy' | 'food';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: ChallengeCategory;
  categoryLabel: string;
  durationLabel: string;
  isDaily: boolean;
  targetCount: number;
  currentCount?: number;
  joined: boolean;
  completed: boolean;
  lastCompletedDate?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  dateStr: string;
  isoDate: string;
  timeStr: string;
  location: string;
  category: string;
  iconName: string;
  totalSpots: number;
  spotsLeft: number;
  registered: boolean;
  description: string;
}

export interface FacilityReport {
  id: string;
  type: 'leak' | 'energy' | 'waste' | 'hvac';
  title: string;
  building: string;
  room?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'investigating' | 'resolved';
  reportedAt: string;
  resolvedAt?: string;
  turnaroundHours?: number;
  reportedBy: string;
}

export interface CampusMetrics {
  studentsParticipating: number;
  challengesCompleted: number;
  wasteDivertedTons: number;
  issuesResolved: number;
  semesterTargetTons: number;
  lastUpdated: string;
}

export interface HallBenchmark {
  name: string;
  studentsCount: number;
  wasteDiversionPct: number;
  pointsPerCapita: number;
  leakTurnaroundHours: number;
  trend: 'up' | 'stable' | 'down';
}

export type DateRangePreset = '7d' | '30d' | 'semester' | 'year' | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
  label: string;
}

export interface SyncAction {
  id: string;
  type: 'JOIN_CHALLENGE' | 'COMPLETE_CHALLENGE' | 'REGISTER_EVENT' | 'UNREGISTER_EVENT' | 'REPORT_ISSUE';
  payload: any;
  timestamp: string;
  synced: boolean;
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
}

export interface WasteSortingResult {
  itemIdentification: string;
  category: 'Recyclable' | 'Organic / Compostable' | 'Electronic Waste (E-Waste)' | 'Hazardous Waste' | 'General / Non-Recyclable Landfill';
  confidenceScore: number;
  confidenceRating: 'High' | 'Medium' | 'Low';
  primaryMaterial: string;
  disposalInstructions: string[];
  campusDisposalLocation: string;
  precautions: string[];
  environmentalImpactSummary: string;
}

export interface EcoChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: string;
}

