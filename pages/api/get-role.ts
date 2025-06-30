import { NextApiRequest, NextApiResponse } from 'next';
import { getPlayerRole, gameState } from '../../lib/gameState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { playerId } = req.query;

  if (!playerId || typeof playerId !== 'string') {
    return res.status(400).json({ message: 'Player ID is required' });
  }

  console.log('🔍 GET ROLE REQUEST:', {
    playerId,
    totalPlayersStored: gameState.players.length,
    storedPlayerIds: gameState.players.map(p => ({ id: p.id, name: p.name }))
  });

  try {
    // Find the player first
    const player = gameState.players.find(p => p.id === playerId);
    
    if (!player) {
      console.log('❌ PLAYER NOT FOUND:', {
        requestedId: playerId,
        availableIds: gameState.players.map(p => p.id),
        isRoundActive: gameState.isRoundActive
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found' 
      });
    }

    console.log('✅ PLAYER FOUND:', { id: player.id, name: player.name });
    
    const role = getPlayerRole(playerId);
    
    res.status(200).json({
      success: true,
      isSpy: role.isSpy,
      prompt: role.prompt,
      message: role.isSpy ? 'You are the spy.' : role.prompt,
      playerName: player.name,
    });
  } catch (error) {
    console.log('💥 GET ROLE ERROR:', error);
    res.status(500).json({ message: 'Failed to get player role' });
  }
} 