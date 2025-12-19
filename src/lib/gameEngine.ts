import { words } from './data/words';

export interface CharState {
    char: string;
    status: 'correct' | 'incorrect' | 'current' | 'pending' | 'incorrect-space';
}

export interface GameState {
    targetText: string;
    charStates: CharState[];
    wpm: number;
    accuracy: number;
    typingComplete: boolean;
    startTime: number | null;
    endTime: number | null;
}

export class TypingEngine {
    private state: GameState;

    constructor() {
        this.state = this.getInitialState();
    }

    private getInitialState(): GameState {
        return {
            targetText: 'Choose a Level to Start Playing',
            charStates: [],
            wpm: 0,
            accuracy: 0,
            typingComplete: false,
            startTime: null,
            endTime: null
        };
    }

    public reset(): GameState {
        this.state = this.getInitialState();
        return this.state;
    }

    public startLevel(level: string): GameState {
        const levelWords = words[level] || words['easy'];
        const numberOfWords = level === 'easy' ? 12 : level === 'medium' ? 12 : level === 'hard' ? 8 : 50;

        // Shuffle and slice
        const shuffledWords = [...levelWords].sort(() => 0.5 - Math.random());
        const targetText = shuffledWords.slice(0, numberOfWords).join(' ');

        this.state = {
            ...this.getInitialState(),
            targetText: targetText,
            startTime: Date.now(),
        };

        // Initialize charStates for the new text
        this.state.charStates = this.calculateCharStates('');

        return this.state;
    }

    public handleInput(inputText: string): GameState {
        if (this.state.typingComplete) return this.state;

        if (!this.state.startTime) {
            this.state.startTime = Date.now();
        }

        this.state.charStates = this.calculateCharStates(inputText);

        // Check completion
        if (inputText === this.state.targetText) {
            this.state.typingComplete = true;
            this.state.typingComplete = true;
            this.state.endTime = Date.now();
            this.calculateWPM();
            this.calculateAccuracy();
        }

        return this.state;
    }

    private calculateCharStates(inputText: string): CharState[] {
        const target = this.state.targetText;
        const result: CharState[] = [];
        const inputLen = inputText.length;

        for (let i = 0; i < target.length; i++) {
            const targetChar = target[i];
            const inputChar = inputText[i];

            let status: CharState['status'] = 'pending';

            if (i < inputLen) {
                if (targetChar === ' ' && inputChar !== ' ') {
                    status = 'incorrect-space';
                } else if (inputChar === targetChar) {
                    status = 'correct';
                } else {
                    status = 'incorrect';
                }
            } else if (i === inputLen) {
                status = 'current';
            }

            result.push({ char: targetChar, status });
        }
        return result;
    }

    private calculateWPM() {
        if (this.state.startTime && this.state.endTime) {
            const timeTakenInMinutes = (this.state.endTime - this.state.startTime) / 60000;
            const wordCount = this.state.targetText.split(' ').length;
            this.state.wpm = Math.round(wordCount / timeTakenInMinutes);
        }
    }

    private calculateAccuracy() {
        const totalChars = this.state.targetText.length;
        const correctChars = this.state.charStates.filter(s => s.status === 'correct').length;
        this.state.accuracy = Math.round((correctChars / totalChars) * 100);
    }

    public getState(): GameState {
        return this.state;
    }
}
