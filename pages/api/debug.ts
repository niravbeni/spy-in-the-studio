import { NextApiRequest, NextApiResponse } from 'next';
import { getGameState } from '../../lib/gameState';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const gameState = await getGameState();
    
    res.status(200).json({
      success: true,
      gameState: {
        players: gameState.players,
        playerCount: gameState.players.length,
        isRoundActive: gameState.isRoundActive,
        currentPrompt: gameState.currentPrompt,
        spyId: gameState.spyId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 