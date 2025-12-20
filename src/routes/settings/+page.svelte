<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { theme } from "$lib/stores/themeStore";
    import { soundEnabled } from "$lib/services/soundManager";
    import {
        smoothCaret,
        caretStyle,
        type CaretStyle,
    } from "$lib/stores/settingsStore";
    import {
        Sun,
        Moon,
        Volume2,
        VolumeX,
        Type,
        MousePointer2,
    } from "lucide-svelte";

    const caretStyles: { value: CaretStyle; label: string }[] = [
        { value: "line", label: "Line |" },
        { value: "block", label: "Block █" },
        { value: "underline", label: "Underline _" },
    ];

    function toggleTheme() {
        theme.update((t) => (t === "dark" ? "light" : "dark"));
    }

    function toggleSound() {
        soundEnabled.update((v) => !v);
    }

    function toggleSmoothCaret() {
        smoothCaret.update((v) => !v);
    }

    function setCaretStyle(style: CaretStyle) {
        caretStyle.set(style);
    }
</script>

<Header />

<main
    class="flex-grow flex flex-col justify-center items-center w-full min-h-screen relative z-10 p-5 pt-24"
>
    <!-- Glow Effect Behind Card -->
    <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"
    ></div>

    <!-- Main Glass Card -->
    <div
        class="relative max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-10"
    >
        <!-- Header -->
        <h1
            class="text-4xl font-['JetBrains_Mono'] text-white mb-8 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        >
            <span class="text-cyan-400 drop-shadow-[0_0_15px_cyan]"
                >Settings</span
            >
        </h1>

        <!-- Settings Sections -->
        <div class="space-y-8">
            <!-- Appearance Section -->
            <section>
                <h2
                    class="text-sm text-slate-500 uppercase tracking-widest mb-4 font-mono"
                >
                    Appearance
                </h2>
                <div
                    class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4"
                >
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            {#if $theme === "dark"}
                                <Moon class="w-5 h-5 text-cyan-400" />
                            {:else}
                                <Sun class="w-5 h-5 text-yellow-400" />
                            {/if}
                            <div>
                                <div class="text-white font-['JetBrains_Mono']">
                                    Theme
                                </div>
                                <div class="text-xs text-slate-500">
                                    {$theme === "dark"
                                        ? "Dark mode"
                                        : "Light mode"}
                                </div>
                            </div>
                        </div>
                        <button
                            onclick={toggleTheme}
                            aria-label="Toggle theme"
                            class="relative w-14 h-7 bg-slate-700 rounded-full transition-colors duration-300 {$theme ===
                            'light'
                                ? 'bg-cyan-500/30'
                                : ''}"
                        >
                            <div
                                class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 {$theme ===
                                'light'
                                    ? 'translate-x-7'
                                    : ''}"
                            ></div>
                        </button>
                    </div>
                </div>
            </section>

            <!-- Sound Section -->
            <section>
                <h2
                    class="text-sm text-slate-500 uppercase tracking-widest mb-4 font-mono"
                >
                    Sound
                </h2>
                <div
                    class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4"
                >
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            {#if $soundEnabled}
                                <Volume2 class="w-5 h-5 text-cyan-400" />
                            {:else}
                                <VolumeX class="w-5 h-5 text-slate-500" />
                            {/if}
                            <div>
                                <div class="text-white font-['JetBrains_Mono']">
                                    Typing Sounds
                                </div>
                                <div class="text-xs text-slate-500">
                                    {$soundEnabled ? "Enabled" : "Disabled"}
                                </div>
                            </div>
                        </div>
                        <button
                            onclick={toggleSound}
                            aria-label="Toggle typing sounds"
                            class="relative w-14 h-7 bg-slate-700 rounded-full transition-colors duration-300 {$soundEnabled
                                ? 'bg-cyan-500/30'
                                : ''}"
                        >
                            <div
                                class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 {$soundEnabled
                                    ? 'translate-x-7'
                                    : ''}"
                            ></div>
                        </button>
                    </div>
                </div>
            </section>

            <!-- Typing Section -->
            <section>
                <h2
                    class="text-sm text-slate-500 uppercase tracking-widest mb-4 font-mono"
                >
                    Typing
                </h2>
                <div class="space-y-3">
                    <!-- Smooth Caret -->
                    <div
                        class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <MousePointer2 class="w-5 h-5 text-cyan-400" />
                                <div>
                                    <div
                                        class="text-white font-['JetBrains_Mono']"
                                    >
                                        Smooth Caret
                                    </div>
                                    <div class="text-xs text-slate-500">
                                        Animate caret movement
                                    </div>
                                </div>
                            </div>
                            <button
                                onclick={toggleSmoothCaret}
                                aria-label="Toggle smooth caret"
                                class="relative w-14 h-7 bg-slate-700 rounded-full transition-colors duration-300 {$smoothCaret
                                    ? 'bg-cyan-500/30'
                                    : ''}"
                            >
                                <div
                                    class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 {$smoothCaret
                                        ? 'translate-x-7'
                                        : ''}"
                                ></div>
                            </button>
                        </div>
                    </div>

                    <!-- Caret Style -->
                    <div
                        class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4"
                    >
                        <div class="flex items-center gap-3 mb-4">
                            <Type class="w-5 h-5 text-cyan-400" />
                            <div>
                                <div class="text-white font-['JetBrains_Mono']">
                                    Caret Style
                                </div>
                                <div class="text-xs text-slate-500">
                                    Choose your cursor appearance
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            {#each caretStyles as style}
                                <button
                                    onclick={() => setCaretStyle(style.value)}
                                    class="flex-1 py-3 px-4 rounded-lg font-mono text-sm transition-all duration-200
                                    {$caretStyle === style.value
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                                        : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700 hover:text-white'}"
                                >
                                    {style.label}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Footer Info -->
        <div
            class="mt-10 pt-6 border-t border-slate-700/50 text-center text-xs text-slate-600 font-mono"
        >
            Settings are saved automatically
        </div>
    </div>
</main>

<Footer />
