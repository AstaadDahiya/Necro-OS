# Necro-OS 👻💀

A cursed Windows 95 desktop simulator for Kiroween (Resurrection category). Experience a haunted operating system where an AI assistant progressively takes control through autonomous actions, window manipulation, and sarcastic interactions.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- A Google Gemini API key ([Get one here](#getting-a-gemini-api-key))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd necro-os
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
VITE_HAUNTING_ENABLED=true
VITE_MAX_WINDOWS=10
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser** to `http://localhost:5173`

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into your `.env` file
5. The free tier includes generous usage limits perfect for development

## 🎮 Features

### Core Desktop Experience
- **Authentic Windows 95 UI** - Pixel-perfect recreation using 98.css
- **Window Management** - Drag, minimize, maximize, and close windows
- **Start Menu** - Launch applications from the classic Start button
- **Taskbar** - View minimized windows and system clock
- **Boot Sequence** - Windows 95 startup animation with sound

### Desktop Applications
- **My Computer** - Browse a fake file system with folders and files
- **Notepad** - Text editor with AI ghost typing capabilities
- **Internet Explorer** - Browser simulator (beware of jumpscares!)
- **MS Paint** - Drawing canvas with brush, eraser, and fill tools
- **Minesweeper** - Playable game with AI opponent
- **Recycle Bin** - View and restore deleted files
- **Spirit Board** - AI-powered Ouija board for supernatural communication
- **Soul Scanner** - Detect and analyze spiritual entities in your system

### 🎃 Cursed AI Assistant (Cursed Clippy)
- **Sarcastic Personality** - Powered by Google Gemini API
- **Natural Language Commands** - Ask Clippy to open apps, close windows, or delete files
- **Autonomous Actions** - Clippy can act on its own when you're idle
- **System Control** - The AI can manipulate windows and files

### 👻 Haunting Behaviors

The system becomes progressively more haunted over time:

**Level 1: Initial Corruption**
- CRT monitor effects (scanlines, phosphor glow)
- Subtle screen curvature
- Basic visual degradation

**Level 2: Growing Unease**
- Cursor begins rotating randomly
- Phantom system notifications appear
- Desktop icons start drifting
- Fake low disk space warnings

**Level 3: Active Haunting**
- Ghost cursor trails follow your movements
- Terminal popups with cryptic system logs
- Desktop icons duplicate into ghost copies
- Wallpaper flickers with ghostly images
- Context menus appear in wrong locations
- Windows open spontaneously

**Level 4: Escalating Chaos**
- Cursor glitches and distorts
- Increased notification frequency
- Desktop background darkens progressively
- Multiple overlapping warnings
- More frequent disturbances
- Idle timeout decreases

**Level 5+: Maximum Corruption**
- Extreme CRT distortion and flicker
- Wallpaper replaced with glitch textures
- Cursor teleports randomly
- Autonomous cursor movement
- Window spam (5 windows at once)
- Aggressive AI takeover
- System barely under your control

### 🎪 Easter Eggs & Special Events

1. **Konami Code** - Enter ↑↑↓↓←→←→BA to instantly max out haunting level
2. **F13 Key (BIOS Screen)** - Press F13 during the BIOS boot screen to instantly enter maximum haunting
3. **Internet Explorer Jumpscare** - Navigate to any page for a surprise
4. **File Deletion Drama** - Delete files for AI commentary and animations
5. **Blue Screen of Death** - Click "Shut Down" in the Start Menu
6. **Paint Corruption** - Ghost can distort your drawings
7. **Minesweeper AI** - The ghost plays against you
8. **Spirit Board Communication** - Ask the Ouija board questions and receive AI-generated supernatural responses
9. **Uncloseable Warnings** - Try to close the low disk space warning.. if you dare
10. **666 References** - Hidden throughout the system (memory tests, disk space, error codes)

### 📺 Visual Corruption Effects

Experience authentic retro horror through progressive visual degradation:

**CRT Monitor Simulation**
- Horizontal scanlines with authentic spacing
- Barrel distortion for curved screen effect
- Phosphor glow with green tint
- Screen flicker at higher haunting levels
- GPU-accelerated for smooth performance

**Cursor Corruption**
- Custom Windows 95 arrow cursor
- Random rotation and glitching
- Ghost cursor trails that follow behind
- Occasional teleportation
- Autonomous movement when idle

**Desktop Degradation**
- Icons drift and move randomly
- Ghost icon duplicates with transparency
- Background progressively darkens
- Wallpaper flickers with ghostly images
- Complete wallpaper replacement at max haunting

**Phantom System Elements**
- AI-generated fake system notifications
- Spontaneous terminal popups with cryptic logs
- Uncloseable low disk space warnings
- Context menus appear in wrong locations
- Rotated and upside-down UI elements

**Spirit Board Application**
- Interactive Ouija board with planchette animation
- AI-powered responses to your questions
- Letter-by-letter spelling with smooth movement
- Whispered letters using Web Speech API
- Session-aware supernatural entity

**BIOS Boot Screen**
- Pre-Windows boot sequence
- Fake hardware detection (Spectral Processor, Haunted Drive)
- Memory test counting to 666 MB
- PC speaker beep sound
- Hidden F13 Easter egg

### 🔊 Authentic Sound Effects
- Window open/close sounds
- Error beeps
- Menu popup sounds
- Windows 95 startup chime
- Jumpscare audio
- PC speaker beeps
- Notification sounds

### 🎵 Audio Haunting (Progressive)
As the haunting level increases, audio effects intensify:
- **Level 2+**: Brown noise ambient background
- **Level 3+**: 56k modem handshake sounds
- **Level 4+**: Creepy whispers using Web Speech API

**Note**: The modem handshake sound file (`public/sounds/modem-handshake.mp3`) is a placeholder. For the full experience, download a real 56k modem sound from [freesound.org](https://freesound.org/) or [archive.org](https://archive.org/details/dialup-modem-sounds) and replace the placeholder file.

## 🏗️ Project Structure

```
necro-os/
├── .kiro/
│   └── specs/necro-os/      # Kiro spec files (requirements, design, tasks)
├── src/
│   ├── assets/
│   │   └── desktop.css      # Custom desktop styling and animations
│   ├── components/
│   │   ├── apps/            # Desktop application components
│   │   │   ├── InternetExplorer.vue
│   │   │   ├── MSPaint.vue
│   │   │   ├── Minesweeper.vue
│   │   │   ├── MyComputer.vue
│   │   │   ├── Notepad.vue
│   │   │   ├── RecycleBin.vue
│   │   │   ├── SoulScanner.vue  # Spirit detection app
│   │   │   ├── SpiritBoard.vue  # AI-powered Ouija board
│   │   │   └── TreeNode.vue
│   │   ├── BIOSScreen.vue   # Pre-boot BIOS screen
│   │   ├── BSOD.vue         # Blue Screen of Death
│   │   ├── BootSequence.vue # Windows 95 boot animation
│   │   ├── CRTFilter.vue    # CRT monitor effects overlay
│   │   ├── CursedClippy.vue # AI assistant interface
│   │   ├── CursorCorruption.vue # Custom cursor manipulation
│   │   ├── Desktop.vue      # Main desktop container
│   │   ├── DiskSpaceWarning.vue # Fake low disk warning
│   │   ├── PhantomNotifications.vue # System notification toasts
│   │   ├── ScaryMaze.vue    # Jumpscare component
│   │   ├── StartMenu.vue    # Start menu popup
│   │   ├── Taskbar.vue      # Bottom taskbar
│   │   ├── TerminalPopup.vue # Command prompt popups
│   │   └── Window.vue       # Draggable window component
│   ├── stores/
│   │   ├── cursedAI.js      # AI assistant state and logic
│   │   ├── fileSystemStore.js # Virtual file system
│   │   ├── ghostBehavior.js # Haunting system state
│   │   ├── visualCorruption.js # Visual effects state
│   │   └── windowManager.js # Window management state
│   ├── utils/
│   │   ├── appRegistry.js   # Application definitions
│   │   ├── audioService.js  # Sound effect management
│   │   ├── audioHaunting.js # Advanced audio haunting effects
│   │   ├── geminiService.js # Gemini API integration
│   │   ├── ghost.js         # Ghost behavior utilities
│   │   └── jumpscareService.js # Jumpscare management
│   ├── App.vue              # Root component
│   └── main.js              # Application entry point
├── .env                     # Environment variables (not committed)
├── .env.example             # Environment variables template
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel deployment config
└── vite.config.js           # Vite build configuration
```

## 🛠️ Development

### Tech Stack
- **Vue 3** - Composition API for reactive components
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **98.css** - Windows 95 UI styling
- **Google Gemini API** - AI-powered interactions

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Build Output
The production build is optimized with:
- Code splitting (vendor, apps chunks)
- Minification with Terser
- CSS optimization
- Asset optimization

Typical bundle sizes:
- Vendor chunk: ~68KB (26KB gzipped)
- Main chunk: ~48KB (15KB gzipped)
- Apps chunk: ~20KB (7KB gzipped)

## 🚢 Deployment

### Deploying to Vercel

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Set up environment variables in Vercel**
   - Go to your Vercel project settings
   - Add environment variable: `VITE_GEMINI_API_KEY` with your API key
   - The other variables are already configured in `vercel.json`

3. **Deploy**
```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables for Production

Set these in your Vercel dashboard:
- `VITE_GEMINI_API_KEY` - Your Gemini API key (required)
- `VITE_HAUNTING_ENABLED` - Enable/disable haunting (default: true)
- `VITE_MAX_WINDOWS` - Maximum open windows (default: 10)

## 🎯 Built with Kiro

This project was developed using Kiro's spec-driven development workflow:

### Kiro Specs
The entire feature was planned and implemented using Kiro's spec system:
- **Requirements Document** - User stories and acceptance criteria using EARS patterns
- **Design Document** - Architecture, component interfaces, and technical decisions
- **Implementation Tasks** - Step-by-step coding tasks with requirement traceability

All spec files are located in `.kiro/specs/necro-os/`

### Development Workflow
1. **Requirements Phase** - Defined user stories and system requirements
2. **Design Phase** - Created architecture and component designs
3. **Task Planning** - Broke down implementation into discrete coding tasks
4. **Implementation** - Executed tasks incrementally with Kiro assistance

### Key Benefits
- **Structured Development** - Clear progression from idea to implementation
- **Requirement Traceability** - Every task links back to specific requirements
- **Incremental Progress** - Build complex features step-by-step
- **Documentation** - Comprehensive design docs generated during planning

## 🎨 Customization

### Adjusting Haunting Behavior

Edit `src/stores/ghostBehavior.js`:
```javascript
// Change initial idle timeout (default: 10 seconds)
idleTimeout: 10000

// Change haunting level increment interval (default: 60 seconds)
hauntingInterval: 60000

// Adjust haunting intensity
hauntingLevel: 1  // Start at different level
```

### Adding New Applications

1. Create component in `src/components/apps/YourApp.vue`
2. Register in `src/utils/appRegistry.js`
3. Add icon and menu item to `src/components/StartMenu.vue`

### Customizing AI Personality

Edit the system prompt in `src/utils/geminiService.js`:
```javascript
const systemPrompt = "Your custom personality here..."
```

## ♿ Accessibility Options

Necro-OS includes accessibility options to reduce motion and visual effects:

### Disabling Visual Effects

You can disable specific effects by modifying localStorage in your browser console:

```javascript
// Disable CRT filter
localStorage.setItem('necro-os-disable-crt', 'true')

// Disable cursor effects (rotation, trails, glitches)
localStorage.setItem('necro-os-reduce-motion', 'true')

// Disable flashing/flicker effects
localStorage.setItem('necro-os-disable-flicker', 'true')

// Reload the page for changes to take effect
location.reload()
```

### Re-enabling Effects

```javascript
// Remove all accessibility preferences
localStorage.removeItem('necro-os-disable-crt')
localStorage.removeItem('necro-os-reduce-motion')
localStorage.removeItem('necro-os-disable-flicker')
location.reload()
```

**Note**: These settings persist across sessions and are stored locally in your browser.

## 🐛 Troubleshooting

### API Key Issues
- **Error: "My dark powers are locked"** - Check your API key in `.env`
- **Error: "I'm too cursed right now"** - Rate limit reached, wait a moment

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Performance Issues
- Reduce `VITE_MAX_WINDOWS` in `.env`
- Disable haunting: Set `VITE_HAUNTING_ENABLED=false`

## 📝 License

MIT License - Feel free to use this cursed creation for your own projects!

## 🎃 Happy Haunting!

Enjoy your cursed Windows 95 experience. Remember: the longer you stay, the more haunted it becomes... 👻
