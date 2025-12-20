<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="h-screen w-screen bg-[#050505] font-['JetBrains_Mono'] text-white flex flex-col items-center overflow-hidden p-5 box-border relative">
	{@render children()}
</div>
