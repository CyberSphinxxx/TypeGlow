<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { user } from "$lib/stores/AuthStore";
    import { onMount } from "svelte";
    import {
        collection,
        query,
        where,
        getDocs,
        orderBy,
    } from "firebase/firestore";
    import { db } from "$lib/firebase";
    import { Trophy, Clock, Target, Zap, Percent } from "lucide-svelte";

    // Stats state
    let testsStarted = $state(0);
    let totalTimeTyping = $state(0); // in seconds
    let averageWpm = $state(0);
    let bestWpm = $state(0);
    let averageAccuracy = $state(0);
    let loading = $state(true);

    // Personal Bests by mode+limit
    interface PersonalBest {
        mode: string;
        limit: number;
        wpm: number;
    }
    let personalBests = $state<PersonalBest[]>([]);

    // Recent scores for progress chart (last 20)
    interface RecentScore {
        wpm: number;
        date: string;
    }
    let recentScores = $state<RecentScore[]>([]);

    // Chart calculations (derived from recentScores)
    let chartData = $derived.by(() => {
        if (recentScores.length === 0) return null;

        const maxWpm = Math.max(...recentScores.map((s) => s.wpm), 1);
        const minWpm = Math.min(...recentScores.map((s) => s.wpm));
        const range = Math.max(maxWpm - minWpm, 10);
        const padding = range * 0.1;
        const chartMin = Math.max(0, minWpm - padding);
        const chartMax = maxWpm + padding;
        const chartRange = chartMax - chartMin;
        const totalPoints = recentScores.length;

        // Handle single score: place at center
        if (totalPoints === 1) {
            const y = ((chartMax - recentScores[0].wpm) / chartRange) * 100;
            return {
                chartMin: Math.round(chartMin),
                chartMax: Math.round(chartMax),
                points: [{ x: 50, y, wpm: recentScores[0].wpm }],
                linePath: null,
                fillPath: null,
                isSingle: true,
            };
        }

        // Multiple points: calculate X to span 0% to 100%
        const points = recentScores.map((s, i) => {
            const x = (i / (totalPoints - 1)) * 100;
            const y = ((chartMax - s.wpm) / chartRange) * 100;
            return { x, y, wpm: s.wpm };
        });

        // Generate line path: "x1,y1 x2,y2 x3,y3..."
        const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");

        // Generate fill path: start at bottom-left, trace line, end at bottom-right
        const fillPath = `M0,100 L${points.map((p) => `${p.x},${p.y}`).join(" L")} L100,100 Z`;

        return {
            chartMin: Math.round(chartMin),
            chartMax: Math.round(chartMax),
            points,
            linePath,
            fillPath,
            isSingle: false,
        };
    });

    // All possible modes for display
    const allModes = [
        { mode: "time", limit: 15, label: "Time 15" },
        { mode: "time", limit: 30, label: "Time 30" },
        { mode: "time", limit: 60, label: "Time 60" },
        { mode: "time", limit: 120, label: "Time 120" },
        { mode: "words", limit: 10, label: "Words 10" },
        { mode: "words", limit: 25, label: "Words 25" },
        { mode: "words", limit: 50, label: "Words 50" },
        { mode: "words", limit: 100, label: "Words 100" },
    ];

    // Format time display
    function formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    // Get member since date
    let memberSince = $derived(
        $user?.metadata?.creationTime
            ? new Date($user.metadata.creationTime).toLocaleDateString(
                  "en-US",
                  {
                      month: "long",
                      year: "numeric",
                  },
              )
            : "Unknown",
    );

    async function loadUserStats() {
        if (!$user) {
            loading = false;
            return;
        }

        try {
            // Try query with ordering (requires composite index)
            let snapshot;
            try {
                const q = query(
                    collection(db, "scores"),
                    where("userId", "==", $user.uid),
                    orderBy("timestamp", "desc"),
                );
                snapshot = await getDocs(q);
            } catch (indexError) {
                // Fallback: query without orderBy if index doesn't exist
                console.warn(
                    "Index not found, using fallback query:",
                    indexError,
                );
                const fallbackQ = query(
                    collection(db, "scores"),
                    where("userId", "==", $user.uid),
                );
                snapshot = await getDocs(fallbackQ);
            }

            if (snapshot.empty) {
                loading = false;
                return;
            }

            const scores = snapshot.docs.map((doc) => doc.data());

            // Total Tests
            testsStarted = scores.length;

            // Best WPM (max of all)
            bestWpm = Math.max(...scores.map((s) => s.wpm || 0));

            // Average WPM
            const totalWpm = scores.reduce((sum, s) => sum + (s.wpm || 0), 0);
            averageWpm = Math.round(totalWpm / scores.length);

            // Average Accuracy
            const totalAccuracy = scores.reduce(
                (sum, s) => sum + (s.accuracy || 0),
                0,
            );
            averageAccuracy = Math.round(totalAccuracy / scores.length);

            // Estimate time (assume average test is 30 seconds if no duration stored)
            totalTimeTyping = scores.length * 30;

            // Calculate Personal Bests by mode+limit
            const bestsMap = new Map<string, PersonalBest>();
            for (const score of scores) {
                if (!score.mode || !score.limit) continue;
                const key = `${score.mode}-${score.limit}`;
                const existing = bestsMap.get(key);
                if (!existing || (score.wpm || 0) > existing.wpm) {
                    bestsMap.set(key, {
                        mode: score.mode,
                        limit: score.limit,
                        wpm: score.wpm || 0,
                    });
                }
            }
            personalBests = Array.from(bestsMap.values());

            // Get last 20 scores for progress chart (already ordered by timestamp desc)
            recentScores = scores
                .slice(0, 20)
                .map((s) => ({
                    wpm: s.wpm || 0,
                    date: s.timestamp?.toDate?.()?.toLocaleDateString() || "",
                }))
                .reverse(); // Reverse to show oldest first in chart
        } catch (e) {
            console.error("Error loading user stats:", e);
        }

        loading = false;
    }

    onMount(() => {
        loadUserStats();
    });

    // Reload if user changes
    $effect(() => {
        if ($user) {
            loadUserStats();
        }
    });
</script>

<Header />

<main
    class="flex-grow flex flex-col items-center w-full max-w-4xl mx-auto relative z-10 p-5 pt-24 pb-32 min-h-screen"
>
    {#if !$user}
        <!-- Not Logged In -->
        <div
            class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center"
        >
            <h1 class="text-2xl font-['JetBrains_Mono'] text-white mb-4">
                Sign In Required
            </h1>
            <p class="text-gray-400 mb-6">
                Please sign in to view your profile and stats.
            </p>
            <a
                href="/"
                class="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors"
            >
                Go Home
            </a>
        </div>
    {:else}
        <!-- User Header -->
        <div
            class="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8"
        >
            <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Avatar -->
                <div class="relative">
                    {#if $user.photoURL}
                        <img
                            src={$user.photoURL}
                            alt={$user.displayName || "User"}
                            class="w-24 h-24 rounded-full border-4 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        />
                    {:else}
                        <div
                            class="w-24 h-24 rounded-full bg-cyan-900 flex items-center justify-center border-4 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        >
                            <span class="text-4xl font-bold text-cyan-400">
                                {$user.displayName
                                    ? $user.displayName[0].toUpperCase()
                                    : "?"}
                            </span>
                        </div>
                    {/if}
                </div>

                <!-- User Info -->
                <div class="text-center sm:text-left flex-1">
                    <h1
                        class="text-3xl font-['JetBrains_Mono'] text-white mb-1"
                    >
                        {$user.displayName || "Anonymous"}
                    </h1>
                    <p class="text-gray-400 text-sm mb-3">{$user.email}</p>
                    <span
                        class="inline-block px-3 py-1 text-xs font-mono bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20"
                    >
                        Member since {memberSince}
                    </span>
                </div>
            </div>
        </div>

        <!-- Stats Grid -->
        {#if loading}
            <!-- Skeleton Loaders -->
            <div class="w-full grid grid-cols-2 lg:grid-cols-5 gap-4">
                {#each Array(5) as _}
                    <div
                        class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center animate-pulse"
                    >
                        <div
                            class="w-8 h-8 bg-gray-700 rounded mx-auto mb-3"
                        ></div>
                        <div
                            class="h-10 w-16 bg-gray-700 rounded mx-auto mb-2"
                        ></div>
                        <div class="h-3 w-20 bg-gray-800 rounded mx-auto"></div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="w-full grid grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Tests Started -->
                <div
                    class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                >
                    <Target class="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <div
                        class="text-3xl font-['JetBrains_Mono'] font-bold text-white mb-1"
                    >
                        {testsStarted}
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Tests
                    </div>
                </div>

                <!-- Time Typing -->
                <div
                    class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                >
                    <Clock class="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <div
                        class="text-3xl font-['JetBrains_Mono'] font-bold text-white mb-1"
                    >
                        {formatTime(totalTimeTyping)}
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Time
                    </div>
                </div>

                <!-- Average WPM -->
                <div
                    class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                >
                    <Zap class="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <div
                        class="text-3xl font-['JetBrains_Mono'] font-bold text-white mb-1"
                    >
                        {averageWpm}
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Avg WPM
                    </div>
                </div>

                <!-- Average Accuracy -->
                <div
                    class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                >
                    <Percent class="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <div
                        class="text-3xl font-['JetBrains_Mono'] font-bold text-white mb-1"
                    >
                        {averageAccuracy}%
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Accuracy
                    </div>
                </div>

                <!-- Best WPM -->
                <div
                    class="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center"
                >
                    <Trophy class="w-8 h-8 text-amber-400 mx-auto mb-3" />
                    <div
                        class="text-3xl font-['JetBrains_Mono'] font-bold text-cyan-400 drop-shadow-[0_0_10px_cyan] mb-1"
                    >
                        {bestWpm}
                    </div>
                    <div class="text-xs text-gray-500 uppercase tracking-wider">
                        Best WPM
                    </div>
                </div>
            </div>

            <!-- Progress Chart -->
            {#if chartData}
                <div
                    class="w-full mt-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6"
                >
                    <h3
                        class="text-sm font-['JetBrains_Mono'] text-gray-400 uppercase tracking-wider mb-4"
                    >
                        Recent Progress
                    </h3>
                    <div class="relative h-40 ml-8">
                        <svg
                            class="w-full h-full"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <!-- Gradient definition -->
                            <defs>
                                <linearGradient
                                    id="chartGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="0%"
                                    y2="100%"
                                >
                                    <stop
                                        offset="0%"
                                        stop-color="rgb(34, 211, 238)"
                                        stop-opacity="0.3"
                                    />
                                    <stop
                                        offset="100%"
                                        stop-color="rgb(34, 211, 238)"
                                        stop-opacity="0"
                                    />
                                </linearGradient>
                            </defs>

                            <!-- Grid lines -->
                            {#each [0, 25, 50, 75, 100] as y}
                                <line
                                    x1="0"
                                    y1={y}
                                    x2="100"
                                    y2={y}
                                    stroke="rgba(255,255,255,0.05)"
                                    stroke-width="0.5"
                                />
                            {/each}

                            <!-- Fill area (only if multiple points) -->
                            {#if !chartData.isSingle && chartData.fillPath}
                                <path
                                    d={chartData.fillPath}
                                    fill="url(#chartGradient)"
                                />
                            {/if}

                            <!-- Line (only if multiple points) -->
                            {#if !chartData.isSingle && chartData.linePath}
                                <polyline
                                    points={chartData.linePath}
                                    fill="none"
                                    stroke="rgb(34, 211, 238)"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    style="filter: drop-shadow(0 0 4px rgb(34, 211, 238));"
                                />
                            {/if}

                            <!-- Data points -->
                            {#each chartData.points as point}
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="2"
                                    fill="rgb(34, 211, 238)"
                                    style="filter: drop-shadow(0 0 4px rgb(34, 211, 238));"
                                />
                            {/each}
                        </svg>

                        <!-- Y-axis labels -->
                        <div
                            class="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 font-mono -ml-8"
                        >
                            <span>{chartData.chartMax}</span>
                            <span>{chartData.chartMin}</span>
                        </div>
                    </div>
                    <div
                        class="flex justify-between text-xs text-gray-600 font-mono mt-2 ml-8"
                    >
                        <span>Oldest</span>
                        <span>{recentScores.length} tests</span>
                        <span>Latest</span>
                    </div>
                </div>
            {/if}

            <!-- Personal Bests Section -->
            <div class="w-full mt-10">
                <h2
                    class="text-xl font-['JetBrains_Mono'] text-white mb-6 flex items-center gap-3"
                >
                    <Trophy class="w-5 h-5 text-amber-400" />
                    Personal Bests
                </h2>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {#each allModes as modeConfig}
                        {@const pb = personalBests.find(
                            (p) =>
                                p.mode === modeConfig.mode &&
                                p.limit === modeConfig.limit,
                        )}
                        <div
                            class="rounded-xl p-4 text-center transition-all {pb
                                ? 'bg-slate-900/50 border border-white/10'
                                : 'border-2 border-dashed border-gray-700/50'}"
                        >
                            <div
                                class="text-xs text-gray-500 uppercase tracking-wider mb-2 font-mono"
                            >
                                {modeConfig.label}
                            </div>
                            {#if pb}
                                <div
                                    class="text-2xl font-['JetBrains_Mono'] font-bold text-cyan-400"
                                >
                                    {pb.wpm}
                                </div>
                                <div class="text-xs text-gray-600">WPM</div>
                            {:else}
                                <div class="text-2xl text-gray-700">—</div>
                                <a
                                    href="/"
                                    class="text-xs text-cyan-600 hover:text-cyan-400 transition-colors"
                                >
                                    Play Now
                                </a>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    {/if}
</main>

<Footer />
