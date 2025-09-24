import { supabase } from './supabase'

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  players: Player[];
  currentPrompt: string | null;
  currentPromptIndex: number | null;
  spyId: string | null;
  isRoundActive: boolean;
  roundNumber: number;
}

export const HMW_PROMPTS = [
  "How might we design a ritual for the end of the world?",
  "How might we reinvent eating for zero-gravity environments?",
  "How might we create a dating experience for pets?",
  "How might we build trust between strangers in public spaces?",
  "How might we design a workplace that nurtures introverts?",
  "How might we help people share food without touching it?",
  "How might we design a shop that sells no physical products?",
  "How might we help people express their mood through wearable technology?",
  "How might we enable neighbors to share and trade electricity?",
  "How might we design a communication tool that doesn't use words?",
];

// Redacted versions of prompts for spies - edit these as needed!
export const REDACTED_PROMPTS = [
  "How might we design a XXXX for the XXXX of the XXXX?",                    // ritual for the end of the world
  "How might we reinvent XXXX for XXXX-XXXX XXXX?",                         // eating for zero-gravity environments  
  "How might we create a XXXX XXXX for XXXX?",                              // dating experience for pets
  "How might we build XXXX between XXXX in XXXX XXXX?",                     // trust between strangers in public spaces
  "How might we design a XXXX that XXXX XXXX?",                             // workplace that nurtures introverts
  "How might we help people XXXX XXXX without XXXX it?",                    // share food without touching it
  "How might we design a XXXX that sells no XXXX XXXX?",                    // shop that sells no physical products
  "How might we help people XXXX their XXXX through XXXX XXXX?",            // express their mood through wearable technology
  "How might we enable XXXX to XXXX and XXXX XXXX?",                        // neighbors to share and trade electricity
  "How might we design a XXXX XXXX that doesn't use XXXX?",                 // communication tool that doesn't use words
];

// Constants for Supabase
const GAME_STATE_ID = 'main-game';
const TABLE_NAME = 'game_states';

// Global object to persist state during hot reloads in development
declare global {
  var __spy_game_state: GameState | undefined;
}

// In-memory fallback for development when Supabase is not configured
// Using global to persist through hot reloads
function getMemoryState(): GameState {
  if (!global.__spy_game_state) {
    global.__spy_game_state = {
      players: [],
      currentPrompt: null,
      currentPromptIndex: null,
      spyId: null,
      isRoundActive: false,
      roundNumber: 1,
    };
  }
  return global.__spy_game_state;
}

function setMemoryState(state: GameState): void {
  global.__spy_game_state = state;
}

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  return !!(supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Get game state from Supabase or memory fallback
export async function getGameState(): Promise<GameState> {
  if (!isSupabaseConfigured()) {
    console.log('📝 Using in-memory storage (Supabase not configured)');
    return getMemoryState();
  }

  try {
    const { data, error } = await supabase!
      .from(TABLE_NAME)
      .select('data')
      .eq('id', GAME_STATE_ID)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('Supabase error:', error);
      return getMemoryState();
    }

    if (data && data.data) {
      return data.data as GameState;
    }

    // Return default state if no data found
    return {
      players: [],
      currentPrompt: null,
      currentPromptIndex: null,
      spyId: null,
      isRoundActive: false,
      roundNumber: 1,
    };
  } catch (error) {
    console.log('Supabase error, using fallback:', error);
    return getMemoryState();
  }
}

// Save game state to Supabase or memory fallback
async function saveGameState(state: GameState): Promise<void> {
  if (!isSupabaseConfigured()) {
    setMemoryState(state);
    return;
  }

  try {
    const { error } = await supabase!
      .from(TABLE_NAME)
      .upsert({
        id: GAME_STATE_ID,
        data: state,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.log('Supabase save error:', error);
      setMemoryState(state); // Fallback to memory
    }
  } catch (error) {
    console.log('Supabase save error, using fallback:', error);
    setMemoryState(state);
  }
}

export async function addPlayer(player: Player): Promise<void> {
  const gameState = await getGameState();
  
  const existingPlayerIndex = gameState.players.findIndex(p => p.id === player.id);
  
  if (existingPlayerIndex >= 0) {
    // Update existing player's name
    gameState.players[existingPlayerIndex].name = player.name;
  } else {
    // Add new player
    gameState.players.push(player);
  }
  
  await saveGameState(gameState);
}

export async function startRound(): Promise<{ prompt: string; spyId: string }> {
  const gameState = await getGameState();
  
  if (gameState.players.length < 2) {
    throw new Error('Need at least 2 players to start a round');
  }

  // Select random prompt
  const randomPromptIndex = Math.floor(Math.random() * HMW_PROMPTS.length);
  const selectedPrompt = HMW_PROMPTS[randomPromptIndex];

  // Select random spy
  const randomPlayerIndex = Math.floor(Math.random() * gameState.players.length);
  const selectedSpyId = gameState.players[randomPlayerIndex].id;

  // Update game state
  gameState.currentPrompt = selectedPrompt;
  gameState.currentPromptIndex = randomPromptIndex;
  gameState.spyId = selectedSpyId;
  gameState.isRoundActive = true;
  
  // Increment round number if this is a new round (not the first)
  if (gameState.roundNumber) {
    gameState.roundNumber += 1;
  } else {
    gameState.roundNumber = 1;
  }

  await saveGameState(gameState);

  return {
    prompt: selectedPrompt,
    spyId: selectedSpyId,
  };
}

export async function getPlayerRole(playerId: string): Promise<{ isSpy: boolean; prompt: string | null }> {
  const gameState = await getGameState();
  
  if (!gameState.isRoundActive || gameState.currentPromptIndex === null) {
    return { isSpy: false, prompt: null };
  }

  const isSpy = gameState.spyId === playerId;
  return {
    isSpy,
    prompt: isSpy ? REDACTED_PROMPTS[gameState.currentPromptIndex] : gameState.currentPrompt,
  };
}

export async function resetGame(): Promise<void> {
  const newState: GameState = {
    players: [],
    currentPrompt: null,
    currentPromptIndex: null,
    spyId: null,
    isRoundActive: false,
    roundNumber: 1,
  };
  
  await saveGameState(newState);
} 