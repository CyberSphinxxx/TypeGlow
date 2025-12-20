import { words } from './data/words';

export interface CharState {
    char: string;
    status: 'correct' | 'incorrect' | 'current' | 'pending' | 'incorrect-space';
}

export interface GameConfig {
    usePunctuation: boolean;
    useNumbers: boolean;
    mode: 'time' | 'words';
    limit: number; // Word count for 'words' mode, seconds for 'time' mode
}

export interface GameState {
    targetText: string;
    charStates: CharState[];
    wpm: number;
    accuracy: number;
    typingComplete: boolean;
    startTime: number | null;
    endTime: number | null;
    currentStreak: number;
    config: GameConfig;
}

const DEFAULT_CONFIG: GameConfig = {
    usePunctuation: false,
    useNumbers: false,
    mode: 'words',
    limit: 25
};

// Common punctuation marks
const PUNCTUATION_MARKS = ['.', ',', '?', '!'];

// Random number strings for injection
const NUMBER_STRINGS = ['42', '1990', '2024', '100', '365', '7', '13', '99', '2025', '500', '123', '777'];

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
            endTime: null,
            currentStreak: 0,
            config: { ...DEFAULT_CONFIG }
        };
    }

    public reset(): GameState {
        this.state = this.getInitialState();
        return this.state;
    }

    /**
     * Start a new game with the given configuration
     */
    public startGame(config: Partial<GameConfig> = {}): GameState {
        const finalConfig: GameConfig = { ...DEFAULT_CONFIG, ...config };

        // Generate words based on config
        const targetText = this.generateText(finalConfig);

        this.state = {
            ...this.getInitialState(),
            targetText: targetText,
            startTime: null, // Will be set on first keystroke
            config: finalConfig
        };

        // Initialize charStates for the new text
        this.state.charStates = this.calculateCharStates('');

        return this.state;
    }

    /**
     * Legacy method for backward compatibility
     */
    public startLevel(level: string): GameState {
        // Map old levels to new config
        const wordCounts: Record<string, number> = {
            'easy': 12,
            'medium': 12,
            'hard': 8,
            'impossible': 50
        };

        return this.startGame({
            mode: 'words',
            limit: wordCounts[level] || 25,
            usePunctuation: false,
            useNumbers: false
        });
    }

    /**
     * Generate text based on configuration
     */
    private generateText(config: GameConfig): string {
        // Get base word list (using easy words as base)
        const baseWords = words['easy'] || [];
        const shuffled = [...baseWords].sort(() => 0.5 - Math.random());

        // Determine word count
        const wordCount = config.mode === 'words' ? config.limit : Math.max(50, config.limit * 2);

        // Select words
        let selectedWords = shuffled.slice(0, wordCount);

        // Apply punctuation modifications
        if (config.usePunctuation) {
            selectedWords = this.applyPunctuation(selectedWords);
        }

        // Inject numbers
        if (config.useNumbers) {
            selectedWords = this.injectNumbers(selectedWords);
        }

        return selectedWords.join(' ');
    }

    /**
     * Apply punctuation: capitalize ~20% of words and add punctuation marks
     */
    private applyPunctuation(wordList: string[]): string[] {
        return wordList.map((word, index) => {
            let modifiedWord = word;

            // Capitalize ~20% of words
            if (Math.random() < 0.2) {
                modifiedWord = modifiedWord.charAt(0).toUpperCase() + modifiedWord.slice(1);
            }

            // Add punctuation to ~15% of words (end of sentences)
            if (Math.random() < 0.15 && index < wordList.length - 1) {
                const punct = PUNCTUATION_MARKS[Math.floor(Math.random() * PUNCTUATION_MARKS.length)];
                modifiedWord += punct;
            }

            return modifiedWord;
        });
    }

    /**
     * Inject number strings every ~10 words
     */
    private injectNumbers(wordList: string[]): string[] {
        const result: string[] = [];

        wordList.forEach((word, index) => {
            result.push(word);

            // Inject a number every ~10 words
            if ((index + 1) % 10 === 0 && Math.random() < 0.7) {
                const num = NUMBER_STRINGS[Math.floor(Math.random() * NUMBER_STRINGS.length)];
                result.push(num);
            }
        });

        return result;
    }

    public handleInput(inputText: string): GameState {
        if (this.state.typingComplete) return this.state;

        if (!this.state.startTime) {
            this.state.startTime = Date.now();
        }

        const prevLen = this.getTypedLength();
        this.state.charStates = this.calculateCharStates(inputText);

        // Update streak logic
        const currentLen = inputText.length;
        if (currentLen > prevLen) {
            const lastCharIndex = currentLen - 1;
            const state = this.state.charStates[lastCharIndex];

            if (inputText[lastCharIndex] === ' ' || currentLen === this.state.targetText.length) {
                if (this.isLastWordCorrect(inputText)) {
                    this.state.currentStreak++;
                } else {
                    this.state.currentStreak = 0;
                }
            } else if (state.status === 'incorrect' || state.status === 'incorrect-space') {
                this.state.currentStreak = 0;
            }
        }

        // Check completion (Words mode: exact match)
        if (inputText === this.state.targetText) {
            this.state.typingComplete = true;
            this.state.endTime = Date.now();
            this.calculateWPM();
            this.calculateAccuracy();
        }

        return this.state;
    }

    /**
     * Check if time is up (for Time mode)
     */
    public checkTimeUp(): boolean {
        if (this.state.config.mode !== 'time' || !this.state.startTime) {
            return false;
        }

        const elapsedSeconds = (Date.now() - this.state.startTime) / 1000;
        if (elapsedSeconds >= this.state.config.limit) {
            this.state.typingComplete = true;
            this.state.endTime = Date.now();
            this.calculateWPM();
            this.calculateAccuracy();
            return true;
        }

        return false;
    }

    /**
     * Get remaining time for Time mode
     */
    public getRemainingTime(): number {
        if (this.state.config.mode !== 'time' || !this.state.startTime) {
            return this.state.config.limit;
        }

        const elapsed = (Date.now() - this.state.startTime) / 1000;
        return Math.max(0, this.state.config.limit - elapsed);
    }

    /**
     * Get elapsed time (for Words mode timer display)
     */
    public getElapsedTime(): number {
        if (!this.state.startTime) return 0;
        const endTime = this.state.endTime || Date.now();
        return (endTime - this.state.startTime) / 1000;
    }

    private getTypedLength(): number {
        return this.state.charStates.filter(s => s.status !== 'pending' && s.status !== 'current').length;
    }

    private isLastWordCorrect(inputText: string): boolean {
        const words = inputText.trim().split(' ');
        if (words.length === 0) return true;

        let end = inputText.length - 1;
        if (inputText[end] === ' ') end--;

        let start = inputText.lastIndexOf(' ', end - 1) + 1;

        for (let i = start; i <= end; i++) {
            if (this.state.charStates[i].status !== 'correct') return false;
        }
        return true;
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
        if (this.state.startTime) {
            const endTime = this.state.endTime || Date.now();
            const timeTakenInMinutes = (endTime - this.state.startTime) / 60000;
            if (timeTakenInMinutes > 0) {
                const typedChars = this.state.charStates.filter(c => c.status === 'correct').length;
                this.state.wpm = Math.round((typedChars / 5) / timeTakenInMinutes);
            }
        }
    }

    public updateLiveWPM(): GameState {
        if (!this.state.typingComplete && this.state.startTime) {
            this.calculateWPM();

            // Check time limit for Time mode
            if (this.state.config.mode === 'time') {
                this.checkTimeUp();
            }
        }
        return this.state;
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
