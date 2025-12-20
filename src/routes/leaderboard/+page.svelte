<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Leaderboard from "$lib/components/Leaderboard.svelte";
</script>

<Header />

<main
    class="flex-grow flex flex-col items-center w-full max-w-[1200px] relative z-10 p-5 pt-28"
>
    <Leaderboard />
</main>

<Footer />
