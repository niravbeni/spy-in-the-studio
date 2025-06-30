import { NextApiRequest, NextApiResponse } from 'next';
import { resetGame, getGameState } from '../../lib/gameState';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get current state for debugging
    const currentState = await getGameState();
    
    console.log('🔄 RESETTING GAME STATE:', {
      beforeReset: {
        playerCount: currentState.players.length,
        players: currentState.players.map(p => ({ id: p.id, name: p.name })),
        isRoundActive: currentState.isRoundActive
      }
    });

    await resetGame();
    
    // Get state after reset
    const newState = await getGameState();
    
    console.log('✅ GAME RESET COMPLETE');

    res.status(200).json({
      success: true,
      message: 'Game reset successfully',
      playerCount: newState.players.length,
    });
  } catch (error) {
    console.log('❌ RESET ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset game' 
    });
  }
} 