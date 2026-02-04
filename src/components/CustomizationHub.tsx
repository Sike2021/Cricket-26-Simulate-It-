
import React, { useState } from 'react';
import { GameData, Brand, TVChannel } from '../types';

interface CustomizationHubProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const CustomizationHub: React.FC<CustomizationHubProps> = ({ gameData, setGameData }) => {
    const [activeTab, setActiveTab] = useState<'teams' | 'brands' | 'tv'>('teams');
    const [selectedTeamId, setSelectedTeamId] = useState(gameData.teams[0].id);
    
    // Team Edit State
    const [teamName, setTeamName] = useState('');
    const [teamLogo, setTeamLogo] = useState('');

    // Brand Edit State
    const [brandName, setBrandName] = useState('');
    const [brandColor, setBrandColor] = useState('text-white');
    const [brandLogo, setBrandLogo] = useState('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>');

    // TV Edit State
    const [tvName, setTvName] = useState('');
    const [tvPop, setTvPop] = useState(0);
    const [tvLogo, setTvLogo] = useState('<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor"/></svg>');

    const handleTeamUpdate = () => {
        if (!teamName && !teamLogo) return;
        setGameData(prev => {
            if (!prev) return null;
            const newAllTeamsData = prev.allTeamsData.map(t => {
                if (t.id === selectedTeamId) {
                    return { ...t, name: teamName || t.name, logo: teamLogo || t.logo };
                }
                return t;
            });
            // Also update active teams list names
            const newTeams = prev.teams.map(t => {
                if (t.id === selectedTeamId) {
                    return { ...t, name: teamName || t.name };
                }
                return t;
            });
            return { ...prev, allTeamsData: newAllTeamsData, teams: newTeams };
        });
        alert('Team updated!');
    };

    const handleAddBrand = () => {
        if (!brandName) return;
        const newBrand: Brand = {
            name: brandName,
            color: brandColor,
            style: 'font-bold',
            logo: brandLogo
        };
        setGameData(prev => {
            if (!prev) return null;
            return { ...prev, availableBrands: [...(prev.availableBrands || []), newBrand] };
        });
        setBrandName('');
        alert('Brand added! Go to Sponsor Room to use it.');
    };

    const handleAddTV = () => {
        if (!tvName) return;
        const newTV: TVChannel = {
            id: `tv-${Date.now()}`,
            name: tvName,
            logo: tvLogo,
            color: 'text-white',
            minPopularity: tvPop,
            tier: 'Standard'
        };
        setGameData(prev => {
            if (!prev) return null;
            return { ...prev, availableTVChannels: [...(prev.availableTVChannels || []), newTV] };
        });
        setTvName('');
        alert('Channel added! Go to Sponsor Room to use it.');
    };

    return (
        <div className="p-4 h-[calc(100vh-90px)] overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-white">Customization Suite</h2>
            
            <div className="flex justify-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                {['teams', 'brands', 'tv'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${activeTab === tab ? 'bg-teal-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'teams' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Team</label>
                        <select 
                            value={selectedTeamId} 
                            onChange={e => { setSelectedTeamId(e.target.value); setTeamName(''); setTeamLogo(''); }}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        >
                            {gameData.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter new team name" 
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logo SVG Code</label>
                        <textarea 
                            placeholder="Paste SVG code here..." 
                            value={teamLogo}
                            onChange={e => setTeamLogo(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono h-32"
                        />
                    </div>
                    <button onClick={handleTeamUpdate} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg">Update Team</button>
                </div>
            )}

            {activeTab === 'brands' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brand Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Omega Corp" 
                            value={brandName}
                            onChange={e => setBrandName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Brand Color (Tailwind Class)</label>
                        <input 
                            type="text" 
                            placeholder="e.g. text-blue-500" 
                            value={brandColor}
                            onChange={e => setBrandColor(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logo SVG</label>
                        <textarea 
                            value={brandLogo}
                            onChange={e => setBrandLogo(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono h-24"
                        />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className={`w-10 h-10 ${brandColor}`} dangerouslySetInnerHTML={{__html: brandLogo}}></div>
                        <span className={`font-bold ${brandColor}`}>{brandName || 'Preview'}</span>
                    </div>
                    <button onClick={handleAddBrand} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Create Sponsor</button>
                </div>
            )}

            {activeTab === 'tv' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Channel Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Global Sports" 
                            value={tvName}
                            onChange={e => setTvName(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Popularity</label>
                        <input 
                            type="number" 
                            value={tvPop}
                            onChange={e => setTvPop(parseInt(e.target.value))}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logo SVG</label>
                        <textarea 
                            value={tvLogo}
                            onChange={e => setTvLogo(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono h-24"
                        />
                    </div>
                    <button onClick={handleAddTV} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Create Channel</button>
                </div>
            )}
        </div>
    );
};

export default CustomizationHub;
