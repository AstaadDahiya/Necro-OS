/**
 * Jumpscare Service
 * Manages jumpscare media variants and random selection
 */

// Collection of jumpscare variants with different videos and audio combinations
const jumpscareVariants = [
  {
    id: 'static',
    type: 'image',
    media: 'https://i.imgur.com/xP5Eo3a.gif',
    audio: [],
    duration: 2500,
    intensity: 1,
    text: 'YOU SHOULDN\'T HAVE DONE THAT'
  },
  {
    id: 'ghost',
    type: 'video',
    media: '/jumpscares/videos/ghost.mp4',
    audio: ['/jumpscares/audio/ghost.mp3'],
    duration: 3000,
    intensity: 3,
    text: 'YOU CANNOT ESCAPE'
  },
  {
    id: 'demon',
    type: 'video',
    media: '/jumpscares/videos/demon.mp4',
    audio: ['/jumpscares/audio/demon.mp3'],
    duration: 4000,
    intensity: 5,
    text: 'YOUR SOUL IS MINE'
  },
  {
    id: 'doll',
    type: 'video',
    media: '/jumpscares/videos/doll.mp4',
    audio: ['/jumpscares/audio/doll.mp3'],
    duration: 3500,
    intensity: 4,
    text: 'COME PLAY WITH ME'
  },
  {
    id: 'clown',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-creepy-clown-jump-scare-tede9hkc.mp4',
    audio: ['/jumpscares/audio/vlipsy-creepy-clown-jump-scare-tede9hkc.mp3'],
    duration: 3000,
    intensity: 4,
    text: 'I SEE YOU'
  },
  {
    id: 'creepy-face',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-creepy-face-jump-scare-3hEsFXt9.mp4',
    audio: ['/jumpscares/audio/vlipsy-creepy-face-jump-scare-3hEsFXt9.mp3'],
    duration: 2500,
    intensity: 3,
    text: 'LOOK AT ME'
  },
  {
    id: 'grave-encounters',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-grave-encounters-jump-scare-rZfDhH4C.mp4',
    audio: ['/jumpscares/audio/vlipsy-grave-encounters-jump-scare-rZfDhH4C.mp3'],
    duration: 3000,
    intensity: 4,
    text: 'GET OUT'
  },
  {
    id: 'rec',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-rec-jump-scare-sBpPtNkS.mp4',
    audio: ['/jumpscares/audio/vlipsy-rec-jump-scare-sBpPtNkS.mp3'],
    duration: 3500,
    intensity: 5,
    text: 'RECORDING...'
  },
  {
    id: 'the-bells',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-the-bells-jump-scare-CiuPrJtA.mp4',
    audio: ['/jumpscares/audio/vlipsy-the-bells-jump-scare-CiuPrJtA.mp3'],
    duration: 3000,
    intensity: 3,
    text: 'HEAR THE BELLS'
  },
  {
    id: 'the-ring',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-the-ring-jump-scare-dGfP6E2A.mp4',
    audio: ['/jumpscares/audio/vlipsy-the-ring-jump-scare-dGfP6E2A.mp3'],
    duration: 4000,
    intensity: 5,
    text: 'SEVEN DAYS'
  },
  {
    id: 'the-visit',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-the-visit-jump-scare-96OggcBe.mp4',
    audio: [],
    duration: 3500,
    intensity: 4,
    text: 'WELCOME'
  },
  {
    id: 'vhs-2',
    type: 'video',
    media: '/jumpscares/videos/vlipsy-vhs-2-jump-scare-apZxG4ru.mp4',
    audio: ['/jumpscares/audio/vlipsy-vhs-2-jump-scare-apZxG4ru.mp3'],
    duration: 3000,
    intensity: 4,
    text: 'REWIND'
  }
]

/**
 * Get completely random jumpscare variant (ignores intensity filtering)
 * @returns {object} Random jumpscare variant
 */
export function getRandomJumpscare() {
  return jumpscareVariants[Math.floor(Math.random() * jumpscareVariants.length)]
}

/**
 * Check if jumpscare should be triggered based on scare intensity setting
 * @param {number} scareIntensity - Scare intensity setting (0-100)
 * @returns {boolean} True if jumpscare should be triggered
 */
export function shouldTriggerJumpscare(scareIntensity = 100) {
  // Convert intensity to probability (0-100 maps to 0-1)
  const probability = scareIntensity / 100
  return Math.random() < probability
}

/**
 * Get jumpscare by specific ID
 * @param {string} id - Jumpscare variant ID
 * @returns {object|null} Jumpscare variant or null if not found
 */
export function getJumpscareById(id) {
  return jumpscareVariants.find(v => v.id === id) || null
}

/**
 * Preload jumpscare media on app initialization
 * @returns {Promise<void>}
 */
export async function preloadJumpscares() {
  const promises = jumpscareVariants.map(variant => {
    return new Promise((resolve) => {
      if (variant.type === 'video' && variant.media.startsWith('/')) {
        // Only preload local video files
        const video = document.createElement('video')
        video.src = variant.media
        video.preload = 'auto'
        video.load()
        video.onloadeddata = () => resolve()
        video.onerror = () => {
          console.warn(`Failed to preload video: ${variant.media}`)
          resolve() // Resolve anyway to not block
        }
      } else if (variant.type === 'image') {
        const img = new Image()
        img.src = variant.media
        img.onload = () => resolve()
        img.onerror = () => {
          console.warn(`Failed to preload image: ${variant.media}`)
          resolve()
        }
      } else {
        resolve() // Skip external URLs
      }
    })
  })
  
  try {
    await Promise.all(promises)
    console.log('Jumpscares preloaded successfully')
  } catch (error) {
    console.error('Error preloading jumpscares:', error)
  }
}

/**
 * Get all jumpscare variants
 * @returns {Array} All jumpscare variants
 */
export function getAllJumpscares() {
  return [...jumpscareVariants]
}
