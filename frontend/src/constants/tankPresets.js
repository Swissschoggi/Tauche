export const TANK_PRESETS = {
  AL80: { name: 'Aluminum 80', volumeLiters: 11.1, workingPressureBar: 207, description: 'Standard AL80 - Most common' },
  AL100: { name: 'Aluminum 100', volumeLiters: 13.2, workingPressureBar: 207, description: 'AL100 - Extra gas' },
  LP95: { name: 'Low Pressure 95', volumeLiters: 15.3, workingPressureBar: 165, description: 'LP95 - High volume, lower pressure' },
  HP100: { name: 'High Pressure 100', volumeLiters: 12.0, workingPressureBar: 232, description: 'HP100 - Compact, high pressure' },
  HP120: { name: 'High Pressure 120', volumeLiters: 14.9, workingPressureBar: 232, description: 'HP120 - Great for deeper dives' },
  Steel72: { name: 'Steel 72', volumeLiters: 10.4, workingPressureBar: 207, description: 'Classic steel 72' },
  Steel120: { name: 'Steel 120', volumeLiters: 15.8, workingPressureBar: 207, description: 'Large steel tank' },
  Twin12: { name: 'Twinset 2x12L', volumeLiters: 24.0, workingPressureBar: 232, description: 'Double 12L - Tech setup' },
  Twin18: { name: 'Twinset 2x18L', volumeLiters: 36.0, workingPressureBar: 232, description: 'Double 18L - Extended range' }
}

export const getTankPreset = (key) => TANK_PRESETS[key]
export const getTankPresetsList = () => Object.entries(TANK_PRESETS).map(([key, value]) => ({ key, ...value }))