export interface ScoreBreakdown {
  isCorrect: boolean;
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  totalAwarded: number;
  newStreak: number;
  streakMessage: string | null;
}

export function calculateScore(params: {
  isCorrect: boolean;
  remainingTime: number;
  totalTime: number;
  currentStreak: number;
  speedBonusEnabled?: boolean;
  streakBonusEnabled?: boolean;
  multiplier?: number;
}): ScoreBreakdown {
  const {
    isCorrect,
    remainingTime,
    totalTime,
    currentStreak,
    speedBonusEnabled = true,
    streakBonusEnabled = true,
    multiplier = 1,
  } = params;

  if (!isCorrect) {
    return {
      isCorrect: false,
      baseScore: 0,
      speedBonus: 0,
      streakBonus: 0,
      totalAwarded: 0,
      newStreak: 0,
      streakMessage: null,
    };
  }

  const baseScore = 100;
  
  // Speed bonus formula: round((remainingTime / totalTime) * 100)
  let speedBonus = 0;
  if (speedBonusEnabled && totalTime > 0) {
    const ratio = Math.max(0, Math.min(1, remainingTime / totalTime));
    speedBonus = Math.round(ratio * 100);
  }

  const newStreak = currentStreak + 1;
  let streakBonus = 0;
  let streakMessage: string | null = null;

  if (streakBonusEnabled) {
    if (newStreak === 10) {
      streakBonus = 200;
      streakMessage = '🔥 Chuỗi 10 câu đúng! +200 điểm';
    } else if (newStreak === 5) {
      streakBonus = 100;
      streakMessage = '🔥 Chuỗi 5 câu đúng! +100 điểm';
    } else if (newStreak === 3) {
      streakBonus = 50;
      streakMessage = '🔥 Chuỗi 3 câu đúng! +50 điểm';
    } else if (newStreak > 3 && newStreak % 5 === 0) {
      streakBonus = 100;
      streakMessage = `🔥 Chuỗi ${newStreak} câu đúng! +100 điểm`;
    }
  }

  const totalBeforeMultiplier = baseScore + speedBonus + streakBonus;
  const totalAwarded = Math.round(totalBeforeMultiplier * (multiplier > 0 ? multiplier : 1));

  return {
    isCorrect: true,
    baseScore,
    speedBonus,
    streakBonus,
    totalAwarded,
    newStreak,
    streakMessage,
  };
}
