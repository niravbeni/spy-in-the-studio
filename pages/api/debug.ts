import { NextApiRequest, NextApiResponse } from 'next';
import { gameState } from '../../lib/gameState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
} 