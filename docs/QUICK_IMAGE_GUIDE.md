# 🖼️ Quick Image Guide - Frame Breaker '85

## 📁 **Where to Add Your Images**

**Replace the placeholder files in the `public/` folder with your actual images:**

```
public/
├── icon.png              ← Replace with your 512x512px app icon
├── og-image.png          ← Replace with your 1200x630px social image
├── splash.png            ← Replace with your 1200x630px splash screen
├── hero.png              ← Replace with your 1200x630px hero image
├── screenshot1.png       ← Replace with gameplay screenshot
├── screenshot2.png       ← Replace with menu screenshot
├── screenshot3.png       ← Replace with leaderboard screenshot
└── favicon.ico           ← Add your browser favicon (optional)
```

## 🎯 **Quick Steps**

### **1. Create Your Images**

- **App Icon**: 512x512px PNG with transparency
- **Social Images**: 1200x630px PNG/JPG (og-image, splash, hero, screenshots)
- **Use your game's colors**: `#f21170`, `#00ffff`, `#70ff00`, `#0d0221`

### **2. Replace Placeholder Files**

Simply drag and drop your images into the `public/` folder, replacing the placeholder files.

### **3. Update URLs (After Deployment)**

When you deploy to production, update these files:

- `.well-known/farcaster.json` - **CRITICAL**: Change all URLs to your domain
- `farcaster-miniapp.json` - Change all URLs to your domain
- `index.html` - Update the `fc:miniapp` meta tag

## 🎨 **Design Tips**

### **App Icon (512x512px)**

- Simple, recognizable design
- Test at 32x32px to ensure it's clear
- Use high contrast colors
- Include "Frame Breaker '85" text

### **Social Images (1200x630px)**

- Use the "rule of thirds" for composition
- Include gameplay elements
- Add the game title prominently
- Use your neon color palette
- Consider adding retro effects (scanlines, glow)

### **Screenshots**

- Capture exciting gameplay moments
- Show different game states (menu, gameplay, leaderboard)
- Ensure UI elements are clearly visible
- Use consistent aspect ratios

## 🛠️ **Tools You Can Use**

### **Free Online Tools**

- **Canva** (canva.com) - Easy templates
- **Figma** (figma.com) - Professional design
- **GIMP** (gimp.org) - Free Photoshop alternative
- **Piskel** (piskelapp.com) - Pixel art editor

### **AI Image Generation**

- **Midjourney** - High-quality AI images
- **DALL-E** - OpenAI's image generation
- **Stable Diffusion** - Open-source AI

### **Screenshot Tools**

- **ShareX** - Free screen capture
- **Greenshot** - Lightweight screenshot tool
- **Built-in OS tools** - Windows Snipping Tool, macOS Screenshot

## 📋 **Checklist**

- [ ] App icon created (512x512px)
- [ ] Open Graph image created (1200x630px)
- [ ] Splash screen created (1200x630px)
- [ ] Hero image created (1200x630px)
- [ ] 3 screenshots created (1200x630px each)
- [ ] All images placed in `public/` folder
- [ ] Images use your game's color palette
- [ ] Images have good contrast and readability
- [ ] App icon is recognizable at small sizes

## 🚀 **After Adding Images**

1. **Test locally**: Run `npm run dev` and check images load
2. **Deploy**: Push to your hosting service (Vercel, Netlify, etc.)
3. **Update URLs**: Change all image URLs in `farcaster-miniapp.json` and `index.html`
4. **Test in Farcaster**: Use Developer Mode to test your Mini App

## 💡 **Pro Tips**

- **Optimize images** for web (compress them)
- **Use PNG** for images with transparency
- **Use JPG** for photos/screenshots
- **Test on mobile** - images should look good on small screens
- **Keep file sizes reasonable** - under 1MB per image
- **Use consistent branding** across all images

---

**Need help?** Check the full `ASSETS_GUIDE.md` for detailed instructions! 🎮✨
