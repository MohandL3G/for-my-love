# For My Love (ذكرى اعترافي لشهد) - Technical & Architecture Guide

This document contains full technical details, configuration guidelines, reverse-engineering notes, and deployment procedures for the **For My Love** project.

---

## 🌟 Overview

A self-contained, romantic love days counter web application dedicated to Mohand & Shahed. Originally reverse-engineered from a protected LoveLoom template (`https://love.tsonit.com/daysmohsha1903`), purified from anti-devtools / tracker scripts, fully localized into Arabic, and enhanced with a multi-event swipe carousel.

---

## 📁 Repository Structure

```text
for-my-love/
├── index.html                   # Main semantic HTML5 document (Arabic RTL)
├── events.json                  # Simple event configuration (titles, dates, avatars)
├── README.md                    # Minimal user-facing summary
├── AGENTS.md                    # Comprehensive technical & operational documentation
└── assets/
    ├── css/
    │   └── style.css            # Responsive styles, animated gradients, liquid SVG aura
    ├── js/
    │   ├── events.js            # Default fallback events configuration
    │   └── script.js            # GSAP animations, swipe gesture handler, live countdown
    ├── images/
    │   ├── mohand.jpg           # Mohand's profile photo (JFIF 250x250)
    │   ├── shahed.jpg           # Shahed's profile photo (JFIF 640x640)
    │   ├── favicon.png          # Browser favicon (512x512 PNG)
    │   └── og-image.webp        # OpenGraph preview card
    └── audio/
        └── background-music.mp3 # Soft romantic background music (128 kbps stereo)
```

---

## ⚙️ How to Add and Edit Events (`events.json`)

To add or modify events, simply edit `events.json` in the root directory. Any changes take effect immediately on page refresh without needing to rebuild or restart the container:

```json
[
  {
    "id": "confession",
    "title": "ذكرى اعترافي لشهد",
    "startDate": "2025-07-14",
    "partner1": {
      "name": "مهند",
      "avatar": "assets/images/mohand.jpg"
    },
    "partner2": {
      "name": "شهد",
      "avatar": "assets/images/shahed.jpg"
    }
  },
  {
    "id": "first-date",
    "title": "أول لقاء بيننا",
    "startDate": "2025-05-20",
    "partner1": {
      "name": "مهند",
      "avatar": "assets/images/mohand.jpg"
    },
    "partner2": {
      "name": "شهد",
      "avatar": "assets/images/shahed.jpg"
    }
  }
]
```

### Swiping & Controls
- **Mobile**: Swipe left or right with your finger across the screen.
- **Desktop**: Click the left `<` and right `>` navigation buttons, use keyboard arrow keys (`←` / `→`), or click on the pagination dots at the bottom.

---

## 💎 Features & Technical Stack

1. **Liquid Heart SVG**:
   - Filter `url(#liquid-effect)` combines gaussian blur and color matrix to render liquid physics.
   - 3 overlapping waves (`#wave1`, `#wave2`, `#wave3`) moving horizontally via GSAP.
   - Water level adjusts smoothly based on total elapsed days relative to 3,652 days (10 years).
2. **Arabic Typography & Grammar**:
   - Arabic text inside the heart: `حب` (top), dynamic count (center), `يوم` (bottom).
   - Partner names: `مهند` & `شهد`.
   - Milestones formatted with authentic Arabic pluralization:
     - 1 day: `بقي يوم واحد على 500 يوم!`
     - 2 days: `بقي يومان على 500 يوم!`
     - 3–10 days: `بقي X أيام على 500 يوم!`
     - 11+ days: `بقي X يوم على 500 يوم!`
3. **Autoplay Music Manager**:
   - Listens to first user interaction (`click`, `touchstart`, `keydown`, `scroll`) to bypass browser audio autoplay restrictions smoothly.
   - Volume icon toggle button in the top right.
4. **Fullscreen Manager**:
   - Toggle button in the top left for mobile and desktop immersive view.

---

## 🐳 Docker Deployment on CT 100 (Angie Minimal)

The container runs on CT 100 alongside `cv` with an identical hardened Angie setup:

- **Host Port**: `8091` mapped to container port `8080`.
- **Image**: `docker.angie.software/angie:1.12.3-minimal`
- **Compose Directory**: `/root/compose/for-my-love/docker-compose.yml`
- **Angie Config**: `/root/compose/for-my-love/angie.conf`
- **Web Root**: `/root/appdata/for-my-love` (mounted read-only)
- **Container Hardening**:
  - Non-root user: `100:101`
  - Read-only root filesystem: `read_only: true`
  - Tmpfs on `/tmp`
  - All capabilities dropped: `cap_drop: ALL`
  - `no-new-privileges: true`
  - Strict Content-Security-Policy permitting self-hosted media and styles.
