# System Icons

This directory contains Windows 95 style system icons for notifications and dialogs in Necro-OS.

## Files

- `warning.svg` - Yellow triangle with exclamation mark (warning notifications)
- `error.svg` - Red circle with X mark (error notifications)
- `info.svg` - Blue circle with 'i' (information notifications)
- `disk.svg` - Hard drive icon (low disk space warnings)
- `critical.svg` - Red octagon with stop hand (critical system errors)

## Design Style

All icons follow Windows 95 design conventions:
- 32x32 pixel size
- Bold outlines (2px black stroke)
- Gradient fills for depth
- Highlight/shadow for 3D effect
- Simple, clear symbolism

## Usage

These icons are used by:
- **PhantomNotifications.vue** - Toast notification system
- **DiskSpaceWarning.vue** - Low disk space dialog
- **BSOD.vue** - Blue screen of death
- Other system dialogs and alerts

## Icon Types

### Warning (warning.svg)
Yellow triangle with black exclamation mark. Used for non-critical warnings that require user attention.

### Error (error.svg)
Red circle with white X. Used for error messages and failed operations.

### Info (info.svg)
Blue circle with white 'i'. Used for informational messages and tips.

### Disk (disk.svg)
Gray hard drive with red activity light. Specifically for disk space warnings showing drive C:.

### Critical (critical.svg)
Red stop sign with white hand. Used for critical system errors that require immediate attention.

## Implementation

Icons are referenced in components via relative paths:
```vue
<img src="/icons/warning.svg" alt="Warning" />
```

Or as background images in CSS:
```css
.notification-icon {
  background-image: url('/icons/warning.svg');
}
```
