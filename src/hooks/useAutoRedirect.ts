import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AutoRedirectConfig {
  condition: boolean;
  delay?: number;
  path: string;
  onRedirect?: () => void;
}

export function useAutoRedirect({
  condition,
  delay = 3000,
  path,
  onRedirect
}: AutoRedirectConfig) {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (condition) {
      timeoutId = setTimeout(() => {
        navigate(path, { replace: true });
        onRedirect?.();
      }, delay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [condition, delay, path, navigate, onRedirect]);
} 