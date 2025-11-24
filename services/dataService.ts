import Papa from 'papaparse';
import { Transaction } from '../types';

const SHEET_ID = '1G7haiHlUvVAz6HhlwmG-tdRdbvInJspzdkvrWisLqb0';
const GID = '647295644';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// Mock data as fallback
const MOCK_DATA: Transaction[] = Array.from({ length: 50 }).map((_, i) => {
  const year = 2024;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const origins = ['São Paulo', 'Belo Horizonte', 'Curitiba', 'Porto Alegre'];
  const destinations = ['Manaus', 'Recife', 'Salvador', 'Fortaleza'];
  
  const monthIndex = Math.floor(Math.random() * months.length);
  const valor = Math.floor(Math.random() * 5000) + 500;

  return {
    id: `mock-${i}`,
    ano: year,
    mes: months[monthIndex],
    origem: origins[Math.floor(Math.random() * origins.length)],
    destino: destinations[Math.floor(Math.random() * destinations.length)],
    faturamento: valor,
    emissoes: 1,
    recebimento: valor,
    dataCompleta: new Date(year, monthIndex, 1)
  };
});

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove R$, spaces, and handle PT-BR format (1.000,00)
  // Remove dots (thousands) then replace comma with dot
  const cleanStr = value.toString().replace(/[R$\s.]/g, '').replace(',', '.');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

const parseDate = (dateStr: string): { date: Date, year: number, month: string } => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  try {
    if (!dateStr) throw new Error('Empty date');
    // Expecting DD/MM/YYYY
    const parts = dateStr.split('/');
    if (parts.length !== 3) throw new Error('Invalid date format');
    
    const day = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, monthIndex, day);
    return {
      date,
      year,
      month: months[monthIndex] || 'Jan'
    };
  } catch (e) {
    const now = new Date();
    return {
      date: now,
      year: now.getFullYear(),
      month: months[now.getMonth()]
    };
  }
};

export const fetchData = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch CSV');
    }
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: false, // We use index based mapping as headers might vary or not exist in export
        skipEmptyLines: true,
        complete: (results) => {
          // Assume Row 1 is header, start from Row 2 (index 1) if headers exist. 
          // However, user said "Column A...", let's inspect row 0 to see if it's a header.
          const rows = results.data as string[][];
          const startIndex = (rows[0][0].toLowerCase().includes('data') || rows[0][3].toLowerCase().includes('valor')) ? 1 : 0;

          const parsedData: Transaction[] = rows.slice(startIndex).map((row, index) => {
            // Column Mapping based on prompt:
            // A (0): Data (DD/MM/AAAA)
            // B (1): Origem
            // C (2): Destino
            // D (3): Valor
            
            const dateStr = row[0];
            const origem = row[1] ? row[1].trim() : 'N/A';
            const destino = row[2] ? row[2].trim() : 'N/A';
            const valorStr = row[3];

            const { date, year, month } = parseDate(dateStr);
            const valor = parseCurrency(valorStr);

            return {
              id: `row-${index}`,
              ano: year,
              mes: month,
              origem: origem || 'Desconhecido',
              destino: destino || 'Desconhecido',
              faturamento: valor,
              emissoes: 1, // Represents 1 shipment/emission per row
              recebimento: valor, // Assuming simplified model where Value = Receipt
              dataCompleta: date
            };
          });
          resolve(parsedData);
        },
        error: (err: any) => {
          console.error("CSV Parse Error", err);
          resolve(MOCK_DATA);
        }
      });
    });
  } catch (error) {
    console.warn("Could not fetch live data (likely CORS), using mock data.", error);
    return MOCK_DATA;
  }
};