import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import { useGameStore } from './store/gameStore';

function App() {
  const { roomCode } = useGameStore();

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col">
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:roomCode" element={<Game />} />
          <Route path="/game" element={roomCode ? <Game /> : <Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
