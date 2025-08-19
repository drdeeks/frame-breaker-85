# Frame Breaker '85 - Farcaster Mini App Setup

## Project Structure

```
Frame Break 85'/
├── src/
│   ├── App.tsx          # Main game component with Farcaster SDK integration
│   ├── main.tsx         # React app entry point
│   └── index.css        # Retro styling and animations
├── index.html           # HTML with Mini App embed metadata
├── farcaster-miniapp.json  # Mini App manifest for Farcaster
├── package.json         # Dependencies including @farcaster/miniapp-sdk
├── vite.config.ts       # Build configuration
├── tsconfig.json        # TypeScript configuration
├── env.example          # Environment variables template
└── README.md           # Project documentation
```

## Farcaster Mini App Integration

### 1. SDK Integration
- **Package**: `@farcaster/miniapp-sdk` added to dependencies
- **Initialization**: SDK initialized in `App.tsx` with `sdk.actions.ready()`
- **Error Handling**: Graceful fallback if SDK fails to load

### 2. Embed Metadata
The `index.html` includes proper Mini App embed metadata:
```html
<meta property="fc:miniapp" content='{"version":"1","imageUrl":"...","button":{"title":"🎮 Play Frame Breaker","action":{"type":"post","url":"..."}}}'>
```

### 3. Mini App Manifest
`farcaster-miniapp.json` contains:
- App metadata (name, description, tags)
- Required capabilities (`actions.ready`, `actions.close`)
- Asset URLs for icons and screenshots
- Category and classification information

### 4. Performance Optimizations
- Preconnect hints for Farcaster Auth Server
- Optimized bundle size with Vite
- Responsive design for mobile and desktop clients

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Set up environment: Copy `env.example` to `.env`
3. Start dev server: `npm run dev`
4. Test in Farcaster Developer Mode

### Production Build
1. Build the app: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Update URLs in `farcaster-miniapp.json`
4. Submit for Farcaster Mini App review

## Key Features

### Game Features
- AI-generated levels using Google Gemini
- Retro 80s aesthetics with neon colors
- Power-ups and power-downs
- High score leaderboard
- Responsive controls for mobile and desktop

### Mini App Features
- Native Farcaster integration
- Ready for Quick Auth implementation
- Social sharing capabilities
- Optimized for Farcaster client viewports

## Required Assets

For full Mini App functionality, create these assets:
- `icon.png` (512x512px) - App icon
- `og-image.png` (1200x630px) - Open Graph image
- `splash.png` (1200x630px) - Splash screen
- `hero.png` - Hero image for directory
- `screenshot1.png`, `screenshot2.png`, `screenshot3.png` - Game screenshots

## Next Steps

1. **Authentication**: Implement Farcaster Quick Auth for user profiles
2. **Social Features**: Add score sharing and leaderboards
3. **Notifications**: Implement push notifications for achievements
4. **Analytics**: Add Mini App usage tracking
5. **Testing**: Comprehensive testing in Farcaster clients

## Resources

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Mini App SDK Reference](https://miniapps.farcaster.xyz/docs/sdk)
- [Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
- [Mini App Guidelines](https://miniapps.farcaster.xyz/docs/guidelines)
