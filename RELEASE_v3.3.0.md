# Release v3.3.0 - Achievements & Anti-Cheat

## 🏆 New Features

### Achievements / Badges System
Unlock **13 achievements** across 3 categories as you improve your typing skills!

#### Speed Milestones
| Badge | Name | Requirement |
|-------|------|-------------|
| 🚀 | Speed Demon | Reach 50 WPM |
| ⚡ | Lightning Fingers | Reach 75 WPM |
| 🔥 | On Fire | Reach 100 WPM |
| 💎 | Diamond Hands | Reach 125 WPM |
| 👑 | Typing Royalty | Reach 150 WPM |

#### Consistency Milestones
| Badge | Name | Requirement |
|-------|------|-------------|
| 🎯 | Sharpshooter | 100% accuracy on any test |
| 🏅 | Bronze Grinder | Complete 10 tests |
| 🥈 | Silver Grinder | Complete 100 tests |
| 🥇 | Gold Grinder | Complete 500 tests |
| 💯 | Dedication | Complete 1000 tests |

#### Mode Mastery
| Badge | Name | Requirement |
|-------|------|-------------|
| ⏱️ | Time Trial Pro | Complete all time modes |
| 📝 | Word Master | Complete all word modes |
| 🌟 | All-Rounder | Try every mode at least once |

### Achievement Features
- 🔔 **Toast notifications** when you unlock a badge (with animated glow effects!)
- 🏅 **Achievements section** on your profile page
- 💾 **Persistent storage** - achievements saved to Firestore per user
- 🎨 **Locked/Unlocked states** - see what you've earned and what's left to unlock

---

## 🛡️ Anti-Cheat System

### Client-Side Protection
- ✅ **Paste prevention** - Ctrl+V and drag-drop blocked in typing area
- ✅ **Cut prevention** - Ctrl+X blocked
- ✅ **Score validation** - Invalid scores rejected before saving

### Server-Side Protection (Firestore Rules)
- ✅ **WPM cap**: 1-250 (world record is ~216 WPM)
- ✅ **Accuracy bounds**: 0-100% only
- ✅ **Valid modes**: Only `time` or `words` accepted
- ✅ **Valid limits**: Only `[10, 15, 25, 30, 50, 60, 100, 120]`

---

## 📁 Files Changed

### New Files
- `src/lib/services/achievementService.ts` - Core achievement definitions and Firestore integration
- `src/lib/components/AchievementToast.svelte` - Animated toast component
- `firebase.json` - Firebase CLI configuration

### Modified Files
- `src/routes/+page.svelte` - Achievement checking after game completion + anti-cheat validation
- `src/routes/profile/+page.svelte` - Achievements section with badge grid
- `src/lib/components/TypingArea.svelte` - Paste/drop/cut prevention
- `firestore.rules` - Anti-cheat validation rules

---

## ⚠️ Deployment Note

Don't forget to deploy the updated Firestore rules:
1. Go to Firebase Console → Firestore → Rules
2. Replace with new rules from `firestore.rules`
3. Click **Publish**
