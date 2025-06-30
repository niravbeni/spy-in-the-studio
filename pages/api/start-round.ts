import { NextApiRequest, NextApiResponse } from 'next';
import { startRound, gameState } from '../../lib/gameState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Debug logging
  console.log('🎮 START ROUND ATTEMPT:', {
    playerCount: gameState.players.length,
    players: gameState.players.map(p => ({ id: p.id, name: p.name })),
    isRoundActive: gameState.isRoundActive
  });

  try {
    const { prompt, spyId } = startRound();

    console.log('✅ ROUND STARTED:', { prompt, spyId });

    res.status(200).json({
      success: true,
      prompt,
      spyId,
      playerCount: gameState.players.length,
      players: gameState.players.map(p => ({ id: p.id, name: p.name })),
    });
  } catch (error) {
    console.log('❌ START ROUND ERROR:', error);
    
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to start round',
      debug: {
        playerCount: gameState.players.length,
        players: gameState.players.map(p => ({ id: p.id, name: p.name })),
        isRoundActive: gameState.isRoundActive
      }
    });
  }
} 