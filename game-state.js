// Global Game State Management - Complete Fixed Version
const gameState = {
    // Player/Host identification
    role: null,
    gameCode: null,
    gameId: null,
    playerId: null,
    playerName: null,
    playerEmoji: null,
    
    // Game progress
    currentQuestion: 0,
    currentQuestionIndex: null,
    difficulty: 'easy',
    suddenDeath: false,
    
    // Player state
    currentPosition: -1,
    canMove: false,
    isAlive: true,
    
    // Game data
    questions: {},
    playersAlive: [],
    
    // Timers and intervals
    timerInterval: null,
    pollInterval: null,
    currentTimer: 5,
    
    // UI state
    playerToKick: null,
    
    // Initialize state
    init() {
        console.log('Initializing game state...');
        this.loadFromStorage();
        console.log('Game state after init:', this.getDebugInfo());
    },
    
    // Reset all state
    reset() {
        console.log('Resetting game state...');
        this.role = null;
        this.gameCode = null;
        this.gameId = null;
        this.playerId = null;
        this.playerName = null;
        this.playerEmoji = null;
        this.currentQuestion = 0;
        this.currentQuestionIndex = null;
        this.difficulty = 'easy';
        this.suddenDeath = false;
        this.currentPosition = -1;
        this.canMove = false;
        this.isAlive = true;
        this.questions = {};
        this.playersAlive = [];
        this.playerToKick = null;
        
        // Clear intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        this.clearStorage();
    },
    
    // Save state to BOTH sessionStorage AND localStorage for persistence
    saveToStorage() {
        const stateToSave = {
            role: this.role,
            gameCode: this.gameCode,
            gameId: this.gameId,
            playerId: this.playerId,
            playerName: this.playerName,
            playerEmoji: this.playerEmoji,
            currentQuestion: this.currentQuestion,
            currentQuestionIndex: this.currentQuestionIndex,
            difficulty: this.difficulty,
            suddenDeath: this.suddenDeath,
            currentPosition: this.currentPosition,
            isAlive: this.isAlive,
            questions: this.questions,
            timestamp: Date.now()
        };
        
        try {
            const stateString = JSON.stringify(stateToSave);
            console.log('Saving state:', stateString);
            
            // Save to both storages for redundancy
            sessionStorage.setItem('trapdoorTriviaState', stateString);
            localStorage.setItem('trapdoorTriviaState', stateString);
            
            console.log('State saved successfully');
        } catch (error) {
            console.error('Failed to save state to storage:', error);
        }
    },
    
    // Load state from storage (try both sessionStorage and localStorage)
    loadFromStorage() {
        try {
            // Try sessionStorage first, then localStorage
            let saved = sessionStorage.getItem('trapdoorTriviaState');
            if (!saved) {
                saved = localStorage.getItem('trapdoorTriviaState');
                console.log('Using localStorage fallback');
            }
            
            console.log('Raw saved state:', saved);
            
            if (saved) {
                const state = JSON.parse(saved);
                console.log('Parsed state:', state);
                
                // Manually assign each property to be extra sure
                this.role = state.role || null;
                this.gameCode = state.gameCode || null;
                this.gameId = state.gameId || null;
                this.playerId = state.playerId || null;
                this.playerName = state.playerName || null;
                this.playerEmoji = state.playerEmoji || null;
                this.currentQuestion = state.currentQuestion || 0;
                this.currentQuestionIndex = state.currentQuestionIndex || null;
                this.difficulty = state.difficulty || 'easy';
                this.suddenDeath = state.suddenDeath || false;
                this.currentPosition = state.currentPosition || -1;
                this.isAlive = state.isAlive !== undefined ? state.isAlive : true;
                this.questions = state.questions || {};
                
                console.log('Game state loaded successfully. Game code:', this.gameCode);
            } else {
                console.log('No saved state found');
            }
        } catch (error) {
            console.error('Failed to load state from storage:', error);
        }
    },
    
    // Clear stored state
    clearStorage() {
        try {
            sessionStorage.removeItem('trapdoorTriviaState');
            localStorage.removeItem('trapdoorTriviaState');
            localStorage.removeItem('trapdoorTriviaRole');
            localStorage.removeItem('trapdoorTriviaIsHost');
            localStorage.removeItem('trapdoorTriviaPlayerId');
            sessionStorage.removeItem('trapdoorTriviaRole');
            sessionStorage.removeItem('trapdoorTriviaIsHost');
            console.log('Storage cleared');
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }
    },
    
    // Set game code with extra validation
    setGameCode(code) {
        if (!code) {
            console.error('Attempted to set null/undefined game code');
            return;
        }
        
        const cleanCode = code.toString().toUpperCase().trim();
        console.log('Setting game code:', cleanCode);
        
        if (!/^[A-Z]{4}$/.test(cleanCode)) {
            console.error('Invalid game code format:', cleanCode);
            return;
        }
        
        this.gameCode = cleanCode;
        this.saveToStorage();
        
        console.log('Game code saved:', this.gameCode);
    },
    
    // Set game role with better validation
    setRole(role) {
        if (role === 'host' || role === 'player') {
            console.log('Setting role:', role);
            this.role = role;
            this.saveToStorage();
        } else if (role === null || role === undefined) {
            console.log('Clearing role');
            this.role = null;
            this.saveToStorage();
        } else {
            console.error('Invalid role:', role);
        }
    },
    
    // Clear role and all indicators
    clearRole() {
        console.log('Clearing role and host indicators');
        this.role = null;
        
        // Clear all host indicators
        try {
            localStorage.removeItem('trapdoorTriviaRole');
            localStorage.removeItem('trapdoorTriviaIsHost');
            sessionStorage.removeItem('trapdoorTriviaRole');
            sessionStorage.removeItem('trapdoorTriviaIsHost');
        } catch (error) {
            console.warn('Failed to clear storage:', error);
        }
        
        this.saveToStorage();
    },
    
    // Set player info safely
    setPlayerInfo(name, emoji) {
        console.log('Setting player info:', name, emoji);
        try {
            this.playerName = name;
            this.playerEmoji = emoji;
            this.saveToStorage();
            console.log('Player info set successfully');
        } catch (error) {
            console.error('Error setting player info:', error);
        }
    },
    
    // Set difficulty
    setDifficulty(difficulty) {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
            this.difficulty = difficulty;
            this.saveToStorage();
        } else {
            console.error('Invalid difficulty:', difficulty);
        }
    },
    
    // Enable/disable sudden death mode
    setSuddenDeath(enabled) {
        this.suddenDeath = enabled;
        if (enabled) {
            this.difficulty = 'hard';
        }
        this.saveToStorage();
    },
    
    // Update player position
    setPosition(position) {
        if (position >= -1 && position <= 2) {
            this.currentPosition = position;
            this.saveToStorage();
        } else {
            console.error('Invalid position:', position);
        }
    },
    
    // Set movement permission
    setCanMove(canMove) {
        this.canMove = canMove;
    },
    
    // Set alive status
    setAlive(alive) {
        this.isAlive = alive;
        this.saveToStorage();
    },
    
    // Update questions
    setQuestions(questions) {
        this.questions = questions || {};
        this.saveToStorage();
    },
    
    // Get current question for difficulty
    getCurrentQuestion() {
        const difficulty = this.suddenDeath ? 'hard' : this.difficulty;
        const questionBank = this.questions[difficulty];
        
        if (!questionBank || !questionBank[this.currentQuestionIndex]) {
            return null;
        }
        
        return questionBank[this.currentQuestionIndex];
    },
    
    // Get timer duration for current difficulty
    getTimerDuration() {
        if (this.suddenDeath) {
            return GAME_CONFIG.timers.suddenDeath || 5;
        }
        return GAME_CONFIG.timers[this.difficulty] || GAME_CONFIG.timers.easy || 5;
    },
    
    // Check if player is on correct trapdoor
    isOnCorrectTrapdoor(correctAnswer) {
        return this.currentPosition === correctAnswer;
    },
    
    // Get player count for game start validation
    hasMinimumPlayers() {
        return this.playersAlive.length >= (GAME_CONFIG.minPlayers || 2);
    },
    
    // Check if sudden death should activate
    shouldActivateSuddenDeath() {
        return this.playersAlive.length === 2 && !this.suddenDeath;
    },
    
    // Check if game should end
    shouldEndGame() {
        return this.playersAlive.length <= 1;
    },
    
    // Debug info
    getDebugInfo() {
        return {
            role: this.role,
            gameCode: this.gameCode,
            gameId: this.gameId,
            playerId: this.playerId,
            playerName: this.playerName,
            playerEmoji: this.playerEmoji,
            currentPosition: this.currentPosition,
            difficulty: this.difficulty,
            suddenDeath: this.suddenDeath,
            isAlive: this.isAlive,
            canMove: this.canMove,
            playersAlive: this.playersAlive.length,
            hasStorage: !!sessionStorage.getItem('trapdoorTriviaState'),
            timestamp: Date.now()
        };
    }
};

// Initialize game state when script loads
console.log('Game state script loaded, initializing...');
gameState.init();

// Save state before page unload
window.addEventListener('beforeunload', () => {
    console.log('Page unloading, saving state...');
    gameState.saveToStorage();
});

// Save state when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden, saving state...');
        gameState.saveToStorage();
    }
});

// Save state periodically as backup
setInterval(() => {
    if (gameState.gameCode) {
        gameState.saveToStorage();
    }
}, 5000);

// Global navigation helper with forced state save
function navigateTo(page) {
    console.log('Navigating to:', page);
    gameState.saveToStorage();
    
    // Wait a bit to ensure save completes
    setTimeout(() => {
        window.location.href = page;
    }, 50);
}

// Global back to home helper
function backToHome() {
    gameState.reset();
    window.location.href = 'index.html';
}

// Expose debug function globally
window.debugGameState = () => {
    console.log('=== GAME STATE DEBUG ===');
    console.log(gameState.getDebugInfo());
    console.log('Raw sessionStorage:', sessionStorage.getItem('trapdoorTriviaState'));
    console.log('Raw localStorage:', localStorage.getItem('trapdoorTriviaState'));
    console.log('Role storage:', {
        localStorage: localStorage.getItem('trapdoorTriviaRole'),
        sessionStorage: sessionStorage.getItem('trapdoorTriviaRole'),
        isHost: localStorage.getItem('trapdoorTriviaIsHost')
    });
    console.log('========================');
};
