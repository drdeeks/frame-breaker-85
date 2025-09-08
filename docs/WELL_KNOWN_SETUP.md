# 🔍 .well-known/farcaster.json - Critical Mini App Discovery File

## ⚠️ **CRITICAL REQUIREMENT**

The `.well-known/farcaster.json` file is **MANDATORY** for Farcaster Mini App discovery. Without this file, Farcaster clients cannot find or validate your Mini App.

## 📁 **File Location**

```
Frame Break 85'/
├── .well-known/
│   └── farcaster.json   ← REQUIRED: Must be accessible at your-domain.com/.well-known/farcaster.json
```

## 🌐 **URL Requirements**

After deployment, this file **MUST** be accessible at:

```
https://your-domain.com/.well-known/farcaster.json
```

## 📋 **File Contents**

The file contains the same information as your manifest but serves as the **primary discovery mechanism**:

```json
{
  "version": "1",
  "name": "Frame Breaker '85",
  "iconUrl": "https://your-domain.com/icon.png",
  "homeUrl": "https://your-domain.com",
  "imageUrl": "https://your-domain.com/og-image.png",
  "buttonTitle": "🎮 Play Now",
  "splashImageUrl": "https://your-domain.com/splash.png",
  "splashBackgroundColor": "#0d0221",
  "subtitle": "AI-Powered Brick Smasher",
  "description": "An AI-powered brick breaker game with retro 80s aesthetics...",
  "screenshotUrls": [
    "https://your-domain.com/screenshot1.png",
    "https://your-domain.com/screenshot2.png",
    "https://your-domain.com/screenshot3.png"
  ],
  "primaryCategory": "games",
  "tags": ["game", "arcade", "retro", "ai", "brick-breaker", "80s", "neon"],
  "heroImageUrl": "https://your-domain.com/hero.png",
  "tagline": "Break frames, not hearts",
  "ogTitle": "Frame Breaker '85 - AI-Powered Retro Arcade Game",
  "ogDescription": "Experience the ultimate brick breaker...",
  "ogImageUrl": "https://your-domain.com/og-image.png",
  "requiredCapabilities": ["actions.ready", "actions.close"]
}
```

## 🚀 **Deployment Steps**

### **1. Local Development**

- File is already created in `.well-known/farcaster.json`
- Vite will serve it at `http://localhost:5173/.well-known/farcaster.json`

### **2. Production Deployment**

1. **Deploy your app** to Vercel, Netlify, or similar
2. **Update all URLs** in `.well-known/farcaster.json` to your production domain
3. **Verify accessibility** by visiting `https://your-domain.com/.well-known/farcaster.json`
4. **Test in Farcaster** Developer Mode

### **3. URL Updates Required**

Replace all instances of `https://frame-breaker-85.vercel.app` with your actual domain:

- `iconUrl`
- `homeUrl`
- `imageUrl`
- `splashImageUrl`
- `screenshotUrls` (all 3 URLs)
- `heroImageUrl`
- `ogImageUrl`

## 🔍 **Validation Checklist**

### **Before Deployment**

- [ ] `.well-known/farcaster.json` file exists
- [ ] All URLs point to placeholder domain (for now)
- [ ] JSON syntax is valid
- [ ] All required fields are present

### **After Deployment**

- [ ] All URLs updated to production domain
- [ ] File accessible at `https://your-domain.com/.well-known/farcaster.json`
- [ ] JSON validates correctly
- [ ] Farcaster Developer Mode can discover your Mini App

## 🛠️ **Testing**

### **Local Testing**

```bash
# Start dev server
npm run dev

# Test file accessibility
curl http://localhost:5173/.well-known/farcaster.json
```

### **Production Testing**

```bash
# Test file accessibility
curl https://your-domain.com/.well-known/farcaster.json

# Should return valid JSON
```

## ⚠️ **Common Issues**

### **File Not Found (404)**

- Ensure `.well-known/` directory is deployed
- Check hosting service configuration
- Verify file permissions

### **Invalid JSON**

- Validate JSON syntax
- Check for missing commas or brackets
- Use JSON validator tools

### **Wrong URLs**

- Update all URLs to production domain
- Ensure images are accessible
- Test each URL individually

## 📚 **Resources**

- [Farcaster Mini App Discovery](https://miniapps.farcaster.xyz/docs/discovery)
- [Well-Known URIs RFC](https://tools.ietf.org/html/rfc5785)
- [JSON Validator](https://jsonlint.com/)

## 🎯 **Quick Commands**

```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('.well-known/farcaster.json', 'utf8')))"

# Test local accessibility
curl http://localhost:5173/.well-known/farcaster.json

# Test production accessibility (replace with your domain)
curl https://your-domain.com/.well-known/farcaster.json
```

---

**Remember**: This file is the **primary way** Farcaster discovers your Mini App. Without it, your Mini App won't be found! 🔍✨
