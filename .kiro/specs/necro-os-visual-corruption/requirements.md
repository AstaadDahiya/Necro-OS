# Requirements Document

## Introduction

Necro-OS Visual Corruption extends the base Necro-OS system with progressive visual degradation, atmospheric effects, and immersive UI enhancements. This feature set adds CRT monitor effects, cursor corruption, phantom system notifications, and a Spirit Board app for AI-powered supernatural communication. These enhancements create a more authentic retro horror experience that progressively degrades the visual fidelity and system stability as haunting escalates.

## Glossary

- **Necro-OS**: The complete haunted Windows 95 desktop simulator system
- **CRT Filter**: Visual overlay that simulates cathode ray tube monitor effects including scanlines, curvature, and phosphor glow
- **Cursor Corruption**: Visual distortions applied to the mouse cursor including rotation, trails, and glitch effects
- **Phantom Notification**: Fake system notifications and toast messages that appear autonomously
- **Spirit Board**: AI-powered Ouija board application for supernatural communication
- **Terminal Popup**: Command prompt windows that appear spontaneously showing fake system logs
- **Desktop Corruption**: Progressive visual degradation of desktop elements including icons, wallpaper, and UI components
- **Haunting Level**: A progressive intensity scale for supernatural behaviors that escalates over time
- **Ghost Behavior**: Autonomous haunting actions triggered by idle detection or time-based escalation

## Requirements

### Requirement 1

**User Story:** As a user, I want to see authentic CRT monitor effects, so that the experience feels like using a real 1990s computer

#### Acceptance Criteria

1. THE Necro-OS SHALL apply a CRT filter overlay to the entire desktop viewport
2. THE CRT filter SHALL render horizontal scanlines with 2 pixel spacing and 50 percent opacity
3. THE CRT filter SHALL apply barrel distortion to simulate curved CRT screen with 3 percent curvature
4. THE CRT filter SHALL add phosphor glow effect using CSS box-shadow with green tint
5. WHEN Haunting Level reaches 3, THE CRT filter SHALL add screen flicker animation at 0.1 second intervals
6. WHEN Haunting Level reaches 5, THE CRT filter SHALL increase barrel distortion to 8 percent for extreme warping

### Requirement 2

**User Story:** As a user, I want the mouse cursor to become corrupted, so that I feel the system losing control

#### Acceptance Criteria

1. THE Necro-OS SHALL replace the default cursor with a custom Windows 95 arrow cursor sprite
2. WHEN Haunting Level reaches 2, THE Cursor Corruption system SHALL randomly rotate the cursor by 15 to 45 degrees
3. WHEN Haunting Level reaches 3, THE Cursor Corruption system SHALL render a ghost cursor trail that follows 200 milliseconds behind the real cursor
4. WHEN Haunting Level reaches 4, THE Cursor Corruption system SHALL apply glitch distortion to the cursor sprite every 5 seconds
5. THE Cursor Corruption system SHALL occasionally teleport the cursor 50 to 100 pixels in a random direction
6. WHEN the user is idle for 5 seconds, THE Cursor Corruption system SHALL animate the cursor moving autonomously in circular patterns

### Requirement 3

**User Story:** As a user, I want to see phantom system notifications, so that the OS feels haunted by background processes

#### Acceptance Criteria

1. THE Phantom Notification system SHALL display toast notifications in the bottom-right corner above the taskbar
2. WHEN Haunting Level reaches 2, THE Phantom Notification system SHALL trigger random notifications every 30 to 60 seconds
3. THE Phantom Notification system SHALL generate notification text using Gemini API with prompts for creepy system messages
4. THE Phantom Notification system SHALL display notifications with Windows 95 styling including gray background and system font
5. WHEN a notification appears, THE Phantom Notification system SHALL play a notification sound using Web Audio API
6. THE Phantom Notification system SHALL auto-dismiss notifications after 5 seconds with fade-out animation
7. WHEN Haunting Level reaches 4, THE Phantom Notification system SHALL decrease notification interval to 15 to 30 seconds

### Requirement 4

**User Story:** As a user, I want to interact with a Spirit Board app, so that I can communicate with AI entities haunting the system

#### Acceptance Criteria

1. THE Necro-OS SHALL provide a SpiritBoard Desktop App accessible from the Start Menu
2. THE SpiritBoard SHALL render a Ouija board graphic with letters, numbers, YES, NO, and GOODBYE
3. WHEN the user clicks on the SpiritBoard, THE SpiritBoard SHALL display a text input field for questions
4. WHEN the user submits a question, THE SpiritBoard SHALL send the question to Gemini API with a supernatural entity system prompt
5. WHEN Gemini API returns a response, THE SpiritBoard SHALL animate a planchette moving across the board spelling out the response letter by letter
6. THE SpiritBoard SHALL use Web Speech API to whisper each letter as the planchette moves
7. THE Gemini API prompt SHALL instruct the AI to respond as a haunting entity with knowledge of the user's session activity
8. THE SpiritBoard SHALL display the complete message below the board after the planchette animation completes

### Requirement 5

**User Story:** As a user, I want to see spontaneous terminal popups, so that I feel like the system is executing mysterious processes

#### Acceptance Criteria

1. THE Terminal Popup system SHALL create Command Prompt windows that appear autonomously
2. WHEN Haunting Level reaches 3, THE Terminal Popup system SHALL trigger terminal popups every 45 to 90 seconds
3. THE Terminal Popup SHALL display fake system logs with timestamps, error codes, and cryptic messages
4. THE Terminal Popup SHALL generate log content using Gemini API with prompts for realistic but unsettling system messages
5. THE Terminal Popup SHALL auto-type log lines with 50 millisecond delay per character for authentic terminal effect
6. WHEN log typing completes, THE Terminal Popup SHALL remain open for 10 seconds before auto-closing
7. THE Terminal Popup system SHALL include messages referencing ghost processes like 'soul.exe', 'haunt.dll', and 'entity404.sys'

### Requirement 6

**User Story:** As a user, I want the desktop to progressively corrupt, so that the visual degradation creates escalating dread

#### Acceptance Criteria

1. WHEN Haunting Level reaches 2, THE Desktop Corruption system SHALL randomly move desktop icons by 10 to 30 pixels every 60 seconds
2. WHEN Haunting Level reaches 3, THE Desktop Corruption system SHALL duplicate random desktop icons creating ghost copies
3. WHEN Haunting Level reaches 4, THE Desktop Corruption system SHALL darken the desktop background by 10 percent every 30 seconds
4. THE Desktop Corruption system SHALL apply CSS filter effects to desktop icons including hue-rotate and invert
5. WHEN Haunting Level reaches 5, THE Desktop Corruption system SHALL replace the desktop wallpaper with a corrupted glitch texture
6. THE Desktop Corruption system SHALL animate desktop icon corruption with smooth CSS transitions over 2 seconds

### Requirement 7

**User Story:** As a user, I want to see a BIOS-style boot sequence, so that the horror experience starts before Windows loads

#### Acceptance Criteria

1. WHEN the application loads, THE Necro-OS SHALL display a BIOS boot screen before the Windows 95 boot sequence
2. THE BIOS boot screen SHALL render white text on black background with monospace font
3. THE BIOS boot screen SHALL display fake hardware detection messages including CPU, RAM, and disk drives
4. THE BIOS boot screen SHALL auto-type text with 20 millisecond delay per character
5. THE BIOS boot screen SHALL include cryptic error messages like 'WARNING: Spectral entity detected in memory sector 0x666'
6. THE BIOS boot screen SHALL display for 5 to 8 seconds before transitioning to Windows 95 boot sequence
7. THE BIOS boot screen SHALL play a PC speaker beep sound using Web Audio API

### Requirement 8

**User Story:** As a user, I want the desktop wallpaper to flicker with ghostly images, so that the background feels alive

#### Acceptance Criteria

1. THE Necro-OS SHALL support animated GIF wallpapers for the desktop background
2. WHEN Haunting Level reaches 3, THE Desktop Wallpaper system SHALL randomly swap the wallpaper with a ghostly flicker image
3. THE Desktop Wallpaper system SHALL display the flicker image for 100 to 300 milliseconds before reverting to original
4. THE Desktop Wallpaper system SHALL trigger wallpaper flickers every 20 to 40 seconds
5. THE Desktop Wallpaper system SHALL use CSS transition effects for smooth wallpaper swapping
6. WHEN Haunting Level reaches 5, THE Desktop Wallpaper system SHALL increase flicker frequency to every 10 to 20 seconds
7. THE Desktop Wallpaper system SHALL maintain a collection of 5 to 10 ghostly wallpaper variants

### Requirement 9

**User Story:** As a user, I want to see fake low disk space warnings, so that I feel the system is failing

#### Acceptance Criteria

1. WHEN Haunting Level reaches 2, THE Phantom Notification system SHALL display fake low disk space warnings
2. THE low disk space warning SHALL render as a Windows 95 dialog box with warning icon
3. THE low disk space warning SHALL display text like 'Drive C: is running out of disk space. 666 MB remaining'
4. WHEN the user clicks OK on the warning, THE warning SHALL reappear after 3 to 5 seconds
5. WHEN the user clicks the X button, THE warning SHALL shake and refuse to close
6. THE low disk space warning SHALL play the Windows error sound when appearing
7. WHEN Haunting Level reaches 4, THE Phantom Notification system SHALL display multiple overlapping disk space warnings

### Requirement 10

**User Story:** As a user, I want right-click context menus to appear in wrong places, so that basic interactions feel broken

#### Acceptance Criteria

1. WHEN Haunting Level reaches 3, THE Context Menu Corruption system SHALL intercept right-click events
2. WHEN a right-click event is intercepted, THE Context Menu Corruption system SHALL display the context menu offset by 100 to 200 pixels from the click position
3. THE Context Menu Corruption system SHALL randomly rotate context menus by 5 to 15 degrees
4. THE Context Menu Corruption system SHALL occasionally display context menus upside-down with 180 degree rotation
5. THE Context Menu Corruption system SHALL have a 30 percent chance to trigger corruption on each right-click
6. WHEN Haunting Level reaches 5, THE Context Menu Corruption system SHALL increase corruption chance to 60 percent

### Requirement 11

**User Story:** As a developer, I want the visual effects to be performant, so that the horror experience remains smooth

#### Acceptance Criteria

1. THE CRT filter SHALL use CSS filters and transforms for GPU acceleration
2. THE Cursor Corruption system SHALL use CSS transforms for cursor manipulation to avoid layout reflows
3. THE Desktop Corruption system SHALL throttle icon movement updates to maximum 1 update per second
4. THE Phantom Notification system SHALL limit maximum concurrent notifications to 3 notifications
5. THE Terminal Popup system SHALL limit maximum concurrent terminal windows to 2 windows
6. THE Necro-OS SHALL use requestAnimationFrame for all animation loops to sync with browser repaint cycle

### Requirement 12

**User Story:** As a user, I want the Spirit Board to feel authentic, so that the supernatural communication is immersive

#### Acceptance Criteria

1. THE SpiritBoard SHALL render the planchette as a semi-transparent circular element with crosshairs
2. WHEN the planchette moves, THE SpiritBoard SHALL apply smooth CSS transitions with 500 millisecond duration
3. THE SpiritBoard SHALL calculate planchette position based on letter coordinates in the board layout
4. WHEN spelling a message, THE SpiritBoard SHALL pause for 800 milliseconds on each letter
5. THE SpiritBoard SHALL apply a glowing effect to the current letter using CSS box-shadow
6. WHEN the message is complete, THE SpiritBoard SHALL move the planchette to GOODBYE position
7. THE SpiritBoard SHALL support multi-word responses by moving to a space position between words

### Requirement 13

**User Story:** As a user, I want terminal popups to look authentic, so that they feel like real system processes

#### Acceptance Criteria

1. THE Terminal Popup SHALL render with black background and green monospace text
2. THE Terminal Popup SHALL display a blinking cursor at the end of the current line
3. THE Terminal Popup SHALL include a title bar showing 'C:\\WINDOWS\\system32\\cmd.exe'
4. THE Terminal Popup SHALL display a command prompt prefix like 'C:\\NECRO>' before each log line
5. THE Terminal Popup SHALL support ANSI color codes for colored text output
6. THE Terminal Popup SHALL render at random positions on the desktop avoiding overlap with existing windows
7. THE Terminal Popup SHALL have a fixed size of 600 pixels width by 400 pixels height

### Requirement 14

**User Story:** As a user, I want desktop icon duplication to feel supernatural, so that the corruption is unsettling

#### Acceptance Criteria

1. WHEN duplicating an icon, THE Desktop Corruption system SHALL create a semi-transparent ghost copy with 50 percent opacity
2. THE ghost icon copy SHALL be offset by 20 to 40 pixels from the original icon position
3. THE ghost icon copy SHALL not respond to click events and shall be non-interactive
4. THE Desktop Corruption system SHALL limit maximum ghost icons to 5 duplicates per original icon
5. WHEN Haunting Level decreases, THE Desktop Corruption system SHALL fade out ghost icons over 2 seconds
6. THE ghost icon SHALL have a subtle pulsing animation using CSS keyframes

### Requirement 15

**User Story:** As a user, I want the BIOS screen to include Easter eggs, so that exploration is rewarded

#### Acceptance Criteria

1. THE BIOS boot screen SHALL have a 10 percent chance to display a secret message like 'Press F13 to enter the void'
2. WHEN the user presses F13 during BIOS screen, THE Necro-OS SHALL immediately set Haunting Level to maximum
3. THE BIOS boot screen SHALL display a fake memory test that counts up to 666 MB
4. THE BIOS boot screen SHALL include a fake hardware list showing 'Spectral Processor' and 'Haunted Graphics Adapter'
5. THE BIOS boot screen SHALL display the current date as October 31, 1995 regardless of actual date
