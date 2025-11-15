# Ghostly Wallpaper Collection

This directory contains SVG wallpapers used for the wallpaper flicker effect in Necro-OS.

## Wallpapers

1. **ghost1.svg** - Ghostly apparition with static noise
2. **ghost2.svg** - "THEY ARE WATCHING" with red eyes
3. **ghost3.svg** - 666 with red crosshairs
4. **ghost4.svg** - "ERROR: SOUL NOT FOUND" with glitch effect
5. **ghost5.svg** - Concentric circles with "YOU CANNOT ESCAPE"
6. **ghost6.svg** - Static pattern with "SYSTEM CORRUPTED"
7. **ghost7.svg** - Terminal output showing ghost processes
8. **ghost8.svg** - Eyes watching with "I SEE YOU"
9. **ghost9.svg** - Tall menacing shadow figure with hollow eyes
10. **ghost10.svg** - Multiple pairs of glowing red eyes in darkness

## Usage

These wallpapers are automatically loaded by the `visualCorruption` store and randomly displayed during wallpaper flicker events.

The flicker system:
- Activates at haunting level 3+
- Displays a random ghostly wallpaper for 100-300ms
- Occurs every 20-40 seconds at level 3-4
- Increases frequency to every 10-20 seconds at level 5

## Adding New Wallpapers

To add new wallpapers:
1. Create an SVG or GIF file (1024x768 recommended)
2. Place it in this directory
3. Add the path to the `flickerWallpapers` array in `src/stores/visualCorruption.js`

## Format Support

The system supports:
- SVG files (vector graphics, scalable)
- GIF files (including animated GIFs)
- PNG/JPG files (raster images)

All formats are rendered using CSS `background-image` with `cover` sizing.
