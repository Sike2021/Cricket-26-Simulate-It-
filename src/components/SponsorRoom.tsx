
import React, { useState, useEffect } from 'react';
import { GameData, Format, Sponsorship } from '../types';
import { SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS, INITIAL_SPONSORSHIPS } from '../data';
import { Icons } from './GameComponents';

interface SponsorRoomProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const SponsorRoom: React.FC<SponsorRoomProps> = ({ gameData, setGameData }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');

    const sponsorship = gameData.sponsorships[selectedFormat] || INITIAL_SPONSORSHIPS[selectedFormat];
    const currentThresholds = SPONSOR_THRESHOLDS[selectedFormat];
    const popularity = gameData.popularity || 0;
    
    // Use dynamic available brands and TV channels
    const availableBrands = gameData.availableBrands || [];
    const availableTV = gameData.availableTVChannels || [];

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20, Format.DEVELOPMENT_T20, Format.RISE_T20];
            case 'List A': return [Format.ODI, Format.DEVELOPMENT_ODI, Format.RISE_ODI];
            case 'First Class': return [Format.FIRST_CLASS, Format.DEVELOPMENT_FIRST_CLASS, Format.RISE_FIRST_CLASS];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormat)) {
            setSelectedFormat(formats[0]);
        }
    }, [category]);

    const handleSelectSponsor = (brandName: string, logoColor: string) => {
        const threshold = currentThresholds[brandName as keyof typeof currentThresholds] || 999;
        if (popularity < threshold) return;

        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                sponsorName: brandName,
                logoColor: logoColor
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    };

    const handleSelectTournamentLogo = (svg: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tournamentLogo: svg
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    };

    const handleSelectTV = (name: string, logo: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tvChannel: name,
                tvLogo: logo
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    }

    const handleNameChange = (value: string) => {
        setGameData(prev => {
            if (!prev) return null;
            const newSponsorships = { ...prev.sponsorships };
            newSponsorships[selectedFormat] = {
                ...newSponsorships[selectedFormat],
                tournamentName: value
            };
            return { ...prev, sponsorships: newSponsorships };
        });
    }

    return (
        <div className="h-[calc(100vh-90px)] overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="bg-slate-900 dark:bg-slate-950 p-4 pb-2 text-white sticky top-0 z-10 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Sponsor Room</h2>
                        <p className="text-xs text-slate-400">Manage Team Finances & Identity</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Popularity</span>
                        <div className="text-xl font-bold text-yellow-400 flex items-center gap-1">
                            <span>★</span> {popularity}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-1 mb-2">
                    {['T20', 'List A', 'First Class'].map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => setCategory(cat as any)} 
                            className={`px-4 py-2 text-xs font-bold uppercase rounded-full transition-colors ${category === cat ? 'bg-teal-500 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as Format)}
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                    {getFormatsForCategory(category).map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            <div className="p-4 space-y-6">
                <section>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">Tournament Identity</h3>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="mb-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 relative overflow-hidden">
                            {sponsorship.tvLogo && (
                                <div className="absolute top-2 right-2 w-8 h-8 opacity-50" dangerouslySetInnerHTML={{__html: sponsorship.tvLogo}}></div>
                            )}
                            <div className={`w-16 h-16 mb-2 ${sponsorship.logoColor || 'text-teal-500'}`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo || TOURNAMENT_LOGOS[0].svg}}></div>
                            <h1 className={`text-xl text-center ${sponsorship.logoColor || 'text-teal-500'} ${sponsorship.sponsorName === "Sike's" ? 'font-extrabold tracking-tight font-display' : 'font-bold'}`}>
                                {sponsorship.sponsorName} <span className="text-slate-800 dark:text-white font-light italic">{sponsorship.tournamentName}</span>
                            </h1>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Select Trophy Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {TOURNAMENT_LOGOS.map((logo) => (
                                    <button 
                                        key={logo.id} 
                                        onClick={() => handleSelectTournamentLogo(logo.svg)}
                                        className={`aspect-square p-2 rounded-lg border-2 transition-all flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 ${sponsorship.tournamentLogo === logo.svg ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <div className="w-6 h-6 text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{__html: logo.svg}}></div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Tournament Name</label>
                            <input 
                                type="text" 
                                value={sponsorship.tournamentName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                className="w-full p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">Broadcast Rights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableTV.map(tv => {
                            const isLocked = popularity < tv.minPopularity;
                            const isSelected = sponsorship.tvChannel === tv.name;
                            
                            return (
                                <button
                                    key={tv.id}
                                    onClick={() => !isLocked && handleSelectTV(tv.name, tv.logo)}
                                    disabled={isLocked}
                                    className={`p-3 rounded-xl border-2 text-left relative overflow-hidden group transition-all ${isSelected ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-teal-300'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`w-8 h-8 ${tv.color}`} dangerouslySetInnerHTML={{__html: tv.logo}}></div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isLocked ? 'border-gray-500 text-gray-500' : 'border-slate-200 text-slate-500'}`}>
                                            {/* @ts-ignore */}
                                            {tv.tier}
                                        </span>
                                    </div>
                                    <div className="font-bold text-sm text-slate-800 dark:text-white">{tv.name}</div>
                                    {isLocked && <div className="text-[10px] text-red-500 mt-1">Requires {tv.minPopularity} Popularity ★</div>}
                                    {isSelected && <div className="absolute top-2 right-2 text-teal-500"><Icons.Check className="h-5 w-5" /></div>}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">Sponsorship Deals</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableBrands.map((brand) => {
                            const threshold = currentThresholds[brand.name as keyof typeof currentThresholds] || 0; // Default 0 for custom brands
                            const isLocked = popularity < threshold;
                            const isSelected = sponsorship.sponsorName === brand.name;

                            return (
                                <div 
                                    key={brand.name} 
                                    className={`relative rounded-xl p-4 border-2 transition-all ${isSelected ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} ${isLocked ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 ${brand.color}`} dangerouslySetInnerHTML={{__html: brand.logo}}></div>
                                        <div>
                                            <h4 className={`text-lg leading-none ${brand.color} ${brand.style?.replace('text-', '')}`}>{brand.name}</h4>
                                            <p className="text-[10px] text-slate-500 mt-1">Official Partner</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-xs font-medium text-slate-500">
                                            Req: <span className={isLocked ? 'text-red-500' : 'text-green-500'}>{threshold} ★</span>
                                        </div>
                                        {isSelected ? (
                                            <span className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded">ACTIVE</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleSelectSponsor(brand.name, brand.color)}
                                                disabled={isLocked}
                                                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${isLocked ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200'}`}
                                            >
                                                {isLocked ? 'LOCKED' : 'SIGN DEAL'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SponsorRoom;
