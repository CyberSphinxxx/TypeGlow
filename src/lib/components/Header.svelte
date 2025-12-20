<script lang="ts">
    import LoginButton from "./LoginButton.svelte";
    import { user } from "../stores/AuthStore";
    import { page } from "$app/stores";
    import { Keyboard, Crown, Info, User } from "lucide-svelte";
</script>

<header
    class="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-black/20 border-b border-white/10 transition-all duration-300"
>
    <!-- Logo -->
    <a href="/" class="no-underline group shrink-0">
        <h1
            class="m-0 text-2xl font-['JetBrains_Mono'] text-white tracking-tight"
        >
            Type<span
                class="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                >Glow</span
            >
        </h1>
    </a>

    <!-- Navigation (Centered Icons) -->
    <nav class="absolute left-1/2 -translate-x-1/2 flex items-center gap-6">
        <!-- Home -->
        <a
            href="/"
            title="Home"
            class="p-2 rounded-lg transition-all duration-300
            {$page.url.pathname === '/'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_cyan]'
                : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'}"
        >
            <Keyboard size={20} />
        </a>

        <!-- Leaderboard -->
        <a
            href="/leaderboard"
            title="Leaderboard"
            class="p-2 rounded-lg transition-all duration-300
            {$page.url.pathname === '/leaderboard'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_cyan]'
                : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'}"
        >
            <Crown size={20} />
        </a>

        <!-- About -->
        <a
            href="/about"
            title="About"
            class="p-2 rounded-lg transition-all duration-300
            {$page.url.pathname === '/about'
                ? 'text-cyan-400 drop-shadow-[0_0_8px_cyan]'
                : 'text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]'}"
        >
            <Info size={20} />
        </a>
    </nav>

    <!-- User Profile / Login -->
    <div class="flex items-center gap-4 shrink-0">
        {#if $user}
            <a
                href="/profile"
                title={$user.displayName || "Profile"}
                class="relative p-1 rounded-full transition-all duration-300 hover:ring-2 hover:ring-cyan-500/50"
            >
                {#if $user.photoURL}
                    <img
                        src={$user.photoURL}
                        alt="User Profile"
                        class="w-8 h-8 rounded-full border border-gray-600 shadow-sm"
                    />
                {:else}
                    <div
                        class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border border-gray-600"
                    >
                        {$user.displayName ? $user.displayName[0] : "U"}
                    </div>
                {/if}
                <!-- Online Dot -->
                <div
                    class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900"
                ></div>
            </a>
        {:else}
            <a
                href="#"
                title="Sign In"
                class="p-2 rounded-lg text-gray-500 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all duration-300"
            >
                <User size={20} />
            </a>
            <LoginButton />
        {/if}
    </div>
</header>
