import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface GameResult {
    wpm: number;
    accuracy: number;
    timestamp: Date;
    mode?: 'time' | 'words';
    limit?: number; // duration in seconds for time mode, word count for words mode
}

export interface ScoreEntry extends GameResult {
    id: string;
    userId: string;
    userName: string;
    photoURL?: string;
}

export interface LeaderboardFilter {
    mode: 'time' | 'words';
    limit: number;
}

/**
 * Save a game score to Firestore
 */
export async function saveScore(result: GameResult, user: User | null) {
    if (!user) return;

    try {
        await addDoc(collection(db, 'scores'), {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            photoURL: user.photoURL,
            wpm: result.wpm,
            accuracy: result.accuracy,
            mode: result.mode || 'words',
            limit: result.limit || 25,
            timestamp: Timestamp.fromDate(result.timestamp)
        });
    } catch (e) {
        console.error("Error adding score: ", e);
    }
}

/**
 * Get leaderboard with optional filters
 * NOTE: You may need to create a composite index in Firebase Console for:
 * Collection: scores
 * Fields: mode (Ascending), limit (Ascending), wpm (Descending)
 */
export async function getLeaderboard(filter?: LeaderboardFilter): Promise<ScoreEntry[]> {
    let q;

    if (filter) {
        // Filtered query: mode + limit + orderBy wpm
        q = query(
            collection(db, 'scores'),
            where('mode', '==', filter.mode),
            where('limit', '==', filter.limit),
            orderBy('wpm', 'desc'),
            limit(20)
        );
    } else {
        // Default: just get top scores regardless of mode
        q = query(
            collection(db, 'scores'),
            orderBy('wpm', 'desc'),
            limit(20)
        );
    }

    try {
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                photoURL: data.photoURL,
                wpm: data.wpm,
                accuracy: data.accuracy,
                mode: data.mode,
                limit: data.limit,
                timestamp: data.timestamp?.toDate() || new Date()
            };
        });
    } catch (e) {
        console.error("Error fetching leaderboard: ", e);
        // If index doesn't exist yet, fall back to unfiltered query
        console.warn("Falling back to unfiltered query. Create composite index if needed.");
        const fallbackQ = query(
            collection(db, 'scores'),
            orderBy('wpm', 'desc'),
            limit(20)
        );
        const fallbackSnapshot = await getDocs(fallbackQ);
        return fallbackSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                photoURL: data.photoURL,
                wpm: data.wpm,
                accuracy: data.accuracy,
                mode: data.mode,
                limit: data.limit,
                timestamp: data.timestamp?.toDate() || new Date()
            };
        });
    }
}
