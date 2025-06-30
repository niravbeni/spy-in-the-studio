# 🕵️ Spy in the Studio

A lightweight mobile web app for running "Spy in the Studio," a creative party game perfect for IDEO SASU sessions. Acts like a digital card deck where each player gets a prompt, except one randomly chosen spy.

## 🎯 Game Overview

- **Players**: 2+ people (optimized for 10-20 in workshops)
- **Setup**: No printed cards needed, just smartphones/tablets
- **Goal**: Creative discussion and spy detection through conversation
- **Duration**: Quick rounds, perfect for workshop energizers

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

## 📱 How to Play

### For Players:
1. Go to the app URL on your phone
2. Enter your name and join the game
3. Wait for the host to start a round
4. You'll receive either:
   - A creative prompt (like "How might we design a ritual for the end of the world?")
   - OR "You are the spy" (if you're the randomly selected spy)
5. Discuss the prompt with the group - spies must try to blend in!

### For Hosts:
1. Go to `/host` on any device
2. Wait for players to join
3. Click "Start Round" to randomly assign roles
4. Click "Next Round" to start fresh with new spy & prompt

## 🏗️ Architecture

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API routes
- **Storage**: In-memory (resets on server restart)
- **Styling**: CSS-in-JS with styled-jsx
- **Mobile-first**: Responsive design optimized for phone use

## 📂 Project Structure

```
spy-in-the-studio/
├── pages/
│   ├── index.tsx          # Join page (/)
│   ├── host.tsx           # Host dashboard (/host)
│   ├── game.tsx           # Player game view (/game)
│   ├── _app.tsx           # App wrapper
│   └── api/
│       ├── join.ts        # POST - Add player
│       ├── start-round.ts # POST - Start new round
│       ├── get-role.ts    # GET - Get player role
│       └── game-status.ts # GET - Game state for host
├── lib/
│   └── gameState.ts       # In-memory game state management
├── package.json
└── README.md
```

## 🧩 HMW Prompt Pool

The app includes 15 creative "How Might We" prompts like:
- "How might we design a ritual for the end of the world?"
- "How might we enable people to live and thrive in underwater cities?"
- "How might we create a dating experience for pets?"
- And 12 more creative challenges...

## 🔧 API Reference

### POST `/api/join`
Add a player to the game
```json
{
  "name": "Player Name",
  "playerId": "optional-existing-id"
}
```

### POST `/api/start-round`
Start a new round (host only)
```json
{} // No body required
```

### GET `/api/get-role?playerId=xyz`
Get player's current role
```json
{
  "isSpy": false,
  "prompt": "How might we...",
  "message": "Your prompt text"
}
```

### GET `/api/game-status`
Get current game state (host dashboard)
```json
{
  "players": [...],
  "playerCount": 5,
  "isRoundActive": true,
  "currentPrompt": "...",
  "spyId": "player-id"
}
```

## 🎨 Features

- ✅ **No Database Required** - Pure in-memory storage
- ✅ **Mobile Optimized** - Beautiful touch-friendly interface  
- ✅ **Real-time Updates** - Automatic polling for game state
- ✅ **Role Assignment** - Automatic random spy & prompt selection
- ✅ **Persistent Identity** - LocalStorage for player ID/name
- ✅ **Host Dashboard** - Clear overview of players and game state
- ✅ **Error Handling** - Graceful error states and retry mechanisms

## 🔄 Game Flow

1. **Join Phase**: Players add their names and see waiting screen
2. **Host Control**: Host sees player list and starts rounds
3. **Role Reveal**: Players automatically get their roles
4. **Discussion**: Organic conversation (no app interaction needed)
5. **Next Round**: Host can instantly restart with new spy/prompt

## 🚀 Deployment

Deploy easily to:
- **Vercel**: `vercel --prod`
- **Netlify**: Connect GitHub repo
- **Heroku**: Standard Node.js deployment
- **Any VPS**: `npm run build && npm start`

## 🤝 Contributing

This is a simple, focused game app. Perfect for:
- Adding more HMW prompts
- UI/UX improvements
- Mobile experience enhancements
- Accessibility features

## 📜 License

Open source - perfect for workshop facilitators and creative teams! 