<script lang="ts">
    import { auth } from "../firebase";
    import {
        GoogleAuthProvider,
        signInWithPopup,
        type User,
    } from "firebase/auth";
    import { user } from "../stores/AuthStore";

    async function signIn() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    }
</script>

<button
    onclick={signIn}
    class="text-gray-400 hover:text-white font-['JetBrains_Mono'] text-sm tracking-wider transition-colors border border-transparent hover:border-gray-700 rounded-full px-4 py-1"
>
    Sign In
</button>
