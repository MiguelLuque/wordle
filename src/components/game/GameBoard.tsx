import { Crown } from 'lucide-react';
import { LetterState } from '../../types/game.types';
import { GAME_CONSTANTS } from '../../types/game.types';

interface GameBoardProps {
    game: {
        attempts: string[];
        currentAttempt: string;
        guessResults: { letter: string; state: LetterState }[][];
    };
}

export function GameBoard({ game }: GameBoardProps) {
    const getLetterClassName = (state: LetterState) => {
        const baseClass =
            'w-11 h-11 md:w-14 md:h-14 border-2 rounded flex items-center justify-center font-bold uppercase transition-colors text-xl md:text-2xl';
        switch (state) {
            case 'correct':
                return `${baseClass} bg-green-500 text-white border-green-600`;
            case 'present':
                return `${baseClass} bg-yellow-500 text-white border-yellow-600`;
            case 'absent':
                return `${baseClass} bg-gray-500 text-white border-gray-600`;
            default:
                return `${baseClass} bg-white border-gray-300`;
        }
    };

    return (
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                    <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-semibold">Your Board</span>
                </div>

                <div className="grid gap-2 mx-auto mb-4" style={{ maxWidth: "fit-content" }}>
                    {[...Array(GAME_CONSTANTS.MAX_ATTEMPTS)].map((_, i) => (
                        <div key={i} className={`grid grid-cols-5 gap-1 ${i === game.attempts.length ? 'current-row' : ''}`}>
                            {[...Array(GAME_CONSTANTS.WORD_LENGTH)].map((_, j) => {
                                const letter =
                                    i === game.attempts.length
                                        ? game.currentAttempt[j] || ''
                                        : game.attempts[i]?.[j] || '';
                                const state = game.guessResults[i]?.[j]?.state || 'empty';

                                return (
                                    <div key={j} className={getLetterClassName(state)}>
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 