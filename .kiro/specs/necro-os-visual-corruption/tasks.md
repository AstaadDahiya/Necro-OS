# Implementation Plan

- [x] 1. Create visualCorruption Pinia store
  - Define state structure for CRT, cursor, desktop, notifications, and terminal effects
  - Implement updateCRTIntensity() action
  - Implement enableCursorCorruption() action
  - Implement moveDesktopIcon() and duplicateIcon() actions
  - Implement generatePhantomNotification() action
  - Implement spawnTerminalPopup() action
  - Add integration with ghostBehavior store for haunting level triggers
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1_

- [x] 2. Implement CRT filter overlay component
  - [x] 2.1 Create CRTFilter.vue component
    - Build fullscreen overlay div with fixed positioning
    - Apply CSS repeating-linear-gradient for scanlines
    - Implement barrel distortion using CSS perspective and transform
    - Add phosphor glow effect with CSS box-shadow
    - Set z-index to 10000 and pointer-events: none
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 2.2 Implement dynamic intensity adjustments
    - Create updateIntensity() method that adjusts effects based on haunting level
    - Add flicker animation keyframes and apply at level 3+
    - Increase barrel distortion from 3% to 8% at level 5
    - Connect to visualCorruption store for reactive updates
    - _Requirements: 1.5, 1.6_
  
  - [x] 2.3 Add CRT filter to Desktop.vue
    - Import CRTFilter component
    - Render CRTFilter as last child in Desktop template
    - Ensure proper z-index layering above all other elements
    - _Requirements: 1.1_

- [x] 3. Build cursor corruption system
  - [x] 3.1 Create CursorCorruption.vue component
    - Hide default cursor with CSS cursor: none on body
    - Create custom cursor div element with Windows 95 arrow sprite
    - Add mousemove event listener to track cursor position
    - Update custom cursor position using CSS transform
    - Set z-index to 10001 to appear above CRT filter
    - _Requirements: 2.1_
  
  - [x] 3.2 Implement cursor rotation
    - Add rotation state variable
    - Apply random rotation (15-45 degrees) when haunting level >= 2
    - Update CSS transform to include rotate()
    - Smooth rotation changes with CSS transition
    - _Requirements: 2.2_
  
  - [x] 3.3 Implement ghost cursor trail
    - Create startGhostTrail() method that spawns trail elements
    - Set interval to create trail div every 50ms
    - Position trail at current cursor location
    - Apply fade-out animation over 200ms
    - Remove trail elements after animation completes
    - Enable trail when haunting level >= 3
    - _Requirements: 2.3_
  
  - [x] 3.4 Implement cursor glitch effect
    - Create glitchCursor() method
    - Apply CSS filter effects (hue-rotate, invert) to cursor element
    - Trigger glitch every 5 seconds when haunting level >= 4
    - Reset glitch after 100ms
    - _Requirements: 2.4_
  
  - [x] 3.5 Implement cursor teleportation
    - Create teleportCursor() method
    - Calculate random offset (50-100 pixels) in random direction
    - Update cursor position instantly without transition
    - Trigger randomly during idle periods
    - _Requirements: 2.5_
  
  - [x] 3.6 Implement autonomous cursor movement
    - Create autonomousMovement() method
    - Animate cursor in circular pattern using requestAnimationFrame
    - Trigger when user idle for 5 seconds
    - Stop autonomous movement on user mouse input
    - _Requirements: 2.6_
  
  - [x] 3.7 Add CursorCorruption to Desktop.vue
    - Import CursorCorruption component
    - Render in Desktop template
    - Connect to visualCorruption store
    - _Requirements: 2.1_

- [x] 4. Create phantom notification system
  - [x] 4.1 Create PhantomNotifications.vue component
    - Build notification container positioned bottom-right above taskbar
    - Create notification card template with Windows 95 styling
    - Implement slide-in animation from right
    - Implement fade-out animation on dismiss
    - Limit maximum concurrent notifications to 3
    - _Requirements: 3.1, 3.4, 3.6_
  
  - [x] 4.2 Implement notification generation with Gemini API
    - Create generateNotification() method in visualCorruption store
    - Build Gemini prompt for creepy system notifications
    - Call geminiService.generate() with prompt
    - Create notification object with id, message, type, timestamp
    - Add notification to queue in store
    - _Requirements: 3.3_
  
  - [x] 4.3 Implement notification scheduling
    - Create scheduleNext() method
    - Set random timeout between 30-60 seconds at level 2
    - Decrease interval to 15-30 seconds at level 4
    - Call generateNotification() when timer fires
    - Reschedule next notification after current one appears
    - _Requirements: 3.2, 3.7_
  
  - [x] 4.4 Add notification sound effects
    - Play notification sound using audioService when notification appears
    - Use Windows 95 notification sound or similar
    - _Requirements: 3.5_
  
  - [x] 4.5 Implement auto-dismiss functionality
    - Set timeout for 5 seconds after notification appears
    - Trigger fade-out animation
    - Remove notification from DOM after animation completes
    - _Requirements: 3.6_
  
  - [x] 4.6 Add PhantomNotifications to Desktop.vue
    - Import PhantomNotifications component
    - Render in Desktop template
    - Connect to visualCorruption store notifications queue
    - _Requirements: 3.1_

- [x] 5. Build fake low disk space warning
  - [x] 5.1 Create DiskSpaceWarning.vue component
    - Build Windows 95 dialog box with warning icon
    - Display message "Drive C: is running out of disk space. 666 MB remaining"
    - Add OK button and X close button
    - Position dialog in center of screen
    - _Requirements: 9.2, 9.3_
  
  - [x] 5.2 Implement uncloseable behavior
    - Intercept OK button click to reappear after 3-5 seconds
    - Intercept X button click to shake dialog and refuse to close
    - Add shake animation keyframes
    - Play error sound on close attempt
    - _Requirements: 9.4, 9.5, 9.6_
  
  - [x] 5.3 Implement multiple overlapping warnings
    - Spawn additional warning dialogs at haunting level 4
    - Offset each dialog position slightly
    - Track active warnings in visualCorruption store
    - _Requirements: 9.7_
  
  - [x] 5.4 Integrate with phantom notification system
    - Trigger disk space warning from visualCorruption store at level 2
    - Add to notification scheduling rotation
    - _Requirements: 9.1_

- [x] 6. Create Spirit Board application
  - [x] 6.1 Create SpiritBoard.vue component
    - Build Ouija board graphic with letters, numbers, YES, NO, GOODBYE
    - Create board layout data structure with character positions
    - Render planchette as semi-transparent circular element with crosshairs
    - Add question input field at bottom of board
    - Add submit button to send question
    - _Requirements: 4.1, 4.2, 12.1_
  
  - [x] 6.2 Implement planchette animation system
    - Create calculateLetterPosition() method to get x,y for each character
    - Implement animatePlanchette() method to move planchette
    - Use CSS transitions for smooth movement (500ms duration)
    - Pause 800ms on each letter
    - Apply glowing effect to current letter with CSS box-shadow
    - Move to GOODBYE position when message complete
    - _Requirements: 4.5, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [x] 6.3 Integrate Gemini API for responses
    - Create submitQuestion() method
    - Build system prompt for supernatural entity persona
    - Include user session context in prompt (opened apps, actions taken)
    - Send question to geminiService.chat()
    - Parse response and trigger planchette animation
    - _Requirements: 4.4, 4.7_
  
  - [x] 6.4 Implement letter whispering with Web Speech API
    - Create speakLetter() method
    - Use SpeechSynthesisUtterance for each letter
    - Set pitch to 0.7, rate to 0.8, volume to 0.4
    - Call speakLetter() as planchette moves to each character
    - _Requirements: 4.6_
  
  - [x] 6.5 Add Spirit Board styling
    - Create Ouija board background image or CSS design
    - Style planchette with semi-transparent background
    - Add mystical fonts and colors
    - Apply 98.css styling to input and buttons
    - _Requirements: 4.2, 12.1_
  
  - [x] 6.6 Handle multi-word responses
    - Detect spaces in response string
    - Pause 500ms for spaces without moving planchette
    - Continue to next word after space pause
    - _Requirements: 12.7_
  
  - [x] 6.7 Register Spirit Board in app registry
    - Add spiritboard to appRegistry.js
    - Create Spirit Board icon
    - Add to Start Menu items
    - Add desktop icon
    - _Requirements: 4.1_

- [x] 7. Implement terminal popup system
  - [x] 7.1 Create TerminalPopup.vue component
    - Build command prompt window with black background
    - Use green monospace font (Courier New or Consolas)
    - Add blinking cursor at end of current line
    - Set title bar to "C:\\WINDOWS\\system32\\cmd.exe"
    - Set fixed size 600x400 pixels
    - _Requirements: 5.3, 13.1, 13.2, 13.3, 13.4_
  
  - [x] 7.2 Implement auto-typing log system
    - Create typeLog() method with character-by-character typing
    - Set typing speed to 50ms per character
    - Add command prompt prefix "C:\\NECRO>" before each line
    - Append completed lines to logs array
    - _Requirements: 5.5_
  
  - [x] 7.3 Generate fake system logs with Gemini API
    - Create generateLogs() method in visualCorruption store
    - Build prompt for realistic but creepy system logs
    - Request logs with timestamps, error codes, ghost process references
    - Parse response into individual log lines
    - _Requirements: 5.4, 5.7_
  
  - [x] 7.4 Implement ANSI color code support
    - Parse ANSI color codes in log text
    - Apply appropriate color spans to text
    - Support basic colors (red for errors, yellow for warnings)
    - _Requirements: 13.5_
  
  - [x] 7.5 Implement auto-close behavior
    - Set timeout for 10 seconds after typing completes
    - Trigger window close action
    - Remove terminal from visualCorruption store activeWindows
    - _Requirements: 5.6_
  
  - [x] 7.6 Implement terminal spawning logic
    - Create spawnTerminalPopup() action in visualCorruption store
    - Check maxConcurrent limit (2 terminals)
    - Calculate random position avoiding overlap
    - Call windowManager.openWindow() with terminal app
    - Track terminal window ID in activeWindows array
    - _Requirements: 5.1, 13.6, 13.7_
  
  - [x] 7.7 Integrate with haunting level system
    - Enable terminal popups at haunting level 3
    - Set spawn interval to 45-90 seconds
    - Trigger spawnTerminalPopup() on interval
    - _Requirements: 5.2_
  
  - [x] 7.8 Register Terminal in app registry
    - Add terminal to appRegistry.js
    - Set appropriate icon and title
    - Configure default size and position
    - _Requirements: 5.3_

- [x] 8. Create BIOS boot screen
  - [x] 8.1 Create BIOSScreen.vue component
    - Build fullscreen black background overlay
    - Use white monospace font (Courier New)
    - Create text container for BIOS messages
    - Set z-index above desktop but below CRT filter
    - _Requirements: 7.1, 7.2_
  
  - [x] 8.2 Implement auto-typing BIOS text
    - Create typeText() method with 20ms character delay
    - Build BIOS text template with hardware detection
    - Type out each line sequentially
    - Add line breaks between sections
    - _Requirements: 7.3, 7.4_
  
  - [x] 8.3 Add fake hardware detection
    - Display "Detecting Hardware..." message
    - List fake hardware: Spectral Processor, Haunted Drive, Possessed GPU
    - Show memory test counting to 666 MB
    - Include warning about spectral entity in memory
    - _Requirements: 7.5, 15.3, 15.4_
  
  - [x] 8.4 Implement PC speaker beep sound
    - Create playBeep() method using Web Audio API
    - Generate square wave at 800 Hz
    - Play short beep (100ms) on BIOS start
    - _Requirements: 7.7_
  
  - [x] 8.5 Add Easter egg F13 detection
    - Add keydown event listener for F13 key
    - Display "Press F13 to enter the void" message
    - When F13 pressed, set haunting level to maximum
    - Show special message before transitioning
    - _Requirements: 15.1, 15.2_
  
  - [x] 8.6 Implement transition to Windows boot
    - Set display duration to 5-8 seconds
    - Fade out BIOS screen
    - Trigger Windows 95 BootSequence component
    - Remove BIOS screen from DOM
    - _Requirements: 7.6_
  
  - [x] 8.7 Add fake date display
    - Display "Current Date: October 31, 1995" regardless of actual date
    - Position in BIOS header section
    - _Requirements: 15.5_
  
  - [x] 8.8 Integrate BIOS screen into App.vue
    - Show BIOS screen before BootSequence on app load
    - Ensure proper component ordering
    - _Requirements: 7.1_

- [x] 9. Implement desktop corruption effects
  - [x] 9.1 Create desktop icon movement system
    - Create moveDesktopIcon() action in visualCorruption store
    - Calculate random offset (10-30 pixels) for icon
    - Store offset in iconOffsets Map keyed by icon ID
    - Apply offset using CSS transform in Desktop.vue
    - Trigger movement every 60 seconds at haunting level 2
    - _Requirements: 6.1_
  
  - [x] 9.2 Implement ghost icon duplication
    - Create duplicateIcon() action in visualCorruption store
    - Generate ghost icon with semi-transparent styling (50% opacity)
    - Calculate offset position (20-40 pixels from original)
    - Add ghost icon to ghostIcons array
    - Render ghost icons in Desktop.vue with non-interactive styling
    - Limit maximum 5 ghost copies per original icon
    - Trigger at haunting level 3
    - _Requirements: 6.2, 14.1, 14.2, 14.3, 14.4_
  
  - [x] 9.3 Implement background darkening
    - Create darkenBackground() action in visualCorruption store
    - Increment backgroundDarkness by 10% every 30 seconds
    - Apply CSS filter brightness() to desktop background
    - Start darkening at haunting level 4
    - _Requirements: 6.3_
  
  - [x] 9.4 Add icon corruption filters
    - Apply CSS filter effects to desktop icons
    - Use hue-rotate and invert filters
    - Randomize filter values per icon
    - Animate filter changes with CSS transitions
    - _Requirements: 6.4_
  
  - [x] 9.5 Implement wallpaper replacement
    - Create replaceWallpaper() action
    - Load corrupted glitch texture
    - Swap desktop background at haunting level 5
    - Use CSS transition for smooth swap
    - _Requirements: 6.5_
  
  - [x] 9.6 Add smooth corruption transitions
    - Apply CSS transition (2 seconds) to all corruption effects
    - Use ease-in-out timing function
    - Ensure GPU acceleration with transform and opacity
    - _Requirements: 6.6_
  
  - [x] 9.7 Add ghost icon pulsing animation
    - Create CSS keyframes for subtle pulse effect
    - Apply to ghost icon opacity (0.4 to 0.6)
    - Set animation duration to 2 seconds infinite
    - _Requirements: 14.6_
  
  - [x] 9.8 Implement ghost icon cleanup
    - Remove ghost icons when haunting level decreases
    - Fade out ghost icons over 2 seconds
    - Clear from ghostIcons array after fade completes
    - _Requirements: 14.5_

- [x] 10. Create wallpaper flicker system
  - [x] 10.1 Implement wallpaper flicker logic
    - Create triggerWallpaperFlicker() action in visualCorruption store
    - Select random ghostly wallpaper from collection
    - Swap desktop background to flicker image
    - Set timeout to revert after 100-300ms
    - Use CSS transition for smooth swap
    - _Requirements: 8.2, 8.5_
  
  - [x] 10.2 Create wallpaper collection
    - Gather or create 5-10 ghostly wallpaper images
    - Store in public/wallpapers/flicker directory
    - Add wallpaper paths to visualCorruption store
    - _Requirements: 8.7_
  
  - [x] 10.3 Implement flicker scheduling
    - Set interval for 20-40 seconds at haunting level 3
    - Decrease interval to 10-20 seconds at level 5
    - Trigger triggerWallpaperFlicker() on interval
    - _Requirements: 8.3, 8.6_
  
  - [x] 10.4 Support animated GIF wallpapers
    - Allow GIF files as desktop background
    - Ensure proper rendering and animation
    - Test performance with animated backgrounds
    - _Requirements: 8.1_
  
  - [x] 10.5 Add flicker transition effects
    - Use CSS transition for wallpaper swap
    - Apply brief flash effect on flicker
    - Ensure smooth revert to original wallpaper
    - _Requirements: 8.4_

- [x] 11. Implement context menu corruption
  - [x] 11.1 Create context menu interception system
    - Add contextmenu event listener to desktop
    - Intercept right-click events at haunting level 3
    - Calculate corruption offset (100-200 pixels)
    - Apply random rotation (5-15 degrees)
    - _Requirements: 10.1, 10.2_
  
  - [x] 11.2 Implement corruption probability
    - Set 30% chance to corrupt at level 3
    - Increase to 60% chance at level 5
    - Use Math.random() to determine if corruption triggers
    - _Requirements: 10.5, 10.6_
  
  - [x] 11.3 Add upside-down context menus
    - Randomly apply 180 degree rotation
    - Ensure menu items remain clickable
    - Test interaction with rotated menus
    - _Requirements: 10.4_
  
  - [x] 11.4 Style corrupted context menus
    - Apply CSS transform for offset and rotation
    - Use CSS transition for smooth appearance
    - Maintain Windows 95 styling
    - _Requirements: 10.3_

- [x] 12. Add performance optimizations
  - [x] 12.1 Implement GPU acceleration
    - Use CSS transform and opacity for all animations
    - Add will-change property to animated elements
    - Avoid top/left positioning for moving elements
    - _Requirements: 11.1, 11.2_
  
  - [x] 12.2 Add throttling and debouncing
    - Throttle cursor position updates to 60fps (16ms)
    - Debounce desktop icon movement to 1 second
    - Throttle wallpaper flicker checks
    - _Requirements: 11.3_
  
  - [x] 12.3 Implement effect limits
    - Limit ghost icons to 10 total
    - Limit concurrent notifications to 3
    - Limit concurrent terminals to 2
    - Remove old effects when limits reached
    - _Requirements: 11.4, 11.5_
  
  - [x] 12.4 Use requestAnimationFrame for animations
    - Replace setInterval with requestAnimationFrame for cursor trail
    - Use requestAnimationFrame for planchette animation
    - Sync all animations with browser repaint cycle
    - _Requirements: 11.6_
  
  - [x] 12.5 Implement memory cleanup
    - Remove old cursor trail elements after 20 accumulated
    - Clear ghost icons when limit exceeded
    - Clean up event listeners on component unmount
    - Clear intervals and timeouts on destroy
    - _Requirements: 11.1_

- [x] 13. Wire up visual corruption to haunting system
  - [x] 13.1 Integrate visualCorruption store with ghostBehavior
    - Import visualCorruption store in ghostBehavior store
    - Add watcher for hauntingLevel changes
    - Call appropriate visualCorruption actions based on level
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1_
  
  - [x] 13.2 Implement level-based effect enabling
    - Level 1: CRT filter basic effects
    - Level 2: Cursor rotation, phantom notifications, icon movement
    - Level 3: Cursor trail, terminal popups, icon duplication, wallpaper flicker
    - Level 4: Cursor glitch, increased notification frequency, background darkening
    - Level 5: Maximum distortion, wallpaper replacement, increased chaos
    - _Requirements: 1.5, 1.6, 2.2, 2.3, 2.4, 3.2, 3.7, 5.2, 6.1, 6.2, 6.3, 6.5, 8.6_
  
  - [x] 13.3 Test effect escalation
    - Manually set haunting levels and verify effects activate
    - Test smooth transitions between levels
    - Verify effects disable when level decreases
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 14. Add custom assets and styling
  - [x] 14.1 Create or source cursor sprites
    - Find Windows 95 arrow cursor sprite
    - Create corrupted cursor variants
    - Add to public/cursors directory
    - _Requirements: 2.1_
  
  - [x] 14.2 Create Spirit Board graphics
    - Design Ouija board layout with letters and numbers
    - Create planchette graphic
    - Add mystical styling and fonts
    - Save as SVG or high-res PNG
    - _Requirements: 4.2, 12.1_
  
  - [x] 14.3 Gather ghostly wallpapers
    - Find or create 5-10 creepy wallpaper images
    - Ensure appropriate resolution (1024x768 or higher)
    - Add to public/wallpapers directory
    - _Requirements: 8.7_
  
  - [x] 14.4 Create glitch texture for corrupted wallpaper
    - Generate or find glitch/static texture
    - Ensure tileable pattern
    - Add to public/wallpapers directory
    - _Requirements: 6.5_
  
  - [x] 14.5 Add notification icons
    - Create or source Windows 95 style warning/error icons
    - Add to public/icons directory
    - _Requirements: 3.4_

- [x] 15. Testing and polish
  - [x] 15.1 Test CRT filter across browsers
    - Verify scanlines render correctly in Chrome, Firefox, Safari
    - Test barrel distortion effect
    - Check performance impact
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 15.2 Test cursor corruption
    - Verify custom cursor appears correctly
    - Test trail rendering and cleanup
    - Test rotation and glitch effects
    - Verify teleportation doesn't break interaction
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 15.3 Test Spirit Board interaction
    - Verify planchette animation is smooth
    - Test letter positioning accuracy
    - Verify Web Speech API whispers work
    - Test with various response lengths
    - _Requirements: 4.5, 4.6, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [x] 15.4 Test terminal popups
    - Verify auto-typing works correctly
    - Test ANSI color code rendering
    - Verify auto-close functionality
    - Test concurrent terminal limit
    - _Requirements: 5.5, 5.6, 13.4, 13.5_
  
  - [x] 15.5 Test BIOS screen
    - Verify auto-typing timing
    - Test F13 Easter egg
    - Verify transition to Windows boot
    - Test PC speaker beep sound
    - _Requirements: 7.3, 7.4, 7.6, 7.7, 15.1, 15.2_
  
  - [x] 15.6 Performance testing
    - Monitor FPS with all effects active
    - Test with 10+ ghost icons
    - Verify memory usage over 30 minutes
    - Check for memory leaks
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [x] 15.7 Cross-browser compatibility testing
    - Test all features in Chrome, Firefox, Safari, Edge
    - Verify Web Speech API support
    - Test CSS filter compatibility
    - Check custom cursor rendering
    - _Requirements: 1.1, 2.1, 4.6_

- [x] 16. Documentation and final integration
  - [x] 16.1 Update README with new features
    - Document Spirit Board app
    - Explain visual corruption effects
    - List Easter eggs (F13, etc.)
    - Add screenshots of new features
    - _Requirements: 4.1, 7.1, 15.1_
  
  - [x] 16.2 Add comments to complex code
    - Document planchette animation algorithm
    - Explain cursor trail implementation
    - Comment CRT filter CSS calculations
    - _Requirements: 4.5, 11.1_
  
  - [x] 16.3 Create configuration options
    - Add option to disable CRT filter for accessibility
    - Add option to reduce motion for cursor effects
    - Add option to disable flashing/flicker effects
    - Store preferences in localStorage
    - _Requirements: 11.1_
  
  - [x] 16.4 Final integration testing
    - Test all new features with existing Necro-OS features
    - Verify no conflicts with window management
    - Test with Cursed Clippy interactions
    - Verify ghost behaviors work with new effects
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
