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
            width: 100%;
            height: 100vh;
            height: -webkit-fill-available;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

          .card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
            max-height: calc(100vh - 40px);
            max-height: calc(-webkit-fill-available - 40px);
            overflow: hidden;
            touch-action: none;
          }

          h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
            color: white;
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
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.2em;
            backdrop-filter: blur(10px);
          }

          .input-group {
            margin-bottom: 20px;
          }

          .name-input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50px;
            font-size: 1.2em;
            text-align: center;
            outline: none;
            transition: border-color 0.3s;
            background: rgba(255,255,255,0.1);
            color: white;
            backdrop-filter: blur(10px);
          }

          .name-input:focus {
            border-color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.2);
          }
          
          .name-input::placeholder {
            color: rgba(255,255,255,0.7);
          }

          .join-button {
            width: 100%;
            padding: 15px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50px;
            font-size: 1.2em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            backdrop-filter: blur(10px);
          }

          .join-button:hover:not(:disabled) {
            background: rgba(255,255,255,0.3);
            border-color: rgba(255,255,255,0.6);
            transform: translateY(-2px);
          }

          .join-button:disabled {
            background: rgba(255,255,255,0.1);
            border-color: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.5);
            cursor: not-allowed;
            transform: none;
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
            border-top: 1px solid rgba(255,255,255,0.2);
          }

          .host-link a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-weight: 500;
          }

          .host-link a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .container {
              padding: 15px;
            }

            .card {
              padding: 25px 20px;
              margin: 0;
              max-width: calc(100% - 30px);
              width: calc(100% - 30px);
              max-height: calc(100vh - 30px);
              max-height: calc(-webkit-fill-available - 30px);
              border-radius: 15px;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
              overflow: hidden;
              touch-action: none;
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
            }

            .card {
              padding: 20px 15px;
              border-radius: 12px;
              max-width: calc(100% - 20px);
              width: calc(100% - 20px);
              max-height: calc(100vh - 20px);
              max-height: calc(-webkit-fill-available - 20px);
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