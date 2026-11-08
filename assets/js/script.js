/**
 * For My Love - Multi-Event Love Counter & Interactive Atmosphere
 * Supports events.json with swipe gestures (mobile & desktop)
 */

// Music Manager
const musicManager = {
    audio: null,
    isUnlocked: false,
    isAttemptingPlay: false,
    state: 'idle',
    _unlockEvents: ['touchstart', 'click', 'keydown', 'scroll'],
    _unlockHandlerRef: null,

    _startAutoplayBypass() {
        if (this.isUnlocked || !this.audio) return;
        this._unlockHandlerRef = this._unlockHandler.bind(this);
        this._unlockEvents.forEach(eventName => {
            document.addEventListener(eventName, this._unlockHandlerRef, { passive: true, once: false });
        });
    },

    _unlockHandler() {
        if (this.isUnlocked || this.isAttemptingPlay) return;
        this.isAttemptingPlay = true;

        this.audio.play().then(() => {
            this.isUnlocked = true;
            this.updateState('playing');
            this._unlockEvents.forEach(eventName => {
                document.removeEventListener(eventName, this._unlockHandlerRef);
            });
        }).catch(() => {
            // Browser autoplay policy might reject without direct click, retry on next interaction
        }).finally(() => {
            this.isAttemptingPlay = false;
        });
    },

    _setupAudio(sourceUrl = 'assets/audio/background-music.mp3') {
        this.audio = new Audio(sourceUrl);
        this.audio.loop = true;
        this.audio.volume = 0.7;
        this.attachEventListeners();
        this.updateState('ready');
    },

    init() {
        this.updateState('loading');
        this._setupAudio();
        this._startAutoplayBypass();

        const toggleBtn = document.getElementById('toggle-audio');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePlayback());
        }
    },

    play() {
        if (!this.audio || this.state === 'loading') return Promise.reject();
        const playPromise = this.audio.play();
        playPromise.then(() => {
            this.isUnlocked = true;
            this.updateState('playing');
        }).catch(error => {
            if (error.name === 'NotAllowedError') {
                this.updateState('paused');
            } else {
                this.updateState('error');
            }
        });
        return playPromise;
    },

    pause() {
        if (this.audio) {
            this.audio.pause();
            this.updateState('paused');
        }
    },

    togglePlayback() {
        if (!this.audio) return;
        this.isUnlocked = true;
        if (this.audio.paused) {
            this.play();
        } else {
            this.pause();
        }
    },

    updateState(newState) {
        this.state = newState;
        this.updateUI();
    },

    updateUI() {
        const audioIcon = document.getElementById('audio-icon');
        if (!audioIcon) return;
        if (!this.audio || this.audio.paused) {
            audioIcon.classList.remove('fa-volume-high');
            audioIcon.classList.add('fa-volume-xmark');
        } else {
            audioIcon.classList.remove('fa-volume-xmark');
            audioIcon.classList.add('fa-volume-high');
        }
    },

    attachEventListeners() {
        if (!this.audio) return;
        this.audio.onplay = () => this.updateState('playing');
        this.audio.onpause = () => this.updateState('paused');
        this.audio.onvolumechange = () => this.updateUI();
    }
};

// Fullscreen Manager
const fullscreenManager = {
    toggleBtn: document.getElementById('toggle-fullscreen'),
    iconElement: document.getElementById('fullscreen-icon'),

    isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    },

    updateIcon() {
        if (!this.iconElement) return;
        if (this.isFullscreen()) {
            this.iconElement.classList.remove('fa-expand');
            this.iconElement.classList.add('fa-compress');
        } else {
            this.iconElement.classList.remove('fa-compress');
            this.iconElement.classList.add('fa-expand');
        }
    },

    toggle() {
        if (!this.isFullscreen()) {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.msRequestFullscreen) {
                el.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },

    init() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
            document.addEventListener('fullscreenchange', () => this.updateIcon());
            document.addEventListener('webkitfullscreenchange', () => this.updateIcon());
            document.addEventListener('mozfullscreenchange', () => this.updateIcon());
            document.addEventListener('MSFullscreenChange', () => this.updateIcon());
        }
    }
};

// Event Manager (Supports multiple events with swipe navigation)
const eventManager = {
    events: [],
    currentIndex: 0,

    elements: {
        title: document.getElementById('event-title'),
        startDateDisplay: document.getElementById('start-date'),
        timer: document.getElementById('timer'),
        milestones: document.getElementById('milestones-text'),
        dayCountInHeart: document.getElementById('day-count-in-heart'),
        waterLevelGroup: document.getElementById('water-level-group'),
        partner1Img: document.getElementById('partner1-img'),
        partner1Name: document.getElementById('partner1-name'),
        partner2Img: document.getElementById('partner2-img'),
        partner2Name: document.getElementById('partner2-name'),
        dotsContainer: document.getElementById('event-dots'),
        prevBtn: document.getElementById('prev-event'),
        nextBtn: document.getElementById('next-event'),
        heartContainer: document.querySelector('.heart-container'),
        particleContainer: document.getElementById('particle-container'),
        rippleContainer: document.getElementById('ripple-container'),
        heartSvg: document.querySelector('.heart-svg'),
    },

    async loadEvents() {
        try {
            const response = await fetch('events.json', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    this.events = data;
                    return;
                }
            }
        } catch (err) {
            console.warn('Could not load events.json, falling back to default configuration:', err);
        }

        // Fallback to window.DEFAULT_LOVE_EVENTS
        this.events = (window.DEFAULT_LOVE_EVENTS && window.DEFAULT_LOVE_EVENTS.length > 0)
            ? window.DEFAULT_LOVE_EVENTS
            : [
                {
                    title: "ذكرى اعترافي لشهد",
                    startDate: "2025-07-14",
                    partner1: { name: "مهند", avatar: "assets/images/mohand.jpg" },
                    partner2: { name: "شهد", avatar: "assets/images/shahed.jpg" }
                }
            ];
    },

    getCurrentEvent() {
        return this.events[this.currentIndex] || this.events[0];
    },

    getStartDate() {
        const ev = this.getCurrentEvent();
        const dateStr = ev.startDate || "2025-07-14";
        return new Date(dateStr + "T00:00:00");
    },

    formatMilestone(daysToMilestone, nextMilestoneDay) {
        let dayUnit = "يوم";
        let daysStr = "";

        if (daysToMilestone === 1) {
            daysStr = "يوم واحد";
        } else if (daysToMilestone === 2) {
            daysStr = "يومان";
        } else if (daysToMilestone >= 3 && daysToMilestone <= 10) {
            daysStr = `${daysToMilestone} أيام`;
        } else {
            daysStr = `${daysToMilestone} يوم`;
        }

        return `✨ بقي ${daysStr} على ${nextMilestoneDay} يوم! ✨`;
    },

    updateWaterLevel(totalDays) {
        const GOAL_IN_DAYS = 3652;
        const MAX_FILL_PERCENTAGE = 90;
        const HEART_HEIGHT = 448;
        const HEART_TOP_Y = 32;

        let progressPercentage = (Math.max(0, totalDays) / GOAL_IN_DAYS) * 100;
        progressPercentage = Math.min(progressPercentage, MAX_FILL_PERCENTAGE);
        const targetY = (HEART_TOP_Y + HEART_HEIGHT) - (progressPercentage / 100) * HEART_HEIGHT;

        if (window.gsap && this.elements.waterLevelGroup) {
            gsap.to(this.elements.waterLevelGroup, {
                y: targetY,
                duration: 1.2,
                ease: 'power2.out'
            });
        }
    },

    renderCurrentEvent(animate = false) {
        const ev = this.getCurrentEvent();
        const startDate = this.getStartDate();
        const now = new Date();
        const diff = now - startDate;
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        const partner1 = ev.partner1 || { name: "مهند", avatar: "assets/images/mohand.jpg" };
        const partner2 = ev.partner2 || { name: "شهد", avatar: "assets/images/shahed.jpg" };

        const updateContent = () => {
            if (this.elements.title) this.elements.title.textContent = ev.title;
            if (this.elements.dayCountInHeart) this.elements.dayCountInHeart.textContent = totalDays >= 0 ? totalDays : 0;

            if (this.elements.startDateDisplay) {
                const day = String(startDate.getDate()).padStart(2, '0');
                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                const year = startDate.getFullYear();
                this.elements.startDateDisplay.textContent = `${day}/${month}/${year}`;
            }

            if (this.elements.milestones) {
                const nextMilestoneDay = Math.ceil((Math.max(0, totalDays) + 1) / 100) * 100;
                const daysToMilestone = nextMilestoneDay - totalDays;
                this.elements.milestones.textContent = this.formatMilestone(daysToMilestone, nextMilestoneDay);
            }

            if (this.elements.partner1Name) this.elements.partner1Name.textContent = partner1.name;
            if (this.elements.partner1Img && partner1.avatar) this.elements.partner1Img.src = partner1.avatar;

            if (this.elements.partner2Name) this.elements.partner2Name.textContent = partner2.name;
            if (this.elements.partner2Img && partner2.avatar) this.elements.partner2Img.src = partner2.avatar;

            this.updateWaterLevel(totalDays);
            this.updateDots();
            this.updateNavButtons();
        };

        if (animate && window.gsap) {
            gsap.timeline()
                .to([this.elements.title, this.elements.dayCountInHeart, this.elements.startDateDisplay, this.elements.milestones], {
                    opacity: 0.2,
                    scale: 0.95,
                    duration: 0.15,
                    onComplete: updateContent
                })
                .to([this.elements.title, this.elements.dayCountInHeart, this.elements.startDateDisplay, this.elements.milestones], {
                    opacity: 1,
                    scale: 1,
                    duration: 0.25,
                    ease: 'back.out(2)'
                });
        } else {
            updateContent();
        }
    },

    updateLiveClock() {
        if (!this.elements.timer) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.elements.timer.textContent = `${hours}:${minutes}:${seconds}`;
    },

    createDots() {
        if (!this.elements.dotsContainer) return;
        this.elements.dotsContainer.innerHTML = '';
        if (this.events.length <= 1) return;

        this.events.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `event-dot ${idx === this.currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goTo(idx));
            this.elements.dotsContainer.appendChild(dot);
        });
    },

    updateDots() {
        if (!this.elements.dotsContainer) return;
        const dots = this.elements.dotsContainer.querySelectorAll('.event-dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === this.currentIndex);
        });
    },

    updateNavButtons() {
        const hasMultiple = this.events.length > 1;
        if (this.elements.prevBtn) {
            this.elements.prevBtn.classList.toggle('hidden', !hasMultiple);
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.classList.toggle('hidden', !hasMultiple);
        }
    },

    next() {
        if (this.events.length <= 1) return;
        this.currentIndex = (this.currentIndex + 1) % this.events.length;
        this.renderCurrentEvent(true);
    },

    prev() {
        if (this.events.length <= 1) return;
        this.currentIndex = (this.currentIndex - 1 + this.events.length) % this.events.length;
        this.renderCurrentEvent(true);
    },

    goTo(index) {
        if (index === this.currentIndex || index < 0 || index >= this.events.length) return;
        this.currentIndex = index;
        this.renderCurrentEvent(true);
    },

    initSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 45;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Only trigger if horizontal movement is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                // In RTL layout:
                // Swipe Left (deltaX < 0) moves forward to next
                // Swipe Right (deltaX > 0) moves backward to prev
                if (deltaX < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }, { passive: true });

        // Keyboard arrow navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.next();
            } else if (e.key === 'ArrowRight') {
                this.prev();
            }
        });

        // Desktop button clicks
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.next());
        }
    },

    async init() {
        await this.loadEvents();
        this.createDots();
        this.renderCurrentEvent(false);
        this.initSwipeGestures();
        this.updateLiveClock();

        // 1-second live clock update
        setInterval(() => this.updateLiveClock(), 1000);
    }
};

// Ambient Visual Effects (Hearts & Liquid Waves)
function initAtmosphere() {
    const FLOATING_HEART_COUNT = 70;
    const HEART_CHARS = ['❤️', '💖', '💕', '✨', '🌸', '🥰'];
    const particleContainer = document.getElementById('particle-container');
    const rippleContainer = document.getElementById('ripple-container');
    const heartSvg = document.querySelector('.heart-svg');
    const heartContainer = document.querySelector('.heart-container');

    if (!window.gsap) return;

    // SVG wave animations
    gsap.to("#wave1", { x: -512, duration: 8, repeat: -1, ease: 'none' });
    gsap.to("#wave2", { x: -512, duration: 12, repeat: -1, ease: 'none' });
    gsap.to("#wave3", { x: -512, duration: 16, repeat: -1, ease: 'none' });

    // Floating ambient hearts
    if (particleContainer) {
        for (let i = 0; i < FLOATING_HEART_COUNT; i++) {
            let particle = document.createElement('div');
            particle.innerHTML = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
            particle.style.cssText = 'position:absolute; user-select:none; will-change:transform,opacity; font-size:' + (Math.random() * 14 + 14) + 'px;';
            particleContainer.appendChild(particle);

            gsap.timeline({ repeat: -1, delay: gsap.utils.random(0, 15) })
                .fromTo(particle, {
                    x: gsap.utils.random(0, window.innerWidth),
                    y: window.innerHeight + 100,
                    opacity: 0.9,
                    scale: gsap.utils.random(0.5, 1.4)
                }, {
                    y: -100,
                    x: `+=${gsap.utils.random(-180, 180)}`,
                    opacity: 0,
                    duration: gsap.utils.random(12, 28),
                    ease: 'none'
                }, 0);
        }
    }

    // Heart pulsing heartbeat
    if (heartSvg) {
        gsap.to(heartSvg, {
            scale: 1.05,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }

    // Entrance animation
    gsap.to(".love-container", { opacity: 1, duration: 1, delay: 0.2 });
    gsap.from(".love-container > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
    });

    // Heart click burst
    if (heartContainer) {
        heartContainer.addEventListener('click', () => {
            gsap.fromTo(heartSvg, { scale: 1.05 }, {
                scale: 1.12,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                ease: 'back.out(3)'
            });

            for (let i = 0; i < 12; i++) {
                const burstHeart = document.createElement('div');
                burstHeart.innerHTML = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
                burstHeart.style.cssText = `position:absolute; top:50%; left:50%; pointer-events:none; font-size:${Math.random()*22+16}px; z-index:10;`;
                heartContainer.appendChild(burstHeart);

                gsap.to(burstHeart, {
                    x: (Math.random() - 0.5) * 350,
                    y: (Math.random() - 0.5) * 350,
                    opacity: 0,
                    scale: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    onComplete: () => burstHeart.remove()
                });
            }
        });
    }

    // Click background ripples
    document.addEventListener('click', (e) => {
        if (e.target.closest('.love-container') || e.target.closest('button')) return;

        if (rippleContainer) {
            for (let i = 0; i < 5; i++) {
                const ripple = document.createElement('div');
                ripple.innerHTML = '❤️';
                ripple.style.cssText = `position:absolute; left:${e.clientX}px; top:${e.clientY}px; font-size:24px; pointer-events:none; z-index:5;`;
                rippleContainer.appendChild(ripple);

                gsap.to(ripple, {
                    x: (Math.random() - 0.5) * 150,
                    y: (Math.random() - 0.5) * 150,
                    opacity: 0,
                    scale: 0.2,
                    duration: 1,
                    ease: 'power2.out',
                    onComplete: () => ripple.remove()
                });
            }
        }
    });
}

// Initialise everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    musicManager.init();
    fullscreenManager.init();
    eventManager.init();
    initAtmosphere();
});
