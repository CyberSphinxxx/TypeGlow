<script lang="ts">
    import type { CharState } from "$lib/gameEngine";

    let {
        targetText,
        charStates,
        wpm,
        hiddenInput = $bindable(),
        oninput,
        onreset,
        typingComplete,
        isInputFocused = $bindable(false),
        currentStreak = 0,
        accuracy = 0,
        testDuration = 0,
        remainingTime = 0,
        gameMode = "words",
    } = $props<{
        targetText: string;
        charStates: CharState[];
        wpm: number;
        hiddenInput: string;
        oninput: (val: string) => void;
        onreset: () => void;
        typingComplete: boolean;
        isInputFocused?: boolean;
        currentStreak?: number;
        accuracy?: number;
        testDuration?: number;
        remainingTime?: number;
        gameMode?: string;
    }>();

    import { onMount, onDestroy } from "svelte";

    let containerRef: HTMLDivElement;
    let textRef: HTMLParagraphElement;
    let charElements: HTMLElement[] = $state([]);
    let cursorStyle = $state("display: none;");
    let resizeObserver: ResizeObserver;

    onMount(() => {
        focusInput();
        updateCursor();

        // Update cursor when text dimensions change (e.g. font load, content change)
        resizeObserver = new ResizeObserver(() => {
            updateCursor();
        });

        if (textRef) resizeObserver.observe(textRef);

        window.addEventListener("resize", updateCursor);
        return () => {
            window.removeEventListener("resize", updateCursor);
            resizeObserver.disconnect();
        };
    });

    $effect(() => {
        // Recalculate cursor whenever input changes
        hiddenInput; // dependency
        charStates; // dependency
        // Use timeout to wait for DOM update
        setTimeout(updateCursor, 0);
        // Also update after transition ends (300ms) to ensure alignment if scaling happened
        setTimeout(updateCursor, 310);
    });

    function updateCursor() {
        if (!containerRef || !charElements.length) return;

        // Find current active char index
        const currentIndex = charStates.findIndex(
            (s: CharState) => s.status === "current",
        );

        if (currentIndex !== -1 && charElements[currentIndex]) {
            const el = charElements[currentIndex];
            const containerRect = containerRef.getBoundingClientRect();
            const rect = el.getBoundingClientRect();

            const top = rect.top - containerRect.top;
            const left = rect.left - containerRect.left;
            const width = rect.width;
            const height = rect.height;

            cursorStyle = `
                display: block;
                top: ${top}px;
                left: ${left}px;
                width: ${width}px;
                height: ${height}px;
            `;
        } else if (hiddenInput.length === charStates.length) {
            // End of text, maybe hide or place at end?
            cursorStyle = "display: none;";
        }
    }

    function focusInput() {
        const input = document.getElementById("userInput") as HTMLInputElement;
        if (input && !typingComplete && charStates.length > 0) {
            input.focus();
            input.click();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (charStates.length === 0) return; // Ignore keys if not started
        if (e.key === "Enter") focusInput();
        if (e.key === "Tab") {
            e.preventDefault();
            onreset();
            focusInput();
        }
        if (e.key === "Escape") {
            e.preventDefault();
            onreset();
            // Don't auto-focus if user wants to abort, but usually reset implies ready to go.
            // Requirement said "Stop timer... Reset... Set Focus Mode false"
            // Resetting clears startTime, so Focus Mode should exit via derive.
            // Let's keep focus so they can type again if they want, or they can click away.
            focusInput();
        }
    }

    let correctChars = $derived(
        charStates.filter((s: CharState) => s.status === "correct").length,
    );
    let wrongChars = $derived(
        charStates.filter((s: CharState) => s.status.includes("incorrect"))
            .length,
    );
</script>

<div
    class="container flex flex-col justify-start pt-12 text-center w-[90%] sm:w-[90%] w-full max-w-[1200px] h-[300px] overflow-hidden mt-[10px] select-none break-words whitespace-normal relative mx-auto focus:outline-none group transition-all duration-500 {currentStreak >=
    10
        ? 'drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]'
        : ''}"
    onclick={focusInput}
    role="button"
    tabindex="0"
    onkeydown={handleKeydown}
    bind:this={containerRef}
>
    <!-- Live Stats Row -->
    {#if !typingComplete && charStates.length > 0}
        <div
            class="absolute top-0 left-0 right-0 flex justify-between items-center"
        >
            <!-- Live WPM (left) -->
            {#if wpm > 0}
                <div class="text-cyan-500/50 font-bold text-xl select-none">
                    {wpm} WPM
                </div>
            {:else}
                <div></div>
            {/if}

            <!-- Timer (right, only in time mode) -->
            {#if gameMode === "time"}
                <div
                    class="text-cyan-400 font-bold text-2xl font-['JetBrains_Mono'] select-none {remainingTime <=
                    10
                        ? 'text-red-400 animate-pulse'
                        : ''}"
                >
                    {Math.ceil(remainingTime)}s
                </div>
            {/if}
        </div>
    {/if}

    <!-- Gliding Cursor -->
    <div
        class="absolute bg-yellow-400/30 animate-pulse transition-all duration-100 ease-out z-0 rounded-sm"
        style={cursorStyle}
    ></div>

    <p
        id="targetText"
        bind:this={textRef}
        class="text-3xl sm:text-4xl leading-relaxed tracking-wide font-['JetBrains_Mono'] relative z-10 transition-all {charStates.length ===
        0
            ? 'text-slate-400 scale-90'
            : 'text-gray-500 scale-100'} {!isInputFocused &&
        charStates.length > 0 &&
        !typingComplete
            ? 'duration-300 blur-[2px] opacity-50'
            : 'duration-0 blur-0 opacity-100'}"
    >
        {#if charStates.length === 0}
            {targetText}
        {:else}
            {#each charStates as state, i}
                {#if state.status === "correct"}
                    <span
                        bind:this={charElements[i]}
                        class="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] pb-1"
                        >{state.char}</span
                    >
                {:else if state.status === "incorrect"}
                    <span
                        bind:this={charElements[i]}
                        class="text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] pb-1"
                        >{state.char}</span
                    >
                {:else if state.status === "incorrect-space"}
                    <span bind:this={charElements[i]} class="bg-red-500/50 pb-1"
                        >&nbsp;</span
                    >
                {:else if state.status === "current"}
                    <span bind:this={charElements[i]} class="text-white pb-1"
                        >{state.char}</span
                    >
                {:else}
                    <span
                        bind:this={charElements[i]}
                        class="opacity-50 pb-1 transition-all duration-300"
                        >{state.char}</span
                    >
                {/if}
            {/each}
        {/if}
    </p>

    <input
        type="text"
        id="userInput"
        class="absolute opacity-0 top-0 left-0 h-0 w-0"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        data-form-type="other"
        bind:value={hiddenInput}
        oninput={() => oninput(hiddenInput)}
        disabled={typingComplete || charStates.length === 0}
        onfocus={() => (isInputFocused = true)}
        onblur={() => (isInputFocused = false)}
    />

    {#if !typingComplete && charStates.length > 0}
        {#if !isInputFocused}
            <div
                class="absolute inset-0 flex items-center justify-center z-50 rounded-lg cursor-pointer icon-fade"
                onclick={focusInput}
                role="button"
                tabindex="0"
                onkeydown={(e) => {
                    if (e.key === "Enter") focusInput();
                }}
            >
                <div class="flex flex-col items-center gap-3 text-gray-500">
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
                        ><path
                            d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
                        /></svg
                    >
                    <p class="font-bold text-lg animate-pulse">
                        Click or Press any key to focus
                    </p>
                </div>
            </div>
        {/if}

        <p
            class="text-sm text-gray-600 mt-8 opacity-50 transition-opacity duration-500"
        >
            Press <span class="border border-gray-600 rounded px-1 text-xs"
                >Esc</span
            > to restart
        </p>
    {/if}
</div>

<!-- Success Screen (Overlay) - Outside container to avoid overflow clipping -->
{#if typingComplete}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-md transition-all duration-500"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="bg-gray-900/95 border border-cyan-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] max-w-4xl w-full mx-4 flex flex-col gap-8 relative overflow-hidden"
        >
            <!-- Decorative Elements -->
            <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"
            ></div>

            <h2
                class="text-3xl font-['JetBrains_Mono'] text-white text-center tracking-widest uppercase mb-2"
            >
                System Report <span class="text-cyan-500">//</span> Completed
            </h2>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- WPM -->
                <div
                    class="bg-black/40 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center"
                >
                    <span
                        class="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2"
                        >Speed</span
                    >
                    <div
                        class="text-6xl font-['JetBrains_Mono'] font-bold text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                    >
                        {wpm}
                    </div>
                    <span class="text-cyan-500/50 text-xs font-bold mt-1"
                        >WPM</span
                    >
                </div>

                <!-- Accuracy -->
                <div
                    class="bg-black/40 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center"
                >
                    <span
                        class="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2"
                        >Accuracy</span
                    >
                    <div
                        class="text-5xl font-['JetBrains_Mono'] font-bold {accuracy ===
                        100
                            ? 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]'
                            : accuracy >= 95
                              ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                              : 'text-red-400'}"
                    >
                        {accuracy}%
                    </div>
                </div>

                <!-- Characters -->
                <div
                    class="bg-black/40 p-4 rounded-xl border border-gray-800 flex flex-col justify-center gap-3 font-mono text-sm"
                >
                    <span
                        class="text-gray-500 text-xs font-mono uppercase tracking-widest text-center"
                        >Characters</span
                    >
                    <div class="space-y-2 w-full px-2">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Correct</span>
                            <span class="text-green-400 font-bold"
                                >{correctChars}</span
                            >
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400">Incorrect</span>
                            <span class="text-red-400 font-bold"
                                >{wrongChars}</span
                            >
                        </div>
                        <div class="h-px bg-gray-700/50 my-1"></div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500">Total</span>
                            <span class="text-white font-bold"
                                >{charStates.length}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Time -->
                <div
                    class="bg-black/40 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center"
                >
                    <span
                        class="text-gray-500 text-xs font-mono uppercase tracking-widest mb-2"
                        >Time</span
                    >
                    <div class="text-3xl font-['JetBrains_Mono'] text-white">
                        {testDuration.toFixed(1)}<span
                            class="text-lg text-gray-500 ml-1">s</span
                        >
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="flex items-center justify-center gap-6 mt-4">
                <button
                    id="resetButton"
                    class="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-['JetBrains_Mono'] font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all flex items-center gap-3 active:scale-95"
                    onclick={onreset}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="transition-transform group-hover:rotate-180 duration-500"
                        ><path
                            d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                        /><path d="M3 3v5h5" /></svg
                    >
                    <span>Restart</span>

                    <div
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                    >
                        Press <span
                            class="text-cyan-400 border border-gray-700 px-1 rounded bg-black/50"
                            >Tab</span
                        >
                    </div>
                </button>

                <button
                    class="px-8 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-['JetBrains_Mono'] font-bold text-lg rounded-xl transition-all flex items-center gap-3 active:scale-95"
                    onclick={onreset}
                >
                    <span>Next Level</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        ><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
                    >
                </button>
            </div>
        </div>
    </div>
{/if}

<svelte:window
    onkeydown={(e) => {
        // Global listener: If not focused, game active, and not special key -> Focus
        if (
            !isInputFocused &&
            charStates.length > 0 &&
            !typingComplete &&
            e.key.length === 1 &&
            !e.ctrlKey &&
            !e.metaKey &&
            !e.altKey
        ) {
            focusInput();
        }
    }}
/>
