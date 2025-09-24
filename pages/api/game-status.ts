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
      players: gameState.players.map(p => ({ id: p.id, name: p.name })),
      playerCount: gameState.players.length,
      isRoundActive: gameState.isRoundActive,
      currentPrompt: gameState.currentPrompt,
      spyId: gameState.spyId,
      roundNumber: gameState.roundNumber || 1,
    });
  } catch (error) {
    console.error('Game status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game status'
    });
  }
} 