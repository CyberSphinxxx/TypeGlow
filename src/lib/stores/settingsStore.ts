import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CaretStyle = 'line' | 'block' | 'underline';
export type FontFamily = 'JetBrains Mono' | 'Fira Code' | 'Source Code Pro' | 'Roboto Mono' | 'IBM Plex Mono' | 'SF Mono';

// Font options for the settings UI
export const FONT_OPTIONS: { value: FontFamily; label: string; stack: string }[] = [
    { value: 'JetBrains Mono', label: 'JetBrains Mono', stack: "'JetBrains Mono', monospace" },
    { value: 'Fira Code', label: 'Fira Code', stack: "'Fira Code', monospace" },
    { value: 'Source Code Pro', label: 'Source Code Pro', stack: "'Source Code Pro', monospace" },
    { value: 'Roboto Mono', label: 'Roboto Mono', stack: "'Roboto Mono', monospace" },
    { value: 'IBM Plex Mono', label: 'IBM Plex Mono', stack: "'IBM Plex Mono', monospace" },
    { value: 'SF Mono', label: 'SF Mono (System)', stack: "'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace" },
];

// Load from localStorage with defaults
const storedSmoothCaret = browser ? localStorage.getItem('smoothCaret') : null;
const storedCaretStyle = browser ? localStorage.getItem('caretStyle') : null;
const storedFontFamily = browser ? localStorage.getItem('fontFamily') : null;

export const smoothCaret = writable<boolean>(storedSmoothCaret !== null ? storedSmoothCaret === 'true' : true);
export const caretStyle = writable<CaretStyle>((storedCaretStyle as CaretStyle) || 'line');
export const fontFamily = writable<FontFamily>((storedFontFamily as FontFamily) || 'JetBrains Mono');

// Persist to localStorage on change
if (browser) {
    smoothCaret.subscribe((value) => {
        localStorage.setItem('smoothCaret', String(value));
    });

    caretStyle.subscribe((value) => {
        localStorage.setItem('caretStyle', value);
    });

    fontFamily.subscribe((value) => {
        localStorage.setItem('fontFamily', value);
    });
}
