// Local Database & Offline Store for Coaching Management

const STORAGE_KEY = 'COACHING_MANAGEMENT_DB_V2';

const INITIAL_DATA = {
  isSetupCompleted: false,
  instituteProfile: {
    name: 'Coaching Management',
    tagline: 'Excellence in Education',
    phone: '',
    address: '',
    currency: '₹',
    receiptPrefix: 'REC-2026-',
  },
  batches: [],
  students: [],
  attendance: [],
  fees: [],
  staff: [],
  enquiries: [],
};

export const getDB = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading database:', e);
    return INITIAL_DATA;
  }
};

export const saveDB = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving database:', e);
  }
};

export const resetDB = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
};

export const exportDBAsJSON = () => {
  const data = getDB();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CoachingManagement_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDBFromJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.students !== undefined && parsed.batches !== undefined) {
      saveDB(parsed);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
};
