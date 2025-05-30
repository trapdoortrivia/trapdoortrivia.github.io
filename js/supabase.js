// Enhanced Supabase Database Client Wrapper
class SimpleSupabase {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    // Insert new record
    async insert(table, data) {
        try {
            console.log(`Inserting into ${table}:`, data);
            
            const response = await fetch(`${this.url}/rest/v1/${table}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Insert failed:`, response.status, errorText);
                throw new Error(`Insert failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`Insert successful:`, result);
            return result;
        } catch (error) {
            console.error('Insert error:', error);
            throw error;
        }
    }

    // Select records with optional query
    async select(table, query = '') {
        try {
            const url = query ? 
                `${this.url}/rest/v1/${table}?${query}` : 
                `${this.url}/rest/v1/${table}`;
                
            console.log(`Selecting from ${table} with query: ${query}`);
            
            const response = await fetch(url, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Select failed:`, response.status, errorText);
                throw new Error(`Select failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`Select successful:`, result);
            return result;
        } catch (error) {
            console.error('Select error:', error);
            throw error;
        }
    }

    // Update record by ID
    async update(table, id, data) {
        try {
            console.log(`Updating ${table} ID ${id}:`, data);
            
            const response = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Update failed:`, response.status, errorText);
                throw new Error(`Update failed: ${response.status} - ${errorText}`);
            }
            
            // For PATCH requests, Supabase might return empty response or the updated data
            let result;
            const responseText = await response.text();
            if (responseText) {
                result = JSON.parse(responseText);
            } else {
                result = { success: true, id: id };
            }
            
            console.log(`Update successful:`, result);
            return result;
        } catch (error) {
            console.error('Update error:', error);
            throw error;
        }
    }

    // Delete records with query
    async delete(table, query) {
        try {
            console.log(`Deleting from ${table} with query: ${query}`);
            
            const response = await fetch(`${this.url}/rest/v1/${table}?${query}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Delete failed:`, response.status, errorText);
                throw new Error(`Delete failed: ${response.status} - ${errorText}`);
            }
            
            console.log(`Delete successful for query: ${query}`);
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }

    // Call stored procedures/functions
    async rpc(functionName, params = {}) {
        try {
            console.log(`Calling RPC function ${functionName} with params:`, params);
            
            const response = await fetch(`${this.url}/rest/v1/rpc/${functionName}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(params)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`RPC failed:`, response.status, errorText);
                throw new Error(`RPC failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log(`RPC ${functionName} successful:`, result);
            return result;
        } catch (error) {
            console.error('RPC error:', error);
            throw error;
        }
    }

    // Enhanced convenience method to check if game exists and is waiting
    async gameExists(code) {
        try {
            if (!code || typeof code !== 'string' || code.length !== 4) {
                console.error('Invalid game code provided:', code);
                return false;
            }
            
            const games = await this.select('games', `code=eq.${code.toUpperCase()}&status=eq.waiting`);
            return games && games.length > 0;
        } catch (error) {
            console.error('Game exists check failed:', error);
            return false;
        }
    }

    // Enhanced convenience method to get alive players for a game
    async getAlivePlayers(gameCode) {
        try {
            if (!gameCode) {
                console.error('No game code provided to getAlivePlayers');
                return [];
            }
            
            return await this.select('players', `game_code=eq.${gameCode.toUpperCase()}&alive=eq.true`);
        } catch (error) {
            console.error('Get alive players failed:', error);
            return [];
        }
    }

    // Enhanced convenience method to get game by code
    async getGame(code) {
        try {
            if (!code || typeof code !== 'string') {
                console.error('Invalid game code provided to getGame:', code);
                return null;
            }
            
            const games = await this.select('games', `code=eq.${code.toUpperCase()}`);
            return games && games.length > 0 ? games[0] : null;
        } catch (error) {
            console.error('Get game failed:', error);
            return null;
        }
    }

    // Enhanced convenience method to update game activity
    async updateGameActivity(gameCode) {
        try {
            if (!gameCode) {
                console.error('No game code provided to updateGameActivity');
                return;
            }
            
            await this.rpc('update_game_activity', { p_game_code: gameCode.toUpperCase() });
        } catch (error) {
            console.error('Update game activity failed:', error);
            // Don't throw - this is not critical
        }
    }

    // Enhanced convenience method to update player activity
    async updatePlayerActivity(playerId) {
        try {
            if (!playerId) {
                console.error('No player ID provided to updatePlayerActivity');
                return;
            }
            
            await this.rpc('update_player_activity', { p_player_id: parseInt(playerId) });
        } catch (error) {
            console.error('Update player activity failed:', error);
            // Don't throw - this is not critical
        }
    }

    // Get questions by difficulty
    async getQuestions(difficulty = null) {
        try {
            const query = difficulty ? `difficulty=eq.${difficulty}` : '';
            return await this.select('questions', query);
        } catch (error) {
            console.error('Get questions failed:', error);
            return [];
        }
    }

    // Get all questions organized by difficulty with proper error handling
    async getAllQuestionsGrouped() {
        try {
            console.log('Loading all questions from database...');
            const questions = await this.select('questions');
            console.log(`Loaded ${questions.length} questions from database`);
            
            if (!questions || questions.length === 0) {
                console.warn('No questions found in database, using fallback questions');
                return this.getFallbackQuestions();
            }
            
            const grouped = questions.reduce((acc, q) => {
                if (!acc[q.difficulty]) acc[q.difficulty] = [];
                acc[q.difficulty].push({
                    question: q.question,
                    answers: [q.answer1, q.answer2, q.answer3],
                    correct: q.correct_answer
                });
                return acc;
            }, {});
            
            console.log('Questions grouped by difficulty:', Object.keys(grouped).map(d => `${d}: ${grouped[d].length}`));
            
            // Ensure we have questions for all difficulties
            const requiredDifficulties = ['easy', 'medium', 'hard'];
            const fallback = this.getFallbackQuestions();
            
            requiredDifficulties.forEach(difficulty => {
                if (!grouped[difficulty] || grouped[difficulty].length === 0) {
                    console.warn(`No ${difficulty} questions found, using fallback`);
                    grouped[difficulty] = fallback[difficulty] || [];
                }
            });
            
            return grouped;
        } catch (error) {
            console.error('Get grouped questions failed:', error);
            console.log('Using fallback questions due to database error');
            return this.getFallbackQuestions();
        }
    }

    // Fallback questions in case database is empty or fails
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

    // Health check function
    async healthCheck() {
        try {
            return await this.rpc('health_check');
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: error.message };
        }
    }

    // Clean up inactive games
    async cleanupInactiveGames() {
        try {
            const result = await this.rpc('cleanup_inactive_games');
            console.log(`Cleaned up ${result} inactive games`);
            return result;
        } catch (error) {
            console.error('Cleanup failed:', error);
            return 0;
        }
    }
}

// Initialize the Supabase client with error handling
let supabase;
try {
    if (!SUPABASE_CONFIG || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
        throw new Error('Supabase configuration is missing or incomplete');
    }
    
    supabase = new SimpleSupabase(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    console.log('Supabase client initialized successfully');
    
    // Test the connection on initialization
    supabase.healthCheck().then(result => {
        console.log('Supabase health check:', result);
    }).catch(error => {
        console.warn('Supabase health check failed:', error);
    });
    
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    
    // Create a mock client that shows errors
    supabase = {
        insert: () => Promise.reject(new Error('Supabase not configured')),
        select: () => Promise.reject(new Error('Supabase not configured')),
        update: () => Promise.reject(new Error('Supabase not configured')),
        delete: () => Promise.reject(new Error('Supabase not configured')),
        rpc: () => Promise.reject(new Error('Supabase not configured')),
        gameExists: () => Promise.resolve(false),
        getAlivePlayers: () => Promise.resolve([]),
        getGame: () => Promise.resolve(null),
        updateGameActivity: () => Promise.resolve(),
        updatePlayerActivity: () => Promise.resolve(),
        getQuestions: () => Promise.resolve([]),
        getAllQuestionsGrouped: () => Promise.resolve({
            easy: [{ question: "Test Question", answers: ["A", "B", "C"], correct: 0 }],
            medium: [{ question: "Test Question", answers: ["A", "B", "C"], correct: 0 }],
            hard: [{ question: "Test Question", answers: ["A", "B", "C"], correct: 0 }]
        }),
        healthCheck: () => Promise.resolve({ status: 'error', message: 'Not configured' }),
        cleanupInactiveGames: () => Promise.resolve(0)
    };
}
