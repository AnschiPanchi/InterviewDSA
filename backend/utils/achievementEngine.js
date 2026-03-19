const BADGES = [
    { id: 'first_step', name: 'First Step', description: 'Complete your first practice problem', icon: '🌱', category: 'General' },
    { id: 'quest_novice', name: 'Quest Novice', description: 'Complete 10 system quests', icon: '⚔️', category: 'Quests', threshold: 10, type: 'quests' },
    { id: 'quest_master', name: 'Quest Master', description: 'Complete 50 system quests', icon: '👑', category: 'Quests', threshold: 50, type: 'quests' },
    { id: 'duel_bronze', name: 'Duelist Bronze', description: 'Win 5 code duels', icon: '🥉', category: 'Duels', threshold: 5, type: 'duelWins' },
    { id: 'duel_silver', name: 'Duelist Silver', description: 'Win 20 code duels', icon: '🥈', category: 'Duels', threshold: 20, type: 'duelWins' },
    { id: 'duel_gold', name: 'Duelist Gold', description: 'Win 50 code duels', icon: '🥇', category: 'Duels', threshold: 50, type: 'duelWins' },
    { id: 'interview_ready', name: 'Interview Ready', description: 'Complete 5 AI mock interviews', icon: '💼', category: 'Career', threshold: 5, type: 'interviews' },
];

export const checkAchievements = async (user, stats = {}) => {
    const existingIds = new Set(user.achievements.map(a => a.id));
    const newAchievements = [];

    for (const badge of BADGES) {
        if (existingIds.has(badge.id)) continue;

        let earned = false;
        if (badge.type === 'quests' && stats.questsCount >= badge.threshold) earned = true;
        if (badge.type === 'duelWins' && user.duelWins >= badge.threshold) earned = true;
        if (badge.type === 'interviews' && stats.interviewsCount >= badge.threshold) earned = true;
        
        // Special case for first step
        if (badge.id === 'first_step' && (stats.questsCount > 0 || user.duelWins > 0)) earned = true;

        if (earned) {
            newAchievements.push({ id: badge.id, earnedAt: new Date() });
        }
    }

    if (newAchievements.length > 0) {
        user.achievements.push(...newAchievements);
        await user.save();
    }

    return newAchievements;
};

export const getAllAvailableBadges = () => BADGES;
