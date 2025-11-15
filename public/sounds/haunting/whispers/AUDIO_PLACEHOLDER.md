# Audio Placeholder Notice

## Missing Audio File: generic-1.mp3

This file is required for the whispers audio layer but is not included in the repository.

### How to Add Audio

1. **Option 1: Use Free Sound Libraries**
   - Visit freesound.org or similar sites
   - Search for "whisper", "breathy voice", or "soft murmur"
   - Download a 2-5 second whisper sound
   - Convert to MP3 at 64kbps
   - Name it `generic-1.mp3` and place in this directory

2. **Option 2: Record Your Own**
   - Use a microphone and recording software
   - Record soft, unintelligible whispers
   - Keep it breathy and ethereal
   - Process with reverb for atmosphere
   - Export as MP3 at 64kbps

3. **Option 3: Use AI Audio Generation**
   - Use services like ElevenLabs or similar
   - Generate whispered speech
   - Make it unintelligible or use phrases like "I see you"
   - Export as MP3

### Specifications

- **Format**: MP3
- **Bitrate**: 64kbps
- **Duration**: 2-5 seconds
- **Content**: Unintelligible whispers, breathy sounds
- **Volume**: Mixed at low level (should be barely audible)

### System Behavior Without Audio

The system will gracefully handle the missing file:
- Errors will be logged to console
- Haunting will continue without whisper audio
- Other audio layers will function normally
- No crashes or broken functionality

### Testing

Once you add the audio file:
1. Refresh the application
2. Enter your name in any input field
3. Increase possession level above 70
4. Wait 30-90 seconds for whispers to play
5. Listen for soft, barely audible whispers

### Future Enhancements

- Personalized whispers using TTS
- Multiple whisper variations (generic-2.mp3, generic-3.mp3)
- Context-aware whispers based on user actions
