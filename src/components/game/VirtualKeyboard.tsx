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

        const baseClasses = `
            ${isSpecialKey ? 'flex-[1.5]' : 'flex-1'}
            min-w-0
            h-12
            sm:h-13
            md:h-14
            rounded 
            font-semibold 
            text-[0.7rem]
            xs:text-[0.75rem]
            sm:text-[0.8rem]
            md:text-sm
            transition-all
            duration-300
            flex
            items-center
            justify-center
            border
        `;

        const stateClasses = {
            correct: 'bg-green-500 text-white shadow-md border-green-600',
            present: 'bg-yellow-500 text-white shadow-md border-yellow-600',
            absent: 'bg-gray-500 text-white/80 shadow-sm border-gray-600',
            unused: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 shadow-sm border-gray-300'
        };

        return `${baseClasses} ${stateClasses[keyState]}`;
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-1.5">
                {GAME_CONSTANTS.KEYBOARD_ROWS.map((row, i) => (
                    <div key={i} className="flex gap-1">
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
        </div>
    );
} 