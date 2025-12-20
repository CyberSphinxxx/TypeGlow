<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import { Github, Bug } from "lucide-svelte";
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
        class="relative max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center"
    >
        <!-- Header -->
        <h1
            class="text-4xl font-['JetBrains_Mono'] text-white mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
        >
            About <span class="text-cyan-400 drop-shadow-[0_0_15px_cyan]"
                >TypeGlow</span
            >
        </h1>

        <p class="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            A minimalist, aesthetic typing speed tester designed to help you
            enter the flow state. Real-time WPM tracking, mechanical audio
            feedback, and a distraction-free neon interface.
        </p>

        <!-- Tech Stack Strip -->
        <div class="mb-10">
            <span
                class="text-xs text-slate-500 uppercase tracking-widest mb-3 block"
                >Powered By</span
            >
            <div class="flex items-center justify-center gap-3 flex-wrap">
                <span
                    class="px-3 py-1 text-xs font-mono bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20"
                    >SvelteKit</span
                >
                <span class="text-slate-600">•</span>
                <span
                    class="px-3 py-1 text-xs font-mono bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20"
                    >TailwindCSS</span
                >
                <span class="text-slate-600">•</span>
                <span
                    class="px-3 py-1 text-xs font-mono bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20"
                    >Firebase</span
                >
                <span class="text-slate-600">•</span>
                <span
                    class="px-3 py-1 text-xs font-mono bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20"
                    >TypeScript</span
                >
            </div>
        </div>

        <!-- Two Column Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <!-- Developer -->
            <div
                class="flex flex-col items-center p-6 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
                <Github class="w-8 h-8 text-slate-400 mb-3" />
                <span class="text-sm text-slate-500 mb-1">Built by</span>
                <a
                    href="https://github.com/CyberSphinxxx"
                    target="_blank"
                    class="text-white font-['JetBrains_Mono'] hover:text-cyan-400 hover:drop-shadow-[0_0_8px_cyan] transition-all no-underline"
                >
                    @John Lemar Gonzales
                </a>
            </div>

            <!-- Support -->
            <div
                class="flex flex-col items-center p-6 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
                <Bug class="w-8 h-8 text-slate-400 mb-3" />
                <span class="text-sm text-slate-500 mb-2">Found an issue?</span>
                <a
                    href="https://github.com/CyberSphinxxx/TypeGlow/issues"
                    target="_blank"
                    class="px-4 py-2 text-sm font-['JetBrains_Mono'] border border-slate-600 rounded-lg text-slate-400 hover:border-red-400 hover:text-red-400 hover:bg-red-500/10 transition-all no-underline"
                >
                    Report Bug
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div
            class="flex justify-center items-center gap-3 text-xs text-slate-600 font-mono"
        >
            <span>v1.0.0</span>
            <span>•</span>
            <span>MIT License</span>
        </div>
    </div>
</main>
