<script lang="ts">
    import { AtSign, Hash, Clock, CaseSensitive } from "lucide-svelte";

    let {
        mode = $bindable("time"),
        quantity = $bindable(30),
        punctuation = $bindable(false),
        numbers = $bindable(false),
        onConfigChange,
    }: {
        mode?: string;
        quantity?: number;
        punctuation?: boolean;
        numbers?: boolean;
        onConfigChange?: () => void;
    } = $props();

    const timeOptions = [15, 30, 60, 120];
    const wordOptions = [10, 25, 50, 100];

    let quantityOptions = $derived(mode === "time" ? timeOptions : wordOptions);

    function setMode(newMode: string) {
        mode = newMode;
        // Reset quantity to first option of new mode
        quantity = newMode === "time" ? 30 : 25;
        onConfigChange?.();
    }

    function setQuantity(val: number) {
        quantity = val;
        onConfigChange?.();
    }

    function togglePunctuation() {
        punctuation = !punctuation;
        onConfigChange?.();
    }

    function toggleNumbers() {
        numbers = !numbers;
        onConfigChange?.();
    }
</script>

<div
    class="w-full max-w-3xl mx-auto mb-12 px-6 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm flex items-center justify-center gap-1 font-['JetBrains_Mono'] text-sm"
>
    <!-- MODIFIERS (Left) -->
    <div class="flex items-center gap-1">
        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 {punctuation
                ? 'text-cyan-400 bg-cyan-400/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}"
            onclick={togglePunctuation}
            title="Toggle Punctuation"
        >
            <AtSign size={14} />
            <span class="text-xs">punctuation</span>
        </button>

        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 {numbers
                ? 'text-cyan-400 bg-cyan-400/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}"
            onclick={toggleNumbers}
            title="Toggle Numbers"
        >
            <Hash size={14} />
            <span class="text-xs">numbers</span>
        </button>
    </div>

    <!-- Divider -->
    <span class="text-gray-700 mx-3">|</span>

    <!-- MODE (Center) -->
    <div class="flex items-center gap-1">
        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 {mode ===
            'time'
                ? 'text-cyan-400 bg-cyan-400/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}"
            onclick={() => setMode("time")}
            title="Time Mode"
        >
            <Clock size={14} />
            <span class="text-xs">time</span>
        </button>

        <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 {mode ===
            'words'
                ? 'text-cyan-400 bg-cyan-400/10'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}"
            onclick={() => setMode("words")}
            title="Words Mode"
        >
            <CaseSensitive size={14} />
            <span class="text-xs">words</span>
        </button>
    </div>

    <!-- Divider -->
    <span class="text-gray-700 mx-3">|</span>

    <!-- QUANTITY (Right) -->
    <div class="flex items-center gap-1">
        {#each quantityOptions as opt}
            <button
                class="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 {quantity ===
                opt
                    ? 'text-cyan-400 bg-cyan-400/10 font-bold'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'}"
                onclick={() => setQuantity(opt)}
            >
                {opt}
            </button>
        {/each}
    </div>
</div>
