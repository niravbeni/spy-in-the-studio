import { NextApiRequest, NextApiResponse } from 'next';
import { getGameState, addPlayer } from '../../lib/gameState';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const gameState = await getGameState();
    
    // Add test functionality for simulating many players
    if (req.method === 'POST' && req.body.action === 'addTestPlayers') {
      const count = req.body.count || 30;
      
      for (let i = 1; i <= count; i++) {
        const testPlayer = {
          id: `test-player-${i}-${Date.now()}`,
          name: `Test Player ${i}`
        };
        await addPlayer(testPlayer);
      }
      
      const updatedGameState = await getGameState();
      
      return res.json({
        success: true,
        message: `Added ${count} test players`,
        playerCount: updatedGameState.players.length
      });
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
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 