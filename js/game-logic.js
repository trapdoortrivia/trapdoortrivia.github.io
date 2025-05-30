// Core Game Logic and Mechanics

// Game Flow Controller
class GameController {
    constructor() {
        this.isActive = false;
        this.currentCorrectAnswer = null;
        this.questionStartTime = null;
    }
    
    // Start a new question round
    async startQuestion(question, correctAnswer, difficulty) {
        this.isActive = true;
        this.currentCorrectAnswer = correctAnswer;
        this.questionStartTime = Date.now();
        
        // Enable player movement
        gameState.setCanMove(true);
        
        // Reset all trapdoor states
        this.resetTrapdoorStates();
        
        console.log(`Question started: ${question.question}, Correct: ${correctAnswer}, Difficulty: ${difficulty}`);
    }
    
    // End the current question
    endQuestion() {
        this.isActive = false;
        gameState.setCanMove(false);
        
        console.log('Question ended');
    }
    
    // Reset visual states of all trapdoors
    resetTrapdoorStates() {
        for (let i = 0; i < 3; i++) {
            const trapdoor = document.getElementById(`trapdoor${i}`);
            if (trapdoor) {
                trapdoor.classList.remove('dropping', 'safe');
            }
        }
    }
    
    // Check if a player's position is correct
    isCorrectPosition(position) {
        return position === this.currentCorrectAnswer;
    }
    
    // Get time elapsed since question started
    getElapsedTime() {
        return this.questionStartTime ? Date.now() - this.questionStartTime : 0;
    }
}

// Timer Controller
class TimerController {
    constructor() {
        this.interval = null;
        this.timeLeft = 0;
        this.duration = 0;
        this.callbacks = {
            onTick: null,
            onWarning: null,
            onExpire: null
        };
    }
    
    // Start countdown timer
    start(duration, callbacks = {}) {
        this.stop(); // Clear any existing timer
        
        this.duration = duration;
        this.timeLeft = duration;
        this.callbacks = { ...this.callbacks, ...callbacks };
        
        // Initial call
        if (this.callbacks.onTick) {
            this.callbacks.onTick(this.timeLeft, this.duration);
        }
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            
            // Tick callback
            if (this.callbacks.onTick) {
                this.callbacks.onTick(this.timeLeft, this.duration);
            }
            
            // Warning zone (last 3 seconds)
            if (this.timeLeft <= 3 && this.timeLeft > 0) {
                if (this.callbacks.onWarning) {
                    this.callbacks.onWarning(this.timeLeft);
                }
            }
            
            // Timer expired
            if (this.timeLeft <= 0) {
                this.stop();
                if (this.callbacks.onExpire) {
                    this.callbacks.onExpire();
                }
            }
        }, 1000);
    }
    
    // Stop the timer
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    // Get remaining time
    getTimeLeft() {
        return this.timeLeft;
    }
    
    // Get progress as percentage
    getProgress() {
        return this.duration > 0 ? (this.timeLeft / this.duration) * 100 : 0;
    }
}

// Player Movement Controller
class MovementController {
    constructor() {
        this.allowMovement = false;
        this.currentPlayerPosition = 1; // Start in middle
    }
    
    // Enable/disable player movement
    setMovementEnabled(enabled) {
        this.allowMovement = enabled;
        gameState.setCanMove(enabled);
    }
    
    // Move player to new position
    async movePlayer(newPosition) {
        if (!this.allowMovement || newPosition === this.currentPlayerPosition) {
            return false;
        }
        
        if (newPosition < 0 || newPosition > 2) {
            console.warn('Invalid trapdoor position:', newPosition);
            return false;
        }
        
        // Update visual position
        const playerEmoji = document.querySelector('.my-player-emoji');
        if (playerEmoji) {
            const newContainer = document.getElementById(`players${newPosition}`);
            if (newContainer) {
                newContainer.appendChild(playerEmoji);
            }
        }
        
        // Update state
        this.currentPlayerPosition = newPosition;
        gameState.setPosition(newPosition);
        
        // Update database for players
        if (gameState.role === 'player' && gameState.playerId) {
            try {
                await supabase.update('players', gameState.playerId, {
                    position: newPosition,
                    last_activity: new Date().toISOString()
                });
            } catch (error) {
                console.warn('Failed to update player position in database:', error);
            }
        }
        
        // Play movement sound
        playSound('movePlayer');
        
        return true;
    }
    
    // Get current player position
    getCurrentPosition() {
        return this.currentPlayerPosition;
    }
    
    // Handle keyboard input for movement
    handleKeyboardMovement(event) {
        if (!this.allowMovement) return;
        
        let newPosition = this.currentPlayerPosition;
        
        switch (event.key.toLowerCase()) {
            case 'arrowleft':
            case 'a':
                newPosition = Math.max(0, this.currentPlayerPosition - 1);
                break;
            case 'arrowright':
            case 'd':
                newPosition = Math.min(2, this.currentPlayerPosition + 1);
                break;
            case '1':
                newPosition = 0;
                break;
            case '2':
                newPosition = 1;
                break;
            case '3':
                newPosition = 2;
                break;
        }
        
        if (newPosition !== this.currentPlayerPosition) {
            event.preventDefault();
            this.movePlayer(newPosition);
        }
    }
}

// Question Manager
class QuestionManager {
    constructor() {
        this.currentQuestionBank = {};
        this.usedQuestions = new Set();
        this.currentQuestion = null;
    }
    
    // Load questions from database or config
    async loadQuestions() {
        try {
            this.currentQuestionBank = await supabase.getAllQuestionsGrouped();
            console.log('Questions loaded:', Object.keys(this.currentQuestionBank));
        } catch (error) {
            console.error('Failed to load questions:', error);
            // Use fallback questions
            this.currentQuestionBank = this.getFallbackQuestions();
        }
    }
    
    // Get a random question for specified difficulty
    getRandomQuestion(difficulty = 'easy') {
        const questionBank = this.currentQuestionBank[difficulty];
        if (!questionBank || questionBank.length === 0) {
            console.warn(`No questions available for difficulty: ${difficulty}`);
            return null;
        }
        
        // Try to get unused question first
        const availableQuestions = questionBank.filter((_, index) => 
            !this.usedQuestions.has(`${difficulty}-${index}`)
        );
        
        let selectedBank = availableQuestions.length > 0 ? availableQuestions : questionBank;
        let questionIndex = Math.floor(Math.random() * selectedBank.length);
        
        // If we used all questions, reset the used set
        if (availableQuestions.length === 0) {
            this.usedQuestions.clear();
        }
        
        // Mark question as used
        this.usedQuestions.add(`${difficulty}-${questionIndex}`);
        
        this.currentQuestion = selectedBank[questionIndex];
        return {
            ...this.currentQuestion,
            index: questionIndex
        };
    }
    
    // Get fallback questions if database fails
    getFallbackQuestions() {
        return {
            easy: [
                { question: "What color is the sky?", answers: ["Blue", "Green", "Purple"], correct: 0 },
                { question: "How many legs does a dog have?", answers: ["2", "4", "6"], correct: 1 },
                { question: "What is 2 + 2?", answers: ["3", "4", "5"], correct: 1 },
                { question: "What do bees make?", answers: ["Honey", "Milk", "Bread"], correct: 0 },
                { question: "How many days in a week?", answers: ["5", "6", "7"], correct: 2 }
            ],
            medium: [
                { question: "What is the capital of France?", answers: ["London", "Berlin", "Paris"], correct: 2 },
                { question: "How many continents are there?", answers: ["5", "6", "7"], correct: 2 },
                { question: "What year did WW2 end?", answers: ["1943", "1945", "1947"], correct: 1 },
                { question: "What is the square root of 144?", answers: ["10", "12", "14"], correct: 1 },
                { question: "Which planet is the Red Planet?", answers: ["Venus", "Mars", "Jupiter"], correct: 1 }
            ],
            hard: [
                { question: "What is the capital of Mongolia?", answers: ["Ulaanbaatar", "Astana", "Bishkek"], correct: 0 },
                { question: "How many bones are in the human body?", answers: ["196", "206", "216"], correct: 1 },
                { question: "What is the speed of light in m/s?", answers: ["299,792,458", "186,000", "670,616,629"], correct: 0 },
                { question: "What is the atomic number of Gold?", answers: ["47", "79", "92"], correct: 1 },
                { question: "What is the smallest country?", answers: ["Monaco", "Vatican City", "San Marino"], correct: 1 }
            ]
        };
    }
    
    // Reset used questions (for new games)
    resetUsedQuestions() {
        this.usedQuestions.clear();
    }
}

// Animation Controller
class AnimationController {
    // Animate trapdoor dropping
    static dropTrapdoor(trapdoorIndex) {
        const trapdoor = document.getElementById(`trapdoor${trapdoorIndex}`);
        if (trapdoor) {
            trapdoor.classList.add('dropping');
        }
    }
    
    // Animate trapdoor as safe
    static markTrapdoorSafe(trapdoorIndex) {
        const trapdoor = document.getElementById(`trapdoor${trapdoorIndex}`);
        if (trapdoor) {
            trapdoor.classList.add('safe');
        }
    }
    
    // Animate player falling
    static animatePlayerFall(playerEmoji) {
        if (playerEmoji) {
            playerEmoji.classList.add('falling');
            
            // Remove player after animation
            setTimeout(() => {
                if (playerEmoji.parentNode) {
                    playerEmoji.remove();
                }
            }, 1500);
        }
    }
    
    // Create sudden death visual effects
    static activateSuddenDeathMode() {
        document.body.classList.add('sudden-death');
        
        const stageLights = document.getElementById('stageLights');
        if (stageLights) {
            stageLights.classList.add('sudden-death');
        }
        
        const indicator = document.getElementById('suddenDeathIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
    }
    
    // Remove sudden death effects
    static deactivateSuddenDeathMode() {
        document.body.classList.remove('sudden-death');
        
        const stageLights = document.getElementById('stageLights');
        if (stageLights) {
            stageLights.classList.remove('sudden-death');
        }
        
        const indicator = document.getElementById('suddenDeathIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }
}

// Global instances
const gameController = new GameController();
const timerController = new TimerController();
const movementController = new MovementController();
const questionManager = new QuestionManager();

// Global helper functions
function initializeGameLogic() {
    // Load questions
    questionManager.loadQuestions();
    
    // Set up keyboard controls
    document.addEventListener('keydown', (e) => {
        movementController.handleKeyboardMovement(e);
    });
    
    console.log('Game logic initialized');
}

// Utility functions for game flow
function getTimerDuration(difficulty, isSuddenDeath = false) {
    if (isSuddenDeath) {
        return GAME_CONFIG.timers.suddenDeath;
    }
    return GAME_CONFIG.timers[difficulty] || GAME_CONFIG.timers.easy;
}

function shouldActivateSuddenDeath(playersAlive) {
    return playersAlive === 2 && !gameState.suddenDeath;
}

function isGameOver(playersAlive) {
    return playersAlive <= 1;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.gameController = gameController;
    window.timerController = timerController;
    window.movementController = movementController;
    window.questionManager = questionManager;
    window.AnimationController = AnimationController;
    window.initializeGameLogic = initializeGameLogic;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gameStage') || document.querySelector('.game-stage')) {
        initializeGameLogic();
    }
});
