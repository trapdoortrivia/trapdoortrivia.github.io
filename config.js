// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://vqptianxqbkszubewbpe.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcHRpYW54cWJrc3p1YmV3YnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzQyNjksImV4cCI6MjA2NDA1MDI2OX0.efNbl6KGaLOx2w0VWk8ThL3K7rPYfSSXv1Vmo1dMdFw'
};

// External Asset URLs (replace with your hosted URLs)
const ASSET_URLS = {
    // Images
    logo: 'https://i.imgur.com/PrO9PRX.png', // Replace with your logo URL
    favicon: 'https://i.imgur.com/zqwuJhV.png', // Replace with your favicon URL
    
    // Audio files
    sounds: {
        join: 'YOUR_JOIN_SOUND_URL_HERE',
        countdown: 'YOUR_COUNTDOWN_SOUND_URL_HERE',
        correct: 'YOUR_CORRECT_SOUND_URL_HERE',
        fall: 'YOUR_FALL_SOUND_URL_HERE',
        suddenDeath: 'YOUR_SUDDEN_DEATH_SOUND_URL_HERE',
        victory: 'YOUR_VICTORY_SOUND_URL_HERE',
        houseWins: 'YOUR_HOUSE_WINS_SOUND_URL_HERE',
        buttonClick: 'YOUR_BUTTON_CLICK_SOUND_URL_HERE',
        movePlayer: 'YOUR_MOVE_PLAYER_SOUND_URL_HERE'
    }
};

// Game Configuration
const GAME_CONFIG = {
    // Available emojis for players (reduced to fit on screen nicely)
    availableEmojis: [
        '😀', '😎', '🤠', '🥳', '🤖', '👻', '🦄', '🐉', '🦁', '🐯', 
        '🐸', '🐧', '🦊', '🐺', '🦝', '🐹', '🐰', '🐻', '🐼', '🐨', 
        '🦥', '🦦', '🦔', '🦇', '🦉', '🦅', '🦆', '🦢', '🦩', '🦚'
    ],
    
    // Timer durations (in seconds)
    timers: {
        easy: 5,
        medium: 10,
        hard: 15,
        suddenDeath: 5
    },
    
    // Minimum players to start game
    minPlayers: 2,
    
    // Poll intervals (in milliseconds)
    pollInterval: 500,
    hostPollInterval: 1000,
    
    // Game cleanup delay (in milliseconds)
    cleanupDelay: 5000
};

// Color Scheme
const COLORS = {
    primary: '#97c1a9',    // Dusty green
    secondary: '#55cbcd',  // Faded blue  
    danger: '#ffb8b1',     // Pink red
    background: '#030303', // Dark background
    menuDark: '#343434',   // Menu dark gray
    menuLight: '#959595'   // Menu light gray
};
