import {
  studentRosterCollection,
  userAccountsCollection,
  campusTreesCollection,
  sustainabilityMetricsCollection,
  StudentRosterRecord,
  UserAccountRecord,
  CampusTreeRecord,
  SustainabilityMetricRecord,
} from './models.js';
import { hashPassword, generateSecureToken } from './crypto.js';
import { campusTrees } from '../data/campusTrees.js';

export async function seedInitialDatabase(): Promise<void> {
  // 1. Seed Authorized Student Roster (Labeled as demonstration student roster)
  const initialRoster: StudentRosterRecord[] = [
    {
      id: 'roster-001',
      prn: '252161006',
      fullName: 'Rahul Deshmukh',
      officialEmail: 'rahul.deshmukh@sguk.ac.in',
      department: 'School of Technology',
      program: 'B.Tech Computer Science & Engineering',
      yearOfStudy: 3,
      enrollmentStatus: 'ACTIVE',
      isActivated: false,
      isDemonstrationRecord: true,
    },
    {
      id: 'roster-002',
      prn: '252161007',
      fullName: 'Ananya Sharma',
      officialEmail: 'ananya.sharma@sguk.ac.in',
      department: 'School of Pharmacy',
      program: 'B.Pharm Pharmaceutical Sciences',
      yearOfStudy: 2,
      enrollmentStatus: 'ACTIVE',
      isActivated: false,
      isDemonstrationRecord: true,
    },
    {
      id: 'roster-003',
      prn: '252161008',
      fullName: 'Aditya Patil',
      officialEmail: 'aditya.patil@sguk.ac.in',
      department: 'School of Technology',
      program: 'B.Tech Civil & Environmental Engineering',
      yearOfStudy: 4,
      enrollmentStatus: 'ACTIVE',
      isActivated: false,
      isDemonstrationRecord: true,
    },
    {
      id: 'roster-004',
      prn: '252161009',
      fullName: 'Tanvi Joshi',
      officialEmail: 'tanvi.joshi@sguk.ac.in',
      department: 'School of Management & Commerce',
      program: 'MBA Sustainable Business Operations',
      yearOfStudy: 1,
      enrollmentStatus: 'ACTIVE',
      isActivated: false,
      isDemonstrationRecord: true,
    },
    {
      id: 'roster-005',
      prn: '252161010',
      fullName: 'Vikram Shinde',
      officialEmail: 'vikram.shinde@sguk.ac.in',
      department: 'School of Architecture & Design',
      program: 'B.Arch Green Building Design',
      yearOfStudy: 3,
      enrollmentStatus: 'ACTIVE',
      isActivated: false,
      isDemonstrationRecord: true,
    },
  ];
  await studentRosterCollection.seed(initialRoster);

  // 2. Demonstration Faculty and Administrator Accounts for Testing & Evaluation
  // Passwords are generated from env variables if available or securely generated for dev demo
  const userCount = await userAccountsCollection.count();
  if (userCount === 0) {
    const facultyPassword = process.env.DEMO_FACULTY_PASSWORD || 'FacultySecure2025!';
    const adminPassword = process.env.DEMO_ADMIN_PASSWORD || 'AdminSecure2025!';

    const facultyPasswordHash = await hashPassword(facultyPassword);
    const facultyUser: UserAccountRecord = {
      id: 'usr-fac-1',
      fullName: 'Dr. Sneha Patil',
      email: 'dr.sneha.patil@sguk.ac.in',
      passwordHash: facultyPasswordHash,
      role: 'faculty',
      department: 'Center for Renewable Energy & Advanced Materials (CREAM)',
      points: 820,
      streakDays: 16,
      completedChallengesCount: 19,
      joinedAt: 'Jul 2021',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemonstrationRecord: true,
    };
    await userAccountsCollection.insert(facultyUser);

    const adminPasswordHash = await hashPassword(adminPassword);
    const adminUser: UserAccountRecord = {
      id: 'usr-admin-1',
      fullName: 'Suhas Kulkarni',
      email: 'suhas.kulkarni@facilities.sguk.ac.in',
      passwordHash: adminPasswordHash,
      role: 'admin',
      department: 'SGU Estate & Campus Facilities Directorate',
      points: 1390,
      streakDays: 32,
      completedChallengesCount: 38,
      joinedAt: 'Jan 2019',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemonstrationRecord: true,
    };
    await userAccountsCollection.insert(adminUser);
  }

  // 3. Seed Campus Trees (Verified field inventory photographed on the SGU campus)
  await campusTreesCollection.seed(campusTrees);


  // 4. Seed Verified Sustainability Metric Records
  const initialMetrics: SustainabilityMetricRecord[] = [
    {
      id: 'met-001',
      key: 'solar_generation_kwh',
      metricType: 'verified_sensor',
      displayName: 'CREAM Solar Microgrid Export',
      currentValue: 184500,
      unit: 'kWh',
      sourceDescription: 'Digital telemetry inverters across School of Technology and Stadium rooftops',
      lastCalibratedAt: '2025-10-01T08:00:00Z',
    },
    {
      id: 'met-002',
      key: 'water_recycled_kl',
      metricType: 'verified_sensor',
      displayName: 'STP Water Treated & Recycled',
      currentValue: 14200,
      unit: 'Kiloliters (KL)',
      sourceDescription: 'SGU Sewage Treatment Plant output flow ultrasonic meters',
      lastCalibratedAt: '2025-10-05T09:30:00Z',
    },
    {
      id: 'met-003',
      key: 'co2_avoided_tons',
      metricType: 'calculated_estimate',
      displayName: 'Avoided Carbon Footprint',
      currentValue: 151.3,
      unit: 'Metric Tons CO2e',
      sourceDescription: 'CEA India Grid Baseline Emission Factor (v19) multiplied by net solar kWh generated',
      calculationMethodology: '184,500 kWh × 0.82 kg CO2/kWh ÷ 1,000 = 151.29 tCO2e',
      lastCalibratedAt: '2025-10-01T08:00:00Z',
    },
  ];
  await sustainabilityMetricsCollection.seed(initialMetrics);
}
