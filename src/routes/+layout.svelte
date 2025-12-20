<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import { theme } from "$lib/stores/themeStore";
	import { onMount } from "svelte";

	let { children } = $props();

	// Apply theme on mount (for SSR/hydration)
	onMount(() => {
		document.documentElement.setAttribute("data-theme", $theme);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div
	class="min-h-screen w-screen font-['JetBrains_Mono'] flex flex-col items-center overflow-y-auto p-5 box-border relative transition-colors duration-300"
	style="background-color: var(--bg-primary); color: var(--text-primary);"
>
	{@render children()}
</div>
