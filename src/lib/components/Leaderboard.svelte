<script lang="ts">
    import { onMount } from "svelte";
    import { getLeaderboard, type ScoreEntry } from "../services/scoreService";

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

<div
    class="leaderboard w-full max-w-[800px] mt-12 mb-20 text-[#fefefe] font-['JetBrains_Mono']"
>
    <h2
        class="text-2xl text-center mb-8 text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_10px_cyan]"
    >
        High Scores
    </h2>

    {#if loading}
        <div class="flex justify-center items-center h-40">
            <div
                class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"
            ></div>
        </div>
    {:else if scores.length === 0}
        <div
            class="text-center p-10 border border-dashed border-gray-700 rounded-lg text-gray-500"
        >
            <p>No legends yet.</p>
            <p class="text-sm mt-2">Be the first to claim the throne.</p>
        </div>
    {:else}
        <div class="flex flex-col gap-3">
            {#each scores as score, index}
                <div
                    class="group relative flex items-center justify-between p-4 rounded-lg bg-gray-900/40 border border-gray-800 transition-all duration-300 hover:bg-gray-800/60 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                    <!-- Rank & Player -->
                    <div class="flex items-center gap-6">
                        <div class="text-2xl w-8 text-center">
                            {#if index === 0}🏆
                            {:else if index === 1}🥈
                            {:else if index === 2}🥉
                            {:else}
                                <span class="text-gray-600 font-bold text-lg"
                                    >#{index + 1}</span
                                >
                            {/if}
                        </div>

                        <div class="flex items-center gap-4">
                            {#if score.photoURL}
                                <img
                                    src={score.photoURL}
                                    alt={score.userName}
                                    class="w-10 h-10 rounded-full border-2 border-gray-700 group-hover:border-cyan-400 transition-colors"
                                />
                            {:else}
                                <div
                                    class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700 text-gray-400 font-bold group-hover:border-cyan-400 group-hover:text-cyan-400 transition-colors"
                                >
                                    {score.userName
                                        ? score.userName[0].toUpperCase()
                                        : "?"}
                                </div>
                            {/if}

                            <div class="flex flex-col">
                                <span
                                    class="font-bold text-lg text-gray-200 group-hover:text-white transition-colors"
                                    >{score.userName}</span
                                >
                                <span class="text-xs text-gray-500"
                                    >{score.timestamp.toLocaleDateString()}</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="flex items-center gap-8 text-right">
                        <div class="flex flex-col items-end">
                            <span
                                class="text-xs text-gray-500 uppercase tracking-wider"
                                >Accuracy</span
                            >
                            <span class="font-bold text-gray-300"
                                >{score.accuracy}%</span
                            >
                        </div>

                        <div class="flex flex-col items-end w-24">
                            <span
                                class="text-xs text-gray-500 uppercase tracking-wider mb-1"
                                >WPM</span
                            >
                            <span
                                class="text-3xl font-bold leading-none
                                {score.wpm >= 100
                                    ? 'text-yellow-400 drop-shadow-[0_0_8px_gold]'
                                    : score.wpm >= 60
                                      ? 'text-[#00ff6a] drop-shadow-[0_0_8px_#00ff6a]'
                                      : 'text-cyan-400'}"
                            >
                                {score.wpm}
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
