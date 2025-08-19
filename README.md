# Frame Breaker '85

<<<<<<< HEAD
An AI-powered brick breaker game with retro aesthetics and modern features, built as a Farcaster Mini App. Each level is dynamically generated using Google's Gemini AI to create unique, challenging patterns.

## 🚀 Farcaster Mini App

This game is designed to run as a Mini App within Farcaster clients. It integrates with the Farcaster Mini App SDK to provide seamless authentication and native features.

### Mini App Features
- **Native Integration**: Runs within Farcaster clients
- **Quick Auth**: Seamless authentication with Farcaster accounts
- **Social Sharing**: Easy sharing of scores and achievements
- **Responsive Design**: Optimized for mobile and desktop Farcaster clients

![Game Screenshot](https://via.placeholder.com/800x600/0d0221/00ffff?text=Frame+Breaker+'85)

## Features

### 🤖 AI-Generated Levels
- Each level layout is created by Google's Gemini AI
- Unique patterns including spaceships, faces, and geometric designs
- Fallback system ensures gameplay continuity if AI is unavailable

### 🎮 Classic Gameplay with Modern Twists
- **Power-ups:**
  - 🟢 **Sticky (S)**: Ball sticks to paddle for 3 hits - perfect for precise aiming
  - 🎨 **Paint (P)**: Choose a brick color to eliminate all bricks of that type
  - 🛡️ **Invincible (I)**: 7 seconds of invincibility with increased ball speed

- **Power-downs:**
  - ➖ **Shrink Paddle (-)**: Reduces paddle size by 50% for 20 seconds
  - ➕ **Add Bricks (+)**: Adds 15% more bricks to the current level

### 🕹️ Retro Experience
- Authentic 80s arcade aesthetics with neon colors
- CRT scanline effects for authentic retro feel
- Retro-style sound effects and visual feedback
- High score leaderboard with 3-letter initials

=======
An AI-powered brick breaker game with retro aesthetics and modern features. Each level is dynamically generated using Google's Gemini AI to create unique, challenging patterns.

## Features

### 🤖 AI-Generated Levels
- Each level layout is created by Google's Gemini AI
- Unique patterns including spaceships, faces, and geometric designs
- Fallback system ensures gameplay continuity if AI is unavailable

### 🎮 Classic Gameplay with Modern Twists
- **Power-ups:**
  - 🟢 **Sticky (S)**: Ball sticks to paddle for 3 hits - perfect for precise aiming
  - 🎨 **Paint (P)**: Choose a brick color to eliminate all bricks of that type
  - 🛡️ **Invincible (I)**: 7 seconds of invincibility with increased ball speed

- **Power-downs:**
  - ➖ **Shrink Paddle (-)**: Reduces paddle size by 50% for 20 seconds
  - ➕ **Add Bricks (+)**: Adds 15% more bricks to the current level

### 🕹️ Retro Experience
- Authentic 80s arcade aesthetics with neon colors
- CRT scanline effects for authentic retro feel
- Retro-style sound effects and visual feedback
- High score leaderboard with 3-letter initials

>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f
### 🎯 Game Mechanics
- **Lives System**: Start with 3 lives
- **Progressive Difficulty**: Each level brings new challenges
- **Brick Durability**: All bricks require 2 hits to destroy
- **Smart Ball Physics**: Ball direction changes based on paddle hit position
- **Mouse & Touch Controls**: Works on desktop and mobile devices

## Controls

### Desktop
- **Mouse**: Move paddle left and right
- **Left Click**: Launch ball when attached to paddle
- **Escape**: Pause/unpause game

### Mobile/Touch
- **Touch & Drag**: Move paddle
- **Tap**: Launch ball when attached to paddle

### Game Controls
- **Pause Button**: Available in top-right corner during gameplay

## Installation & Setup

### Prerequisites
<<<<<<< HEAD
- Node.js (v22.11.0 or higher) - Required for Farcaster Mini Apps
- Google Gemini AI API key
- Farcaster account with Developer Mode enabled
=======
- Node.js (v14 or higher)
- Google Gemini AI API key
>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
<<<<<<< HEAD
   GEMINI_API_KEY=your_google_gemini_api_key_here
=======
   API_KEY=your_google_gemini_api_key_here
>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f
   ```

4. Start the development server:
   ```bash
<<<<<<< HEAD
   npm run dev
   ```

### Farcaster Developer Mode
To test this Mini App in Farcaster:
1. Make sure you're logged in to Farcaster on mobile or desktop
2. Visit: https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"
4. Use the developer tools to preview and test your Mini App

=======
   npm start
   ```

>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f
### Getting a Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Add the API key to your `.env` file

## Technical Details

### Built With
- **React 18** - Modern React with hooks
- **HTML5 Canvas** - High-performance 2D graphics
- **Google Gemini AI** - Dynamic level generation
- **CSS3** - Retro styling and animations
<<<<<<< HEAD
- **Farcaster Mini App SDK** - Native Farcaster integration

### Mini App Architecture
- **SDK Integration**: Uses `@farcaster/miniapp-sdk` for native features
- **Embed Metadata**: Proper OpenGraph and Mini App embed tags
- **Responsive Design**: Optimized for Farcaster client viewports
- **Authentication Ready**: Prepared for Farcaster Quick Auth integration
=======
>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f

### Game Configuration
- **Canvas Size**: 800x600 pixels
- **Brick Grid**: 18 columns × 10 rows
- **Power-up Chance**: 15% per brick
- **Frame Rate**: 60 FPS (using requestAnimationFrame)

### Performance Features
- Efficient canvas rendering
- Optimized collision detection
- Memory-safe state management
- Responsive design for multiple screen sizes

## Game States

- **Start Screen**: Main menu with game title and options
- **Playing**: Active gameplay state
- **Paused**: Game paused (ESC key or pause button)
- **Loading**: AI generating new level
- **Level Complete**: Brief celebration screen between levels
- **Game Over**: Score submission and restart options
- **Leaderboard**: High scores display
- **Color Picker**: Paint power-up selection screen

## Scoring System

- **Brick Destruction**: 10 points per brick
- **Paint Power-up**: 10 points per brick eliminated
- **Level Progression**: Unlimited levels with increasing complexity

## Local Storage

The game automatically saves:
- High scores leaderboard (top 10 scores)
- Player initials and scores

## Browser Compatibility

- **Recommended**: Chrome, Firefox, Safari, Edge (modern versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Requirements**: Canvas API support, ES6+ JavaScript

## Development

### Project Structure
```
src/
├── App.js          # Main game component
├── index.css       # Retro styling and animations
└── index.js        # React app entry point
```

### Key Components
- **Game Loop**: 60 FPS rendering and physics
- **AI Integration**: Gemini API for level generation
- **State Management**: React hooks for game state
- **Collision System**: Efficient rectangle-circle collision detection

## Troubleshooting

### Common Issues

**Game won't load:**
- Verify your Google Gemini API key is correct
- Check browser console for error messages
- Ensure you have a stable internet connection

**Levels not generating:**
- Check API key validity
- Game will fall back to default patterns if AI is unavailable

**Performance issues:**
- Try reducing browser zoom level
- Close other resource-intensive tabs
- Ensure hardware acceleration is enabled in browser

**Mobile controls not responsive:**
- Ensure touch events aren't being blocked
- Try refreshing the page
- Check if browser supports touch events

<<<<<<< HEAD
## Mini App Deployment

### Building for Production
```bash
npm run build
```

### Publishing to Farcaster
1. Deploy your built application to a public URL (e.g., Vercel, Netlify)
2. Update the URLs in `farcaster-miniapp.json` to match your deployment
3. Use the Farcaster Developer Tools to submit your Mini App for review
4. Once approved, your Mini App will be available in the Farcaster Mini App directory

### Required Assets
Make sure to create and upload these assets to your deployment:
- `icon.png` - App icon (512x512px)
- `og-image.png` - Open Graph image (1200x630px)
- `splash.png` - Splash screen (1200x630px)
- `hero.png` - Hero image for the Mini App directory
- `screenshot1.png`, `screenshot2.png`, `screenshot3.png` - Game screenshots

=======
>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f
## Contributing

Feel free to contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Credits

- **Game Engine**: Custom HTML5 Canvas implementation
- **AI Integration**: Google Gemini AI for procedural level generation
- **Design**: Inspired by classic 80s arcade games
- **Font**: "Press Start 2P" for authentic retro feel

---

<<<<<<< HEAD
*Get ready to break some frames! 🕹️*
=======
*Get ready to break some frames! 🕹️*
>>>>>>> 98e5a8cc8eac86436f395eb3fad162a56e857a5f
