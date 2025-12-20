<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import TypingArea from "$lib/components/TypingArea.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import ConfigBar from "$lib/components/ConfigBar.svelte";

    import { TypingEngine } from "$lib/gameEngine";
    import { saveScore } from "$lib/services/scoreService";
    import { user } from "$lib/stores/AuthStore";

    import { soundManager } from "$lib/services/soundManager";

    const engine = new TypingEngine();
    let gameState = $state(engine.getState());
    let currentInput = $state("");

    // Config state
    let gameMode = $state("words"); // "time" or "words"
    let quantity = $state(25); // Word count or time in seconds
    let punctuation = $state(false);
    let numbers = $state(false);
    let remainingTime = $state(0); // For timer display in time mode

    $effect(() => {
        // Unlock audio context on first interaction
        const unlock = () => {
            soundManager.unlockAudio();
            window.removeEventListener("click", unlock);
            window.removeEventListener("keydown", unlock);
        };
        window.addEventListener("click", unlock);
        window.addEventListener("keydown", unlock);
        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("keydown", unlock);
        };
    });

    $effect(() => {
        const interval = setInterval(() => {
            if (!gameState.typingComplete && gameState.startTime) {
                gameState = engine.updateLiveWPM();
                // Update remaining time for timer display
                remainingTime = engine.getRemainingTime();
            }
        }, 100); // Update more frequently for smoother timer
        return () => clearInterval(interval);
    });

    function startGame() {
        currentInput = "";

        const input = document.getElementById("userInput") as HTMLInputElement;
        if (input) input.value = "";

        // Pass config to engine
        gameState = engine.startGame({
            mode: gameMode as "time" | "words",
            limit: quantity,
            usePunctuation: punctuation,
            useNumbers: numbers,
        });

        // Initialize remaining time for time mode
        remainingTime = quantity;

        input?.focus();
    }

    function handleConfigChange() {
        // Restart with new config when user changes settings
        startGame();
    }

    async function handleInput(val: string) {
        if (gameState.typingComplete) return;

        if (val.length > currentInput.length) {
            const newState = engine.handleInput(val);
            const addedIndex = val.length - 1;
            const charState = newState.charStates[addedIndex];

            if (charState) {
                if (
                    charState.status === "correct" ||
                    (charState.char === " " && val[addedIndex] === " ")
                ) {
                    soundManager.playClick();
                } else if (
                    charState.status === "incorrect" ||
                    charState.status === "incorrect-space"
                ) {
                    soundManager.playError();
                }
            }

            gameState = newState;
        } else {
            gameState = engine.handleInput(val);
        }

        currentInput = val;

        if (gameState.typingComplete) {
            if ($user) {
                await saveScore(
                    {
                        wpm: gameState.wpm,
                        accuracy: gameState.accuracy,
                        timestamp: new Date(),
                        mode: gameMode as "time" | "words",
                        limit: quantity,
                    },
                    $user,
                );
            }
        }
    }

    function handleReset() {
        startGame();
    }

    let isInputFocused = $state(false);
</script>

<Header />

<main
    class="flex-grow flex flex-col items-center w-full max-w-[1200px] relative z-10 p-5 pt-32"
>
    <!-- Config Bar (Monkeytype Style) -->
    <ConfigBar
        bind:mode={gameMode}
        bind:quantity
        bind:punctuation
        bind:numbers
        onConfigChange={handleConfigChange}
    />

    <TypingArea
        targetText={gameState.targetText}
        charStates={gameState.charStates}
        wpm={gameState.wpm}
        typingComplete={gameState.typingComplete}
        currentStreak={gameState.currentStreak}
        accuracy={gameState.accuracy}
        testDuration={gameState.endTime && gameState.startTime
            ? (gameState.endTime - gameState.startTime) / 1000
            : 0}
        {remainingTime}
        {gameMode}
        bind:hiddenInput={currentInput}
        bind:isInputFocused
        oninput={handleInput}
        onreset={handleReset}
    />
</main>

<div>
    <Footer showKeybindHint={true} />
</div>
