import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { addPlayer, gameState, Player } from '../../lib/gameState';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Player name is required' });
  }

  try {
    const playerId = uuidv4();
    const player: Player = { id: playerId, name };

    console.log('👤 PLAYER JOINING:', { playerId, name });

    addPlayer(player);

    console.log('👤 PLAYER JOINED - Total players:', gameState.players.length);

    res.status(200).json({
      success: true,
      playerId,
      playerCount: gameState.players.length,
    });
  } catch (error) {
    console.log('💥 JOIN ERROR:', error);
    res.status(500).json({ message: 'Failed to join game' });
  }
} 