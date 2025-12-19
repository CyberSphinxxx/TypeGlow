import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface GameResult {
    wpm: number;
    accuracy: number;
    timestamp: Date;
}

export interface ScoreEntry extends GameResult {
    id: string;
    userId: string;
    userName: string;
    photoURL?: string;
}

export async function saveScore(result: GameResult, user: User | null) {
    if (!user) return;

    try {
        await addDoc(collection(db, 'scores'), {
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            photoURL: user.photoURL,
            wpm: result.wpm,
            accuracy: result.accuracy,
            timestamp: Timestamp.fromDate(result.timestamp)
        });
    } catch (e) {
        console.error("Error adding score: ", e);
    }
}

export async function getLeaderboard(): Promise<ScoreEntry[]> {
    const q = query(collection(db, 'scores'), orderBy('wpm', 'desc'), limit(10));
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
            timestamp: data.timestamp.toDate()
        };
    });
}
