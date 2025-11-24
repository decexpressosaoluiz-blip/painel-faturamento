import { GoogleGenAI } from "@google/genai";
import { KPI, RouteData } from "../types";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiAnalysis = async (
  kpis: KPI,
  topRoutes: RouteData[],
  selectedOrigin: string | null,
  selectedDestination: string | null
): Promise<string> => {
  if (!ai) {
    return "API Key não configurada.";
  }

  const context = `
    Contexto do Painel de Faturamento:
    - Faturamento Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalFaturamento)}
    - Emissões Totais: ${kpis.totalEmissoes}
    - Ticket Médio: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.ticketMedio)}
    - Origem Selecionada: ${selectedOrigin || 'Todas'}
    - Destino Selecionado: ${selectedDestination || 'Todos'}
    
    Top Rotas por Faturamento:
    ${topRoutes.map(r => `${r.origem} -> ${r.destino}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.faturamento)}`).join('\n')}
  `;

  const prompt = `
    Atue como um analista de dados sênior especializado em logística e finanças.
    Analise os seguintes dados do painel de faturamento.
    Forneça 3 insights breves e estratégicos sobre o desempenho, identificando padrões, oportunidades de crescimento ou anomalias.
    Use formatação markdown simples. Seja direto e profissional.
    
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao comunicar com a IA.";
  }
};

export const getStrategicInsight = async (
    indicatorName: string,
    value: string,
    description: string,
    contextData: string
): Promise<string> => {
    if (!ai) return "Configuração de API necessária para análise profunda.";

    const prompt = `
        Você é um consultor estratégico de logística. O usuário clicou no indicador "${indicatorName}" que está com o valor "${value}".
        
        Descrição do indicador: ${description}
        Contexto Adicional: ${contextData}

        1. Explique em linguagem simples o que esse indicador significa para uma transportadora.
        2. Analise se este valor é bom, ruim ou neutro (considere benchmarks gerais de logística).
        3. Dê uma sugestão de ação prática para melhorar ou manter esse número.

        Seja conciso (máximo 100 palavras). Use Markdown.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Análise indisponível.";
    } catch (error) {
        return "Erro na análise de IA.";
    }
};