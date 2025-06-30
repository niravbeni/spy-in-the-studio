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

// Hot-reload resistant game state - survives Next.js development reloads
declare global {
  // eslint-disable-next-line no-var
  var __gameState: GameState | undefined;
}

// Initialize or get existing game state
function initializeGameState(): GameState {
  if (global.__gameState) {
    console.log('🔄 REUSING EXISTING GAME STATE:', {
      players: global.__gameState.players.length,
      isRoundActive: global.__gameState.isRoundActive
    });
    return global.__gameState;
  }

  console.log('🆕 CREATING NEW GAME STATE');
  const newState: GameState = {
    players: [],
    currentPrompt: null,
    currentPromptIndex: null,
    spyId: null,
    isRoundActive: false,
  };
  
  global.__gameState = newState;
  return newState;
}

// Get the persistent game state
export const gameState = initializeGameState();

// Sync state to global storage after changes
function syncStateToGlobal(): void {
  global.__gameState = gameState;
}

export function addPlayer(player: Player): void {
  const existingPlayerIndex = gameState.players.findIndex(p => p.id === player.id);
  
  if (existingPlayerIndex >= 0) {
    // Update existing player's name
    gameState.players[existingPlayerIndex].name = player.name;
  } else {
    // Add new player
    gameState.players.push(player);
  }
  
  syncStateToGlobal();
}

export function startRound(): { prompt: string; spyId: string } {
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

  syncStateToGlobal();

  return {
    prompt: selectedPrompt,
    spyId: selectedSpyId,
  };
}

export function getPlayerRole(playerId: string): { isSpy: boolean; prompt: string | null } {
  if (!gameState.isRoundActive || gameState.currentPromptIndex === null) {
    return { isSpy: false, prompt: null };
  }

  const isSpy = gameState.spyId === playerId;
  return {
    isSpy,
    prompt: isSpy ? REDACTED_PROMPTS[gameState.currentPromptIndex] : gameState.currentPrompt,
  };
}

export function resetGame(): void {
  gameState.players = [];
  gameState.currentPrompt = null;
  gameState.currentPromptIndex = null;
  gameState.spyId = null;
  gameState.isRoundActive = false;
  
  syncStateToGlobal();
} 