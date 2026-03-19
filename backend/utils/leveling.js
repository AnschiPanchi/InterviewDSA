/**
 * Logarithmic Leveling Formula:
 * Level = floor(sqrt(totalXP / 100)) + 1
 * 
 * Thresholds:
 * Lvl 1: 0 XP
 * Lvl 2: 100 XP
 * Lvl 3: 400 XP
 * Lvl 4: 900 XP
 * Lvl 5: 1600 XP
 * ...
 * Lvl 10: 8100 XP
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
    const currentLevel = calculateLevel(xp);
    const xpForCurrent = getXPForLevel(currentLevel);
    const xpForNext = getXPForLevel(currentLevel + 1);
    
    const progress = ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
    return Math.min(100, Math.max(0, progress));
};
