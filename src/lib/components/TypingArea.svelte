<script lang="ts">
   import type { CharState } from '$lib/gameEngine';

   let { 
       targetText, 
       charStates, 
       wpm, 
       hiddenInput = $bindable(),
       oninput,
       onreset,
       typingComplete
   } = $props<{
       targetText: string;
       charStates: CharState[];
       wpm: number;
       hiddenInput: string;
       oninput: (val: string) => void;
       onreset: () => void;
       typingComplete: boolean;
   }>();

   function focusInput() {
       const input = document.getElementById('userInput') as HTMLInputElement;
       if (input && !typingComplete) {
           input.focus();
           input.click(); // Ensure focus on mobile/some browsers
       }
   }
</script>

<div 
    class="container bg-[#282c34] p-10 sm:p-[40px] p-[20px] rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-center w-[90%] sm:w-[90%] w-full max-w-[800px] min-h-[250px] mt-[10px] select-none transition-all duration-1000 ease break-words whitespace-normal relative mx-auto"
    onclick={focusInput}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if(e.key === 'Enter') focusInput(); }}
>
    
    <p id="targetText" class="text-[1.5rem] sm:text-[1.9rem] -mt-[5px] mb-[10px] tracking-[1px] sm:tracking-[2px] text-[#fefefe] transition-colors duration-300 ease">
        {#if charStates.length === 0}
            {targetText}
        {:else}
            {#each charStates as state}
                {#if state.status === 'correct'}
                    <span class="text-[#00ff6a] drop-shadow-[0_0_8px_#00ff6a] transition-all duration-200">{state.char}</span>
                {:else if state.status === 'incorrect'}
                    <span class="text-[#ff3333] drop-shadow-[0_0_8px_#ff3333] transition-all duration-200">{state.char}</span>
                {:else if state.status === 'incorrect-space'}
                     <span class="bg-[rgba(255,51,51,0.3)]">&nbsp;</span>
                {:else if state.status === 'current'}
                    <span class="text-[#f1c40f] bg-[#444] font-bold drop-shadow-[0_0_8px_#f1c40f] transition-all duration-200">{state.char}</span>
                {:else}
                    <span>{state.char}</span>
                {/if}
            {/each}
        {/if}
    </p>

    {#if typingComplete}
        <p id="congratulations" class="text-[#00ff6a]">Congratulations!</p>
    {/if}
    
    <input 
        type="text" 
        id="userInput" 
        class="absolute opacity-0 top-0 left-0 h-0 w-0" 
        bind:value={hiddenInput}
        oninput={() => oninput(hiddenInput)}
        disabled={typingComplete}
        autoFocus
    />
    
    {#if !typingComplete && hiddenInput.length === 0}
        <p class="click-instruction text-[1.2rem] text-[#a7a7a7] mt-[15px] cursor-pointer transition duration-300 ease-in-out" id="clickInstruction">
            Click here to start typing!
        </p>
    {/if}
    
    {#if wpm > 0}
        <p id="wpmDisplay" class="text-[#fefefe] mt-[20px] text-[18px] font-bold">Your WPM: {wpm}</p>
    {/if}
    
    {#if typingComplete}
        <button 
            id="resetButton" 
            class="mt-[20px] px-[20px] py-[10px] text-[1.2rem] bg-[#00ff6a] text-[#282c34] border-none rounded-[5px] cursor-pointer hover:bg-[#01c753]"
            onclick={onreset}
        >
            Reset
        </button>
    {/if}
</div>
