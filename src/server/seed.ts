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

  // 3. Seed Campus Trees (Distinguishing verified inventory from sample educational records)
  const initialTrees: CampusTreeRecord[] = [
    {
      id: 'tree-001',
      tagNumber: 'SGU-TR-0101',
      speciesCommon: 'Neem Tree',
      speciesBotanical: 'Azadirachta indica',
      localNameMarathi: 'कडुनिंब (Kadunimb)',
      locationZone: 'Central Lawn near Knowledge Resource Centre',
      coordinates: { lat: 16.7456, lng: 74.3754 },
      plantedDate: '2019-07-15',
      status: 'Healthy',
      isVerified: true,
      canopyDiameterMeters: 6.2,
      heightMeters: 8.5,
      lastInspectionDate: '2025-09-20',
      maintainedBy: 'SGU Horticulture Department',
      notes: 'Natural air purifier and shade canopy. Drip irrigation functional.',
      imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tree-002',
      tagNumber: 'SGU-TR-0102',
      speciesCommon: 'Peepal Tree',
      speciesBotanical: 'Ficus religiosa',
      localNameMarathi: 'पिंपळ (Pimpal)',
      locationZone: 'Sahyadri Residence Garden Quad',
      coordinates: { lat: 16.7471, lng: 74.3765 },
      plantedDate: '2018-08-10',
      status: 'Healthy',
      isVerified: true,
      canopyDiameterMeters: 9.0,
      heightMeters: 11.2,
      lastInspectionDate: '2025-09-18',
      maintainedBy: 'SGU Horticulture Department',
      notes: 'Mature tree providing extensive biodiversity habitat for local avian species.',
      imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tree-003',
      tagNumber: 'SGU-TR-0103',
      speciesCommon: 'Gulmohar (Flamboyant)',
      speciesBotanical: 'Delonix regia',
      localNameMarathi: 'गुलमोहर (Gulmohar)',
      locationZone: 'School of Technology North Avenue',
      coordinates: { lat: 16.7448, lng: 74.3742 },
      plantedDate: '2021-06-22',
      status: 'Needs Inspection',
      isVerified: true,
      canopyDiameterMeters: 4.8,
      heightMeters: 6.1,
      lastInspectionDate: '2025-10-02',
      maintainedBy: 'Student Green Volunteer Brigade',
      notes: 'Monitored for seasonal bloom health. Requires pruning along walkway boundary.',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tree-004',
      tagNumber: 'SGU-TR-0104',
      speciesCommon: 'Banyan Tree',
      speciesBotanical: 'Ficus benghalensis',
      localNameMarathi: 'वड (Vad)',
      locationZone: 'CREAM Solar Field Boundary Promenade',
      coordinates: { lat: 16.7460, lng: 74.3780 },
      plantedDate: '2017-09-05',
      status: 'Healthy',
      isVerified: true,
      canopyDiameterMeters: 12.4,
      heightMeters: 12.8,
      lastInspectionDate: '2025-08-30',
      maintainedBy: 'SGU Campus Maintenance Cell',
      notes: 'Aerial root propagation monitored. Natural barrier protecting solar arrays from high highway dust.',
      imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'tree-005',
      tagNumber: 'SGU-TR-0105',
      speciesCommon: 'Indian Gooseberry (Amla)',
      speciesBotanical: 'Phyllanthus emblica',
      localNameMarathi: 'आवळा (Amla)',
      locationZone: 'Medicinal Plant Arboretum (School of Pharmacy)',
      coordinates: { lat: 16.7439, lng: 74.3759 },
      plantedDate: '2022-07-14',
      status: 'Maintenance Required',
      isVerified: false, // Sample demo record for research trial
      isSampleDemonstration: true,
      canopyDiameterMeters: 2.5,
      heightMeters: 3.2,
      lastInspectionDate: '2025-10-01',
      maintainedBy: 'Pharmacy Herbal Research Club',
      notes: '[Sample Educational Record] Soil moisture sensor indicates dry topsoil; organic mulching and nutrient replenishment required.',
      imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
    },
  ];
  await campusTreesCollection.seed(initialTrees);

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
