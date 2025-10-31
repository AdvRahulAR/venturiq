
import { Sector, Geography, Stage, Weightages } from './types';

export const LOCAL_STORAGE_KEYS = {
  HISTORY: 'aiAnalystHistory',
  THEME: 'aiAnalystTheme',
};

export const SECTOR_OPTIONS = Object.values(Sector);
export const GEOGRAPHY_OPTIONS = Object.values(Geography);
export const STAGE_OPTIONS = Object.values(Stage);

export const DEFAULT_WEIGHTAGES: Weightages = {
  team: 25,
  market: 20,
  product: 20,
  traction: 20,
  unitEconomics: 10,
  risks: -15,
};

export const MAX_HISTORY_ENTRIES = 50;