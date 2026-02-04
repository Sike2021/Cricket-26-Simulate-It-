
import React from 'react';

interface SettingsProps {
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetGame, theme, setTheme, saveGame, loadGame }) => (
    <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Settings</h2>
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <span className="font-semibold">Theme</span>
                <div className="flex space-x-2">
                    <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded ${theme === 'light' ? 'bg-teal-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>Light</button>
                    <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded ${theme === 'dark' ? 'bg-teal-500 text-white' : 'bg-gray-300 dark:bg-gray-600'}`}>Dark</button>
                </div>
            </div>
            <button onClick={saveGame} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Save Game</button>
            <button onClick={loadGame} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Load Game</button>
            <button onClick={onResetGame} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Reset All Progress</button>
        </div>
    </div>
);

export default Settings;
