<script lang="ts">
    let { onselectlevel } = $props<{ onselectlevel: (level: string) => void }>();
    
    import LoginButton from './LoginButton.svelte';
    import { user } from '../stores/AuthStore';
    
    let selectedLevel = $state<string | null>(null);

    function selectLevel(level: string) {
        selectedLevel = level;
        onselectlevel(level);
    }
</script>

<div class="fixed top-0 left-0 w-full pointer-events-none z-50">
    <!-- Logo -->
    <a href="https://github.com/CyberSphinxxx/TypeGlow" target="_blank" class="pointer-events-auto absolute top-5 left-5 no-underline">
        <h1 class="m-0 text-3xl sm:text-[3rem] text-[rgb(255,226,59)] transition-colors duration-500 ease-out hover:text-[rgb(255,217,0)] hover:duration-500 hover:ease-in-out drop-shadow-[0_0_5px_gold]">
            TypeGlow
        </h1>
    </a>

    <!-- User Profile / Login -->
    <div class="pointer-events-auto absolute top-5 right-5 flex items-center gap-4">
        {#if $user}
            <div class="flex items-center gap-2">
                {#if $user.photoURL}
                    <img src={$user.photoURL} alt="User Profile" class="w-10 h-10 rounded-full border-2 border-gold shadow-lg" />
                {:else}
                    <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white border-2 border-gold shadow-lg">
                        {$user.displayName ? $user.displayName[0] : 'U'}
                    </div>
                {/if}
            </div>
        {:else}
            <LoginButton />
        {/if}
    </div>
</div>

<!-- Difficulty Levels - Centered relative to screen usually, or part of main flow? 
     In original, it was div above container. 
     I'll place it here but it needs to be positioned correctly in the flow.
     If Header component is rendered at the top of +page.svelte, this div will be in flow. -->
<div class="difficulty-levels text-center mb-5 -mt-[5%] select-none relative z-10 pointer-events-auto">
    {#each ['Easy', 'Medium', 'Hard', 'Impossible'] as level}
        <button 
            class="level mx-[15px] text-[1.4rem] sm:text-[1.8rem] font-['Noto_Serif_Oriya'] text-[#fefefe] transition-colors duration-300 ease-out bg-[#282c34] rounded-[10px] border-none p-[5px] hover:text-gold hover:duration-300 hover:ease-in cursor-pointer {selectedLevel === level.toLowerCase() ? 'text-gold' : ''}"
            data-level={level.toLowerCase()}
            onclick={() => selectLevel(level.toLowerCase())}
        >
            {level}
        </button>
    {/each}
</div>
