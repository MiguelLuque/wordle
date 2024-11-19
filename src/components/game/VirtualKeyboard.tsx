import { KeyState, GameStatus, GAME_CONSTANTS } from '../../types/game.types';

interface VirtualKeyboardProps {
    keyboardState: Record<string, KeyState>;
    onKeyPress: (key: string) => void;
    gameStatus: GameStatus;
}

export function VirtualKeyboard({ keyboardState, onKeyPress, gameStatus }: VirtualKeyboardProps) {
    const getKeyClassName = (key: string) => {
        const isSpecialKey = key === 'ENTER' || key === 'DEL';
        const keyState = keyboardState[key] || 'unused';

        return `
      ${isSpecialKey ? 'flex-[1.5]' : 'flex-1'} 
      h-[3.25rem] md:h-14
      rounded 
      font-semibold 
      text-xs md:text-base 
      transition-colors
      flex
      items-center
      justify-center
      min-w-[2rem]
      ${keyState === 'correct' ? 'bg-green-500 text-white' :
                keyState === 'present' ? 'bg-yellow-500 text-white' :
                    keyState === 'absent' ? 'bg-gray-500 text-white' :
                        'bg-gray-200 hover:bg-gray-300'
            }
    `;
    };

    return (
        <div className="grid gap-1 w-full max-w-[500px] mx-auto">
            {GAME_CONSTANTS.KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="flex justify-center gap-1">
                    {row.map((key) => (
                        <button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            disabled={gameStatus !== 'playing'}
                            className={getKeyClassName(key)}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
} 