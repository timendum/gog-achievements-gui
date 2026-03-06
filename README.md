# GOG Achievements Manager

A desktop application for managing GOG achievements.  
View, unlock, and lock achievements for your GOG games with your mouse.

## What It Does

GOG Achievements Manager connects to your GOG account and allows you to:

- Browse your GOG game library
- View all achievements for each game
- Unlock achievements you've earned but weren't tracked
- Lock achievements to reset your progress
- See achievement details including descriptions, icons and unlock dates

---

## User Guide

### Installation

1. Download the latest release for Windows (x64)
2. Extract the archive
3. Run `gog-achievements-gui.exe`

### Prerequisites

- GOG Galaxy installed and working (for authentication)
- Windows operating system (because of GOG Galaxy)
- An active GOG account with owned games

### How to Use

#### Viewing Your Games

1. Launch the application
2. The app will automatically load your GOG game library
3. Games will appear with cover art and title
4. Use the search bar at the top to filter games by name (or ID)

#### Managing Achievements

1. Click on any game to view its achievements
1. To modify achievements:
   - Click the checkbox next to an achievement to toggle its state
   - Locked achievements can be unlocked
   - Unlocked achievements can be locked (reset)
1. Click "Save Changes" to apply modifications

#### Tips

- The search function works with both game titles and game IDs
- Changes are saved directly to GOG's servers
- Unlocking an achievement sets the unlock date to 10 seconds ago
- Locking an achievement removes the unlock date entirely

---

## Developer Guide

### Technology Stack

- **Framework**: [Electrobun](https://electrobun.dev/) - Desktop app framework using Bun runtime
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 7
- **Runtime**: Bun (backend process)
- **Platform**: Windows x64

### Project Structure

```
gog-achievements-gui/
├── src/
│   ├── bun/                   # Backend (Bun runtime)
│   │   ├── gog/               # GOG API integration
│   │   └── index.ts           # Main process entry point
│   ├── mainview/              # Frontend (React)
│   │   ├── components/        # React components
│   │   ├── App.tsx            # Main React component
│   │   ├── main.tsx           # React entry point
│   │   └── index.html         # HTML template
│   └── shared/
│       └── types.ts           # Shared RPC types
├── assets/                    # Static assets
```

### Architecture

The application follows a **two-process architecture**:

#### Bun Backend Process (`src/bun/`)

- Runs in Node.js-compatible Bun runtime
- Handles GOG API communication
- Fetch authentication from GOG Galaxy via Windows Registry
- Implements RPC handlers for frontend requests
- Caches game data locally to reduce API calls

#### React Frontend Process (`src/mainview/`)

- Runs in webview
- Renders UI with React and Tailwind CSS
- Communicates with backend via RPC (Remote Procedure Call)
- Manages application state and user interactions

#### RPC Communication

The app uses Electrobun's RPC system for backend-frontend communication.

### Development Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Run in development mode:**

   ```bash
   bun run dev
   ```

3. **Run with Hot Module Replacement (HMR):**

   ```bash
   bun run dev:hmr
   ```

4. **Build for production:**

   ```bash
   bun run build
   ```

### License

AGPL-3.0-only

### Author

Timendum
