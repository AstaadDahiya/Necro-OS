# Advanced Haunting System Integration Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.vue                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  onBootComplete()                                       │    │
│  │    ↓                                                    │    │
│  │  advancedHaunting.initialize()                         │    │
│  │    ├─→ Load saved progress                             │    │
│  │    ├─→ Apply theme                                     │    │
│  │    ├─→ Check consumed warning                          │    │
│  │    ├─→ Setup before unload handler                     │    │
│  │    ├─→ initializeHauntingIntegration() ────────┐       │    │
│  │    ├─→ initializeVisualCorruptionIntegration() ┼──┐    │    │
│  │    ├─→ initializeAudioHaunting()               │  │    │    │
│  │    ├─→ initializeMetaHorrorEffects()           │  │    │    │
│  │    ├─→ setupUserNameDetection()                │  │    │    │
│  │    ├─→ setupEasterEggDetection()               │  │    │    │
│  │    ├─→ startSession()                          │  │    │    │
│  │    └─→ startEndingConditionChecker()           │  │    │    │
│  └────────────────────────────────────────────────┼──┼────┘    │
└─────────────────────────────────────────────────────┼──┼─────────┘
                                                      │  │
                    ┌─────────────────────────────────┘  │
                    │                                    │
                    ▼                                    ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│  Ghost Behavior Store            │  │  Visual Corruption Store         │
│  ┌────────────────────────────┐  │  │  ┌────────────────────────────┐  │
│  │ hauntingLevel (1-10)       │  │  │  │ CRT Filter                 │  │
│  │   ↓                        │  │  │  │ Cursor Corruption          │  │
│  │ Watched by:                │  │  │  │ Desktop Corruption         │  │
│  │ advancedHaunting           │  │  │  │ Phantom Notifications      │  │
│  │   ↓                        │  │  │  │ Terminal Popups            │  │
│  │ Maps to possession         │  │  │  │ Disk Space Warnings        │  │
│  │ contribution (0-50)        │  │  │  │ Context Menu Corruption    │  │
│  └────────────────────────────┘  │  │  │ Wallpaper Flicker          │  │
│                                   │  │  └────────────────────────────┘  │
│  Escalation Timer:                │  │                                  │
│  - Increments every 30s           │  │  Triggered by:                   │
│  - Triggers audio haunting        │  │  - possessionLevel >= 60         │
│  - Triggers visual corruption     │  │  - possessionLevel >= 80         │
└──────────────────────────────────┘  └──────────────────────────────────┘
                    │                                    ▲
                    │                                    │
                    └────────────────┬───────────────────┘
                                     │
                                     ▼
            ┌─────────────────────────────────────────────┐
            │  Advanced Haunting Store                    │
            │  ┌───────────────────────────────────────┐  │
            │  │ possessionLevel (0-100)               │  │
            │  │   ↑                                   │  │
            │  │   │ Increased by:                     │  │
            │  │   ├─ Escalation timer (per minute)    │  │
            │  │   ├─ Seasonal modifiers               │  │
            │  │   └─ Difficulty multiplier            │  │
            │  │   ↓                                   │  │
            │  │ Decreased by:                         │  │
            │  │   ├─ Exorcism actions                 │  │
            │  │   ├─ Cursed file deletion             │  │
            │  │   └─ Puzzle completion                │  │
            │  └───────────────────────────────────────┘  │
            │                                             │
            │  Watchers:                                  │
            │  ┌───────────────────────────────────────┐  │
            │  │ watch(ghostBehavior.hauntingLevel)    │  │
            │  │   → Log possession contribution       │  │
            │  │                                       │  │
            │  │ watch(possessionLevel)                │  │
            │  │   → Level 60: Glitch corruption       │  │
            │  │   → Level 80: Invert corruption       │  │
            │  │   → Level 70+: Random flickers        │  │
            │  └───────────────────────────────────────┘  │
            └─────────────────────────────────────────────┘
                                     │
                                     ▼
            ┌─────────────────────────────────────────────┐
            │  Desktop Component                          │
            │  ┌───────────────────────────────────────┐  │
            │  │ Debug UI (Ctrl+Shift+D)               │  │
            │  │   ├─ Possession Level: XX.X           │  │
            │  │   ├─ Haunting Level: X                │  │
            │  │   ├─ Difficulty: normal               │  │
            │  │   ├─ Session Time: MM:SS              │  │
            │  │   └─ Seasonal Event: 🎃 Halloween     │  │
            │  └───────────────────────────────────────┘  │
            │                                             │
            │  Updates every second via:                  │
            │  - formatSessionTime()                      │
            │  - getSeasonalEventName()                   │
            └─────────────────────────────────────────────┘
```

## Integration Points

### 1. Haunting Level → Possession Contribution
```javascript
watch(
  () => ghostBehavior.hauntingLevel,
  (newLevel) => {
    const contribution = newLevel * 5  // Maps 1-10 to 0-50
    console.log(`Haunting level ${newLevel} contributes ${contribution} to possession`)
  }
)
```

### 2. Possession Level → Visual Corruption
```javascript
watch(
  () => this.possessionLevel,
  (level, oldLevel) => {
    // Threshold 60: Glitch effects
    if (level >= 60 && oldLevel < 60) {
      visualCorruption.triggerWallpaperFlicker()
      visualCorruption.replaceWallpaper()
    }
    
    // Threshold 80: Invert effects
    if (level >= 80 && oldLevel < 80) {
      visualCorruption.darkenBackground()
      visualCorruption.darkenBackground()
      visualCorruption.desktopCorruption.flickerInterval = 5000
    }
    
    // Random flickers at high possession
    if (level >= 70 && Math.random() < 0.1) {
      visualCorruption.triggerWallpaperFlicker()
    }
  }
)
```

### 3. Component Registration Flow
```
appRegistry.js
  ├─ taskmanager → TaskManager.vue
  ├─ commandprompt → CommandPrompt.vue
  └─ settings → SettingsPanel.vue

Window Manager
  ├─ openWindow(appName, options)
  └─ getAppComponent(appName) → Lazy loaded component
```

## Data Flow

```
User Action
    ↓
Ghost Behavior (idle detection, escalation)
    ↓
Haunting Level Changes (1-10)
    ↓
Advanced Haunting Watcher
    ↓
Possession Level Calculation
    ↓
    ├─→ Visual Corruption Triggers (60, 80)
    │   └─→ Wallpaper flicker, darkening, etc.
    │
    ├─→ Audio Haunting Effects
    │   └─→ Whispers, heartbeat, ambient sounds
    │
    ├─→ Meta Horror Effects
    │   └─→ Fake errors, screen crack, etc.
    │
    └─→ Debug UI Update
        └─→ Real-time stats display
```

## Threshold Effects

| Possession Level | Visual Corruption Effects |
|-----------------|---------------------------|
| 0-59 | Base CRT filter, cursor corruption |
| 60-69 | + Glitch corruption, wallpaper replacement |
| 70-79 | + 10% random flickers |
| 80-100 | + Invert corruption, 30% random flickers, max darkening |

## Debug UI Features

- **Toggle**: Ctrl+Shift+D
- **Persistence**: localStorage
- **Update Frequency**: 1 second
- **Position**: Top-right corner
- **Style**: Terminal green on dark background
- **Information**:
  - Possession Level (decimal precision)
  - Haunting Level (integer 1-10)
  - Difficulty Mode
  - Session Time (MM:SS)
  - Active Seasonal Event
