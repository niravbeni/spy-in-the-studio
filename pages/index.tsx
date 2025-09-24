import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function JoinPage() {
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const router = useRouter();

  // Don't pre-fill name - each tab should be independent

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      // Always create a new player ID for each join (each tab should be separate)
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          // Don't send existing playerId - always create new
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store player ID and name for this tab
        localStorage.setItem('playerId', data.playerId);
        localStorage.setItem('playerName', name.trim());
        
        // Small delay to ensure server state is updated before redirect
        setTimeout(() => {
          router.push('/game');
        }, 100);
      } else {
        setError(data.message || 'Failed to join game');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Poll for player count updates
  useEffect(() => {
    const fetchPlayerCount = async () => {
      try {
        const response = await fetch('/api/game-status');
        const data = await response.json();
        if (data.success) {
          setPlayerCount(data.playerCount);
        }
      } catch (err) {
        // Silently fail
      }
    };

    fetchPlayerCount();
    const interval = setInterval(fetchPlayerCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Spy in the Studio - Join Game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <div className="card">
          <h1>🕵️ Spy in the Studio</h1>
          
          <div className="player-count">
            <span className="count-badge">{playerCount}</span>
            <span>players waiting</span>
          </div>

          <form onSubmit={handleJoin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isJoining}
                maxLength={30}
                required
                className="name-input"
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button 
              type="submit" 
              disabled={isJoining || !name.trim()}
              className="join-button"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </form>

          <div className="host-link">
            <a href="/host">Host Dashboard →</a>
          </div>
        </div>

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-x: hidden;
            width: 100%;
            max-width: 100vw;
          }

          .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }

          h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
            color: #333;
            font-weight: 700;
          }

          .subtitle {
            color: #666;
            margin: 0 0 30px 0;
            font-size: 1.1em;
          }

          .player-count {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
          }

          .count-badge {
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.2em;
          }

          .input-group {
            margin-bottom: 20px;
          }

          .name-input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #eee;
            border-radius: 50px;
            font-size: 1.2em;
            text-align: center;
            outline: none;
            transition: border-color 0.3s;
          }

          .name-input:focus {
            border-color: #667eea;
          }

          .join-button {
            width: 100%;
            padding: 15px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50px;
            font-size: 1.2em;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
          }

          .join-button:hover:not(:disabled) {
            background: #5a6fd8;
          }

          .join-button:disabled {
            background: #ccc;
            cursor: not-allowed;
          }

          .error {
            color: #e74c3c;
            margin: 15px 0;
            padding: 10px;
            background: #fee;
            border-radius: 10px;
            font-size: 0.9em;
          }

          .host-link {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }

          .host-link a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }

          .host-link a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .container {
              padding: 15px;
              box-sizing: border-box;
              overflow-x: hidden;
              width: 100vw;
              max-width: 100vw;
            }

            .card {
              padding: 30px 20px;
              margin: 0;
              max-width: calc(100vw - 30px);
              width: calc(100vw - 30px);
              border-radius: 15px;
              box-sizing: border-box;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }

            .name-input {
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .name-input:focus {
              border: none;
              outline: 2px solid #667eea;
              outline-offset: 2px;
            }

            .join-button {
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }

            .count-badge {
              border: none;
              outline: none;
            }
          }

          @media (max-width: 480px) {
            .container {
              padding: 10px;
              overflow-x: hidden;
              width: 100vw;
              max-width: 100vw;
            }

            .card {
              padding: 25px 15px;
              border-radius: 12px;
              max-width: calc(100vw - 20px);
              width: calc(100vw - 20px);
            }
            
            h1 {
              font-size: 2em;
            }

            .name-input {
              padding: 12px 15px;
              font-size: 1.1em;
            }

            .join-button {
              padding: 12px;
              font-size: 1.1em;
            }
          }
        `}</style>
      </div>
    </>
  );
} 