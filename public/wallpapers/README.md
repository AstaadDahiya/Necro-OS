# Wallpaper Assets

This directory contains wallpaper images for the Necro-OS desktop corruption system.

## Files

### Corrupted Wallpapers (for maximum haunting level)
- `corrupted-glitch.svg` - Tileable glitch texture with RGB shift artifacts, scan lines, and digital corruption
- `static-noise.svg` - TV static noise pattern with chromatic aberration and interference lines

### Flicker Wallpapers
See `flicker/` subdirectory for ghostly wallpapers used in the wallpaper flicker effect.

## Usage

### Corrupted Glitch Texture
Used when haunting level reaches 5 to replace the normal desktop wallpaper with a corrupted, glitchy appearance. The texture is designed to be tileable for seamless background coverage.

Features:
- RGB color channel separation
- Horizontal scan lines
- Vertical corruption bars
- Dead pixels and artifacts
- Static noise overlay

### Static Noise Texture
Alternative corrupted wallpaper with TV static effect. Uses SVG filters for procedural noise generation.

Features:
- Fractal noise pattern (tileable)
- Chromatic aberration (RGB shift)
- Horizontal interference lines
- Glitch blocks
- Dead and bright pixel artifacts

## Implementation

These textures are referenced in the `visualCorruption` store and applied via CSS `background-image` when the `replaceWallpaper()` action is triggered at haunting level 5.

The textures use SVG format for:
- Scalability to any resolution
- Small file size
- Procedural generation via filters
- Easy customization
