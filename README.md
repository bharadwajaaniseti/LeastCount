# Least Count Card Game

A production-ready multiplayer Least Count card game built with React, TypeScript, Socket.io, and TailwindCSS.

## Features

- **Real-time multiplayer**: Up to 8 players per room
- **Multi-card discard**: Support for single cards, sets, and runs
- **Indian Least Count rules**: Jokers wild in runs, A-low only, ends-only pickup
- **Modern UI**: Green felt table design with smooth animations
- **Cross-platform**: Runs on web browsers with responsive design

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **State Management**: Zustand
- **Build Tool**: pnpm
- **Code Quality**: ESLint + Prettier

## Project Structure

```
/apps
  /client     # React frontend
  /server     # Express + Socket.io backend
/packages
  /shared     # Shared TypeScript types
```

## Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install:all
   ```

2. **Start development servers**:
   ```bash
   pnpm dev
   ```

   This starts:
   - Client on http://localhost:5173
   - Server on http://localhost:3001

3. **Build for production**:
   ```bash
   pnpm build
   ```

## Game Rules

- **Hand Size**: 7 cards
- **Declare Threshold**: 10 points or less
- **Bad Declare Penalty**: 40 points
- **Elimination**: At 200 points
- **Ends-only Pickup**: Can only pick first or last card from discard pile
- **Jokers**: Wild in runs only, worth 0 points
- **Ace**: Low only (A-2-3, not Q-K-A)

## Controls

- **Double-click cards**: Select/unselect for discard
- **Keyboard shortcuts**:
  - `Enter`: Confirm discard
  - `D`: Draw from stock
  - `F`: Draw first card from discard
  - `L`: Draw last card from discard
  - `M`: Move (end turn)
  - `S`: Show (declare)

## Valid Discards

1. **Single Card**: Any card
2. **Set**: 2+ cards of same rank (no jokers)
3. **Run**: 3+ consecutive cards of same suit (jokers allowed as wilds)

## Development

### Code Style
- ESLint for linting
- Prettier for formatting
- TypeScript strict mode

### Testing
- Component testing with React Testing Library
- Socket.io event testing

## License

MIT
