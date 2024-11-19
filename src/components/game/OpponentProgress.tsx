import { Crown } from 'lucide-react';
import { GuessResult } from '../../types/game.types';
import { GAME_CONSTANTS } from '../../types/game.types';

interface OpponentProgressProps {
    rivalAttempts: string[];
    rivalGuessResults: GuessResult[][];
}

export function OpponentProgress({ rivalAttempts, rivalGuessResults }: OpponentProgressProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    <Crown className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-600">Opponent's Progress</span>
                </div>
                <span className="text-sm text-gray-500">
                    {rivalAttempts.length}/{GAME_CONSTANTS.MAX_ATTEMPTS}
                </span>
            </div>

            <div className="flex gap-2">
                {rivalGuessResults.map((result, attemptIndex) => (
                    <div key={attemptIndex} className="flex gap-0.5">
                        {result.map((guess, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${guess.state === 'correct'
                                        ? 'bg-green-500'
                                        : guess.state === 'present'
                                            ? 'bg-yellow-500'
                                            : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
} 