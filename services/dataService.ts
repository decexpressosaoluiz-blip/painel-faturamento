import Papa from 'papaparse';
import { Transaction } from '../types';

const SHEET_ID = '1G7haiHlUvVAz6HhlwmG-tdRdbvInJspzdkvrWisLqb0';
const GID = '647295644';
// Usando o endpoint gviz/tq que é mais permissivo com CORS e retorna CSV limpo
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

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

const parseCurrency = (value: string | number): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  
  // Remove R$, spaces, and handle PT-BR format (1.000,00)
  // Remove dots (thousands) then replace comma with dot
  const cleanStr = value.toString().replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
};

const parseDate = (dateStr: string): { date: Date, year: number, month: string } => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  try {
    if (!dateStr) throw new Error('Empty date');
    
    // gviz might return dates differently or standard DD/MM/YYYY
    let day = 1, monthIndex = 0, year = 2024;

    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            day = parseInt(parts[0], 10);
            monthIndex = parseInt(parts[1], 10) - 1;
            year = parseInt(parts[2], 10);
        }
    } else if (dateStr.includes('-')) {
        // Handle ISO-like (YYYY-MM-DD) which sometimes appears
        const parts = dateStr.split('-');
        if (parts.length === 3) {
             year = parseInt(parts[0], 10);
             monthIndex = parseInt(parts[1], 10) - 1;
             day = parseInt(parts[2], 10);
        }
    } else {
        // Fallback for unexpected formats
        throw new Error('Unrecognized date format');
    }

    if (isNaN(year) || isNaN(monthIndex) || isNaN(day)) throw new Error('Invalid date numbers');
    
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
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: false, 
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          
          // gviz usually includes headers. 
          // We assume headers exist if the first row contains text like 'Data' or 'Origem'
          let startIndex = 0;
          if (rows.length > 0) {
              const firstCell = rows[0][0] ? rows[0][0].toString().toLowerCase() : '';
              if (firstCell.includes('data') || firstCell.includes('label')) {
                  startIndex = 1;
              }
          }

          const parsedData: Transaction[] = [];

          for (let i = startIndex; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 4) continue; // Skip incomplete rows

            // Column Mapping:
            // A (0): Data (DD/MM/AAAA)
            // B (1): Origem
            // C (2): Destino
            // D (3): Valor
            
            const dateStr = row[0];
            const origem = row[1] ? row[1].trim() : 'N/A';
            const destino = row[2] ? row[2].trim() : 'N/A';
            const valorStr = row[3];

            // If headers are repeated or empty rows slipped through
            if (!dateStr || dateStr.toLowerCase() === 'data') continue;

            const { date, year, month } = parseDate(dateStr);
            const valor = parseCurrency(valorStr);

            parsedData.push({
              id: `row-${i}`,
              ano: year,
              mes: month,
              origem: origem || 'Desconhecido',
              destino: destino || 'Desconhecido',
              faturamento: valor,
              emissoes: 1, 
              recebimento: valor,
              dataCompleta: date
            });
          }
          
          console.log(`Dados reais carregados: ${parsedData.length} registros.`);
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