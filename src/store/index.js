export const updateSettings = settings => ({
  type: 'UPDATE_SETTINGS',
  settings,
});

export const initFromStorage = data => ({
  type: 'INIT_FROM_STORAGE',
  data,
});
