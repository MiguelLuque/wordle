import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import MainMenu from './screens/MainMenu';
import GameScreen from './screens/GameScreen';
import { useGameStore } from './store/gameStore';

function App() {
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route
          path="/menu"
          element={isAuthenticated ? <MainMenu /> : <AuthScreen />}
        />
        <Route
          path="/game/:gameId"
          element={isAuthenticated ? <GameScreen /> : <AuthScreen />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;