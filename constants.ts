
import { Player, Team, PlayerRole } from './types';
import { generateInitialStats } from './data';

// Updated initial squad to match Player interface and use PlayerRole enum values.
export const INITIAL_SQUAD: Player[] = [
  { id: '1', name: 'Virat Kohli', nationality: 'India', role: PlayerRole.BATSMAN, battingSkill: 94, secondarySkill: 20, style: 'N', isOpener: false, isForeign: false, stats: generateInitialStats() },
  { id: '2', name: 'Jasprit Bumrah', nationality: 'India', role: PlayerRole.FAST_BOWLER, battingSkill: 15, secondarySkill: 96, style: 'D', isOpener: false, isForeign: false, stats: generateInitialStats() },
  { id: '3', name: 'Ben Stokes', nationality: 'England', role: PlayerRole.ALL_ROUNDER, battingSkill: 88, secondarySkill: 85, style: 'A', isOpener: false, isForeign: true, stats: generateInitialStats() },
  { id: '4', name: 'Quinton de Kock', nationality: 'South Africa', role: PlayerRole.WICKET_KEEPER, battingSkill: 86, secondarySkill: 5, style: 'A', isOpener: true, isForeign: true, stats: generateInitialStats() },
  { id: '5', name: 'Rashid Khan', nationality: 'Afghanistan', role: PlayerRole.SPIN_BOWLER, battingSkill: 30, secondarySkill: 95, style: 'A', isOpener: false, isForeign: true, stats: generateInitialStats() },
  { id: '6', name: 'Steve Smith', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 92, secondarySkill: 40, style: 'D', isOpener: false, isForeign: true, stats: generateInitialStats() },
];

// Fixed INITIAL_TEAM to comply with Team interface by adding the missing 'purse' property.
export const INITIAL_TEAM: Team = {
  id: 'team_mavericks',
  name: 'Mumbai Mavericks',
  squad: INITIAL_SQUAD,
  captains: {},
  /* Fix: Added missing 'purse' property required by Team interface */
  purse: 50.0,
};

// Updated market players to use correct PlayerRole enum and mandatory Player fields.
export const MARKET_PLAYERS: Player[] = [
  { id: 'm1', name: 'Shaheen Afridi', nationality: 'Pakistan', role: PlayerRole.FAST_BOWLER, battingSkill: 20, secondarySkill: 93, style: 'D', isOpener: false, isForeign: true, stats: generateInitialStats() },
  { id: 'm2', name: 'Travis Head', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 89, secondarySkill: 45, style: 'A', isOpener: true, isForeign: true, stats: generateInitialStats() },
  { id: 'm3', name: 'Sam Curran', nationality: 'England', role: PlayerRole.ALL_ROUNDER, battingSkill: 75, secondarySkill: 82, style: 'A', isOpener: false, isForeign: true, stats: generateInitialStats() },
];
