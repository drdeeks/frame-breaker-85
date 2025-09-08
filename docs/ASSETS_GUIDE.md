# Frame Breaker '85 - Assets & Images Guide

## 📁 Asset Directory Structure

```
Frame Break 85'/
├── public/                    # Static assets served at root URL
│   ├── icon.png              # App icon (512x512px)
│   ├── og-image.png          # Open Graph image (1200x630px)
│   ├── splash.png            # Splash screen (1200x630px)
│   ├── hero.png              # Hero image for directory
│   ├── screenshot1.png       # Game screenshot 1
│   ├── screenshot2.png       # Game screenshot 2
│   ├── screenshot3.png       # Game screenshot 3
│   └── favicon.ico           # Browser favicon
├── src/
│   └── assets/               # Assets imported in code
│       ├── images/           # Game-specific images
│       └── icons/            # UI icons
└── dist/                     # Built assets (auto-generated)
```

## 🖼️ Required Images for Farcaster Mini App

### **1. App Icon (`public/icon.png`)**

- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Purpose**: App icon in Farcaster Mini App directory
- **Design**: Should represent your game clearly at small sizes
- **Example**: Retro arcade cabinet with neon "Frame Breaker '85" text

### **2. Open Graph Image (`public/og-image.png`)**

- **Size**: 1200x630 pixels (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **Purpose**: Preview image when shared on social media
- **Design**: Eye-catching game screenshot with title overlay
- **Example**: Gameplay screenshot with "Frame Breaker '85" title

### **3. Splash Screen (`public/splash.png`)**

- **Size**: 1200x630 pixels
- **Format**: PNG
- **Purpose**: Loading screen shown while Mini App loads
- **Design**: Simple, clean design with game logo
- **Background**: Should match `splashBackgroundColor: "#0d0221"`

### **4. Hero Image (`public/hero.png`)**

- **Size**: 1200x630 pixels (recommended)
- **Format**: PNG
- **Purpose**: Featured image in Mini App directory
- **Design**: Most attractive game screenshot or promotional image

### **5. Screenshots (`public/screenshot1.png`, `screenshot2.png`, `screenshot3.png`)**

- **Size**: 1200x630 pixels (recommended)
- **Format**: PNG
- **Purpose**: Showcase different aspects of your game
- **Suggestions**:
  - Screenshot 1: Main gameplay with power-ups
  - Screenshot 2: Level selection or menu
  - Screenshot 3: High score leaderboard

## 🎨 Design Guidelines

### **Color Palette**

Use your game's existing color scheme:

- **Primary**: `#f21170` (Neon Pink)
- **Secondary**: `#00ffff` (Cyan)
- **Accent**: `#70ff00` (Neon Green)
- **Background**: `#0d0221` (Dark Purple)
- **Text**: `#ffffff` (White)

### **Typography**

- **Font**: "Press Start 2P" (same as your game)
- **Style**: Retro 80s arcade aesthetic
- **Effects**: Neon glow, scanlines, CRT effects

### **Design Elements**

- **Retro Arcade Feel**: Use pixel art, neon effects, scanlines
- **Game Branding**: Consistent "Frame Breaker '85" branding
- **Readability**: Ensure text is legible at all sizes
- **Visual Hierarchy**: Important elements should stand out

## 📝 Image Creation Tips

### **For App Icon (512x512px)**

1. Start with a simple, recognizable design
2. Test at 32x32px to ensure it's still recognizable
3. Use high contrast colors
4. Include the game title clearly

### **For Social Images (1200x630px)**

1. Use the "rule of thirds" for composition
2. Include gameplay elements
3. Add the game title prominently
4. Use your neon color palette
5. Consider adding retro effects (scanlines, glow)

### **For Screenshots**

1. Capture the most exciting moments
2. Show different game states (menu, gameplay, leaderboard)
3. Ensure UI elements are clearly visible
4. Use consistent aspect ratios

## 🔧 Technical Implementation

### **1. Update Discovery File URLs**

After creating your images, update `.well-known/farcaster.json`:

```json
{
  "iconUrl": "https://your-domain.com/icon.png",
  "imageUrl": "https://your-domain.com/og-image.png",
  "splashImageUrl": "https://your-domain.com/splash.png",
  "heroImageUrl": "https://your-domain.com/hero.png",
  "screenshotUrls": [
    "https://your-domain.com/screenshot1.png",
    "https://your-domain.com/screenshot2.png",
    "https://your-domain.com/screenshot3.png"
  ]
}
```

### **2. Update Manifest URLs**

Also update `farcaster-miniapp.json`:

```json
{
  "iconUrl": "https://your-domain.com/icon.png",
  "imageUrl": "https://your-domain.com/og-image.png",
  "splashImageUrl": "https://your-domain.com/splash.png",
  "heroImageUrl": "https://your-domain.com/hero.png",
  "screenshotUrls": [
    "https://your-domain.com/screenshot1.png",
    "https://your-domain.com/screenshot2.png",
    "https://your-domain.com/screenshot3.png"
  ]
}
```

### **3. Update HTML Metadata**

Update `index.html` with your actual image URLs:

```html
<meta property="fc:miniapp" content='{"version":"1","imageUrl":"https://your-domain.com/og-image.png","button":{"title":"🎮 Play Frame Breaker","action":{"type":"post","url":"https://your-domain.com"}}}'>
<meta property="og:image" content="https://your-domain.com/og-image.png">
<meta name="twitter:image" content="https://your-domain.com/og-image.png">
```

### **4. Add Favicon**

Create `public/favicon.ico` for browser tabs:

- **Size**: 16x16, 32x32, 48x48 pixels (multi-size ICO)
- **Design**: Simplified version of your app icon

## 🛠️ Tools for Creating Images

### **Free Online Tools**

- **Canva**: Easy-to-use design tool with templates
- **Figma**: Professional design tool (free tier available)
- **GIMP**: Free Photoshop alternative
- **Piskel**: Free pixel art editor

### **AI Image Generation**

- **Midjourney**: High-quality AI image generation
- **DALL-E**: OpenAI's image generation
- **Stable Diffusion**: Open-source AI image generation

### **Screenshot Tools**

- **ShareX**: Free screen capture tool
- **Greenshot**: Lightweight screenshot tool
- **Built-in**: Use your OS's screenshot tools

## 📋 Asset Checklist

### **Before Deployment**

- [ ] App icon (512x512px) created and placed in `public/`
- [ ] Open Graph image (1200x630px) created and placed in `public/`
- [ ] Splash screen (1200x630px) created and placed in `public/`
- [ ] Hero image (1200x630px) created and placed in `public/`
- [ ] 3 screenshots (1200x630px) created and placed in `public/`
- [ ] Favicon (multi-size ICO) created and placed in `public/`
- [ ] All URLs updated in `.well-known/farcaster.json` **CRITICAL**
- [ ] All URLs updated in `farcaster-miniapp.json`
- [ ] All URLs updated in `index.html`
- [ ] `.well-known/farcaster.json` accessible at your domain
- [ ] Images tested at different sizes
- [ ] Images optimized for web (compressed)

### **Testing Checklist**

- [ ] App icon looks good at 32x32px
- [ ] Social images look good when shared
- [ ] Splash screen loads quickly
- [ ] All images display correctly in browser
- [ ] Images work in Farcaster Developer Mode

## 🚀 Deployment Notes

### **Local Development**

- Images in `public/` are served at `http://localhost:5173/`
- Example: `public/icon.png` → `http://localhost:5173/icon.png`

### **Production Deployment**

- Deploy to Vercel, Netlify, or similar
- Update all URLs to your production domain
- Ensure images are publicly accessible
- Test all image URLs work correctly

## 📚 Resources

- [Farcaster Mini App Guidelines](https://miniapps.farcaster.xyz/docs/guidelines)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

**Remember**: Your images are the first impression users will have of your Mini App. Make them count! 🎮✨
