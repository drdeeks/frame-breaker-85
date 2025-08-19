# Frame Breaker '85

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
- Node.js (v14 or higher)
- Google Gemini AI API key

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

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

*Get ready to break some frames! 🕹️*
