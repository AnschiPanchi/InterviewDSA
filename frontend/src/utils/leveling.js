/**
 * Logarithmic Leveling Formula (Frontend)
 * Level = floor(sqrt(totalXP / 100)) + 1
 */

export const calculateLevel = (xp) => {
    if (!xp || xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const getXPForLevel = (level) => {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 100;
};

export const getLevelProgress = (xp) => {
    if (!xp || xp < 0) return 0;
    const currentLevel = calculateLevel(xp);
    const xpForCurrent = getXPForLevel(currentLevel);
    const xpForNext = getXPForLevel(currentLevel + 1);
    
    const progress = ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
    return Math.min(100, Math.max(0, progress));
};

export const getXPToNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp);
    const xpForNext = getXPForLevel(currentLevel + 1);
    return Math.max(0, xpForNext - xp);
};
