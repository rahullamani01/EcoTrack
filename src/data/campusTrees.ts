import { CampusTreeRecord } from '../types';

/**
 * Verified campus tree inventory photographed on-site at
 * Sanjay Ghodawat University, Atigre, Kolhapur (GPS: 16.742331, 74.382953).
 *
 * This module is shared by the server seeder and the client so the static
 * GitHub Pages demo can fall back to the same records when the API is not
 * available.
 */
export const campusTrees: CampusTreeRecord[] = [
  {
    id: 'tree-001',
    tagNumber: 'SGU-TR-0101',
    speciesCommon: 'Variegated Weeping Fig',
    speciesBotanical: "Ficus benjamina 'Variegata'",
    localNameMarathi: 'फिकस (Ficus)',
    locationZone: 'Research Block Lawn, School of Technology',
    coordinates: { lat: 16.742331, lng: 74.382953 },
    plantedDate: '2021-08-12',
    status: 'Healthy',
    isVerified: true,
    canopyDiameterMeters: 5.4,
    heightMeters: 6.2,
    lastInspectionDate: '2025-10-13',
    maintainedBy: 'SGU Horticulture Department',
    notes:
      'Variegated ornamental specimen with a layered, near-horizontal canopy. Drip irrigation is functional and lower branches are pruned annually to keep the lawn walkway clear.',
    imageUrl: '/images/trees/variegated-ficus-research-lawn.jpg',
  },
  {
    id: 'tree-002',
    tagNumber: 'SGU-TR-0102',
    speciesCommon: 'Royal Palm',
    speciesBotanical: 'Roystonea regia',
    localNameMarathi: 'रॉयल पाम (Royal Palm)',
    locationZone: 'Campus Pond Promenade, Central Water Body',
    coordinates: { lat: 16.7426, lng: 74.3834 },
    plantedDate: '2018-06-05',
    status: 'Healthy',
    isVerified: true,
    canopyDiameterMeters: 6.0,
    heightMeters: 10.5,
    lastInspectionDate: '2025-10-13',
    maintainedBy: 'SGU Horticulture Department',
    notes:
      'Tall waterfront palm shading the stone-paved pond promenade. Crown is cleaned annually and the root zone is protected by rock edging with functional drip lines.',
    imageUrl: '/images/trees/royal-palm-campus-pond.jpg',
  },
  {
    id: 'tree-003',
    tagNumber: 'SGU-TR-0103',
    speciesCommon: 'Copperpod (Sonmohar)',
    speciesBotanical: 'Peltophorum pterocarpum',
    localNameMarathi: 'सोनमोहर (Sonmohar)',
    locationZone: 'Brick-Paver Avenue, Academic Block Approach Road',
    coordinates: { lat: 16.7421, lng: 74.3825 },
    plantedDate: '2019-07-22',
    status: 'Needs Inspection',
    isVerified: true,
    canopyDiameterMeters: 7.8,
    heightMeters: 9.0,
    lastInspectionDate: '2025-10-13',
    maintainedBy: 'Student Green Volunteer Brigade',
    notes:
      'Avenue tree forming part of the campus approach-road canopy corridor. Lower branches overhang the paver walkway and require pruning; monitor foliage for psyllid damage before the next flowering season.',
    imageUrl: '/images/trees/copperpod-avenue.jpg',
  },
  {
    id: 'tree-004',
    tagNumber: 'SGU-TR-0104',
    speciesCommon: "Saptaparni (Devil's Tree)",
    speciesBotanical: 'Alstonia scholaris',
    localNameMarathi: 'सप्तपर्णी (Saptaparni)',
    locationZone: 'Research Block Perimeter Grove',
    coordinates: { lat: 16.7419, lng: 74.3831 },
    plantedDate: '2017-09-05',
    status: 'Healthy',
    isVerified: true,
    canopyDiameterMeters: 9.5,
    heightMeters: 13.5,
    lastInspectionDate: '2025-10-13',
    maintainedBy: 'SGU Campus Maintenance Cell',
    notes:
      'Tiered evergreen grove with characteristic whorled branches. Trunks carry white spiral banding as a borer and termite deterrent; the wrapping is checked and re-tensioned during every quarterly audit.',
    imageUrl: '/images/trees/saptaparni-grove.jpg',
  },
  {
    id: 'tree-005',
    tagNumber: 'SGU-TR-0105',
    speciesCommon: 'Mango Tree',
    speciesBotanical: 'Mangifera indica',
    localNameMarathi: 'आंबा (Amba)',
    locationZone: 'Central Lawn near Academic Complex',
    coordinates: { lat: 16.7427, lng: 74.3827 },
    plantedDate: '2016-06-18',
    status: 'Maintenance Required',
    isVerified: true,
    canopyDiameterMeters: 8.2,
    heightMeters: 8.0,
    lastInspectionDate: '2025-10-13',
    maintainedBy: 'SGU Horticulture Department',
    notes:
      'Mature shade and fruit-bearing specimen on the central lawn. Drip emitters at the root zone are clogged and the topsoil is compacted; line flushing, organic mulching and a nutrient top-dressing are scheduled.',
    imageUrl: '/images/trees/mango-central-lawn.jpg',
  },
];
