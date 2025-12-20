<script lang="ts">
    import { soundEnabled } from "../services/soundManager";
</script>

<!-- Keybind Hints (Centered Footer) -->
<div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
    <div
        class="flex items-center gap-2 text-xs text-gray-600 font-['JetBrains_Mono']"
    >
        <kbd
            class="px-2 py-1 bg-gray-800/80 rounded border border-gray-700 text-gray-500"
            >tab</kbd
        >
        <span class="text-gray-700">-</span>
        <span>restart test</span>
    </div>
</div>

<!-- Control Dock (Bottom Right) -->
<footer class="fixed bottom-8 right-8 z-50">
    <div
        class="flex items-center gap-4 px-6 py-3 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-full opacity-30 hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
    >
        <!-- SOUND TOGGLE -->
        <button
            class="text-gray-400 hover:text-cyan-400 transition-colors"
            onclick={() => soundEnabled.update((v) => !v)}
            title={$soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
            aria-label="Toggle Sound"
        >
            {#if $soundEnabled}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                    ></polygon>
                    <path
                        d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                    ></path>
                </svg>
            {:else}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                    ></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            {/if}
        </button>

        <!-- THEME TOGGLE (Placeholder) -->
        <button
            class="text-gray-400 hover:text-cyan-400 transition-colors"
            title="Theme (Coming Soon)"
            aria-label="Toggle Theme"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="5"></circle>
                <path
                    d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                ></path>
            </svg>
        </button>

        <!-- GITHUB LINK -->
        <a
            href="https://github.com/CyberSphinxxx"
            target="_blank"
            class="text-gray-400 hover:text-cyan-400 transition-colors flex items-center"
            title="View on GitHub"
            aria-label="GitHub"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                ></path>
            </svg>
        </a>
    </div>
</footer>
