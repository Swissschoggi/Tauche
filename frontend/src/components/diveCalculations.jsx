export const calculateSAC = (dive) => {
  if (!dive.pressureStartBar || !dive.pressureEndBar || !dive.durationMinutes || !dive.depthMeters) {
    return null;
  }

  const consumed = dive.pressureStartBar - dive.pressureEndBar;
  const volume = dive.cylinderVolumeLiters || 12.0;
  
  const avgDepth = dive.depthMeters / 2;
  const avgPressureATA = 1 + (avgDepth / 10);
  
  const sac = (consumed * volume) / (dive.durationMinutes * avgPressureATA);
  return sac.toFixed(2);
};