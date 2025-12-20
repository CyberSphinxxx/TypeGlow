<script lang="ts">
    import {
        getAchievementById,
        type AchievementDefinition,
    } from "$lib/services/achievementService";
    import { onMount } from "svelte";
    import { Award } from "lucide-svelte";

    interface Props {
        achievementId: string;
        onDismiss?: () => void;
    }

    let { achievementId, onDismiss }: Props = $props();

    let achievement = $state<AchievementDefinition | undefined>(undefined);
    let visible = $state(false);
    let exiting = $state(false);

    onMount(() => {
        achievement = getAchievementById(achievementId);

        // Trigger entrance animation
        setTimeout(() => {
            visible = true;
        }, 50);

        // Auto-dismiss after 4 seconds
        const timeout = setTimeout(() => {
            dismiss();
        }, 4000);

        return () => clearTimeout(timeout);
    });

    function dismiss() {
        exiting = true;
        setTimeout(() => {
            onDismiss?.();
        }, 300);
    }
</script>

{#if achievement}
    <div
        class="achievement-toast"
        class:visible
        class:exiting
        onclick={dismiss}
        onkeydown={(e) => e.key === "Enter" && dismiss()}
        role="button"
        tabindex="0"
    >
        <div class="toast-glow"></div>
        <div class="toast-content">
            <div class="icon-container">
                <span class="achievement-icon">{achievement.icon}</span>
                <Award class="badge-icon" />
            </div>
            <div class="text-container">
                <div class="achievement-label">Achievement Unlocked!</div>
                <div class="achievement-name">{achievement.name}</div>
                <div class="achievement-desc">{achievement.description}</div>
            </div>
        </div>
    </div>
{/if}

<style>
    .achievement-toast {
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(-120%);
        z-index: 9999;
        cursor: pointer;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .achievement-toast.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    .achievement-toast.exiting {
        transform: translateX(-50%) translateY(-120%);
        opacity: 0;
    }

    .toast-glow {
        position: absolute;
        inset: -4px;
        background: linear-gradient(
            135deg,
            rgba(6, 182, 212, 0.4),
            rgba(147, 51, 234, 0.4)
        );
        border-radius: 20px;
        filter: blur(20px);
        z-index: -1;
        animation: pulse-glow 2s ease-in-out infinite;
    }

    @keyframes pulse-glow {
        0%,
        100% {
            opacity: 0.6;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
    }

    .toast-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.5rem;
        background: linear-gradient(
            135deg,
            rgba(15, 23, 42, 0.95),
            rgba(30, 41, 59, 0.95)
        );
        backdrop-filter: blur(20px);
        border: 1px solid rgba(6, 182, 212, 0.3);
        border-radius: 16px;
        box-shadow:
            0 4px 30px rgba(6, 182, 212, 0.2),
            0 0 60px rgba(147, 51, 234, 0.1);
    }

    .icon-container {
        position: relative;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            135deg,
            rgba(6, 182, 212, 0.2),
            rgba(147, 51, 234, 0.2)
        );
        border-radius: 12px;
        border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .achievement-icon {
        font-size: 2rem;
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        animation: bounce-icon 0.6s ease-out;
    }

    @keyframes bounce-icon {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
    }

    .badge-icon {
        position: absolute;
        bottom: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        color: #fbbf24;
        filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
    }

    .text-container {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    .achievement-label {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #22d3ee;
        font-weight: 600;
    }

    .achievement-name {
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        font-family: "JetBrains Mono", monospace;
    }

    .achievement-desc {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.6);
    }

    /* Responsive */
    @media (max-width: 480px) {
        .toast-content {
            padding: 0.75rem 1rem;
            gap: 0.75rem;
        }

        .icon-container {
            width: 48px;
            height: 48px;
        }

        .achievement-icon {
            font-size: 1.5rem;
        }

        .achievement-name {
            font-size: 1rem;
        }
    }
</style>
