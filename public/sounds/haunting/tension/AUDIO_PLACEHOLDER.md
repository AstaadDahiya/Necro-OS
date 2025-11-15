# Audio Placeholder Notice

## Missing Audio File: heartbeat.mp3

This file is required for the tension audio layer but is not included in the repository.

### How to Add Audio

1. **Option 1: Use Free Sound Libraries**
   - Visit freesound.org or similar sites
   - Search for "heartbeat" or "heart beat loop"
   - Download a seamless loop at 60 BPM
   - Convert to MP3 at 64kbps
   - Name it `heartbeat.mp3` and place in this directory

2. **Option 2: Generate with Audio Software**
   - Use Audacity, GarageBand, or similar
   - Create a 1-2 second heartbeat loop (lub-dub pattern)
   - Set tempo to exactly 60 BPM
   - Export as MP3 at 64kbps
   - Ensure seamless looping

3. **Option 3: Use AI Audio Generation**
   - Use services like ElevenLabs, Mubert, or similar
   - Generate a heartbeat sound effect
   - Process to 60 BPM loop
   - Export as MP3

### Specifications

- **Format**: MP3
- **Bitrate**: 64kbps
- **Duration**: 1-2 seconds (seamless loop)
- **BPM**: 60 (one beat per second)
- **Content**: Realistic heartbeat (lub-dub)

### System Behavior Without Audio

The system will gracefully handle the missing file:
- Errors will be logged to console
- Haunting will continue without heartbeat audio
- Other audio layers will function normally
- No crashes or broken functionality

### Testing

Once you add the audio file:
1. Refresh the application
2. Increase possession level above 80
3. Listen for continuous heartbeat at 100 BPM
4. Trigger a jumpscare to hear tempo ramp (60→140 BPM)
