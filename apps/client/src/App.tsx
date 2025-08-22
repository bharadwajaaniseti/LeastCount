import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import { useGameStore } from './store/gameStore';

function App() {
  const { roomCode } = useGameStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:roomCode" element={<Game />} />
        <Route path="/game" element={roomCode ? <Game /> : <Home />} />
      </Routes>
    </div>
  );
}

export default App;
