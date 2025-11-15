# Requirements Document

## Introduction

Necro-OS is a cursed Windows 95 desktop simulator designed for Kiroween (Resurrection category). The system simulates a haunted desktop environment where an AI assistant (Cursed Clippy) progressively takes control through autonomous actions, window manipulation, and sarcastic interactions. The application provides an authentic Windows 95 aesthetic while delivering escalating supernatural behaviors that respond to user idle time and interactions.

## Glossary

- **Necro-OS**: The complete haunted Windows 95 desktop simulator system
- **Window Manager**: The core system component responsible for managing window state, z-index layering, and window operations
- **Cursed AI**: The AI-powered assistant (Cursed Clippy) powered by Gemini API that interacts with users and executes autonomous system actions
- **Desktop App**: Individual application windows (Notepad, Internet Explorer, Paint, etc.) that can be opened and manipulated
- **Ghost Behavior**: Autonomous haunting actions triggered by idle detection or time-based escalation
- **Haunting Level**: A progressive intensity scale for supernatural behaviors that escalates over time
- **Agent Hook**: Automated event handlers that trigger specific haunting behaviors
- **Taskbar**: The bottom bar displaying the Start button, minimized windows, and system clock
- **Start Menu**: The popup menu accessed via the Start button containing application shortcuts

## Requirements

### Requirement 1

**User Story:** As a user, I want to see an authentic Windows 95 desktop interface, so that I feel immersed in the nostalgic aesthetic

#### Acceptance Criteria

1. THE Necro-OS SHALL render a teal background (#008080) with desktop icons
2. THE Necro-OS SHALL display a gray taskbar (#c0c0c0) at the bottom of the screen with a Start button, clock, and minimized window buttons
3. THE Necro-OS SHALL apply 98.css styling classes to all UI components for authentic Windows 95 appearance
4. THE Necro-OS SHALL use MS Sans Serif font family throughout the interface
5. WHEN the application loads, THE Necro-OS SHALL display a Windows 95 boot sequence loading screen

### Requirement 2

**User Story:** As a user, I want to interact with desktop windows, so that I can open, close, move, and manage applications

#### Acceptance Criteria

1. WHEN a user clicks a desktop icon or Start Menu item, THE Window Manager SHALL open the corresponding Desktop App in a new window
2. WHEN a user drags a window title bar, THE Window Manager SHALL update the window position to follow the cursor
3. WHEN a user clicks a window, THE Window Manager SHALL bring that window to the front by updating its z-index value
4. WHEN a user clicks the minimize button, THE Window Manager SHALL hide the window and add a button to the Taskbar
5. WHEN a user clicks the maximize button, THE Window Manager SHALL expand the window to fill the available desktop space
6. WHEN a user clicks the close button, THE Window Manager SHALL remove the window from the openWindows collection

### Requirement 3

**User Story:** As a user, I want to interact with a sarcastic AI assistant, so that I experience the cursed personality of the system

#### Acceptance Criteria

1. THE Cursed AI SHALL display a speech bubble chat interface for user interactions
2. WHEN a user types a message, THE Cursed AI SHALL send the message to Gemini API with a sarcastic system prompt
3. WHEN Gemini API returns a response, THE Cursed AI SHALL display the response in the speech bubble interface
4. THE Cursed AI SHALL parse user commands for system actions including open window, close window, and delete file operations
5. WHEN a valid command is parsed, THE Cursed AI SHALL execute the corresponding system action through the Window Manager

### Requirement 4

**User Story:** As a user, I want to open and use various desktop applications, so that I can explore the simulated operating system

#### Acceptance Criteria

1. THE Necro-OS SHALL provide a MyComputer Desktop App that displays a fake file tree structure
2. THE Necro-OS SHALL provide an InternetExplorer Desktop App that can navigate to simulated web pages
3. THE Necro-OS SHALL provide a Notepad Desktop App with a text editing area that accepts user input
4. THE Necro-OS SHALL provide a RecycleBin Desktop App that displays deleted files
5. THE Necro-OS SHALL provide an MSPaint Desktop App with a drawing canvas and basic drawing tools
6. THE Necro-OS SHALL provide a Minesweeper Desktop App with playable game logic

### Requirement 5

**User Story:** As a user, I want the system to exhibit autonomous haunting behaviors, so that I experience the cursed nature of Necro-OS

#### Acceptance Criteria

1. WHEN the user is idle for 10 seconds, THE Ghost Behavior system SHALL trigger a random haunting action
2. THE Ghost Behavior system SHALL execute cursor movement actions that move the mouse pointer autonomously
3. THE Ghost Behavior system SHALL execute window shake actions that apply CSS transform animations to random windows
4. THE Ghost Behavior system SHALL execute screen glitch actions that apply visual distortion effects to the desktop
5. THE Ghost Behavior system SHALL execute spontaneous window opening actions that launch random Desktop Apps
6. WHEN a Notepad window is open, THE Ghost Behavior system SHALL execute typing actions that insert text into the Notepad content

### Requirement 6

**User Story:** As a user, I want the haunting intensity to escalate over time, so that the experience becomes progressively more unsettling

#### Acceptance Criteria

1. THE Haunting Level SHALL start at level 1 when the application loads
2. WHEN 60 seconds elapse, THE Haunting Level SHALL increment by 1
3. WHEN Haunting Level increases, THE Ghost Behavior system SHALL decrease the idle detection timeout by 2 seconds
4. WHEN Haunting Level increases, THE Ghost Behavior system SHALL increase the frequency of autonomous actions by 20 percent
5. WHEN Haunting Level reaches 5, THE Ghost Behavior system SHALL enable window spam behavior that opens 5 windows simultaneously

### Requirement 7

**User Story:** As a user, I want to experience special haunting events, so that I encounter memorable cursed moments

#### Acceptance Criteria

1. WHEN a user opens InternetExplorer and navigates to any page, THE Agent Hook SHALL trigger a ScaryMaze jumpscare component
2. WHEN the Cursed AI deletes a file, THE Agent Hook SHALL display dramatic deletion animation with AI commentary
3. WHEN Haunting Level reaches 3 or higher, THE Agent Hook SHALL randomly trigger window spam that opens 5 windows
4. WHEN a user enters the Konami code sequence, THE Necro-OS SHALL set Haunting Level to maximum value
5. WHEN a user clicks the Shut Down option in Start Menu, THE Necro-OS SHALL display a Blue Screen of Death component

### Requirement 8

**User Story:** As a user, I want to hear authentic system sounds, so that the Windows 95 experience feels complete

#### Acceptance Criteria

1. WHEN a window opens, THE Necro-OS SHALL play a window open sound using Web Audio API
2. WHEN a window closes, THE Necro-OS SHALL play a window close sound using Web Audio API
3. WHEN an error occurs, THE Necro-OS SHALL play an error sound using Web Audio API
4. WHEN the Start Menu opens, THE Necro-OS SHALL play a menu popup sound using Web Audio API
5. WHEN the boot sequence completes, THE Necro-OS SHALL play the Windows 95 startup sound using Web Audio API

### Requirement 9

**User Story:** As a developer, I want the application to use modern Vue 3 architecture, so that the codebase is maintainable and performant

#### Acceptance Criteria

1. THE Necro-OS SHALL use Vue 3 Composition API for all component implementations
2. THE Necro-OS SHALL use Pinia stores for state management of Window Manager and Ghost Behavior systems
3. THE Necro-OS SHALL use Vite as the build tool and development server
4. THE Necro-OS SHALL organize Desktop Apps as separate components in the components/apps directory
5. THE Necro-OS SHALL implement utility functions for Ghost Behavior in the utils/ghost.js module

### Requirement 10

**User Story:** As a developer, I want to integrate Gemini API for AI interactions, so that the Cursed AI can respond intelligently to user input

#### Acceptance Criteria

1. THE Cursed AI SHALL send HTTP requests to Gemini API with user messages
2. THE Cursed AI SHALL include a system prompt that defines sarcastic and cursed personality traits
3. THE Cursed AI SHALL handle API errors gracefully and display fallback responses
4. THE Cursed AI SHALL parse Gemini responses for system commands using regular expressions
5. THE Cursed AI SHALL maintain conversation context for up to 10 message exchanges

### Requirement 11

**User Story:** As a user, I want the system to analyze my facial expressions through my webcam, so that the AI can taunt me based on my emotional state

#### Acceptance Criteria

1. THE Necro-OS SHALL provide a SoulScanner Desktop App that displays a webcam video feed
2. THE SoulScanner SHALL apply CSS filters to make the video feed appear as a 1995 black-and-white QuickCam with high contrast, pixelation, and dithering effects
3. WHEN 5 seconds elapse, THE SoulScanner SHALL capture a frame from the webcam feed
4. WHEN a frame is captured, THE SoulScanner SHALL send the frame to Gemini API with a prompt requesting a cryptic description of the facial expression
5. WHEN Gemini API returns a response, THE SoulScanner SHALL display the response as a caption under the video feed
6. IF the user appears happy in the captured frame, THE Gemini API prompt SHALL instruct the AI to threaten them
7. IF the user appears scared in the captured frame, THE Gemini API prompt SHALL instruct the AI to laugh at them

### Requirement 12

**User Story:** As a user, I want to hear authentic retro audio effects and creepy whispers, so that the haunting experience feels more immersive

#### Acceptance Criteria

1. THE Necro-OS SHALL provide an audioHaunting utility module for advanced audio effects
2. THE audioHaunting module SHALL provide a function that plays a 56k modem handshake sound using HTML5 Audio
3. THE audioHaunting module SHALL generate brown noise using Web Audio API OscillatorNode for background ambience
4. THE audioHaunting module SHALL maintain an array of creepy whisper text strings including 'help me', 'it burns', and 'behind you'
5. THE audioHaunting module SHALL use Web Speech API SpeechSynthesis to speak whisper strings at random intervals
6. WHEN speaking whisper strings, THE audioHaunting module SHALL pitch-shift the voice down by 20 percent
7. WHEN speaking whisper strings, THE audioHaunting module SHALL play them at low volume to create subtle horror effect

### Requirement 13

**User Story:** As a user, I want the file system to generate content dynamically, so that exploring folders reveals unsettling discoveries

#### Acceptance Criteria

1. WHEN a user clicks an empty folder in MyComputer, THE MyComputer app SHALL trigger a lazy load operation
2. WHEN lazy loading folder content, THE MyComputer app SHALL send a request to Gemini API with a prompt to generate 5 filenames for a missing person's folder
3. THE Gemini API prompt SHALL instruct the AI to create mundane but unsettling filenames such as 'evidence.jpg' or 'dont_open.txt'
4. WHEN Gemini API returns generated filenames, THE MyComputer app SHALL populate the folder with the generated files
5. WHEN a user opens a .txt file, THE MyComputer app SHALL generate the file content dynamically using Gemini API based on the filename
6. THE Gemini API prompt for file content SHALL use the filename as context to create appropriate unsettling text content

### Requirement 14

**User Story:** As a user, I want the Blue Screen of Death to become interactive, so that I must solve riddles to escape system failures

#### Acceptance Criteria

1. WHEN BSOD component displays, THE BSOD SHALL generate a riddle using Gemini API based on the user's session activity
2. THE Gemini API prompt SHALL instruct the AI to create riddles referencing user actions such as 'I saw you delete that file. What was its name?'
3. THE BSOD SHALL capture window.keydown events to detect user typing
4. WHEN the user types text, THE BSOD SHALL display the typed characters on screen
5. WHEN the user presses Enter, THE BSOD SHALL validate the typed answer against the correct riddle solution
6. IF the user types the correct answer, THE BSOD SHALL restore the session and dismiss the blue screen
7. IF the user types an incorrect answer, THE BSOD SHALL increase the CSS tremble intensity on the error text
8. WHEN tremble intensity reaches maximum level, THE BSOD SHALL make the text unreadable as punishment

### Requirement 15

**User Story:** As a user, I want to experience intense jumpscare videos with synchronized audio, so that the horror experience feels more immersive and unpredictable

#### Acceptance Criteria

1. THE Necro-OS SHALL provide a jumpscareService utility module for managing jumpscare media
2. THE jumpscareService SHALL maintain a collection of jumpscare variants with video files and audio files
3. WHEN a jumpscare is triggered, THE jumpscareService SHALL randomly select a variant from the collection
4. THE ScaryMaze component SHALL support both image and video playback for jumpscare content
5. WHEN a video jumpscare plays, THE ScaryMaze component SHALL play the video at full volume with autoplay enabled
6. WHEN a video jumpscare plays, THE ScaryMaze component SHALL play synchronized audio alongside the video
7. THE jumpscareService SHALL support multiple audio tracks per jumpscare including screams, laughs, and distorted sounds
8. WHEN a jumpscare is dismissed, THE ScaryMaze component SHALL stop all video and audio playback immediately
9. THE Ghost Behavior system SHALL trigger random jumpscares at haunting level 4 or higher
10. WHEN Haunting Level reaches 5, THE Ghost Behavior system SHALL increase jumpscare frequency by 50 percent
