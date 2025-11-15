# Jumpscare Media Files

This directory contains video and audio files for the jumpscare system in Necro-OS.

## Directory Structure

```
jumpscares/
├── videos/          # Video files for jumpscares
│   ├── scream1.mp4
│   ├── ghost.mp4
│   ├── glitch.mp4
│   ├── demon.mp4
│   └── eyes.mp4
└── audio/           # Audio files for jumpscares
    ├── scream1.mp3
    ├── scream2.mp3
    ├── whisper.mp3
    ├── whisper2.mp3
    ├── static.mp3
    ├── distortion.mp3
    ├── laugh.mp3
    └── heartbeat.mp3
```

## Adding Custom Jumpscares

### Video Files

**Supported Formats:**
- MP4 (H.264 codec recommended)
- WebM (VP8/VP9 codec)

**Recommended Specifications:**
- Resolution: 1920x1080 or 1280x720
- Duration: 2-5 seconds
- Frame rate: 24-30 fps
- Bitrate: 2-5 Mbps

**Tips:**
- Keep file sizes under 5MB for faster loading
- Use high contrast and saturated colors for maximum impact
- Consider adding visual glitches or distortions

### Audio Files

**Supported Formats:**
- MP3 (recommended)
- WAV
- OGG

**Recommended Specifications:**
- Sample rate: 44.1 kHz
- Bitrate: 128-192 kbps
- Duration: 1-5 seconds

**Tips:**
- Use sudden loud sounds for maximum scare effect
- Layer multiple audio tracks for complex soundscapes
- Consider using distorted voices, screams, or unsettling ambient sounds

## Configuring Jumpscares

To add a new jumpscare variant, edit `src/utils/jumpscareService.js`:

```javascript
{
  id: 'my-jumpscare',           // Unique identifier
  type: 'video',                // 'video' or 'image'
  media: '/jumpscares/videos/my-video.mp4',
  audio: [
    '/jumpscares/audio/my-sound1.mp3',
    '/jumpscares/audio/my-sound2.mp3'
  ],
  duration: 3000,               // Duration in milliseconds
  intensity: 3,                 // Intensity level (1-5)
  text: 'YOUR CUSTOM TEXT'      // Optional text overlay
}
```

## Intensity Levels

- **Level 1**: Mild - Subtle scares, low intensity
- **Level 2**: Moderate - Standard jumpscares
- **Level 3**: High - Intense visuals and audio
- **Level 4**: Very High - Disturbing content
- **Level 5**: Maximum - Most intense jumpscares

Higher intensity jumpscares are triggered more frequently at higher haunting levels.

## Performance Considerations

- Large video files may cause loading delays
- Preloading is handled automatically on app initialization
- Consider using compressed formats to reduce file sizes
- Test on different devices to ensure smooth playback

## Copyright and Content Warnings

- Ensure you have the rights to use any media files
- Be mindful of content that may be disturbing to users
- Consider adding content warnings for intense jumpscares
- Respect user experience and don't overuse high-intensity scares

## Fallback Behavior

If a video or audio file fails to load:
- The system will fall back to the default static image jumpscare
- Errors are logged to the console for debugging
- The app continues to function normally

## Testing

To test jumpscares:
1. Open the browser console
2. Run: `window.dispatchEvent(new CustomEvent('ghost-jumpscare', { detail: { intensity: 3 } }))`
3. Or wait for haunting level 4+ and let the ghost behavior trigger them automatically
