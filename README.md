# For My Love (ذكرى اعترافي لشهد) 💕

A beautiful, romantic anniversary & love days counter web application dedicated to Mohand & Shahed.

## ✨ Features

- **Animated Glowing Heart**: SVG-based dynamic heart with an interactive liquid wave level that fills up over time.
- **Heartbeat & Burst Effects**: Ambient heartbeat pulsing, plus explosive heart burst particles on click/touch.
- **Floating Particles & Ripples**: Romantic floating hearts rising smoothly with GSAP animations, plus interactive ripple effects wherever you click.
- **Live Counter & Milestones**:
  - Live calculated love days (`482 days` and counting).
  - Dynamic milestone celebration tracker (e.g., `✨ 18 days left until 500 days! ✨`).
  - Real-time digital clock and confession date display (`14/07/2025`).
- **Profile Connection**:
  - Romantic curved dashed thread connecting Mohand & Shahed's profile pictures with animated floating mini-hearts.
  - Interactive profile image hover and scale effects.
- **Background Music**:
  - Soft romantic background music with smart autoplay bypass on first user interaction.
  - Volume control toggle button (`fa-volume-high` / `fa-volume-xmark`).
- **Fullscreen Mode**: Fullscreen toggle button for an immersive mobile or desktop experience.
- **Completely Self-Contained**: All images, audio, scripts, and styles are stored locally with zero dependencies on third-party server backends.

---

## 📁 Project Structure

```text
for-my-love/
├── index.html                  # Main webpage
├── assets/
│   ├── css/
│   │   └── style.css          # Design, gradients, and keyframe animations
│   ├── js/
│   │   └── script.js          # GSAP animation, date calculation & audio manager
│   ├── images/
│   │   ├── mohand.jpg         # Mohand's profile picture
│   │   ├── shahed.jpg         # Shahed's profile picture
│   │   ├── favicon.png        # Webpage favicon
│   │   └── og-image.webp      # Social preview image
│   └── audio/
│       └── background-music.mp3 # Romantic background music
└── README.md
```

---

## ⚙️ Configuration

You can easily adjust names, dates, or audio in `assets/js/script.js`:

```javascript
window.dataLoveDaysCounter = {
    settings: {
        startDate: "2025-07-14",       // Your anniversary / confession date (YYYY-MM-DD)
        birthday1: "1999-08-09",       // Mohand's birthday
        birthday2: "2003-12-30",       // Shahed's birthday
        nickname1: "Mohand",           // First partner name
        nickname2: "Shahed",           // Second partner name
        timezone: "Africa/Tripoli"     // Preferred timezone
    },
    title: "ذكرى اعترافي لشهد",
    data: {
        title: "ذكرى اعترافي لشهد",
        type_music: "system",
        backgroundMusic: "assets/audio/background-music.mp3"
    }
};
```

---

## 🚀 How to Host on GitHub Pages

1. Create a repository on GitHub (e.g. `for-my-love`).
2. Push this folder to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit of For My Love counter"
   git remote add origin https://github.com/YOUR_USERNAME/for-my-love.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **Settings** > **Pages** in your GitHub repository.
4. Under **Source**, choose **Deploy from a branch**, select branch `main` and folder `/ (root)`, then click **Save**.
5. Your love counter will be live at `https://YOUR_USERNAME.github.io/for-my-love/`!
