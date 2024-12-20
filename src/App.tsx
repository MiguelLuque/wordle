import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import AuthScreen from './screens/AuthScreen';
import MainMenu from './screens/MainMenu';
import GameScreen from './screens/GameScreen';
import { Toaster } from 'react-hot-toast';
import SplashScreen from './screens/SplashScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authenticated = useGameStore((state) => state.authenticated);

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route
            path="/game/:gameId"
            element={
              <ProtectedRoute>
                <GameScreen />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}