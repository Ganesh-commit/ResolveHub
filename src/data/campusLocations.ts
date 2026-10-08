export interface CampusLocation {
  id: string;
  name: string;
  zone: string;
  type: string;
  categories: string[];
}

export const LOCATION_ZONES = [
  'Hostels',
  'Academic',
  'Library',
  'Administration',
  'Food',
  'Sports',
  'Transport',
  'Common Areas',
  'Online / No location'
];

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  // ── Hostels ──
  { id: 'loc-h-01', name: 'Hostel Block A', zone: 'Hostels', type: 'Residential', categories: ['Hostel & Facilities', 'Sanitation & Hygiene', 'IT & Network'] },
  { id: 'loc-h-02', name: 'Hostel Block B', zone: 'Hostels', type: 'Residential', categories: ['Hostel & Facilities', 'Sanitation & Hygiene', 'IT & Network'] },
  { id: 'loc-h-03', name: 'Hostel Block C', zone: 'Hostels', type: 'Residential', categories: ['Hostel & Facilities', 'Sanitation & Hygiene', 'IT & Network'] },
  { id: 'loc-h-04', name: 'Priyadarshini Girls Hostel', zone: 'Hostels', type: 'Residential', categories: ['Hostel & Facilities', 'Sanitation & Hygiene', 'Harassment & Discipline'] },
  { id: 'loc-h-05', name: 'NTR Mens Hostel', zone: 'Hostels', type: 'Residential', categories: ['Hostel & Facilities', 'Sanitation & Hygiene', 'Harassment & Discipline'] },

  // ── Academic ──
  { id: 'loc-ac-01', name: 'CSE & IT Department Building', zone: 'Academic', type: 'Department Block', categories: ['Academics', 'IT & Network'] },
  { id: 'loc-ac-02', name: 'ECE & EEE Department Building', zone: 'Academic', type: 'Department Block', categories: ['Academics', 'IT & Network'] },
  { id: 'loc-ac-03', name: 'Mechanical & Civil Workshops', zone: 'Academic', type: 'Lab / Workshop', categories: ['Academics', 'Hostel & Facilities'] },
  { id: 'loc-ac-04', name: 'Pharmacy & Biotech Block', zone: 'Academic', type: 'Department Block', categories: ['Academics', 'Sanitation & Hygiene'] },
  { id: 'loc-ac-05', name: 'Management & Humanities Block', zone: 'Academic', type: 'Department Block', categories: ['Academics'] },

  // ── Library ──
  { id: 'loc-lib-01', name: 'Central University Library', zone: 'Library', type: 'Library', categories: ['Academics', 'IT & Network'] },
  { id: 'loc-lib-02', name: 'Digital e-Resource Center', zone: 'Library', type: 'Digital Lab', categories: ['IT & Network', 'Academics'] },

  // ── Administration ──
  { id: 'loc-adm-01', name: 'Registrar & Admin Main Block', zone: 'Administration', type: 'Administrative', categories: ['Finance & Scholarship', 'Harassment & Discipline'] },
  { id: 'loc-adm-02', name: 'Student Welfare & Dean Office', zone: 'Administration', type: 'Administrative', categories: ['Harassment & Discipline', 'Academics'] },
  { id: 'loc-adm-03', name: 'Accounts & Finance Counter', zone: 'Administration', type: 'Finance Office', categories: ['Finance & Scholarship'] },
  { id: 'loc-adm-04', name: 'Examination Controller Cell', zone: 'Administration', type: 'Exam Office', categories: ['Academics'] },

  // ── Food ──
  { id: 'loc-fd-01', name: 'Central Student Mess', zone: 'Food', type: 'Dining', categories: ['Sanitation & Hygiene', 'Hostel & Facilities'] },
  { id: 'loc-fd-02', name: 'Campus Main Canteen & Food Court', zone: 'Food', type: 'Dining', categories: ['Sanitation & Hygiene'] },

  // ── Sports ──
  { id: 'loc-sp-01', name: 'University Sports Complex', zone: 'Sports', type: 'Facility', categories: ['Hostel & Facilities', 'Sanitation & Hygiene'] },
  { id: 'loc-sp-02', name: 'Athletic Track & Cricket Ground', zone: 'Sports', type: 'Ground', categories: ['Hostel & Facilities'] },

  // ── Transport ──
  { id: 'loc-tr-01', name: 'University Bus Station & Bay', zone: 'Transport', type: 'Transport Terminal', categories: ['Hostel & Facilities', 'Sanitation & Hygiene'] },
  { id: 'loc-tr-02', name: 'Campus Vehicle Garage', zone: 'Transport', type: 'Garage', categories: ['Hostel & Facilities'] },

  // ── Common Areas ──
  { id: 'loc-cm-01', name: 'Main Gate & Security Checkpost', zone: 'Common Areas', type: 'Security', categories: ['Harassment & Discipline', 'Hostel & Facilities'] },
  { id: 'loc-cm-02', name: 'University Grand Auditorium', zone: 'Common Areas', type: 'Auditorium', categories: ['Hostel & Facilities', 'IT & Network'] },
  { id: 'loc-cm-03', name: 'Open Air Theatre & Lawn', zone: 'Common Areas', type: 'Open Space', categories: ['Sanitation & Hygiene', 'Hostel & Facilities'] },

  // ── Online / No location ──
  { id: 'loc-on-01', name: 'University Student Portal / Mobile App', zone: 'Online / No location', type: 'Digital System', categories: ['IT & Network', 'Academics'] },
  { id: 'loc-on-02', name: 'Online Fee Gateway & Challan System', zone: 'Online / No location', type: 'Payment Portal', categories: ['Finance & Scholarship'] },
  { id: 'loc-on-03', name: 'Online Marks & Transcript Portal', zone: 'Online / No location', type: 'Academic Portal', categories: ['Academics'] }
];

export function getLocationsByCategory(category: string): CampusLocation[] {
  if (!category || category === 'all') return CAMPUS_LOCATIONS;
  return CAMPUS_LOCATIONS.filter(loc => loc.categories.includes(category));
}
