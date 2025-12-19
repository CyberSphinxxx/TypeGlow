<script lang="ts">
    import { onMount } from 'svelte';
    import { getLeaderboard, type ScoreEntry } from '../services/scoreService';

    let scores = $state<ScoreEntry[]>([]);
    let loading = $state(true);

    async function loadScores() {
        loading = true;
        scores = await getLeaderboard();
        loading = false;
    }

    onMount(() => {
        loadScores();
    });

    // Expose refresh method if needed, or just auto-refresh on mount/updates
    export function refresh() {
        loadScores();
    }
</script>

<div class="leaderboard bg-[#282c34] p-5 rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] w-full max-w-[800px] mt-5 text-[#fefefe]">
    <h2 class="text-xl text-center mb-4 text-[#f1c40f]">Leaderboard (Top 10)</h2>
    
    {#if loading}
        <p class="text-center text-gray-400">Loading scores...</p>
    {:else if scores.length === 0}
        <p class="text-center text-gray-400">No scores yet. Be the first!</p>
    {:else}
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="text-[#a7a7a7] border-b border-gray-600">
                    <th class="p-2">Rank</th>
                    <th class="p-2">Player</th>
                    <th class="p-2">WPM</th>
                    <th class="p-2">Accuracy</th>
                    <th class="p-2">Date</th>
                </tr>
            </thead>
            <tbody>
                {#each scores as score, index}
                    <tr class="border-b border-gray-700 hover:bg-[#32363e]">
                        <td class="p-2 text-[#f1c40f] font-bold">#{index + 1}</td>
                        <td class="p-2 flex items-center gap-2">
                            {#if score.photoURL}
                                <img src={score.photoURL} alt={score.userName} class="w-6 h-6 rounded-full" />
                            {/if}
                            {score.userName}
                        </td>
                        <td class="p-2 font-bold text-[#00ff6a]">{score.wpm}</td>
                        <td class="p-2">{score.accuracy}%</td>
                        <td class="p-2 text-sm text-gray-400">{score.timestamp.toLocaleDateString()}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
