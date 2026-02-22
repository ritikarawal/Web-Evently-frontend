# Music Setup Instructions

## 📁 Directory: `/public/music/`

This directory contains category-specific background music for event browsing.

## 🎵 Required Files

Each of these files should be an MP3 audio file (128kbps is recommended):

1. **birthday.mp3** - Upbeat, celebratory music (2-3 minutes recommended)
2. **anniversary.mp3** - Romantic, slow music
3. **wedding.mp3** - Elegant, ceremonial music  
4. **engagement.mp3** - Joyful, celebratory music
5. **workshop.mp3** - Professional, focus-oriented music
6. **conference.mp3** - Energetic, professional music
7. **graduation.mp3** - Inspirational, achievement-focused music
8. **fundraisers.mp3** - Uplifting, motivational music

## 🔗 Free Music Sources

### Top Recommendations:
- **Pixabay** (https://pixabay.com/music) - Best selection, easy download
- **Pexels** (https://pexels.com/music) - Simple, clean interface
- **Freepik** (https://freepik.com/music) - Good variety
- **Unminus** (https://unminus.com) - High quality royalty-free

### Alternative Sources:
- YouTube Audio Library (with YouTube account)
- Incompetech.com
- Free Music Archive
- ccMixter.org

## 📥 Setup Steps

### Option 1: Download Individual Files

1. Visit your preferred free music source
2. Search for music matching each category theme
3. Download as MP3
4. Rename to the exact filename (e.g., `birthday.mp3`)
5. Place in this directory (`/public/music/`)

### Option 2: Using ffmpeg (for audio conversion)

If you have audio files in other formats:
```bash
# Convert .wav to .mp3
ffmpeg -i birthday.wav -q:a 4 birthday.mp3

# Convert .m4a to .mp3
ffmpeg -i anniversary.m4a -q:a 4 anniversary.mp3
```

## 📊 File Size Recommendations

- **Optimal:** 2-4 MB per file (2-3 minutes at 128kbps)
- **Maximum:** 10 MB per file
- **Format:** MP3 (for browser compatibility)
- **Bitrate:** 128-192 kbps (recommended)

## ✅ Verification

After adding files, check:

1. **File Names** - Exactly match the list above
2. **Format** - All files are .mp3
3. **Location** - All files in `/public/music/` directory
4. **Permissions** - Files are readable by the web server

## 🎧 Testing

1. Start the development server
2. Navigate to home page
3. Click the music button (🔊) on any event card
4. You should hear the category-specific music

If no sound:
- Check browser console for errors
- Ensure file paths are correct
- Verify browser allows audio playback
- Check file size isn't excessive

## 💡 Pro Tips

1. **Consistency** - Use similar audio quality/volume for all files
2. **Licensing** - Always use royalty-free or licensed music
3. **Attribution** - Keep track of music sources for proper credit if needed
4. **Duration** - Shorter files work better for browsing (2-3 min recommended)
5. **Volume** - System defaults to 30% - files won't be too loud

## 🚫 Common Issues

| Issue | Solution |
|-------|----------|
| No sound plays | Check file exists at correct path |
| Audio is too loud | Edit category theme to lower volume |
| File not found 404 | Verify filename spelling and location |
| Playback issues | Ensure MP3 format, try re-encoding |
| File size too large | Use lower bitrate (128kbps) |

## 📝 Notes

- Music plays on demand (click the button to play/pause)
- Only one category music plays at a time (switching resets)
- Music loops continuously while playing
- Volume is set to comfort level (30%)
- No autoplay on page load (respects user preferences)

