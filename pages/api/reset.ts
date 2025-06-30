import { NextApiRequest, NextApiResponse } from 'next';
import { resetGame, gameState } from '../../lib/gameState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔄 RESETTING GAME STATE:', {
    beforeReset: {
      playerCount: gameState.players.length,
      players: gameState.players.map(p => ({ id: p.id, name: p.name })),
      isRoundActive: gameState.isRoundActive
    }
  });

  try {
    resetGame();
    
    console.log('✅ GAME RESET COMPLETE');

    res.status(200).json({
      success: true,
      message: 'Game reset successfully',
      playerCount: gameState.players.length,
    });
  } catch (error) {
    console.log('❌ RESET ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset game' 
    });
  }
} 