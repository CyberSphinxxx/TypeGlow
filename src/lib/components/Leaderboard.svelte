<script lang="ts">
    import { onMount } from "svelte";
    import {
        getLeaderboard,
        type ScoreEntry,
        type LeaderboardFilter,
    } from "../services/scoreService";
    import { user } from "../stores/AuthStore";

    let scores = $state<ScoreEntry[]>([]);
    let loading = $state(true);

    // Filter state
    let activeMode = $state<"time" | "words">("words");
    let activeLimit = $state(25);

    const timeOptions = [15, 30, 60, 120];
    const wordOptions = [10, 25, 50, 100];

    let limitOptions = $derived(
        activeMode === "time" ? timeOptions : wordOptions,
    );

    async function loadScores() {
        loading = true;
        const filter: LeaderboardFilter = {
            mode: activeMode,
            limit: activeLimit,
        };
        scores = await getLeaderboard(filter);
        loading = false;
    }

    onMount(() => {
        loadScores();
    });

    // Reload when filters change
    $effect(() => {
        // Track dependencies
        const _mode = activeMode;
        const _limit = activeLimit;
        loadScores();
    });

    function setMode(mode: "time" | "words") {
        activeMode = mode;
        activeLimit = mode === "time" ? 30 : 25;
    }

    // Check if current user is in top 10
    let userInTop10 = $derived(
        $user
            ? scores.slice(0, 10).some((s) => s.userName === $user?.displayName)
            : false,
    );

    // Get user's personal best if not in top 10
    let userBest = $derived(
        $user && !userInTop10
            ? scores.find((s) => s.userName === $user?.displayName)
            : null,
    );

    export function refresh() {
        loadScores();
    }
</script>

<div class="leaderboard w-full max-w-4xl mx-auto font-['JetBrains_Mono']">
    <!-- Title -->
    <h1 class="text-3xl text-center mb-8 text-white uppercase tracking-widest">
        Leader<span class="text-cyan-400 drop-shadow-[0_0_15px_cyan]"
            >board</span
        >
    </h1>

    <!-- Filter Bar -->
    <div
        class="flex flex-wrap items-center justify-center gap-6 mb-8 p-4 bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl"
    >
        <!-- Mode Toggles -->
        <div class="flex items-center gap-2">
            <button
                class="px-4 py-2 rounded-lg text-sm transition-all duration-200 {activeMode ===
                'time'
                    ? 'text-cyan-400 bg-cyan-400/10 font-bold'
                    : 'text-gray-500 hover:text-gray-300'}"
                onclick={() => setMode("time")}
            >
                ⏱️ Time
            </button>
            <button
                class="px-4 py-2 rounded-lg text-sm transition-all duration-200 {activeMode ===
                'words'
                    ? 'text-cyan-400 bg-cyan-400/10 font-bold'
                    : 'text-gray-500 hover:text-gray-300'}"
                onclick={() => setMode("words")}
            >
                🅰️ Words
            </button>
        </div>

        <span class="text-gray-700">|</span>

        <!-- Limit Options -->
        <div class="flex items-center gap-1">
            {#each limitOptions as opt}
                <button
                    class="px-3 py-1 rounded-lg text-sm transition-all duration-200 {activeLimit ===
                    opt
                        ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_cyan]'
                        : 'text-gray-500 hover:text-gray-300'}"
                    onclick={() => (activeLimit = opt)}
                >
                    {opt}
                </button>
            {/each}
        </div>
    </div>

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
            <p class="text-xl">No legends yet.</p>
            <p class="text-sm mt-2">Be the first to claim the throne.</p>
        </div>
    {:else}
        <!-- Glass Table -->
        <div
            class="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
        >
            <!-- Header Row -->
            <div
                class="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-800/30 border-b border-white/5"
            >
                <div
                    class="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                    Rank
                </div>
                <div
                    class="col-span-5 text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                    Player
                </div>
                <div
                    class="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                    Date
                </div>
                <div
                    class="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                    Accuracy
                </div>
                <div
                    class="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider text-right"
                >
                    WPM
                </div>
            </div>

            <!-- Data Rows -->
            {#each scores.slice(0, 10) as score, index}
                <div
                    class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 transition-all duration-200 hover:bg-white/5
                    {index === 0
                        ? 'bg-yellow-500/10'
                        : index === 1
                          ? 'bg-slate-400/10'
                          : index === 2
                            ? 'bg-orange-700/10'
                            : ''}"
                >
                    <!-- Rank -->
                    <div class="col-span-1 text-lg">
                        {#if index === 0}
                            <span class="text-2xl">🏆</span>
                        {:else if index === 1}
                            <span class="text-2xl">🥈</span>
                        {:else if index === 2}
                            <span class="text-2xl">🥉</span>
                        {:else}
                            <span class="text-gray-600 font-bold"
                                >#{index + 1}</span
                            >
                        {/if}
                    </div>

                    <!-- Player -->
                    <div class="col-span-5 flex items-center gap-3">
                        {#if score.photoURL}
                            <img
                                src={score.photoURL}
                                alt={score.userName}
                                class="w-8 h-8 rounded-full border border-gray-700"
                            />
                        {:else}
                            <div
                                class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-400 text-sm font-bold"
                            >
                                {score.userName
                                    ? score.userName[0].toUpperCase()
                                    : "?"}
                            </div>
                        {/if}
                        <span class="text-gray-200 font-medium truncate"
                            >{score.userName}</span
                        >
                    </div>

                    <!-- Date -->
                    <div class="col-span-2 text-gray-500 text-sm">
                        {score.timestamp.toLocaleDateString()}
                    </div>

                    <!-- Accuracy -->
                    <div class="col-span-2 text-right text-gray-300">
                        {score.accuracy}%
                    </div>

                    <!-- WPM -->
                    <div
                        class="col-span-2 text-right text-2xl font-bold
                        {index === 0
                            ? 'text-yellow-400 drop-shadow-[0_0_10px_gold]'
                            : index === 1
                              ? 'text-slate-300'
                              : index === 2
                                ? 'text-orange-400'
                                : 'text-cyan-400'}"
                    >
                        {score.wpm}
                    </div>
                </div>
            {/each}

            <!-- User's Personal Best (if not in top 10) -->
            {#if userBest}
                <div
                    class="grid grid-cols-12 gap-4 px-6 py-4 items-center bg-cyan-500/10 border-t border-cyan-500/30"
                >
                    <!-- Rank -->
                    <div class="col-span-1">
                        <span class="text-gray-500 text-sm">You</span>
                    </div>

                    <!-- Player -->
                    <div class="col-span-5 flex items-center gap-3">
                        {#if userBest.photoURL}
                            <img
                                src={userBest.photoURL}
                                alt={userBest.userName}
                                class="w-8 h-8 rounded-full border border-cyan-500"
                            />
                        {:else}
                            <div
                                class="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center border border-cyan-500 text-cyan-400 text-sm font-bold"
                            >
                                {userBest.userName
                                    ? userBest.userName[0].toUpperCase()
                                    : "?"}
                            </div>
                        {/if}
                        <span class="text-cyan-400 font-medium"
                            >{userBest.userName}</span
                        >
                    </div>

                    <!-- Date -->
                    <div class="col-span-2 text-gray-500 text-sm">
                        {userBest.timestamp.toLocaleDateString()}
                    </div>

                    <!-- Accuracy -->
                    <div class="col-span-2 text-right text-gray-300">
                        {userBest.accuracy}%
                    </div>

                    <!-- WPM -->
                    <div
                        class="col-span-2 text-right text-2xl font-bold text-cyan-400"
                    >
                        {userBest.wpm}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>
