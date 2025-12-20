import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Achievement definition interface
export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'speed' | 'consistency' | 'mastery';
}

// Unlocked achievement (stored in Firestore)
export interface UnlockedAchievement {
    id: string;
    unlockedAt: Date;
}

// User stats needed for achievement checking
export interface UserStats {
    bestWpm: number;
    testsCompleted: number;
    bestAccuracy: number;
    completedModes: { mode: string; limit: number }[];
}

// All achievement definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
    // Speed Milestones
    { id: 'speed_50', name: 'Speed Demon', description: 'Reach 50 WPM', icon: '🚀', category: 'speed' },
    { id: 'speed_75', name: 'Lightning Fingers', description: 'Reach 75 WPM', icon: '⚡', category: 'speed' },
    { id: 'speed_100', name: 'On Fire', description: 'Reach 100 WPM', icon: '🔥', category: 'speed' },
    { id: 'speed_125', name: 'Diamond Hands', description: 'Reach 125 WPM', icon: '💎', category: 'speed' },
    { id: 'speed_150', name: 'Typing Royalty', description: 'Reach 150 WPM', icon: '👑', category: 'speed' },

    // Consistency Milestones
    { id: 'accuracy_100', name: 'Sharpshooter', description: '100% accuracy on any test', icon: '🎯', category: 'consistency' },
    { id: 'tests_10', name: 'Bronze Grinder', description: 'Complete 10 tests', icon: '🏅', category: 'consistency' },
    { id: 'tests_100', name: 'Silver Grinder', description: 'Complete 100 tests', icon: '🥈', category: 'consistency' },
    { id: 'tests_500', name: 'Gold Grinder', description: 'Complete 500 tests', icon: '🥇', category: 'consistency' },
    { id: 'tests_1000', name: 'Dedication', description: 'Complete 1000 tests', icon: '💯', category: 'consistency' },

    // Mode Mastery
    { id: 'time_master', name: 'Time Trial Pro', description: 'Complete all time modes', icon: '⏱️', category: 'mastery' },
    { id: 'word_master', name: 'Word Master', description: 'Complete all word modes', icon: '📝', category: 'mastery' },
    { id: 'all_rounder', name: 'All-Rounder', description: 'Try every mode at least once', icon: '🌟', category: 'mastery' },
];

// Mode requirements for mastery achievements
const TIME_MODES = [15, 30, 60, 120];
const WORD_MODES = [10, 25, 50, 100];

/**
 * Get user's unlocked achievements from Firestore
 */
export async function getUserAchievements(userId: string): Promise<UnlockedAchievement[]> {
    try {
        const docRef = doc(db, 'achievements', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const unlocked = data.unlocked || [];
            return unlocked.map((a: { id: string; unlockedAt: Timestamp }) => ({
                id: a.id,
                unlockedAt: a.unlockedAt?.toDate?.() || new Date()
            }));
        }
        return [];
    } catch (e) {
        console.error('Error fetching achievements:', e);
        return [];
    }
}

/**
 * Check and unlock achievements based on user stats
 * Returns array of newly unlocked achievement IDs
 */
export async function checkAndUnlockAchievements(
    userId: string,
    stats: UserStats
): Promise<string[]> {
    const currentAchievements = await getUserAchievements(userId);
    const unlockedIds = new Set(currentAchievements.map(a => a.id));
    const newlyUnlocked: string[] = [];

    // Check Speed achievements
    if (stats.bestWpm >= 50 && !unlockedIds.has('speed_50')) {
        newlyUnlocked.push('speed_50');
    }
    if (stats.bestWpm >= 75 && !unlockedIds.has('speed_75')) {
        newlyUnlocked.push('speed_75');
    }
    if (stats.bestWpm >= 100 && !unlockedIds.has('speed_100')) {
        newlyUnlocked.push('speed_100');
    }
    if (stats.bestWpm >= 125 && !unlockedIds.has('speed_125')) {
        newlyUnlocked.push('speed_125');
    }
    if (stats.bestWpm >= 150 && !unlockedIds.has('speed_150')) {
        newlyUnlocked.push('speed_150');
    }

    // Check Accuracy achievement
    if (stats.bestAccuracy >= 100 && !unlockedIds.has('accuracy_100')) {
        newlyUnlocked.push('accuracy_100');
    }

    // Check Tests completed achievements
    if (stats.testsCompleted >= 10 && !unlockedIds.has('tests_10')) {
        newlyUnlocked.push('tests_10');
    }
    if (stats.testsCompleted >= 100 && !unlockedIds.has('tests_100')) {
        newlyUnlocked.push('tests_100');
    }
    if (stats.testsCompleted >= 500 && !unlockedIds.has('tests_500')) {
        newlyUnlocked.push('tests_500');
    }
    if (stats.testsCompleted >= 1000 && !unlockedIds.has('tests_1000')) {
        newlyUnlocked.push('tests_1000');
    }

    // Check Mode mastery achievements
    const completedTimeModes = stats.completedModes
        .filter(m => m.mode === 'time')
        .map(m => m.limit);
    const completedWordModes = stats.completedModes
        .filter(m => m.mode === 'words')
        .map(m => m.limit);

    const hasAllTimeModes = TIME_MODES.every(t => completedTimeModes.includes(t));
    const hasAllWordModes = WORD_MODES.every(w => completedWordModes.includes(w));

    if (hasAllTimeModes && !unlockedIds.has('time_master')) {
        newlyUnlocked.push('time_master');
    }
    if (hasAllWordModes && !unlockedIds.has('word_master')) {
        newlyUnlocked.push('word_master');
    }

    // All-Rounder: at least one of each mode+limit combo
    const allModesCombos = [
        ...TIME_MODES.map(t => `time-${t}`),
        ...WORD_MODES.map(w => `words-${w}`)
    ];
    const userCombos = stats.completedModes.map(m => `${m.mode}-${m.limit}`);
    const hasAllCombos = allModesCombos.every(c => userCombos.includes(c));

    if (hasAllCombos && !unlockedIds.has('all_rounder')) {
        newlyUnlocked.push('all_rounder');
    }

    // Save newly unlocked achievements
    if (newlyUnlocked.length > 0) {
        await saveNewAchievements(userId, currentAchievements, newlyUnlocked);
    }

    return newlyUnlocked;
}

/**
 * Save newly unlocked achievements to Firestore
 */
async function saveNewAchievements(
    userId: string,
    existing: UnlockedAchievement[],
    newIds: string[]
): Promise<void> {
    const docRef = doc(db, 'achievements', userId);
    const now = Timestamp.now();

    const newAchievements = newIds.map(id => ({
        id,
        unlockedAt: now
    }));

    const allUnlocked = [
        ...existing.map(a => ({ id: a.id, unlockedAt: Timestamp.fromDate(a.unlockedAt) })),
        ...newAchievements
    ];

    try {
        await setDoc(docRef, { unlocked: allUnlocked }, { merge: true });
    } catch (e) {
        console.error('Error saving achievements:', e);
    }
}

/**
 * Get achievement definition by ID
 */
export function getAchievementById(id: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}
