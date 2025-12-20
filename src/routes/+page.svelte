<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import TypingArea from "$lib/components/TypingArea.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import ConfigBar from "$lib/components/ConfigBar.svelte";
    import AchievementToast from "$lib/components/AchievementToast.svelte";

    import { TypingEngine } from "$lib/gameEngine";
    import { saveScore } from "$lib/services/scoreService";
    import {
        checkAndUnlockAchievements,
        type UserStats,
    } from "$lib/services/achievementService";
    import { user } from "$lib/stores/AuthStore";
    import { db } from "$lib/firebase";
    import { collection, query, where, getDocs } from "firebase/firestore";

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

    // Achievement toast state
    let pendingAchievements = $state<string[]>([]);
    let currentToastId = $state<string | null>(null);

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
                // Anti-cheat: Client-side validation
                const wpm = gameState.wpm;
                const acc = gameState.accuracy;
                const validLimits = [10, 15, 25, 30, 50, 60, 100, 120];

                if (
                    wpm < 1 ||
                    wpm > 250 ||
                    acc < 0 ||
                    acc > 100 ||
                    !validLimits.includes(quantity)
                ) {
                    console.warn("Invalid score detected, not saving.");
                    return;
                }

                await saveScore(
                    {
                        wpm: wpm,
                        accuracy: acc,
                        timestamp: new Date(),
                        mode: gameMode as "time" | "words",
                        limit: quantity,
                    },
                    $user,
                );

                // Check for new achievements
                await checkAchievements();
            }
        }
    }

    function handleReset() {
        startGame();
    }

    let isInputFocused = $state(false);

    // Build user stats from Firestore for achievement checking
    async function getUserStats(): Promise<UserStats> {
        if (!$user) {
            return {
                bestWpm: 0,
                testsCompleted: 0,
                bestAccuracy: 0,
                completedModes: [],
            };
        }

        try {
            const q = query(
                collection(db, "scores"),
                where("userId", "==", $user.uid),
            );
            const snapshot = await getDocs(q);
            const scores = snapshot.docs.map((doc) => doc.data());

            const bestWpm = Math.max(...scores.map((s) => s.wpm || 0), 0);
            const bestAccuracy = Math.max(
                ...scores.map((s) => s.accuracy || 0),
                0,
            );
            const testsCompleted = scores.length;

            // Get unique completed modes
            const modesSet = new Set<string>();
            const completedModes: { mode: string; limit: number }[] = [];
            for (const score of scores) {
                if (score.mode && score.limit) {
                    const key = `${score.mode}-${score.limit}`;
                    if (!modesSet.has(key)) {
                        modesSet.add(key);
                        completedModes.push({
                            mode: score.mode,
                            limit: score.limit,
                        });
                    }
                }
            }

            return { bestWpm, testsCompleted, bestAccuracy, completedModes };
        } catch (e) {
            console.error("Error fetching user stats:", e);
            return {
                bestWpm: 0,
                testsCompleted: 0,
                bestAccuracy: 0,
                completedModes: [],
            };
        }
    }

    // Check achievements and show toast for newly unlocked ones
    async function checkAchievements() {
        if (!$user) return;

        const stats = await getUserStats();
        const newlyUnlocked = await checkAndUnlockAchievements(
            $user.uid,
            stats,
        );

        if (newlyUnlocked.length > 0) {
            pendingAchievements = [...pendingAchievements, ...newlyUnlocked];
            showNextToast();
        }
    }

    // Show next achievement toast
    function showNextToast() {
        if (currentToastId || pendingAchievements.length === 0) return;
        currentToastId = pendingAchievements[0];
        pendingAchievements = pendingAchievements.slice(1);
    }

    // Handle toast dismissal
    function handleToastDismiss() {
        currentToastId = null;
        // Show next toast if there are more
        setTimeout(() => showNextToast(), 300);
    }
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

<!-- Achievement Toast -->
{#if currentToastId}
    <AchievementToast
        achievementId={currentToastId}
        onDismiss={handleToastDismiss}
    />
{/if}

<div>
    <Footer showKeybindHint={true} />
</div>
