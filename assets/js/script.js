/**
 * Love Days Counter - For Mohand & Shahed
 * "ذكرى اعترافي لشهد"
 */

window.dataLoveDaysCounter = {
    settings: {
        startDate: "2025-07-14",
        birthday1: "1999-08-09",
        birthday2: "2003-12-30",
        nickname1: "Mohand",
        nickname2: "Shahed",
        timezone: "Africa/Tripoli"
    },
    title: "ذكرى اعترافي لشهد",
    data: {
        title: "ذكرى اعترافي لشهد",
        type_music: "system",
        backgroundMusic: "assets/audio/background-music.mp3"
    }
};

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
            // Browser autoplay policy might reject without direct click, will retry on next interaction
        }).finally(() => {
            this.isAttemptingPlay = false;
        });
    },

    _setupAudio(sourceUrl = null) {
        const audioSrc = sourceUrl || window.dataLoveDaysCounter?.data?.backgroundMusic || 'assets/audio/background-music.mp3';
        this.audio = new Audio(audioSrc);
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

document.addEventListener('DOMContentLoaded', () => {
    // Initialise audio and fullscreen managers
    musicManager.init();
    fullscreenManager.init();

    const defaultLang = {
        error_missing_data: 'Error: Configuration data not found.',
        error_invalid_date: 'Error: Invalid start date.',
        milestone_prefix: '✨',
        milestone_suffix: 'left until',
        day_unit: 'days',
    };

    const lang = Object.assign({}, defaultLang, window.loveDaysLang);

    const settings = window.dataLoveDaysCounter.settings;
    const startDateString = settings.startDate;
    const startDate = new Date(startDateString + 'T00:00:00');

    const FLOATING_HEART_COUNT = 70;
    const HEART_CHARS = ['❤️', '💖', '💕', '✨', '🌸', '🥰'];
    const GOAL_IN_DAYS = 3652;
    const MAX_FILL_PERCENTAGE = 90;
    const HEART_HEIGHT = 448;
    const HEART_TOP_Y = 32;

    const elements = {
        timer: document.getElementById('timer'),
        startDateDisplay: document.getElementById('start-date'),
        milestones: document.getElementById('milestones-text'),
        heartContainer: document.querySelector('.heart-container'),
        particleContainer: document.getElementById('particle-container'),
        rippleContainer: document.getElementById('ripple-container'),
        dayCountInHeart: document.getElementById('day-count-in-heart'),
        heartSvg: document.querySelector('.heart-svg'),
        waterLevelGroup: document.getElementById('water-level-group'),
    };

    function updateWaterLevel(totalDays) {
        let progressPercentage = (totalDays / GOAL_IN_DAYS) * 100;
        progressPercentage = Math.min(progressPercentage, MAX_FILL_PERCENTAGE);
        const targetY = (HEART_TOP_Y + HEART_HEIGHT) - (progressPercentage / 100) * HEART_HEIGHT;

        if (window.gsap && elements.waterLevelGroup) {
            gsap.to(elements.waterLevelGroup, {
                y: targetY,
                duration: 1.5,
                ease: 'power2.out'
            });
        }
    }

    function updateAll() {
        const now = new Date();
        const diff = now - startDate;
        const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (elements.dayCountInHeart) {
            elements.dayCountInHeart.textContent = totalDays;
        }

        if (elements.timer) {
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            elements.timer.textContent = `${hours}:${minutes}:${seconds}`;
        }

        if (elements.milestones) {
            const nextMilestoneDay = Math.ceil((totalDays + 1) / 100) * 100;
            const daysToMilestone = nextMilestoneDay - totalDays;
            elements.milestones.textContent = `${lang.milestone_prefix} ${daysToMilestone} ${lang.day_unit} ${lang.milestone_suffix} ${nextMilestoneDay} ${lang.day_unit}! ✨`;
        }

        updateWaterLevel(totalDays);
    }

    // SVG wave animations
    if (window.gsap) {
        gsap.to("#wave1", { x: -512, duration: 8, repeat: -1, ease: 'none' });
        gsap.to("#wave2", { x: -512, duration: 12, repeat: -1, ease: 'none' });
        gsap.to("#wave3", { x: -512, duration: 16, repeat: -1, ease: 'none' });

        // Floating ambient hearts
        for (let i = 0; i < FLOATING_HEART_COUNT; i++) {
            let particle = document.createElement('div');
            particle.innerHTML = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
            particle.style.cssText = 'position:absolute; user-select:none; will-change:transform,opacity; font-size:' + (Math.random() * 14 + 14) + 'px;';
            elements.particleContainer.appendChild(particle);

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

        // Heart pulsing heartbeat
        gsap.to(elements.heartSvg, {
            scale: 1.05,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });

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
    }

    // Heart click burst
    if (elements.heartContainer) {
        elements.heartContainer.addEventListener('click', () => {
            if (window.gsap) {
                gsap.fromTo(elements.heartSvg, { scale: 1.05 }, {
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
                    elements.heartContainer.appendChild(burstHeart);

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
            }
        });
    }

    // Click background ripples
    document.addEventListener('click', (e) => {
        if (e.target.closest('.love-container') || e.target.closest('button')) return;

        if (window.gsap && elements.rippleContainer) {
            for (let i = 0; i < 5; i++) {
                const ripple = document.createElement('div');
                ripple.innerHTML = '❤️';
                ripple.style.cssText = `position:absolute; left:${e.clientX}px; top:${e.clientY}px; font-size:24px; pointer-events:none; z-index:5;`;
                elements.rippleContainer.appendChild(ripple);

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

    if (elements.startDateDisplay) {
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const year = startDate.getFullYear();
        elements.startDateDisplay.textContent = `${day}/${month}/${year}`;
    }

    updateAll();
    setInterval(updateAll, 1000);
});
