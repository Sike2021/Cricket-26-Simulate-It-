
import React from 'react';

interface MainMenuProps {
    onStartNewGame: () => void;
    onResumeGame: () => void;
    hasSaveData: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onResumeGame, hasSaveData }) => (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 1)), url('https://images.unsplash.com/photo-1595435942477-f5439483405a?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="h-full w-full absolute top-0 left-0 bg-gradient-to-b dark:from-black/70 dark:to-[#2C3531] from-gray-100/70 to-gray-50"></div>
        <div className="relative z-10 text-center">
            <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">Sike's</h2>
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">CRICKET MANAGER</h1>
            <h2 className="text-5xl font-extrabold text-teal-600 dark:text-teal-400 mb-12">25</h2>
            <div className="space-y-4">
                {hasSaveData && (
                    <button
                        onClick={onResumeGame}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-10 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full"
                    >
                        Resume Game
                    </button>
                )}
                <button
                    onClick={onStartNewGame}
                    className="bg-gray-800 hover:bg-black dark:bg-gray-200 dark:hover:bg-white text-white dark:text-gray-900 font-bold py-3 px-10 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 w-full"
                >
                    {hasSaveData ? "Start New Game" : "Start Career"}
                </button>
            </div>
        </div>
    </div>
);

export default MainMenu;
