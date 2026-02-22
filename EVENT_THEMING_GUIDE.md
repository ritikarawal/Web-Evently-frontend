# Event Theming & Music System Documentation

## 🎨 Features Implemented

### 1. **Category-Specific Color Themes**
Each event category now has its own unique color scheme:

- **Birthday** 🎂: Pink & Rose gradients
- **Anniversary** 💕: Red & Pink gradients  
- **Wedding** 💍: Purple & Indigo gradients
- **Engagement** 💎: Blue & Cyan gradients
- **Workshop** 🛠️: Green & Emerald gradients
- **Conference** 🎤: Indigo & Purple gradients
- **Graduation** 🎓: Yellow & Orange gradients
- **Fundraisers** 🤝: Orange & Amber gradients

### 2. **Mock Events Data**
- 8 sample events (one for each category)
- Located in: `constants/mockEvents.ts`
- Events include realistic details: title, description, dates, capacity, pricing
- Easily replaceable with API data

### 3. **Animations**
New smooth animations added:

- **Card Slide In** - Events slide in from below on page load
- **Card Lift** - Cards lift up on hover for depth effect
- **Shimmer** - Category icons shimmer continuously
- **Attendee Pulse** - Attendee count badges pulse gently
- **Border Glow** - Optional glowing border effect
- **Staggered Animation** - Multiple events animate with slight delays

Animations CSS: `styles/animations.css`

### 4. **Music System**
Each event category has its own background music:

- Music files are sourced from `public/music/[category].mp3`
- Music button on each event card (🔊 to play, 🎵 when playing)
- Volume set to 30% for comfort
- Loops continuously while browsing
- Easy to add/replace audio files

### 5. **File Structure**

```
evently-frontend/
├── constants/
│   ├── categoryThemes.ts      # Theme definitions for all categories
│   └── mockEvents.ts          # Sample 8 events (one per category)
├── public/
│   └── music/
│       ├── birthday.mp3       # Add your music files here
│       ├── anniversary.mp3
│       ├── wedding.mp3
│       ├── engagement.mp3
│       ├── workshop.mp3
│       ├── conference.mp3
│       ├── graduation.mp3
│       └── fundraisers.mp3
├── styles/
│   └── animations.css         # All animation keyframes
├── components/
│   └── EventCard.tsx          # Updated with themes & music
└── app/
    └── (protected)/
        └── home/
            └── page.tsx       # Updated with mock events & themes
```

## 📋 How to Use

### Adding Music Files
1. Get royalty-free audio from:
   - Pixabay: https://pixabay.com/music
   - Pexels: https://pexels.com/music
   - Freepik: https://freepik.com/music
   - Unminus: https://unminus.com

2. Download .mp3 files for each category

3. Place them in `public/music/` with names:
   - `birthday.mp3`
   - `anniversary.mp3`
   - `wedding.mp3`
   - `engagement.mp3`
   - `workshop.mp3`
   - `conference.mp3`
   - `graduation.mp3`
   - `fundraisers.mp3`

### Customizing Themes
Edit `constants/categoryThemes.ts` to:
- Change colors for any category
- Modify icon emojis
- Adjust animation delays
- Update music file paths

### Using Mock Events
The home page now displays:
1. 8 sample events (from mock data)
2. Real API events (if available)
3. Automatic fallback to mock if API fails

To use real events only, comment out the mock events merge in `home/page.tsx`.

## 🎵 Music Integration Details

Each EventCard now includes:
- Music player button with status indicator
- Category-matched music plays on demand
- Volume set to 30% for comfort
- Auto-cleanup on component unmount
- Error handling for missing files

## ✨ Animation Details

### Timing
- Slide In: 0.5s ease-out
- Lift: 0.3s ease-in-out  
- Shimmer: 2s ease-in-out
- Pulse: 2s ease-in-out
- Stagger delays: 0ms, 100ms, 200ms, 300ms

### Usage Classes
```tsx
// In JSX components:
<div className="animate-card-slide-in">
  // Slides in from below
</div>

<div className="animate-shimmer">
  // Shimmers continuously
</div>

<div className="animate-attendee-pulse">
  // Pulses gently
</div>
```

## 🔧 Future Enhancements

1. **User Preferences** - Save favorite category music
2. **Volume Control** - Let users adjust music volume
3. **Playlist Mode** - Play all category music sequentially
4. **Sound Effects** - Add subtle sounds for interactions
5. **Dark Mode Support** - Theme variations for dark theme

## 📱 Responsive Design

- Mobile: 2 columns for category grid
- Tablet: 4 columns
- Desktop: 8 columns (all categories visible)

All animations are optimized for performance and accessibility.
