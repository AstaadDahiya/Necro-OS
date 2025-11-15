# Tension Audio Layer

This directory contains heartbeat audio files for the tension layer of the advanced haunting system.

## Requirements

- **Jumpscare Heartbeat**: Plays before jumpscares, ramping from 60 BPM to 140 BPM over 10 seconds
- **Continuous Heartbeat**: Plays continuously at 100 BPM when possession level > 80
- **Volume**: 70% of base volume

## Audio Files

### heartbeat.mp3
Looping heartbeat sound recorded at 60 BPM baseline.

**Specifications**:
- Format: MP3
- Bitrate: 64kbps (recommended for small file size)
- Duration: 1-2 seconds (seamless loop)
- Base BPM: 60 (one beat per second)
- Content: Realistic heartbeat sound (lub-dub pattern)
- Loop: Must loop seamlessly without clicks or gaps

**Playback Rate Adjustment**:
The system adjusts playback rate to change tempo:
- 60 BPM = 1.0x playback rate (original)
- 100 BPM = 1.67x playback rate
- 140 BPM = 2.33x playback rate

## Usage Scenarios

### Before Jumpscare
1. Start heartbeat at 60 BPM
2. Ramp to 140 BPM over 10 seconds using `adjustHeartbeatTempo()`
3. Stop after jumpscare completes (12 seconds total)

### High Possession (> 80)
1. Start continuous heartbeat at 100 BPM
2. Loop indefinitely until possession drops below 80
3. Creates constant tension and unease

## Audio Design Notes

Heartbeat should:
- Sound realistic and visceral
- Loop seamlessly without audible seams
- Be recorded at exactly 60 BPM for accurate tempo scaling
- Have a deep, bass-heavy quality for physical impact
- Work well when sped up to 140 BPM (should not sound distorted)

## Technical Notes

The audio file is played using Web Audio API's `AudioBufferSourceNode` with `playbackRate` parameter:
- `playbackRate.linearRampToValueAtTime()` creates smooth tempo transitions
- Loop mode is enabled for continuous playback
- Playback rate changes affect both tempo and pitch (intentional for realism)

## Placeholder Audio

Until proper audio files are created, the system will gracefully handle missing files by logging errors without breaking functionality.
