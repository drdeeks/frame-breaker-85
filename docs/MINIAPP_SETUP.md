# Frame Breaker '85 - Farcaster Mini App Setup

## Project Structure

```
Frame Break 85'/
├── src/
│   ├── App.tsx          # Main game component with Farcaster SDK integration
│   ├── main.tsx         # React app entry point
│   └── index.css        # Retro styling and animations
├── .well-known/
│   └── farcaster.json   # REQUIRED: Farcaster Mini App discovery file
├── public/              # Static assets served at root URL
│   ├── icon.png         # App icon (512x512px)
│   ├── og-image.png     # Open Graph image (1200x630px)
│   ├── splash.png       # Splash screen (1200x630px)
│   ├── hero.png         # Hero image for directory
│   ├── screenshot1.png  # Game screenshot 1
│   ├── screenshot2.png  # Game screenshot 2
│   └── screenshot3.png  # Game screenshot 3
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
- **Initialization**: SDK initialized in `App.tsx` with `sdk.actions.ready()` (CRITICAL - prevents infinite loading)
- **Error Handling**: Graceful fallback if SDK fails to load
- **Node.js Requirement**: Version 22.11.0 or higher (specified in package.json)

### 2. Embed Metadata

The `index.html` includes proper Mini App embed metadata:

```html
<meta property="fc:miniapp" content='{"version":"1","imageUrl":"...","button":{"title":"🎮 Play Frame Breaker","action":{"type":"post","url":"..."}}}'>
```

### 3. Mini App Discovery File

`.well-known/farcaster.json` contains:

- App metadata (name, description, tags)
- Required capabilities (`actions.ready`, `actions.close`, `actions.notify`)
- Asset URLs for icons and screenshots
- Category and classification information
- **CRITICAL**: This file must be accessible at `https://your-domain.com/.well-known/farcaster.json`
- **Primary Discovery**: This is the main way Farcaster clients discover your Mini App

### 4. Mini App Manifest

`farcaster-miniapp.json` contains:

- Additional manifest information for development tools
- Backup configuration for Mini App discovery
- Consistent metadata with discovery file

### 4. Performance Optimizations

- Preconnect hints for Farcaster Auth Server
- Optimized bundle size with Vite
- Responsive design for mobile and desktop clients

## Development Workflow

### Local Development

1. **Verify Node.js version**: `node --version` (must be 22.11.0 or higher)
2. Install dependencies: `npm install`
3. Set up environment: Copy `env.example` to `.env`
4. Start dev server: `npm run dev`
5. **Enable Developer Mode**: Visit <https://farcaster.xyz/~/settings/developer-tools>
6. Test in Farcaster Developer Mode

### Production Build

1. Build the app: `npm run build`
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Update URLs in `.well-known/farcaster.json` and `farcaster-miniapp.json`
4. Verify `.well-known/farcaster.json` is accessible at your domain
5. Submit for Farcaster Mini App review

## Key Features

### Game Features

- AI-generated levels using Google Gemini
- Retro 80s aesthetics with neon colors
- Power-ups and power-downs
- High score leaderboard
- Responsive controls for mobile and desktop

### Mini App Features

- Native Farcaster integration with proper SDK initialization
- Ready for Quick Auth implementation
- Social sharing capabilities with embed metadata
- Optimized for Farcaster client viewports
- Notification support (actions.notify capability)
- Proper splash screen handling

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
- [Getting Started Guide](https://miniapps.farcaster.xyz/docs/getting-started)
- [Mini App SDK Reference](https://miniapps.farcaster.xyz/docs/sdk)
- [Developer Tools](https://farcaster.xyz/~/settings/developer-tools)
- [Mini App Guidelines](https://miniapps.farcaster.xyz/docs/guidelines)
- [Manifest vs Embed Guide](https://miniapps.farcaster.xyz/docs/guides/manifest-vs-embed)
- [Loading Guide](https://miniapps.farcaster.xyz/docs/guides/loading)
