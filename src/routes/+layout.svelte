<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="h-screen w-screen bg-[#282c34] font-['Noto_Serif_Oriya'] text-[#333333] flex flex-col justify-center items-center overflow-hidden p-5 box-border relative">
	{@render children()}
</div>
