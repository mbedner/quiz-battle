export type HapticType = 'correct' | 'wrong_grownup' | 'attacked' | 'ko' | 'emote' | 'victory';

export function haptic(type: HapticType) {
  if (!('vibrate' in navigator)) return;
  const patterns: Record<HapticType, number | number[]> = {
    correct:       [40, 20, 80],
    wrong_grownup: [30, 20, 30],
    attacked:      [60, 30, 100, 30, 140],
    ko:            [150, 80, 150, 80, 300],
    emote:         25,
    victory:       [80, 40, 80, 40, 250],
  };
  navigator.vibrate(patterns[type]);
}
