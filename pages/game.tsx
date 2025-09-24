import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface PlayerRole {
  isSpy: boolean;
  prompt: string | null;
  message: string;
}

// Function to process redacted text and style XXXX as blacked-out text
const processRedactedText = (text: string) => {
  if (!text) return text;
  
  const parts = text.split(/(\bXXXX\b)/g);
  return parts.map((part, index) => {
    if (part === 'XXXX') {
      return <span key={index} className="redacted">████</span>;
    }
    return part;
  });
};

export default function GamePage() {
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInspiration, setShowInspiration] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [isPolling, setIsPolling] = useState(false);
  const router = useRouter();

  const fetchRole = async (isBackgroundFetch = false) => {
    const playerId = localStorage.getItem('playerId');

    if (!playerId) {
      router.push('/');
      return;
    }

    if (isBackgroundFetch) {
      setIsPolling(true);
    }

    try {
      const response = await fetch(`/api/get-role?playerId=${playerId}`);
      const data = await response.json();

      if (data.success) {
        const newRole = {
          isSpy: data.isSpy,
          prompt: data.prompt,
          message: data.message,
        };
        
        // Check if this is a new round (prompt changed)
        if (role?.prompt && data.prompt && role.prompt !== data.prompt) {
          setRoundNumber(prev => prev + 1);
        }
        
        setRole(newRole);
        // Set the player name from the server response (not localStorage)
        setPlayerName(data.playerName || 'Unknown Player');
      } else {
        // If player not found, show error but don't auto-redirect
        if (data.message?.includes('Player not found')) {
          setError(`${data.message} - Game may have restarted. Please rejoin.`);
          return;
        }
        setError(data.message || 'Failed to get role');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      if (isBackgroundFetch) {
        setIsPolling(false);
      }
    }
  };

  useEffect(() => {
    fetchRole();
    
    // Continuous polling to detect new rounds and updates
    const interval = setInterval(() => {
      fetchRole(true); // Background fetch
    }, 3000); // Poll every 3 seconds for updates
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError('');
    fetchRole();
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Spy in the Studio - Loading</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="container">
          <div className="card loading">
            <div className="spinner"></div>
            <p>Loading your role...</p>
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

            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #667eea;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  if (error) {
    const isPlayerNotFound = error.includes('Player not found');
    
    return (
      <>
        <Head>
          <title>Spy in the Studio - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="container">
          <div className="card error">
            <h2>{isPlayerNotFound ? '🔄 Reconnect Needed' : '😞 Oops!'}</h2>
            <p>{error}</p>
            {isPlayerNotFound ? (
              <>
                <button onClick={() => {
                  localStorage.removeItem('playerId');
                  localStorage.removeItem('playerName');
                  router.push('/');
                }} className="action-button">
                  Rejoin Game
                </button>
                <button onClick={handleRefresh} className="link-button">
                  Try Again
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRefresh} className="action-button">
                  Try Again
                </button>
                <button onClick={() => router.push('/')} className="link-button">
                  Back to Join
                </button>
              </>
            )}
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

            .action-button {
              padding: 12px 24px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 25px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              margin: 10px;
            }

            .link-button {
              padding: 12px 24px;
              background: transparent;
              color: #667eea;
              border: 2px solid #667eea;
              border-radius: 25px;
              font-size: 1em;
              font-weight: 600;
              cursor: pointer;
              margin: 10px;
            }
          `}</style>
        </div>
      </>
    );
  }

  if (!role) {
    return (
      <>
        <Head>
          <title>Spy in the Studio - Waiting</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="container">
          <div className="card waiting">
            <h2>⏳ Waiting for host...</h2>
            <p>The host hasn't started a round yet.</p>
            <div className="player-info">
              <strong>You're {playerName}</strong>
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
            }

            .card {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
              width: 100%;
            }

            .player-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
              color: #667eea;
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Spy in the Studio - Your Role</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <div className="card prompt-card">
          <div className="player-info">
            <strong>{playerName}</strong>
          </div>
          
          <div className="round-info">
            <span className="round-number">Round {roundNumber}</span>
            {isPolling && <span className="polling-indicator">🔄</span>}
          </div>
          
          <div className="role-reveal">
            {role.isSpy ? (
              <>
                <div className="role-icon">💡</div>
                <h1>Your Brief</h1>
                <div className="prompt-text spy-prompt">
                  {role.prompt ? processRedactedText(role.prompt) : 'No prompt available'}
                </div>
                <p className="instruction">
                  You are the spy, try to fit in! Listen carefully to the discussion 
                  and blend in with the group without being discovered.
                </p>
              </>
            ) : (
              <>
                <div className="role-icon">💡</div>
                <h1>Your Brief</h1>
                <div className="prompt-text">
                  {role.prompt ? processRedactedText(role.prompt) : 'No prompt available'}
                </div>
                <p className="instruction">
                  Discuss this prompt with the group. One person among you is the spy who can't see the full brief. 
                  Try to figure out who it is through the discussion!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Inspiration Button */}
        <button 
          className="inspiration-button"
          onClick={() => setShowInspiration(true)}
          aria-label="Get question inspiration"
        >
          💭 Need inspiration?
        </button>

        {/* Inspiration Modal */}
        {showInspiration && (
          <div className="modal-overlay" onClick={() => setShowInspiration(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>💭 Question Inspiration</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowInspiration(false)}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-intro">Use these questions to spark deeper discussions:</p>
                <ul className="inspiration-list">
                  <li>What material would you prototype this with?</li>
                  <li>What sense (touch, taste, smell, etc.) really matters here?</li>
                  <li>What kind of person would be the perfect user for this?</li>
                  <li>Where would this idea live — at home, in public, or somewhere else?</li>
                  <li>What's the ideal emotional reaction someone should have to this?</li>
                  <li>Would this make someone laugh, cry, or think?</li>
                  <li>Is this more calming or energizing?</li>
                  <li>If this idea were an animal, what would it be?</li>
                  <li>What color or texture comes to mind when you think of it?</li>
                  <li>Is this idea more like a whisper or a shout?</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .card {
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
            position: relative;
          }

          .prompt-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .player-info {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255,255,255,0.2);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            backdrop-filter: blur(10px);
          }

          .round-info {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .round-number {
            font-weight: 600;
          }

          .polling-indicator {
            font-size: 0.8em;
            animation: spin 2s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .role-reveal {
            margin-top: 40px;
          }

          .role-icon {
            font-size: 4em;
            margin-bottom: 20px;
          }

          h1 {
            font-size: 2.5em;
            margin: 0 0 20px 0;
            font-weight: 700;
          }

          .prompt-text {
            background: rgba(255,255,255,0.15);
            padding: 25px;
            border-radius: 15px;
            font-size: 1.3em;
            font-weight: 600;
            margin: 20px 0;
            line-height: 1.4;
            backdrop-filter: blur(10px);
          }

          .spy-prompt {
            border: 2px dashed rgba(255,255,255,0.4);
          }

          .redacted {
            background: #000;
            color: #000;
            padding: 2px 4px;
            border-radius: 3px;
            display: inline-block;
            margin: 0 1px;
            font-family: monospace;
            user-select: none;
            position: relative;
            overflow: hidden;
          }

          .redacted::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%),
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%);
            background-size: 4px 4px;
            background-position: 0 0, 2px 2px;
            opacity: 0.3;
          }

          .instruction {
            font-size: 1.1em;
            opacity: 0.9;
            line-height: 1.5;
            margin-top: 20px;
          }

          /* Inspiration Button */
          .inspiration-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: rgba(255,255,255,0.9);
            color: #333;
            border: none;
            border-radius: 50px;
            padding: 15px 25px;
            font-size: 1.1em;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            z-index: 1000;
          }

          .inspiration-button:hover {
            background: rgba(255,255,255,1);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0,0,0,0.2);
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
            backdrop-filter: blur(5px);
          }

          .modal-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px 10px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.3em;
            font-weight: 600;
          }

          .close-button {
            background: none;
            border: none;
            color: white;
            font-size: 1.5em;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
          }

          .close-button:hover {
            background: rgba(255,255,255,0.1);
          }

          .modal-body {
            padding: 15px 25px 20px;
          }

          .modal-intro {
            font-size: 1em;
            margin-bottom: 15px;
            opacity: 0.9;
          }

          .inspiration-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .inspiration-list li {
            background: rgba(255,255,255,0.1);
            margin-bottom: 8px;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.9em;
            line-height: 1.3;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            transition: background 0.2s ease;
          }

          .inspiration-list li:hover {
            background: rgba(255,255,255,0.15);
          }

          @media (max-width: 768px) {
            .container {
              padding: 15px;
              box-sizing: border-box;
            }

            .card {
              padding: 25px 20px;
              margin: 0;
              max-width: 100%;
              border-radius: 15px;
              box-sizing: border-box;
            }

            .player-info, .round-info {
              position: relative;
              top: auto;
              left: auto;
              right: auto;
              margin-bottom: 15px;
              display: inline-block;
              margin-right: 10px;
            }

            .round-info {
              margin-right: 0;
            }

            .role-reveal {
              margin-top: 20px;
            }

            .role-icon {
              font-size: 3em;
              margin-bottom: 15px;
            }

            h1 {
              font-size: 2em;
              margin-bottom: 15px;
            }

            .prompt-text {
              padding: 20px;
              font-size: 1.1em;
              margin: 15px 0;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }

            .spy-prompt {
              border: 2px dashed rgba(255,255,255,0.4);
            }

            .instruction {
              font-size: 1em;
              margin-top: 15px;
            }

            .inspiration-button {
              bottom: 20px;
              right: 20px;
              padding: 12px 20px;
              font-size: 1em;
            }

            .modal-content {
              margin: 10px;
              max-height: 90vh;
            }

            .modal-header {
              padding: 15px 20px 10px;
            }

            .modal-header h2 {
              font-size: 1.2em;
            }

            .modal-body {
              padding: 12px 20px 15px;
            }

            .modal-intro {
              font-size: 0.95em;
              margin-bottom: 12px;
            }

            .inspiration-list li {
              padding: 8px 12px;
              font-size: 0.85em;
              margin-bottom: 6px;
              line-height: 1.25;
              border: none;
              outline: none;
              -webkit-tap-highlight-color: transparent;
            }
          }

          @media (max-width: 480px) {
            .container {
              padding: 10px;
            }

            .card {
              padding: 20px 15px;
              border-radius: 12px;
            }

            .role-icon {
              font-size: 2.5em;
            }

            h1 {
              font-size: 1.8em;
            }

            .prompt-text {
              padding: 15px;
              font-size: 1em;
            }

            .player-info, .round-info {
              font-size: 0.8em;
              padding: 6px 12px;
              margin-bottom: 10px;
            }
          }
        `}</style>
      </div>
    </>
  );
} 