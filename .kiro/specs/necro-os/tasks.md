# Implementation Plan

- [x] 1. Initialize Vue 3 project with Vite and dependencies
  - Create new Vite project with Vue 3 template
  - Install dependencies: pinia, 98.css, @google/generative-ai
  - Configure vite.config.js with build optimizations
  - Set up .env file structure for API keys
  - Create basic folder structure (components, stores, utils, assets)
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Implement Window Manager Pinia store
  - [x] 2.1 Create windowManager store with state structure
    - Define openWindows array, nextZIndex counter, minimizedWindows array
    - Implement getters for active window, window by ID
    - _Requirements: 2.1, 2.3_
  
  - [x] 2.2 Implement window lifecycle actions
    - Write openWindow() action to create new window with unique ID
    - Write closeWindow() action to remove window from state
    - Write minimizeWindow() action to move window to minimized array
    - Write restoreWindow() action to restore from minimized state
    - Write maximizeWindow() action to toggle maximize state
    - Write bringToFront() action to update z-index
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

- [x] 3. Create core desktop UI components
  - [x] 3.1 Build Desktop.vue component
    - Create teal background (#008080) with desktop styling
    - Render desktop icons grid with click handlers
    - Implement desktop click handler to reset idle timer
    - Add window rendering loop using v-for
    - _Requirements: 1.1, 2.1_
  
  - [x] 3.2 Build Window.vue component
    - Implement draggable window with title bar
    - Add 98.css window styling classes
    - Create minimize, maximize, close button handlers
    - Implement drag start/move/end logic with bounds checking
    - Add bringToFront on click functionality
    - Create computed properties for window styles (position, z-index, dimensions)
    - Implement shake animation method for ghost behaviors
    - _Requirements: 1.3, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 3.3 Build Taskbar.vue component
    - Create gray taskbar (#c0c0c0) with 98.css styling
    - Add Start button with click handler
    - Implement clock display with time updates every second
    - Render minimized window buttons from store
    - Add restore window click handlers
    - _Requirements: 1.2, 2.4_
  
  - [x] 3.4 Build StartMenu.vue component
    - Create Windows 95 style menu with 98.css
    - Define menu items array with icons and app names
    - Implement launch app click handlers
    - Add Shut Down option that triggers BSOD
    - Add menu close on outside click
    - _Requirements: 1.2, 2.1_

- [x] 4. Implement desktop application components
  - [x] 4.1 Create MyComputer.vue app
    - Build fake file tree data structure
    - Implement folder expand/collapse functionality
    - Add file selection highlighting
    - Create delete file action that moves to recycle bin
    - _Requirements: 4.1_
  
  - [x] 4.2 Create Notepad.vue app
    - Build textarea with content binding
    - Implement save dialog (fake)
    - Add aiWrite() method for ghost typing animation
    - Track dirty state for unsaved changes
    - _Requirements: 4.3_
  
  - [x] 4.3 Create InternetExplorer.vue app
    - Build address bar with navigation controls
    - Implement navigate() method with URL history
    - Add back/forward navigation
    - Create loading state indicator
    - _Requirements: 4.2_
  
  - [x] 4.4 Create RecycleBin.vue app
    - Display deleted files list
    - Implement restore file functionality
    - Add permanent delete with confirmation
    - Create empty bin action
    - _Requirements: 4.4_
  
  - [x] 4.5 Create MSPaint.vue app
    - Set up HTML5 canvas element
    - Implement drawing tools (brush, eraser, fill)
    - Add color picker and brush size controls
    - Create cursedEffect() method for ghost distortions
    - Implement mouse event handlers for drawing
    - _Requirements: 4.5_
  
  - [x] 4.6 Create Minesweeper.vue app
    - Initialize game board with mines
    - Implement cell reveal logic with flood fill
    - Add flag toggle on right-click
    - Create win/loss detection
    - Implement aiMove() method for ghost AI opponent
    - _Requirements: 4.6_

- [x] 5. Build Gemini API integration
  - [x] 5.1 Create geminiService utility
    - Set up Gemini API client with API key from env
    - Implement chat() method with system prompt
    - Add streaming support for responses
    - Implement error handling with status codes
    - Add conversation context management (last 10 messages)
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [x] 5.2 Create cursedAI Pinia store
    - Define messages array and isTyping state
    - Implement addMessage() action
    - Create sendMessage() action that calls geminiService
    - Implement parseCommands() to extract system commands from responses
    - Create executeCommand() action that calls window manager
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.4_
  
  - [x] 5.3 Build CursedClippy.vue component
    - Create speech bubble UI with 98.css styling
    - Implement message display with user/assistant roles
    - Add input field with send button
    - Create typing indicator animation
    - Implement minimize/restore functionality
    - Add autonomous action trigger method
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Implement ghost behavior system
  - [x] 6.1 Create ghostBehavior Pinia store
    - Define hauntingLevel, idleTimer, lastActionTime state
    - Implement startIdleDetection() action
    - Create incrementHauntingLevel() action with timer
    - Add isHaunting boolean state
    - _Requirements: 5.1, 6.1, 6.2_
  
  - [x] 6.2 Create ghost.js utility module
    - Implement detectIdle() function with 10 second timeout
    - Create selectRandomAction() based on haunting level
    - Implement executeGhostAction() dispatcher
    - Add moveCursor() action implementation
    - Add shakeWindow() action implementation
    - Add screenGlitch() action implementation
    - Add spontaneousOpen() action implementation
    - Add ghostType() action for Notepad
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 6.3 Implement haunting escalation logic
    - Create timer that increments haunting level every 60 seconds
    - Decrease idle timeout by 2 seconds per level
    - Increase action frequency by 20% per level
    - Enable window spam at level 5
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [x] 7. Create special event components and hooks
  - [x] 7.1 Build ScaryMaze.vue jumpscare component
    - Create fullscreen overlay with jumpscare image/video
    - Add loud sound effect trigger
    - Implement auto-dismiss after 3 seconds or click
    - _Requirements: 7.1_
  
  - [x] 7.2 Build BSOD.vue component
    - Create authentic Windows 95 blue screen styling
    - Add random error messages
    - Implement dismiss on any key press
    - _Requirements: 7.5_
  
  - [x] 7.3 Build BootSequence.vue component
    - Create Windows 95 boot animation
    - Add progress bar and loading text
    - Play startup sound on completion
    - Auto-dismiss after animation completes
    - _Requirements: 1.5_
  
  - [x] 7.4 Implement Internet Explorer hook
    - Detect navigation in InternetExplorer component
    - Trigger ScaryMaze component on any page load
    - _Requirements: 7.1_
  
  - [x] 7.5 Implement file delete hook
    - Intercept delete actions in MyComputer and RecycleBin
    - Trigger dramatic deletion animation
    - Display AI commentary via CursedClippy
    - _Requirements: 7.2_
  
  - [x] 7.6 Implement window spam hook
    - Check haunting level in ghost behavior loop
    - Trigger spam action that opens 5 random windows
    - Add cooldown to prevent excessive spam
    - _Requirements: 7.3_
  
  - [x] 7.7 Implement Konami code detection
    - Add keyboard event listener in App.vue
    - Track key sequence (↑↑↓↓←→←→BA)
    - Set haunting level to maximum on completion
    - _Requirements: 7.4_

- [x] 8. Implement audio system
  - [x] 8.1 Create audioService utility
    - Set up Web Audio API context
    - Load sound files (window open/close, error, menu, startup)
    - Implement play() method with sound name parameter
    - Add volume control
    - Handle audio context resume on user interaction
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.2 Integrate audio triggers
    - Add window open sound to openWindow() action
    - Add window close sound to closeWindow() action
    - Add error sound to error handlers
    - Add menu sound to Start Menu open
    - Add startup sound to boot sequence completion
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Wire up App.vue and routing
  - [x] 9.1 Configure App.vue root component
    - Initialize Pinia stores on mount
    - Start idle detection and haunting escalation
    - Add Konami code listener
    - Render Desktop component
    - Add BootSequence on initial load
    - _Requirements: 1.5, 7.4_
  
  - [x] 9.2 Connect all components to stores
    - Ensure Window.vue uses windowManager store
    - Connect Taskbar to windowManager for minimized windows
    - Connect StartMenu to windowManager for app launching
    - Connect CursedClippy to cursedAI store
    - Connect Desktop to ghostBehavior for idle detection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Add styling and polish
  - [x] 10.1 Apply 98.css styling throughout
    - Import 98.css in main.js
    - Apply window classes to Window.vue
    - Apply button classes to all buttons
    - Apply menu classes to StartMenu
    - Apply taskbar classes to Taskbar
    - _Requirements: 1.3_
  
  - [x] 10.2 Add custom CSS for desktop and animations
    - Create desktop.css with teal background and icon grid
    - Add shake animation keyframes
    - Add glitch effect keyframes
    - Add typing animation for ghost behaviors
    - Set MS Sans Serif font family globally
    - _Requirements: 1.1, 1.4, 5.3, 5.4_
  
  - [x] 10.3 Implement performance optimizations
    - Use v-show for minimized windows
    - Lazy load app components with defineAsyncComponent
    - Add window limit check (max 10 windows)
    - Use CSS transforms for dragging
    - Throttle ghost actions to one per 5 seconds
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 11. Configure deployment
  - [x] 11.1 Set up environment variables
    - Create .env.example with VITE_GEMINI_API_KEY
    - Add .env to .gitignore
    - Document API key setup in README
    - _Requirements: 10.1_
  
  - [x] 11.2 Configure Vercel deployment
    - Create vercel.json with build configuration
    - Set up environment variables in Vercel dashboard
    - Configure build command and output directory
    - Test production build locally
    - _Requirements: 10.1_
  
  - [x] 11.3 Create README documentation
    - Document project setup and installation
    - Explain how to get Gemini API key
    - List all features and Easter eggs
    - Add screenshots/GIFs of haunting behaviors
    - Include Kiro usage breakdown (specs, hooks, steering)
    - _Requirements: 10.1_

- [x] 12. Implement SoulScanner webcam component
  - [x] 12.1 Create SoulScanner.vue component with webcam UI
    - Build window component with video element
    - Apply CSS filters for 1995 QuickCam aesthetic (grayscale, high contrast, pixelated)
    - Add caption display area below video feed
    - Create camera permission request UI
    - _Requirements: 11.1, 11.2_
  
  - [x] 12.2 Implement webcam capture logic
    - Request MediaDevices camera access on component mount
    - Set up video stream with 320x240 resolution
    - Create 5-second interval timer for frame capture
    - Implement canvas-based frame capture to base64
    - Handle permission denied and no camera errors
    - Clean up stream on component unmount
    - _Requirements: 11.3, 11.4_
  
  - [x] 12.3 Integrate Gemini API for facial expression analysis
    - Extend geminiService with analyzeImage() method for vision API
    - Create prompt that asks for cryptic expression description
    - Add conditional logic: threaten if happy, laugh if scared
    - Display Gemini response as caption under video
    - Handle API errors with fallback taunts
    - _Requirements: 11.4, 11.5, 11.6, 11.7_
  
  - [x] 12.4 Register SoulScanner in app registry
    - Add SoulScanner to appRegistry.js with icon
    - Add SoulScanner option to Start Menu
    - Create desktop icon for SoulScanner
    - _Requirements: 11.1_

- [x] 13. Create audioHaunting service
  - [x] 13.1 Implement modem handshake sound
    - Find or create 56k modem handshake audio file
    - Add audio file to public/sounds directory
    - Create playModemHandshake() function using HTML5 Audio
    - Set appropriate volume level (0.7)
    - _Requirements: 12.2_
  
  - [x] 13.2 Implement brown noise generator
    - Create startBrownNoise() function using Web Audio API
    - Set up AudioContext and ScriptProcessorNode
    - Implement brown noise algorithm with lastOut state
    - Connect to audio destination for playback
    - Return context and node for cleanup
    - Handle Web Audio API not supported error
    - _Requirements: 12.3_
  
  - [x] 13.3 Implement whisper system with Web Speech API
    - Define array of creepy whisper phrases
    - Create speakWhisper() function using SpeechSynthesisUtterance
    - Set pitch to 0.8 (20% reduction) and volume to 0.3
    - Set speech rate to 0.7 for slower delivery
    - Implement startWhisperScheduler() with random 15-45 second intervals
    - _Requirements: 12.4, 12.5, 12.6, 12.7_
  
  - [x] 13.4 Integrate audio haunting into ghost behaviors
    - Import audioHaunting service in ghostBehavior store
    - Trigger modem sound at haunting level 3
    - Start brown noise at haunting level 2
    - Start whisper scheduler at haunting level 4
    - Add cleanup on component unmount
    - _Requirements: 12.2, 12.3, 12.4_

- [x] 14. Implement dynamic file system generation
  - [x] 14.1 Create fileSystemStore Pinia store
    - Define state with fileTree object, generatedFolders Set, fileContents Map
    - Create lazyLoadFolder() action that calls Gemini API
    - Implement prompt for generating 5 unsettling filenames
    - Parse response and populate fileTree with generated files
    - Track generated folders to avoid regeneration
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 14.2 Implement dynamic file content generation
    - Create generateFileContent() action in fileSystemStore
    - Check fileContents cache before generating
    - Build Gemini prompt using filename as context
    - Request 2-3 paragraphs of unsettling content
    - Cache generated content in Map
    - Return content for display
    - _Requirements: 13.5, 13.6_
  
  - [x] 14.3 Enhance MyComputer.vue with lazy loading
    - Modify handleFolderClick() to detect empty folders
    - Call fileSystemStore.lazyLoadFolder() for empty folders
    - Update local file tree with generated files
    - Show loading indicator during generation
    - _Requirements: 13.1, 13.4_
  
  - [x] 14.4 Implement dynamic file opening
    - Modify openFile() method to detect .txt files
    - Call fileSystemStore.generateFileContent() for text files
    - Open Notepad window with generated content
    - Pass filename and content as window data
    - _Requirements: 13.5, 13.6_

- [x] 15. Enhance BSOD with interactive riddles
  - [x] 15.1 Implement riddle generation system
    - Create gatherSessionContext() method to collect user actions
    - Pull data from windowManager store (opened windows, deleted files)
    - Build Gemini prompt with session context
    - Request riddle in format "I saw you [action]. What was [detail]?"
    - Parse response to extract question and answer
    - Initialize riddle state with attempts and trembleIntensity
    - _Requirements: 14.1, 14.2_
  
  - [x] 15.2 Implement keyboard input handling
    - Add window.keydown event listener on component mount
    - Capture alphanumeric keys and build userInput string
    - Handle Backspace for character deletion
    - Handle Enter key to submit answer
    - Display typed characters on screen
    - Remove event listener on component unmount
    - _Requirements: 14.3, 14.4_
  
  - [x] 15.3 Implement answer validation and punishment
    - Create checkAnswer() method to compare user input with correct answer
    - Normalize both strings (lowercase, trim) for comparison
    - If correct, call restoreSession() to dismiss BSOD
    - If incorrect, increment attempts counter
    - Calculate trembleIntensity as attempts * 2 (max 10)
    - Clear userInput for next attempt
    - _Requirements: 14.5, 14.6, 14.7_
  
  - [x] 15.4 Implement CSS tremble animation
    - Create @keyframes tremble with 10 transform steps
    - Apply random translate and rotate values
    - Bind animation-duration to trembleIntensity CSS variable
    - Apply animation to error text elements
    - Make text progressively unreadable at high intensity
    - _Requirements: 14.7, 14.8_
  
  - [x] 15.5 Update BSOD trigger to generate riddle
    - Modify BSOD component mount to call generateRiddle()
    - Display riddle question prominently on blue screen
    - Show input prompt for user answer
    - Add visual feedback for wrong answers
    - _Requirements: 14.1, 14.2_

- [x] 16. Implement jumpscare video and audio system
  - [x] 16.1 Create jumpscareService utility module
    - Define jumpscare variant data structure with id, type, media, audio, duration, intensity
    - Create collection of 4-6 jumpscare variants with different videos and audio combinations
    - Implement getRandomJumpscare() function that filters by minimum intensity
    - Implement getJumpscareById() function for specific variant selection
    - Create preloadJumpscares() function to preload media on app initialization
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 16.2 Enhance ScaryMaze.vue component for video support
    - Add variant prop to accept specific jumpscare variant
    - Update trigger() method to accept optional variantId parameter
    - Modify trigger() to call jumpscareService.getRandomJumpscare() based on haunting level
    - Add currentVariant reactive state to store selected jumpscare
    - Add videoElement ref for video DOM element
    - Add audioElements array to track playing audio
    - _Requirements: 15.3, 15.4_
  
  - [x] 16.3 Implement video and audio playback logic
    - Create playVideo() method that plays video element with full volume
    - Create playAudio() method that plays all audio tracks from variant
    - Update dismiss timer to use variant.duration instead of hardcoded 3000ms
    - Implement stopAllMedia() method to pause and reset video and audio
    - Update dismiss() method to call stopAllMedia() before closing
    - Handle video and audio play errors gracefully
    - _Requirements: 15.5, 15.6, 15.8_
  
  - [x] 16.4 Update ScaryMaze template for video support
    - Add conditional rendering for video element when variant.type is 'video'
    - Add conditional rendering for img element when variant.type is 'image'
    - Set video attributes: autoplay, muted (audio comes from separate tracks)
    - Bind video src to currentVariant.media
    - Add jumpscare-video CSS class for video styling
    - Update jumpscare-text to display variant.text if available
    - _Requirements: 15.4, 15.5_
  
  - [x] 16.5 Add enhanced CSS animations for jumpscares
    - Create jumpscare-video class with full viewport coverage
    - Add brightness and contrast filters to video for intensity
    - Create colorShift keyframe animation for psychedelic effect
    - Update flicker animation to be more intense (0.05s interval)
    - Add CSS for different intensity levels based on variant
    - _Requirements: 15.4, 15.5_
  
  - [x] 16.6 Integrate jumpscares into ghost behavior system
    - Import jumpscareService in ghost.js utility
    - Add 'jumpscare' action type to ghost action types
    - Implement executeJumpscare() function in ghost.js
    - Add jumpscare to random action selection at haunting level 4+
    - Increase jumpscare frequency by 50% at haunting level 5
    - Pass appropriate intensity based on haunting level
    - _Requirements: 15.9, 15.10_
  
  - [x] 16.7 Create jumpscare media folder structure
    - Create public/jumpscares/videos directory
    - Create public/jumpscares/audio directory
    - Add placeholder README.md explaining how to add custom jumpscares
    - Document required video formats (mp4, webm) and audio formats (mp3, wav)
    - Update .gitignore to optionally exclude large media files
    - _Requirements: 15.1, 15.2_
  
  - [x] 16.8 Add jumpscare preloading to App.vue
    - Import jumpscareService.preloadJumpscares() in App.vue
    - Call preloadJumpscares() in onMounted after boot sequence
    - Add loading state indicator during preload (optional)
    - Handle preload errors gracefully without blocking app
    - _Requirements: 15.1_
