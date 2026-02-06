import { StockData } from '../types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwgBecjYUtKoC0MoqVvEJbsaWpx93USXViXh7Sw-t5izoxFFpqkavxO90GaitAK-DwOTsXWGqt4vEg/pub?output=csv';

export const fetchStockData = async (): Promise<StockData[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV data');
    }
    const text = await response.text();
    const data = parseCSV(text);
    // Shuffle the data to ensure randomness in the game
    return shuffleArray(data);
  } catch (error) {
    console.error('Error loading stock data:', error);
    return [];
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const parseCSV = (csvText: string): StockData[] => {
  const lines = csvText.split(/\r?\n/);
  const data: StockData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',');
    
    if (columns.length >= 4) {
      data.push({
        id: columns[0].trim(),
        symbol: columns[0].trim(),
        name: columns[1].trim(),
        industry: columns[2].trim(),
        hint: columns[3].trim(),
      });
    }
  }
  return data;
};