import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Check localStorage for saved preference, default to 'dark'
const storedTheme = browser ? localStorage.getItem('theme') : 'dark';
const initialTheme = storedTheme || 'dark';

export const theme = writable<'dark' | 'light'>(initialTheme as 'dark' | 'light');

// Subscribe to changes and persist to localStorage + apply to document
if (browser) {
    theme.subscribe((value) => {
        localStorage.setItem('theme', value);
        document.documentElement.setAttribute('data-theme', value);
    });
}
