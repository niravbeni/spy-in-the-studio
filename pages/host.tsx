import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Player {
  id: string;
  name: string;
}

interface GameStatus {
  players: Player[];
  playerCount: number;
  isRoundActive: boolean;
  currentPrompt: string | null;
  spyId: string | null;
  roundNumber: number;
}

export default function HostPage() {
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    players: [],
    playerCount: 0,
    isRoundActive: false,
    currentPrompt: null,
    spyId: null,
    roundNumber: 1,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');

  const fetchGameStatus = async () => {
    try {
      const response = await fetch('/api/game-status');
      const data = await response.json();
      if (data.success) {
        setGameStatus(data);
      }
    } catch (err) {
      // Silently fail for polling
    }
  };

  const startRound = async () => {
    if (gameStatus.playerCount < 2) {
      setError('Need at least 2 players to start a round');
      return;
    }

    setIsStarting(true);
    setError('');

    try {
      const response = await fetch('/api/start-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchGameStatus();
      } else {
        setError(data.message || 'Failed to start round');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const resetGame = async () => {
    if (!confirm('Are you sure you want to reset the game? This will remove all players and clear the current round.')) {
      return;
    }

    setIsResetting(true);
    setError('');

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchGameStatus();
      } else {
        setError(data.message || 'Failed to reset game');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchGameStatus();
    const interval = setInterval(fetchGameStatus, 2000);
    return () => clearInterval(interval);
  }, []);


  const spyName = gameStatus.spyId ? 
    gameStatus.players.find(p => p.id === gameStatus.spyId)?.name : 
    null;

  return (
    <>
      <Head>
        <title>Spy in the Studio - Host Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <div className="dashboard">
          <h1>🎭 Host Dashboard</h1>
          
          <div className="stats">
            <div className="stat-card">
              <div className="stat-number">{gameStatus.playerCount}</div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-indicator">
                {gameStatus.isRoundActive ? '🟢' : '🔴'}
              </div>
              <div className="stat-label">
                {gameStatus.isRoundActive ? 'Round Active' : 'Waiting'}
              </div>
            </div>
          </div>

          <div className={`main-content${gameStatus.isRoundActive ? ' has-round' : ''}`}>
            <div className="players-column">
              <div className={`players-section${gameStatus.playerCount > 0 ? ' has-players' : ''}`}>
                <h2>Players ({gameStatus.playerCount})</h2>
                <div className="players-grid">
                  {gameStatus.players.map((player) => (
                    <div key={player.id} className="player-card">
                      <span className="player-name">{player.name}</span>
                      {gameStatus.isRoundActive && player.id === gameStatus.spyId && (
                        <span className="spy-badge">🕵️ SPY</span>
                      )}
                    </div>
                  ))}
                  {gameStatus.playerCount === 0 && (
                    <div className="empty-state">
                      No players yet. Share the join link!
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="round-column">
              {gameStatus.isRoundActive && (
                <>
                  <div className="round-info">
                    <h3>Round: {gameStatus.roundNumber}</h3>
                  </div>
                  <div className="prompt-card">
                    <strong>Prompt:</strong> {gameStatus.currentPrompt}
                  </div>
                  <div className="spy-info">
                    <strong>Spy:</strong> {spyName}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="controls">
            <button 
              onClick={startRound}
              disabled={isStarting || gameStatus.playerCount < 2 || isResetting}
              className="action-button primary"
            >
              {isStarting ? 'Starting...' : gameStatus.isRoundActive ? 'Next Round' : 'Start Round'}
            </button>

            <button 
              onClick={resetGame}
              disabled={isResetting || isStarting}
              className="action-button secondary"
            >
              {isResetting ? 'Resetting...' : 'Reset Game'}
            </button>
            
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <style jsx>{`
          .container {
            width: 100%;
            height: 100vh;
            height: -webkit-fill-available;
            padding: 20px;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
            touch-action: none;
          }

          .dashboard {
            max-width: 800px;
            width: 100%;
            max-height: calc(100vh - 40px);
            max-height: calc(-webkit-fill-available - 40px);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            touch-action: none;
          }

          h1 {
            text-align: center;
            margin: 0 0 20px 0;
            font-size: 2.2em;
            color: white;
            font-weight: 700;
            flex-shrink: 0;
          }

          .stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
            flex-shrink: 0;
          }

          .stat-card {
            background: rgba(255,255,255,0.15);
            padding: 15px;
            border-radius: 15px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }

          .stat-number {
            font-size: 2.2em;
            font-weight: bold;
            color: white;
            margin-bottom: 5px;
          }

          .stat-indicator {
            font-size: 2em;
            margin-bottom: 10px;
          }

          .stat-label {
            color: rgba(255,255,255,0.8);
            font-weight: 500;
          }

          .players-section {
            margin-bottom: 25px;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            max-height: calc(100vh - 300px);
            overflow: hidden;
          }

          .players-section.has-players {
            background: rgba(255,255,255,0.05);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.1);
          }

          .players-section h2 {
            margin: 0 0 15px 0;
            color: white;
            flex-shrink: 0;
          }

          .players-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
            min-height: 0;
            width: 100%;
            max-width: 100%;
          }

          .players-section.has-players .players-grid {
            overflow-y: auto;
            overflow-x: hidden;
            padding-bottom: 10px;
            padding-right: 5px;
            -webkit-overflow-scrolling: touch;
            border-radius: 10px;
            position: relative;
            max-height: 100%;
            min-height: 200px;
          }
          
          /* Desktop vertical list behavior */
          @media (min-width: 769px) {
            .players-section.has-players .players-grid {
              max-height: calc(100vh - 400px);
            }
          }

          .players-section.has-players .players-grid::after {
            content: '';
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(transparent, rgba(255,255,255,0.05));
            pointer-events: none;
            border-radius: 0 0 10px 10px;
          }

          .players-section.has-players .players-grid::-webkit-scrollbar {
            width: 8px;
          }

          .players-section.has-players .players-grid::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            margin: 5px 0;
          }

          .players-section.has-players .players-grid::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.4);
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.2);
          }

          .players-section.has-players .players-grid::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.6);
          }

          .players-section.has-players .players-grid::-webkit-scrollbar-corner {
            background: transparent;
          }


          .player-card {
            background: rgba(255,255,255,0.15);
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            min-height: 50px;
            flex-shrink: 0;
            transition: background 0.3s;
          }

          .player-card:hover {
            background: rgba(255,255,255,0.2);
          }

          .player-name {
            font-weight: 500;
          }

          .spy-badge {
            background: #e74c3c;
            color: white;
            padding: 3px 8px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
          }

          .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            color: #666;
            padding: 40px;
            background: #f8f9fa;
            border-radius: 10px;
          }

          .round-info {
            background: rgba(255,255,255,0.15);
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 25px;
            flex-shrink: 0;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
          }

          .round-info h3 {
            margin: 0 0 15px 0;
            color: white;
          }

          .prompt-card {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 1.1em;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
          }

          .spy-info {
            color: white;
            font-weight: 500;
          }

          .controls {
            text-align: center;
            margin-bottom: 25px;
            flex-shrink: 0;
          }

          .action-button {
            padding: 14px 28px;
            border: none;
            border-radius: 12px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            min-width: 140px;
            height: auto;
          }

          .action-button.primary {
            background: #667eea;
            color: white;
          }

          .action-button.primary:hover:not(:disabled) {
            background: #5a6fd8;
          }

          .action-button.secondary {
            background: #6c757d;
            color: white;
            margin-left: 10px;
          }

          .action-button.secondary:hover:not(:disabled) {
            background: #5a6268;
          }

          .action-button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }


          .error {
            color: #e74c3c;
            margin: 15px 0;
            padding: 15px;
            background: #fee;
            border-radius: 10px;
            text-align: center;
            flex-shrink: 0;
          }


          @media (max-width: 768px) {
            .container {
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .dashboard {
              height: calc(100vh - 40px);
              height: calc(100dvh - 40px);
              max-height: calc(100vh - 40px);
              max-height: calc(100dvh - 40px);
              width: calc(100% - 40px);
              max-width: calc(100% - 40px);
              padding: 20px;
              margin: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-sizing: border-box;
            }
            
            h1 {
              font-size: 1.8em;
              margin-bottom: 15px;
              flex-shrink: 0;
            }
            
            .stats {
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 15px;
              flex-shrink: 0;
            }
            
            .main-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 0;
              min-height: 0;
            }
            
            .main-content.has-round {
              flex-direction: row;
            }
            
            .round-column {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            
            .players-column {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 0;
            }
            
            .main-content:not(.has-round) .players-column {
              flex: 1;
              max-width: 100%;
            }
            
            .controls {
              flex-shrink: 0;
              margin-top: 0;
              display: flex;
              gap: 10px;
            }
            
            .round-info, .prompt-card {
              flex-shrink: 0;
              margin-bottom: 0;
              padding: 10px;
              font-size: 0.85em;
            }
            
            .prompt-card {
              font-size: 0.8em;
              line-height: 1.3;
            }
            
            .spy-info {
              font-size: 0.85em;
              padding: 8px;
              margin: 0;
              background: rgba(255,255,255,0.15);
              border-radius: 8px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            
            .players-section h2 {
              flex-shrink: 0 !important;
              margin: 0 0 8px 0 !important;
              font-size: 1.1em !important;
            }
            
            .stat-number {
              font-size: 1.8em;
            }
            
            .players-section {
              flex: 1 !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              margin: 0 !important;
              min-height: 0 !important;
              max-height: none !important;
              display: flex !important;
              flex-direction: column !important;
            }
            
            .players-grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
              width: 100% !important;
              padding-bottom: 10px !important;
              overflow: visible !important;
              flex: none !important;
              min-height: auto !important;
            }
            
            .player-card {
              padding: 12px;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            .action-button {
              flex: 1;
              padding: 16px 20px;
              font-size: 1.1em;
              margin: 0;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
              border-radius: 10px;
              min-height: 52px;
            }

            .action-button.secondary {
              margin-left: 0;
            }
            
            .round-info {
              padding: 12px;
              border: none;
              outline: none;
            }
            
            .prompt-card {
              padding: 12px;
              font-size: 1em;
              border: none;
              outline: none;
            }

            .stat-card {
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
          }
          
          @media (max-width: 480px) {
            .container {
              padding: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .dashboard {
              height: calc(100vh - 30px);
              height: calc(100dvh - 30px);
              max-height: calc(100vh - 30px);
              max-height: calc(100dvh - 30px);
              width: calc(100% - 30px);
              max-width: calc(100% - 30px);
              padding: 15px;
              margin: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-sizing: border-box;
              border-radius: 15px;
            }
            
            .main-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 6px;
              min-height: 0;
            }
            
            .main-content.has-round {
              flex-direction: row;
            }
            
            .round-column {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            
            .players-column {
              flex: 1;
              display: flex;
              flex-direction: column;
              min-height: 0;
            }
            
            .main-content:not(.has-round) .players-column {
              flex: 1;
              max-width: 100%;
            }
            
            .players-section {
              flex: 1 !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
              margin: 0 !important;
              min-height: 0 !important;
              max-height: none !important;
              display: flex !important;
              flex-direction: column !important;
            }
            
            .players-grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 6px !important;
              width: 100% !important;
              padding-bottom: 8px !important;
              overflow: visible !important;
              flex: none !important;
              min-height: auto !important;
            }
            
            .controls {
              flex-shrink: 0;
              margin-top: 0;
              display: flex;
              gap: 8px;
            }
            
            .round-info, .prompt-card {
              flex-shrink: 0;
              margin-bottom: 0;
              padding: 8px;
              font-size: 0.8em;
            }
            
            .prompt-card {
              font-size: 0.75em;
              line-height: 1.2;
            }
            
            .spy-info {
              font-size: 0.8em;
              padding: 6px;
              margin: 0;
              background: rgba(255,255,255,0.15);
              border-radius: 6px;
              border: 1px solid rgba(255,255,255,0.2);
            }
            
            .players-section h2 {
              flex-shrink: 0 !important;
              margin: 0 0 6px 0 !important;
              font-size: 1em !important;
            }
            
            .action-button {
              flex: 1;
              padding: 14px 16px;
              font-size: 1em;
              margin: 0;
              border-radius: 8px;
              min-height: 48px;
            }
            
            h1 {
              font-size: 1.6em;
            }
            
            .stat-card {
              padding: 12px;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
            
          }
        `}</style>
      </div>
    </>
  );
} 