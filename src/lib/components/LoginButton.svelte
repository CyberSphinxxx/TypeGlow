<script lang="ts">
   import { auth } from '../firebase';
   import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
   import { user } from '../stores/AuthStore';

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
    class="bg-[#4285F4] text-white border-none px-4 py-2 rounded pointer-events-auto hover:bg-[#357ae8] transition-colors cursor-pointer flex items-center gap-2 font-sans font-medium text-sm"
    onclick={signIn}
>
    <!-- Google Icon -->
    <svg class="w-4 h-4 bg-white rounded-full p-[2px]" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6154z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2582c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71 0-.5932.1022-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5478 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"/>
        <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
    Sign in with Google
</button>
