<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import TypingArea from '$lib/components/TypingArea.svelte';
    import Footer from '$lib/components/Footer.svelte';
    import Leaderboard from '$lib/components/Leaderboard.svelte';
    import { TypingEngine } from '$lib/gameEngine';
    import { saveScore } from '$lib/services/scoreService';
    import { user } from '$lib/stores/AuthStore';
    import type { User } from 'firebase/auth'; // Ensure type import if needed or just rely on store logic
    import { get } from 'svelte/store'; // To get value if needed non-reactively, but $user is better

    const engine = new TypingEngine();
    let gameState = $state(engine.getState());
    let currentInput = $state('');

    function handleLevelSelect(level: string) {
        currentInput = '';
        gameState = engine.startLevel(level);
        
        // Auto-focus logic can be handled in TypingArea via prop change if needed, 
        // but simple focus happens on click mostly. 
        // The Header event will reset the game state.
        
        // Wait for UI update then focus? 
        // Actually, let's just ensure input is cleared.
        setTimeout(() => {
            const input = document.getElementById('userInput') as HTMLInputElement;
            input?.focus();
        }, 0);
    }

    let leaderboardComponent: Leaderboard;

    async function handleInput(val: string) {
        // Prevent double processing if already complete
        if (gameState.typingComplete) return;

        currentInput = val;
        const newState = engine.handleInput(val);
        gameState = newState;

        if (newState.typingComplete) {
            // Game just finished
            if ($user) {
                await saveScore({
                    wpm: newState.wpm,
                    accuracy: newState.accuracy,
                    timestamp: new Date()
                }, $user);
                
                // Refresh leaderboard
                leaderboardComponent?.refresh();
            }
        }
    }
    
    function handleReset() {
        currentInput = '';
        gameState = engine.reset();
    }
</script>

<Header onselectlevel={handleLevelSelect} />
<TypingArea 
    targetText={gameState.targetText}
    charStates={gameState.charStates}
    wpm={gameState.wpm}
    typingComplete={gameState.typingComplete}
    bind:hiddenInput={currentInput}
    oninput={handleInput}
    onreset={handleReset}
/>

<Leaderboard bind:this={leaderboardComponent} />

<Footer />
