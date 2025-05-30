// Audio Management System
class AudioManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.audioContext = null;
        this.loadedSounds = new Set();
        this.init();
    }
    
    // Initialize audio system
    init() {
        // Try to get stored sound preference
        try {
            const stored = localStorage.getItem('trapdoorTriviaSound');
            if (stored !== null) {
                this.enabled = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load sound preference:', error);
        }
        
        // Initialize Web Audio Context (for fallback beeps)
        this.initAudioContext();
        
        // Preload sound files
        this.preloadSounds();
    }
    
    // Initialize Web Audio Context for fallback sounds
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    // Preload external sound files
    async preloadSounds() {
        const soundPromises = Object.entries(ASSET_URLS.sounds).map(([name, url]) => {
            return this.loadSound(name, url);
        });
        
        // Wait for all sounds to load (or fail)
        await Promise.allSettled(soundPromises);
    }
    
    // Load individual sound file
    async loadSound(name, url) {
        if (!url || url === `YOUR_${name.toUpperCase()}_SOUND_URL_HERE`) {
            // Skip placeholder URLs
            return;
        }
        
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 0.3; // Default volume
            
            // Wait for audio to be ready
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve);
                audio.addEventListener('error', reject);
                audio.load();
            });
            
            this.sounds[name] = audio;
            this.loadedSounds.add(name);
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
        }
    }
    
    // Play sound by name
    async playSound(soundName) {
        if (!this.enabled) return;
        
        // Try to play loaded sound file first
        if (this.sounds[soundName] && this.loadedSounds.has(soundName)) {
            try {
                // Clone the audio to allow overlapping plays
                const audio = this.sounds[soundName].cloneNode();
                audio.volume = 0.3;
                await audio.play();
                return;
            } catch (error) {
                console.warn(`Failed to play sound ${soundName}:`, error);
            }
        }
        
        // Fallback to generated beep
        this.playBeep(soundName);
    }
    
    // Generate beep sounds as fallback
    playBeep(soundName) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Different frequencies for different sounds
            const frequencies = {
                join: 440,           // A4
                countdown: 880,      // A5
                correct: 523.25,     // C5
                fall: 220,           // A3
                victory: 659.25,     // E5
                houseWins: 146.83,   // D3
                buttonClick: 330,    // E4
                movePlayer: 293.66   // D4
            };
            
            const frequency = frequencies[soundName] || 440;
            const duration = soundName === 'fall' ? 0.8 : 0.3;
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = soundName === 'suddenDeath' ? 'sawtooth' : 'sine';
            
            // Volume envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            // Special effects for certain sounds
            if (soundName === 'fall') {
                // Falling pitch effect
                oscillator.frequency.exponentialRampToValueAtTime(frequency / 4, this.audioContext.currentTime + duration);
            } else if (soundName === 'countdown') {
                // Quick beep
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            }
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Failed to play beep:', error);
        }
    }
    
    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        this.saveSoundPreference();
        return this.enabled;
    }
    
    // Enable sounds
    enable() {
        this.enabled = true;
        this.saveSoundPreference();
    }
    
    // Disable sounds
    disable() {
        this.enabled = false;
        this.saveSoundPreference();
    }
    
    // Check if sounds are enabled
    isEnabled() {
        return this.enabled;
    }
    
    // Save sound preference to localStorage
    saveSoundPreference() {
        try {
            localStorage.setItem('trapdoorTriviaSound', JSON.stringify(this.enabled));
        } catch (error) {
            console.warn('Failed to save sound preference:', error);
        }
    }
    
    // Set volume for all sounds
    setVolume(volume) {
        const vol = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(audio => {
            audio.volume = vol * 0.3; // Scale down for comfort
        });
    }
    
    // Unlock audio (required for mobile browsers)
    async unlockAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to unlock audio:', error);
            }
        }
    }
}

// Initialize global audio manager
const audioManager = new AudioManager();

// Global functions for easy access
function playSound(soundName) {
    audioManager.playSound(soundName);
}

function toggleSound() {
    const enabled = audioManager.toggle();
    
    // Update sound toggle button if it exists
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = enabled ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !enabled);
    }
    
    return enabled;
}

function enableSound() {
    audioManager.enable();
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = '🔊';
        soundToggle.classList.remove('muted');
    }
}

function disableSound() {
    audioManager.disable();
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = '🔇';
        soundToggle.classList.add('muted');
    }
}

// Initialize sound toggle button when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.textContent = audioManager.isEnabled() ? '🔊' : '🔇';
        soundToggle.classList.toggle('muted', !audioManager.isEnabled());
    }
});

// Unlock audio on first user interaction (mobile requirement)
document.addEventListener('click', () => {
    audioManager.unlockAudio();
}, { once: true });

document.addEventListener('touchstart', () => {
    audioManager.unlockAudio();
}, { once: true });
