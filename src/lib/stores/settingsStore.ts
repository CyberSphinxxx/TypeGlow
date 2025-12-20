import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type CaretStyle = 'line' | 'block' | 'underline';

// Load from localStorage with defaults
const storedSmoothCaret = browser ? localStorage.getItem('smoothCaret') : null;
const storedCaretStyle = browser ? localStorage.getItem('caretStyle') : null;

export const smoothCaret = writable<boolean>(storedSmoothCaret !== null ? storedSmoothCaret === 'true' : true);
export const caretStyle = writable<CaretStyle>((storedCaretStyle as CaretStyle) || 'line');

// Persist to localStorage on change
if (browser) {
    smoothCaret.subscribe((value) => {
        localStorage.setItem('smoothCaret', String(value));
    });

    caretStyle.subscribe((value) => {
        localStorage.setItem('caretStyle', value);
    });
}
