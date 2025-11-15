# Advanced Haunting Integration Implementation

## Overview
This document describes the implementation of Task 19: Integrate Advanced Haunting with Existing Systems.

## Implementation Details

### 1. Store Integration Watchers

#### Ghost Behavior Store Integration
- **Location**: `src/stores/advancedHaunting.js` - `initializeHauntingIntegration()`
- **Functionality**: Watches `ghostBehaviorStore.hauntingLevel` (1-10 scale) and maps it to possession contribution (0-50)
- **Purpose**: Allows the base haunting system to influence the advanced possession system

#### Visual Corruption Store Integration
- **Location**: `src/stores/advancedHaunting.js` - `initializeVisualCorruptionIntegration()`
- **Functionality**: Watches `possessionLevel` and triggers visual corruption effects at key thresholds
- **Thresholds**:
  - **Level 60**: Triggers glitch corruption (wallpaper flicker, wallpaper replacement)
  - **Level 80**: Triggers invert corruption (maximum darkening, increased flicker frequency)
  - **Level 70-79**: 10% chance of wallpaper flicker on possession changes
  - **Level 80+**: 30% chance of wallpaper flicker on possession changes

### 2. App.vue Initialization

The `advancedHauntingStore.initialize()` method is called in `App.vue` during the `onBootComplete()` lifecycle hook. This ensures:
- All integrations are set up after boot sequence
- Stores are properly initialized before haunting begins
- Visual corruption integration is active from the start

### 3. Debug UI Display

#### Toggle Mechanism
- **Keyboard Shortcut**: `Ctrl+Shift+D`
- **Persistence**: State saved to `localStorage` as `necro-os-debug-ui`
- **Location**: Top-right corner of desktop

#### Displayed Information
- **Possession Level**: Current possession level (0-100) with decimal precision
- **Haunting Level**: Base haunting level from ghost behavior store (1-10)
- **Difficulty**: Current difficulty mode (tourist/normal/nightmare/permadeath)
- **Session Time**: Elapsed time in MM:SS format
- **Seasonal Event**: Active seasonal event with icon and name

#### Styling
- Dark semi-transparent background with green terminal-style text
- Monospace font for technical aesthetic
- Non-intrusive positioning with backdrop blur
- Clear visual hierarchy with borders and spacing

### 4. Component Registration

All new components are properly registered in `src/utils/appRegistry.js`:
- ✅ **TaskManager**: `taskmanager` → `TaskManager.vue`
- ✅ **CommandPrompt**: `commandprompt` → `CommandPrompt.vue`
- ✅ **Settings**: `settings` → `SettingsPanel.vue`

Note: `ExorcismPuzzle`, `AchievementNotification`, `EndingScreen`, and `DifficultySelector` are modal components rendered directly in `App.vue` and do not require window manager registration.

## Integration Flow

```
Boot Complete (App.vue)
    ↓
advancedHaunting.initialize()
    ↓
    ├─→ initializeHauntingIntegration()
    │   └─→ Watch ghostBehavior.hauntingLevel
    │       └─→ Log possession contribution (0-50)
    │
    ├─→ initializeVisualCorruptionIntegration()
    │   └─→ Watch possessionLevel
    │       ├─→ Level 60: Trigger glitch effects
    │       ├─→ Level 80: Trigger invert effects
    │       └─→ Level 70+: Random flicker effects
    │
    └─→ Other initializations (audio, meta horror, etc.)
```

## Testing

A comprehensive test file has been created: `test-integration.html`

### Test Coverage
1. **Store Integration**: Verifies all stores initialize and integration methods exist
2. **Possession Level Watchers**: Tests threshold triggers at levels 60 and 80
3. **Haunting Level Sync**: Verifies ghost behavior changes are observed
4. **Debug UI Toggle**: Manual verification of debug display functionality
5. **Component Registration**: Confirms all new components are in appRegistry

### Running Tests
1. Open `test-integration.html` in a browser
2. Click "Run Test" buttons for automated tests
3. Use Ctrl+Shift+D to verify debug UI (Test 4)
4. Check console for detailed logs

## Files Modified

### Core Integration
- `src/stores/advancedHaunting.js`
  - Added `initializeVisualCorruptionIntegration()` method
  - Added import for `useVisualCorruptionStore`
  - Updated `initialize()` to call visual corruption integration

### Debug UI
- `src/components/Desktop.vue`
  - Added `useAdvancedHauntingStore` import
  - Added `showDebugUI` reactive state
  - Added debug panel template with possession/haunting stats
  - Added `formatSessionTime()` and `getSeasonalEventName()` helpers
  - Added keyboard listener for Ctrl+Shift+D toggle
  - Added CSS styles for debug panel

### Testing
- `test-integration.html` (new file)
  - Comprehensive integration test suite
  - Real-time state monitoring
  - Automated and manual test scenarios

## Requirements Satisfied

All requirements from Task 19 have been implemented:
- ✅ Watcher in advancedHauntingStore syncs with ghostBehaviorStore.hauntingLevel
- ✅ Watcher triggers visualCorruptionStore effects at possession thresholds (60, 80)
- ✅ App.vue initializes advancedHauntingStore on boot complete
- ✅ Possession level display added to desktop (optional debug UI with Ctrl+Shift+D)
- ✅ All new components registered in window manager (appRegistry)

## Usage

### For Players
- Press `Ctrl+Shift+D` at any time to toggle the debug UI
- Debug UI shows real-time possession and haunting statistics
- Useful for understanding game mechanics and progression

### For Developers
- Use `test-integration.html` to verify integration functionality
- Check browser console for detailed integration logs
- Monitor possession level changes and their effects on visual corruption
- Verify threshold triggers work correctly at levels 60 and 80

## Notes

- The debug UI is hidden by default and must be manually enabled
- Integration watchers are set up during `initialize()` and remain active throughout the session
- Visual corruption effects are only triggered if the `visualCorruption` feature is enabled in customization settings
- The possession level contribution from haunting level is logged but not directly added (possession is managed by the escalation timer)
