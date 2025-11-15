/**
 * Audio Haunting Service
 * Provides advanced audio effects for immersive horror experience
 * - Modem handshake sounds
 * - Brown noise generation
 * - Creepy whispers using Web Speech API
 */

// Creepy whisper phrases
const whisperPhrases = [
  'help me',
  'it burns',
  'behind you',
  'I can see you',
  'why did you do that',
  'they are coming',
  'you cannot escape',
  'I am watching',
  'delete me',
  'the void calls'
]

/**
 * Play 56k modem handshake sound using HTML5 Audio
 */
export function playModemHandshake() {
  try {
    const audio = new Audio('/sounds/modem-handshake.mp3')
    audio.volume = 0.7
    audio.play().catch(error => {
      console.warn('Failed to play modem handshake:', error)
    })
  } catch (error) {
    console.error('Error creating modem handshake audio:', error)
  }
}

/**
 * Start ambient audio layer using actual audio files
 * Returns audio element for cleanup
 */
export function startBrownNoise() {
  try {
    // Use actual ambient audio files instead of generated brown noise
    const ambientAudio = new Audio('/sounds/haunting/ambient/distant-scream.mp3')
    ambientAudio.loop = true
    ambientAudio.volume = 0.15 // Low ambient volume
    
    // Play with error handling
    ambientAudio.play().catch(error => {
      console.warn('[AudioHaunting] Ambient audio autoplay blocked:', error.message)
      // Will play after user interaction
    })
    
    console.log('[AudioHaunting] Started ambient audio layer')
    return { audio: ambientAudio }
  } catch (error) {
    console.error('[AudioHaunting] Failed to start ambient audio:', error)
    return null
  }
}

/**
 * Stop ambient audio and clean up resources
 */
export function stopBrownNoise(audioData) {
  if (!audioData || !audioData.audio) return
  
  try {
    audioData.audio.pause()
    audioData.audio.currentTime = 0
    audioData.audio.src = '' // Release resources
    console.log('[AudioHaunting] Stopped ambient audio layer')
  } catch (error) {
    console.error('[AudioHaunting] Failed to stop ambient audio:', error)
  }
}

/**
 * Play phantom typing sound effect
 */
export function playPhantomTyping() {
  try {
    const audio = new Audio('/sounds/haunting/effects/phantom-typing.mp3')
    audio.volume = 0.3
    audio.play().catch(error => {
      console.warn('[AudioHaunting] Phantom typing playback failed:', error.message)
    })
  } catch (error) {
    console.error('[AudioHaunting] Failed to play phantom typing:', error)
  }
}

/**
 * Play HDD grinding sound effect
 */
export function playHDDGrinding() {
  try {
    const audio = new Audio('/sounds/haunting/effects/hdd-grinding.mp3')
    audio.volume = 0.4
    audio.play().catch(error => {
      console.warn('[AudioHaunting] HDD grinding playback failed:', error.message)
    })
  } catch (error) {
    console.error('[AudioHaunting] Failed to play HDD grinding:', error)
  }
}

/**
 * Start heartbeat tension audio (looping)
 */
let heartbeatAudio = null
export function startHeartbeat() {
  try {
    if (heartbeatAudio) return // Already playing
    
    heartbeatAudio = new Audio('/sounds/haunting/tension/heartbeat.mp3')
    heartbeatAudio.loop = true
    heartbeatAudio.volume = 0.5
    heartbeatAudio.play().catch(error => {
      console.warn('[AudioHaunting] Heartbeat playback failed:', error.message)
    })
    console.log('[AudioHaunting] Started heartbeat tension layer')
  } catch (error) {
    console.error('[AudioHaunting] Failed to start heartbeat:', error)
  }
}

/**
 * Stop heartbeat audio
 */
export function stopHeartbeat() {
  if (heartbeatAudio) {
    heartbeatAudio.pause()
    heartbeatAudio.currentTime = 0
    heartbeatAudio = null
    console.log('[AudioHaunting] Stopped heartbeat tension layer')
  }
}

/**
 * Play whisper sound
 */
export function playWhisperSound() {
  try {
    const audio = new Audio('/sounds/haunting/whispers/generic-1.mp3')
    audio.volume = 0.25
    audio.play().catch(error => {
      console.warn('[AudioHaunting] Whisper playback failed:', error.message)
    })
  } catch (error) {
    console.error('[AudioHaunting] Failed to play whisper:', error)
  }
}

/**
 * Speak a random whisper using Web Speech API
 * - Pitch reduced by 20% (0.8)
 * - Low volume (0.3)
 * - Slower speech rate (0.7)
 */
export function speakWhisper() {
  try {
    // Check if Web Speech API is supported
    if (!window.speechSynthesis) {
      console.warn('Web Speech API not supported')
      return
    }

    const phrase = whisperPhrases[Math.floor(Math.random() * whisperPhrases.length)]
    const utterance = new SpeechSynthesisUtterance(phrase)
    
    utterance.pitch = 0.8  // 20% pitch reduction
    utterance.rate = 0.7   // Slower delivery
    utterance.volume = 0.3 // Low volume for subtle effect
    
    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Failed to speak whisper:', error)
  }
}

/**
 * Start whisper scheduler with random 15-45 second intervals
 * Returns cleanup function to stop the scheduler
 */
export function startWhisperScheduler() {
  let timeoutId = null
  
  const scheduleNext = () => {
    // Random delay between 15-45 seconds
    const delay = Math.random() * 30000 + 15000
    
    timeoutId = setTimeout(() => {
      speakWhisper()
      scheduleNext()
    }, delay)
  }
  
  // Start the scheduler
  scheduleNext()
  
  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
}
