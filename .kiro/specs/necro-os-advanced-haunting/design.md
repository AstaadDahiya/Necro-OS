# Design Document: Advanced Haunting System

## Overview

The Advanced Haunting System extends NecroOS with sophisticated horror mechanics including possessed applications, layered audio haunting, interactive exorcism gameplay, multiple endings, and meta-horror elements. The system integrates with the existing `ghostBehaviorStore` and `visualCorruptionStore` to create a cohesive, escalating horror experience.

The design follows a modular architecture where each haunting category (possessed apps, audio, gameplay, meta-horror) operates independently but coordinates through a central `advancedHauntingStore`. This allows for flexible customization and difficulty scaling while maintaining performance.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         App.vue                              │
│  (Initializes all stores, handles boot sequence)            │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────────────────┐
    │                         │                          │
┌───▼──────────────┐  ┌──────▼──────────┐  ┌───────────▼──────┐
│ Ghost Behavior   │  │ Visual          │  │ Advanced         │
│ Store (existing) │  │ Corruption      │  │ Haunting Store   │
│                  │  │ Store (existing)│  │ (NEW)            │
└───┬──────────────┘  └──────┬──────────┘  └───────┬──────────┘
    │                        │                      │
    │  Possession Level      │  Visual Effects      │  Coordinates
    │  Escalation            │  Triggers            │  All Features
    │                        │                      │
    └────────────────────────┴──────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Possessed Apps │  │ Audio Haunting  │  │ Gameplay       │
│ Service        │  │ Service         │  │ Service        │
│ (NEW)          │  │ (Enhanced)      │  │ (NEW)          │
└────────────────┘  └─────────────────┘  └────────────────┘
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Calculator     │  │ Audio Layers    │  │ Exorcism       │
│ Clock          │  │ - Ambient       │  │ Components     │
│ Task Manager   │  │ - Effects       │  │ - Cursed Files │
│ Command Prompt │  │ - Whispers      │  │ - Puzzles      │
└────────────────┘  │ - Tension       │  └────────────────┘
                    └─────────────────┘
```

### Store Architecture

The system introduces a new Pinia store `advancedHauntingStore` that coordinates all advanced features:

```javascript
advancedHauntingStore {
  state: {
    possessionLevel: 0-100,
    difficulty: 'normal' | 'tourist' | 'nightmare' | 'permadeath',
    sessionStartTime: timestamp,
    exorcismCooldowns: Map<action, timestamp>,
    discoveredEasterEggs: Set<eggId>,
    achievements: Set<achievementId>,
    endingReached: null | 'survivor' | 'consumed' | 'purified' | 'possessed',
    customization: {
      scareIntensity: 0-100,
      enabledBehaviors: Set<behaviorType>,
      theme: 'default' | 'hospital' | 'asylum' | 'cemetery'
    },
    statistics: {
      totalSessions: number,
      totalTimeSurvived: number,
      exorcismsPerformed: number,
      jumpscaresSeen: Set<jumpscareId>
    }
  }
}
```

## Components and Interfaces

### 1. Advanced Haunting Store (Core Orchestrator)

**File**: `src/stores/advancedHaunting.js`

**Responsibilities**:
- Manage possession level (0-100 scale, separate from existing haunting level)
- Coordinate all advanced haunting features
- Handle difficulty mode logic
- Manage persistence to localStorage
- Track statistics and achievements
- Determine ending conditions

**Key Methods**:
```javascript
// Possession management
increasePossession(amount)
decreasePossession(amount)
getPossessionLevel()

// Difficulty
setDifficulty(mode)
getDifficultyMultiplier()

// Exorcism
performExorcism(actionType, power)
isExorcismOnCooldown(actionType)

// Endings
checkEndingConditions()
triggerEnding(endingType)

// Persistence
saveToLocalStorage()
loadFromLocalStorage()
clearProgress()

// Statistics
recordEvent(eventType, data)
getStatistics()

// Customization
updateCustomization(settings)
isFeatureEnabled(featureType)
```

### 2. Possessed Apps Service

**File**: `src/utils/possessedAppsService.js`

**Responsibilities**:
- Inject haunting behaviors into applications
- Manage app-specific possession effects
- Coordinate with possession level

**Key Functions**:
```javascript
// Calculator possession
getCalculatorResult(operation, actualResult, possessionLevel)
shouldShowDemonicSymbol(possessionLevel)
getDemonicSymbol()

// Clock possession
shouldRunBackwards(possessionLevel)
getBackwardsDuration()
shouldShow333AM(currentTime)

// Task Manager possession
getCursedProcesses(possessionLevel)
generateCursedProcess()

// Command Prompt possession
shouldTypeAutonomously(possessionLevel)
getAutonomousMessage()
typeMessage(message, targetElement)
```

**Integration Points**:
- Calculator component calls `getCalculatorResult()` before displaying
- Clock component checks `shouldRunBackwards()` and `shouldShow333AM()`
- Task Manager component injects `getCursedProcesses()` into process list
- Command Prompt component triggers `typeMessage()` based on possession level

### 3. Enhanced Audio Haunting Service

**File**: `src/utils/audioHauntingService.js` (extends existing)

**New Audio Layers**:
```javascript
audioLayers = {
  ambient: {
    volume: 0-1,
    sounds: ['distant-scream', 'wind', 'creaking'],
    currentSound: null
  },
  effects: {
    volume: 0-1,
    sounds: ['phantom-typing', 'hdd-grinding', 'glass-break'],
    currentSound: null
  },
  whispers: {
    volume: 0-1,
    sounds: ['whisper-name', 'whisper-generic'],
    currentSound: null
  },
  tension: {
    volume: 0-1,
    sounds: ['heartbeat'],
    bpm: 60-140
  }
}
```

**Key Functions**:
```javascript
// Layer management
initializeAudioLayers()
setLayerVolume(layerName, volume)
playOnLayer(layerName, soundName, options)
stopLayer(layerName)

// Possession-based audio
updateAudioForPossessionLevel(level)
playDistantScream(proximity)
playPhantomTyping()
playHDDGrinding(duration)
playWhisper(userName)

// Tension building
startHeartbeat(initialBPM)
adjustHeartbeatTempo(targetBPM, duration)
stopHeartbeat()

// Proximity simulation
adjustVolumeByProximity(soundId, distance)
```

### 4. Gameplay Service

**File**: `src/utils/gameplayService.js`

**Responsibilities**:
- Manage exorcism mechanics
- Track cursed files and puzzles
- Handle achievement unlocking
- Monitor ending conditions

**Key Functions**:
```javascript
// Cursed files
generateCursedFiles(count)
deleteCursedFile(fileId)
getCursedFileList()

// Exorcism actions
performTextExorcism(phrase)
performPuzzleExorcism(solution)
performFileExorcism(fileId)
calculateExorcismPower(actionType)

// Puzzles
generateSymbolPuzzle(difficulty)
validatePuzzleSolution(puzzleId, solution)

// Achievements
checkAchievements()
unlockAchievement(achievementId)
getAchievementProgress()

// Endings
monitorSessionTime()
checkSurvivorEnding()
checkConsumedEnding()
checkPurifiedEnding()
checkPossessedEnding()
```

### 5. Meta Horror Service

**File**: `src/utils/metaHorrorService.js`

**Responsibilities**:
- Generate fake system failures
- Create reality-breaking effects
- Manage easter eggs
- Handle seasonal events

**Key Functions**:
```javascript
// System failures
showFakeRAMError()
showScreenCrack()
showOverheatingWarning(temperature)
showDiskDefrag()

// Reality breaking
showWatchingNotification()
createFakeBrowserTab()
simulateFileAccess()

// Easter eggs
checkKonamiCode(keySequence)
checkSecretCoordinate(x, y, clickCount)
checkSecretPhrase(text)
unlockSecretWallpaper(possessionLevel)

// Seasonal events
getCurrentSeasonalEvent()
applyHalloweenModifiers()
applyFriday13Modifiers()
applyWitchingHourModifiers()
checkMoonPhase()
```

### 6. New Vue Components

#### Calculator Component (Enhanced)
**File**: `src/components/apps/Calculator.vue`

**New Features**:
- Integrate with `possessedAppsService`
- Display incorrect results based on possession
- Show demonic symbols at high possession
- Maintain calculation history for "correction" behavior

#### Task Manager Component (New)
**File**: `src/components/apps/TaskManager.vue`

**Features**:
- Display real and cursed processes
- Show CPU/Memory usage (fake)
- Allow "ending" processes (no effect on cursed ones)
- Integrate with possession level for cursed process count

#### Command Prompt Component (New)
**File**: `src/components/apps/CommandPrompt.vue`

**Features**:
- Terminal-style interface
- Autonomous typing at high possession
- Accept user commands (limited set)
- Display cryptic responses

#### Exorcism Puzzle Component (New)
**File**: `src/components/ExorcismPuzzle.vue`

**Features**:
- Display symbol sequence
- Accept user input
- Timer countdown
- Success/failure feedback
- Integration with gameplay service

#### Ending Screen Component (New)
**File**: `src/components/EndingScreen.vue`

**Features**:
- Display ending-specific visuals
- Show statistics
- Offer restart/continue options
- Save ending to persistence

#### Difficulty Selector Component (New)
**File**: `src/components/DifficultySelector.vue`

**Features**:
- Modal overlay on first launch
- Four difficulty options with descriptions
- Preview of difficulty effects
- Save selection to localStorage

#### Settings Panel Component (New)
**File**: `src/components/SettingsPanel.vue`

**Features**:
- Scare intensity slider
- Feature toggles (possessed apps, audio, visual)
- Theme selector
- Statistics display
- Reset progress button

## Data Models

### Possession Level Model
```javascript
{
  current: 0-100,
  baseIncreaseRate: number, // per minute
  difficultyMultiplier: number,
  lastUpdate: timestamp,
  history: [
    { timestamp, level, event }
  ]
}
```

### Exorcism Action Model
```javascript
{
  type: 'text' | 'file' | 'puzzle',
  power: number, // possession reduction amount
  cooldown: number, // milliseconds
  lastPerformed: timestamp,
  timesPerformed: number
}
```

### Cursed File Model
```javascript
{
  id: string,
  name: string,
  path: string,
  size: string,
  icon: string,
  content: string, // if opened
  possessionValue: number // reduction on delete
}
```

### Achievement Model
```javascript
{
  id: string,
  name: string,
  description: string,
  icon: string,
  unlocked: boolean,
  unlockedAt: timestamp,
  condition: function
}
```

### Ending Model
```javascript
{
  type: 'survivor' | 'consumed' | 'purified' | 'possessed',
  title: string,
  message: string,
  visualEffect: string,
  audioEffect: string,
  condition: function,
  statistics: object
}
```

### Session Statistics Model
```javascript
{
  sessionId: string,
  startTime: timestamp,
  endTime: timestamp,
  duration: number,
  difficulty: string,
  maxPossessionLevel: number,
  exorcismsPerformed: number,
  jumpscaresSeen: number,
  easterEggsFound: number,
  ending: string,
  achievementsUnlocked: []
}
```

### Seasonal Event Model
```javascript
{
  type: 'halloween' | 'friday13' | 'witchingHour' | 'fullMoon',
  active: boolean,
  startTime: timestamp,
  endTime: timestamp,
  modifiers: {
    possessionMultiplier: number,
    jumpscareFrequency: number,
    audioIntensity: number
  }
}
```

## Error Handling

### Audio Failures
- Gracefully degrade if Web Audio API unavailable
- Fallback to silent mode with visual-only effects
- Log audio errors without breaking gameplay

### LocalStorage Failures
- Catch quota exceeded errors
- Implement data compression for statistics
- Provide in-memory fallback for session
- Warn user if persistence unavailable

### Component Failures
- Wrap possessed app behaviors in try-catch
- Prevent possession effects from breaking core app functionality
- Log errors to console for debugging
- Disable specific haunting features if they cause crashes

### Performance Issues
- Throttle possession level updates to max 1/second
- Debounce audio layer volume changes
- Limit concurrent audio sources to 4
- Implement requestAnimationFrame for visual effects
- Monitor frame rate and reduce effects if below 30fps

## Testing Strategy

### Unit Tests
- Test possession level calculations
- Test exorcism power calculations
- Test difficulty multipliers
- Test achievement condition logic
- Test ending condition detection
- Test seasonal event date calculations

### Integration Tests
- Test store coordination (advancedHaunting ↔ ghostBehavior)
- Test audio layer management
- Test persistence save/load cycle
- Test component communication with services
- Test easter egg detection

### Manual Testing Scenarios
1. **Possession Escalation**: Start session, wait for possession to increase, verify effects trigger at correct thresholds
2. **Exorcism Flow**: Perform each exorcism type, verify cooldowns work, verify possession decreases
3. **Endings**: Force each ending condition, verify correct ending displays
4. **Difficulty Modes**: Test each difficulty, verify possession rates differ
5. **Persistence**: Close/reopen browser, verify state restored
6. **Audio Layers**: Verify all 4 layers can play simultaneously without distortion
7. **Possessed Apps**: Open each app, verify possession effects at various levels
8. **Easter Eggs**: Trigger each easter egg, verify unlock and persistence
9. **Seasonal Events**: Mock system date, verify event activation
10. **Customization**: Toggle features, verify they enable/disable correctly

### Performance Tests
- Monitor memory usage over 30-minute session
- Verify audio doesn't cause memory leaks
- Test with 10 windows open simultaneously
- Measure frame rate during intense haunting
- Test localStorage size growth over multiple sessions

## Integration with Existing Systems

### Ghost Behavior Store Integration
```javascript
// In advancedHauntingStore
watch(
  () => ghostBehaviorStore.hauntingLevel,
  (newLevel) => {
    // Map haunting level (1-10) to possession level contribution
    const contribution = newLevel * 5 // 0-50 from base haunting
    updatePossessionLevel(contribution)
  }
)
```

### Visual Corruption Integration
```javascript
// In advancedHauntingStore
watch(
  () => possessionLevel,
  (level) => {
    // Trigger visual corruption at thresholds
    if (level >= 60) {
      visualCorruptionStore.triggerCorruption('glitch')
    }
    if (level >= 80) {
      visualCorruptionStore.triggerCorruption('invert')
    }
  }
)
```

### Audio Service Integration
```javascript
// Extend existing audioService
audioService.initializeLayers = function() {
  this.layers = {
    ambient: this.createAudioLayer(),
    effects: this.createAudioLayer(),
    whispers: this.createAudioLayer(),
    tension: this.createAudioLayer()
  }
}
```

### Window Manager Integration
```javascript
// In possessed apps
const windowManager = useWindowManagerStore()
const window = windowManager.getWindowById(props.windowId)

// Inject possession behaviors based on window.appName
if (window.appName === 'Calculator') {
  applyCalculatorPossession()
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load possessed app components only when opened
2. **Audio Pooling**: Reuse audio nodes instead of creating new ones
3. **Throttled Updates**: Update possession level max once per second
4. **Debounced Persistence**: Save to localStorage max once per 5 seconds
5. **Event Delegation**: Use single event listener for easter egg detection
6. **Memoization**: Cache achievement condition results
7. **RequestAnimationFrame**: Batch visual updates
8. **Web Workers**: Offload statistics calculations (future enhancement)

### Memory Management

- Clear audio buffers when layers stop
- Remove event listeners on component unmount
- Limit localStorage to 5MB max
- Prune old session statistics (keep last 10)
- Unload unused audio files after 5 minutes

### Bundle Size

- Code split possessed app components
- Lazy load audio files on demand
- Compress audio files (use MP3 at 64kbps)
- Tree-shake unused utilities
- Minify all production code

## Security Considerations

### LocalStorage Safety
- Validate all data loaded from localStorage
- Sanitize user input in text exorcisms
- Prevent XSS in cursed file content
- Limit localStorage writes to prevent quota attacks

### Audio Safety
- Limit max volume to prevent hearing damage
- Provide volume controls in settings
- Warn users about audio content
- Respect browser autoplay policies

### Performance Safety
- Implement circuit breaker for failing features
- Limit possession level increase rate
- Prevent infinite loops in easter egg detection
- Cap maximum concurrent audio sources

## Accessibility Considerations

### Photosensitivity
- Add warning on first launch
- Provide "reduced motion" mode in settings
- Disable rapid flashing effects when enabled
- Offer alternative visual indicators

### Audio Accessibility
- Provide visual alternatives for audio cues
- Include subtitles for whispers
- Allow disabling specific audio categories
- Ensure core gameplay works without audio

### Cognitive Accessibility
- Provide "Tourist Mode" for low-stress experience
- Allow pausing haunting progression
- Clear visual indicators for exorcism opportunities
- Simple, consistent UI patterns

## Future Enhancements

### Phase 2 Features (Not in Current Spec)
- Multiplayer haunting (share session links)
- Webcam integration for face detection
- Custom jumpscare uploads
- Modding API for community content
- Mobile touch controls
- Progressive Web App support
- Cloud save synchronization
- Leaderboards and global statistics

### Technical Debt to Address
- Migrate to TypeScript for type safety
- Implement comprehensive error boundaries
- Add telemetry for crash reporting
- Create automated E2E tests
- Set up CI/CD pipeline
- Implement A/B testing framework
- Add performance monitoring
- Create developer documentation

## Deployment Considerations

### Build Configuration
```javascript
// vite.config.js additions
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'possessed-apps': [
            './src/components/apps/Calculator.vue',
            './src/components/apps/TaskManager.vue',
            './src/components/apps/CommandPrompt.vue'
          ],
          'audio-haunting': [
            './src/utils/audioHauntingService.js',
            './public/sounds/haunting/*'
          ]
        }
      }
    }
  }
}
```

### Asset Organization
```
public/
  sounds/
    haunting/
      ambient/
        distant-scream-1.mp3
        distant-scream-2.mp3
        wind.mp3
      effects/
        phantom-typing.mp3
        hdd-grinding.mp3
        glass-break.mp3
      whispers/
        generic-1.mp3
        generic-2.mp3
      tension/
        heartbeat.mp3
  images/
    endings/
      survivor.jpg
      consumed.jpg
      purified.jpg
      possessed.jpg
    themes/
      hospital/
      asylum/
      cemetery/
```

### Environment Variables
```
VITE_ENABLE_TELEMETRY=false
VITE_DEBUG_MODE=false
VITE_SKIP_BOOT_SEQUENCE=false
VITE_DEFAULT_DIFFICULTY=normal
VITE_MAX_POSSESSION_RATE=3
```

## Conclusion

This design provides a comprehensive architecture for the Advanced Haunting System that integrates seamlessly with existing NecroOS components while maintaining modularity and performance. The system is designed to be extensible, allowing for future enhancements without major refactoring.

Key design principles:
- **Modularity**: Each feature category operates independently
- **Performance**: Optimized for smooth 60fps experience
- **Persistence**: Reliable save/load with graceful degradation
- **Accessibility**: Multiple difficulty modes and customization options
- **Maintainability**: Clear separation of concerns and well-documented interfaces
