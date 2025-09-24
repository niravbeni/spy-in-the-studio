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
}

export default function HostPage() {
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    players: [],
    playerCount: 0,
    isRoundActive: false,
    currentPrompt: null,
    spyId: null,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

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

  // Set current URL after component mounts (client-side only)
  useEffect(() => {
    setCurrentUrl(window.location.origin);
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

          <div className="players-section">
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

          {gameStatus.isRoundActive && (
            <div className="round-info">
              <h3>Current Round</h3>
              <div className="prompt-card">
                <strong>Prompt:</strong> {gameStatus.currentPrompt}
              </div>
              <div className="spy-info">
                <strong>Spy:</strong> {spyName}
              </div>
            </div>
          )}

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
            
            {gameStatus.playerCount < 2 && !gameStatus.isRoundActive && (
              <p className="help-text">Need at least 2 players to start</p>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="join-link">
            <p>Share this link with players:</p>
            <code>{currentUrl}</code>
          </div>
        </div>

        <style jsx>{`
          .container {
            height: 100vh;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            overflow-x: hidden;
            width: 100%;
            max-width: 100vw;
          }

          .dashboard {
            max-width: 800px;
            width: 100%;
            max-height: calc(100vh - 40px);
            background: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
          }

          h1 {
            text-align: center;
            margin: 0 0 20px 0;
            font-size: 2.2em;
            color: #333;
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
            background: #f8f9fa;
            padding: 15px;
            border-radius: 15px;
            text-align: center;
          }

          .stat-number {
            font-size: 2.2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }

          .stat-indicator {
            font-size: 2em;
            margin-bottom: 10px;
          }

          .stat-label {
            color: #666;
            font-weight: 500;
          }

          .players-section {
            margin-bottom: 25px;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
          }

          .players-section h2 {
            margin: 0 0 15px 0;
            color: #333;
            flex-shrink: 0;
          }

          .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 5px;
            flex: 1;
            min-height: 0;
            width: 100%;
            max-width: 100%;
          }

          /* Scrollbar styling */
          .players-grid::-webkit-scrollbar {
            width: 8px;
          }

          .players-grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .players-grid::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 10px;
          }

          .players-grid::-webkit-scrollbar-thumb:hover {
            background: #5a6fd8;
          }

          .player-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
            background: #e8f5e8;
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 25px;
            flex-shrink: 0;
          }

          .round-info h3 {
            margin: 0 0 15px 0;
            color: #2c5330;
          }

          .prompt-card {
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            font-size: 1.1em;
          }

          .spy-info {
            color: #2c5330;
            font-weight: 500;
          }

          .controls {
            text-align: center;
            margin-bottom: 25px;
            flex-shrink: 0;
          }

          .action-button {
            padding: 12px 25px;
            border: none;
            border-radius: 50px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            min-width: 140px;
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

          .help-text {
            margin-top: 10px;
            color: #666;
            font-size: 0.9em;
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

          .join-link {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 15px;
            text-align: center;
            flex-shrink: 0;
          }

          .join-link p {
            margin: 0 0 10px 0;
            color: #666;
          }

          .join-link code {
            background: #e9ecef;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
          }

          @media (max-width: 768px) {
            .container {
              padding: 10px;
              box-sizing: border-box;
              overflow-x: hidden;
              width: 100vw;
              max-width: 100vw;
            }
            
            .dashboard {
              padding: 15px;
              max-height: calc(100vh - 20px);
              margin: 0;
              max-width: calc(100vw - 20px);
              width: calc(100vw - 20px);
              box-sizing: border-box;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            h1 {
              font-size: 1.8em;
              margin-bottom: 15px;
            }
            
            .stats {
              grid-template-columns: 1fr;
              gap: 10px;
              margin-bottom: 20px;
            }
            
            .stat-number {
              font-size: 1.8em;
            }
            
            .players-grid {
              grid-template-columns: 1fr;
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
            }
            
            .player-card {
              padding: 12px;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
            
            .action-button {
              width: 100%;
              padding: 15px;
              font-size: 1.2em;
              margin: 5px 0;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }

            .action-button.secondary {
              margin-left: 0;
            }
            
            .round-info, .join-link {
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
              padding: 5px;
              box-sizing: border-box;
              overflow-x: hidden;
              width: 100vw;
              max-width: 100vw;
            }
            
            .dashboard {
              padding: 12px;
              max-height: calc(100vh - 10px);
              border-radius: 15px;
              max-width: calc(100vw - 10px);
              width: calc(100vw - 10px);
              box-sizing: border-box;
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
            
            .join-link code {
              font-size: 0.85em;
              padding: 6px 8px;
              border: none;
              outline: none;
            }
          }
        `}</style>
      </div>
    </>
  );
} 