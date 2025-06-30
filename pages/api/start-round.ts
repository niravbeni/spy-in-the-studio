import { NextApiRequest, NextApiResponse } from 'next';
import { startRound, getGameState } from '../../lib/gameState';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current game state for debugging
    const currentState = await getGameState();
    
    // Debug logging
    console.log('🎮 START ROUND ATTEMPT:', {
      playerCount: currentState.players.length,
      players: currentState.players.map(p => ({ id: p.id, name: p.name })),
      isRoundActive: currentState.isRoundActive
    });

    const result = await startRound();
    const gameState = await getGameState();

    console.log('✅ ROUND STARTED:', { prompt: result.prompt, spyId: result.spyId });

    res.status(200).json({
      success: true,
      prompt: result.prompt,
      spyId: result.spyId,
      playerCount: gameState.players.length,
      players: gameState.players,
    });
  } catch (error) {
    console.log('💥 START ROUND ERROR:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to start round' 
    });
  }
} 