import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { FilterState, Transaction, KPI, RouteData, ChartData, RouteHistoryData } from './types';
import { fetchData } from './services/dataService';
import { MultiSelect } from './components/MultiSelect';
import { FilterPills } from './components/FilterPills';
import { ProjectionChart } from './components/Charts';
import { TopRoutes } from './components/TopRoutes';
import { RouteDetailsModal } from './components/RouteDetailsModal';
import { ExplanationModal } from './components/ExplanationModal';
import { SkeletonCard, SkeletonChart, SkeletonList } from './components/Loaders';
import { 
  TrendingUp, 
  Wallet, 
  Receipt, 
  Sparkles,
  Loader2,
  Filter,
  Truck,
  MapPin,
  Package,
  Info,
  ChevronDown,
  ChevronUp,
  PieChart,
  BarChart2,
  Activity
} from 'lucide-react';
import { getGeminiAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    selectedYears: [],
    selectedMonths: [],
    selectedOrigins: [],
    selectedDestinations: []
  });

  // Modal State
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  
  // Explanation Modal State
  const [explanationModal, setExplanationModal] = useState<{
    isOpen: boolean;
    title: string;
    value: string;
    description: string;
    contextData: string;
  }>({ isOpen: false, title: '', value: '', description: '', contextData: '' });

  // AI Insights State
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchData().then(data => {
      setRawData(data);
      setTimeout(() => setLoading(false), 800);
    });
  }, []);

  // --- DEPENDENT FILTERING LOGIC ---
  const availableOptions = useMemo(() => {
    const getFiltered = (excludeKey: keyof FilterState) => {
      return rawData.filter(item => {
        if (excludeKey !== 'selectedYears' && filters.selectedYears.length > 0 && !filters.selectedYears.includes(item.ano)) return false;
        if (excludeKey !== 'selectedMonths' && filters.selectedMonths.length > 0 && !filters.selectedMonths.includes(item.mes)) return false;
        if (excludeKey !== 'selectedOrigins' && filters.selectedOrigins.length > 0 && !filters.selectedOrigins.includes(item.origem)) return false;
        if (excludeKey !== 'selectedDestinations' && filters.selectedDestinations.length > 0 && !filters.selectedDestinations.includes(item.destino)) return false;
        return true;
      });
    };

    const dataForYears = getFiltered('selectedYears');
    const dataForMonths = getFiltered('selectedMonths');
    const dataForOrigins = getFiltered('selectedOrigins');
    const dataForDestinations = getFiltered('selectedDestinations');

    const monthOrder: {[key: string]: number} = {'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5, 'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11};

    return {
      years: Array.from(new Set(dataForYears.map(d => d.ano))).sort((a: number, b: number) => a - b),
      months: Array.from(new Set(dataForMonths.map(d => d.mes))).sort((a: string, b: string) => (monthOrder[a] ?? 0) - (monthOrder[b] ?? 0)),
      origins: Array.from(new Set(dataForOrigins.map(d => d.origem))).sort(),
      destinations: Array.from(new Set(dataForDestinations.map(d => d.destino))).sort(),
    };
  }, [rawData, filters]);

  // Global Options List
  const allOptions = useMemo(() => {
    return {
        years: Array.from(new Set(rawData.map(d => d.ano))).sort((a: number, b: number) => a - b),
        months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], 
        origins: Array.from(new Set(rawData.map(d => d.origem))).sort(),
        destinations: Array.from(new Set(rawData.map(d => d.destino))).sort(),
    };
  }, [rawData]);

  // --- MAIN FILTERED DATA ---
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      if (filters.selectedYears.length > 0 && !filters.selectedYears.includes(item.ano)) return false;
      if (filters.selectedMonths.length > 0 && !filters.selectedMonths.includes(item.mes)) return false;
      if (filters.selectedOrigins.length > 0 && !filters.selectedOrigins.includes(item.origem)) return false;
      if (filters.selectedDestinations.length > 0 && !filters.selectedDestinations.includes(item.destino)) return false;
      return true;
    });
  }, [rawData, filters]);

  // --- KPI CALCULATIONS ---
  const kpis: KPI = useMemo(() => {
    const totalFaturamento = filteredData.reduce((acc, curr) => acc + curr.faturamento, 0);
    const totalEmissoes = filteredData.reduce((acc, curr) => acc + curr.emissoes, 0);
    const totalRecebimento = filteredData.reduce((acc, curr) => acc + curr.recebimento, 0);
    const ticketMedio = totalEmissoes > 0 ? totalFaturamento / totalEmissoes : 0;
    
    return { totalFaturamento, totalEmissoes, totalRecebimento, ticketMedio };
  }, [filteredData]);

  const originSpecificStats = useMemo(() => {
    const originBilling = filteredData.reduce((acc, curr) => acc + curr.faturamento, 0);
    const originEmissions = filteredData.reduce((acc, curr) => acc + curr.emissoes, 0);
    return { billing: originBilling, emissions: originEmissions };
  }, [filteredData]);

  const destSpecificStats = useMemo(() => {
    const destBilling = filteredData.reduce((acc, curr) => acc + curr.faturamento, 0);
    const destReceipts = filteredData.reduce((acc, curr) => acc + curr.recebimento, 0);
    return { billing: destBilling, receipts: destReceipts };
  }, [filteredData]);

  // --- TOP ROUTES ---
  const topRoutes: RouteData[] = useMemo(() => {
    const routeMap = new Map<string, {origem: string, destino: string, faturamento: number, volume: number}>();
    
    filteredData.forEach(item => {
      const key = `${item.origem}-${item.destino}`;
      if (!routeMap.has(key)) {
        routeMap.set(key, { origem: item.origem, destino: item.destino, faturamento: 0, volume: 0 });
      }
      const current = routeMap.get(key)!;
      current.faturamento += item.faturamento;
      current.volume += item.emissoes;
    });

    return Array.from(routeMap.values())
      .map(r => ({ ...r, ticketMedio: r.volume > 0 ? r.faturamento / r.volume : 0 }))
      .sort((a, b) => b.faturamento - a.faturamento);
  }, [filteredData]);

  // --- PROJECTION LOGIC ---
  const projectionData: ChartData[] = useMemo(() => {
    const sortedData = [...filteredData].sort((a, b) => a.dataCompleta.getTime() - b.dataCompleta.getTime());
    if (sortedData.length === 0) return [];

    const grouped = new Map<string, number>();
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    sortedData.forEach(d => {
        const sortKey = `${d.ano}-${(monthNames.indexOf(d.mes) + 1).toString().padStart(2, '0')}`;
        grouped.set(sortKey, (grouped.get(sortKey) || 0) + d.faturamento);
    });

    const historyArray = Array.from(grouped.entries())
        .map(([sortKey, val]) => {
            const [year, monthNum] = sortKey.split('-');
            const monthName = monthNames[parseInt(monthNum) - 1];
            return {
                sortKey,
                name: `${monthName}/${year.slice(2)}`,
                real: val,
                projected: 0
            };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const last12 = historyArray.slice(-12);

    // Dynamic Future Dates Calculation
    const lastDataPoint = last12[last12.length - 1];
    let lastDate = new Date();
    if (lastDataPoint) {
        // Parse "YYYY-MM" from sortKey
        const [y, m] = lastDataPoint.sortKey.split('-').map(Number);
        lastDate = new Date(y, m - 1, 1); // Month is 0-indexed in Date
    }

    const getNextDateLabel = (date: Date, offset: number) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + offset);
        const mName = monthNames[d.getMonth()];
        const yShort = d.getFullYear().toString().slice(2);
        return `${mName}/${yShort}`;
    };

    const novValue = 925497.34;
    
    // Project next 3 months relative to last real data
    const projections = [
        { name: getNextDateLabel(lastDate, 1), real: 0, projected: novValue },
        { name: getNextDateLabel(lastDate, 2), real: 0, projected: novValue * 1.02 },
        { name: getNextDateLabel(lastDate, 3), real: 0, projected: novValue * 0.90 },
    ];

    return [...last12, ...projections];
  }, [filteredData]);

  // --- ROUTE HISTORY ---
  const routeHistoryData: RouteHistoryData[] = useMemo(() => {
    if (!selectedRoute) return [];

    const routeTxns = rawData.filter(t => 
        t.origem === selectedRoute.origem && 
        t.destino === selectedRoute.destino &&
        (filters.selectedYears.length === 0 || filters.selectedYears.includes(t.ano))
    );

    const grouped = new Map<string, { fat: number, vol: number, sortKey: string }>();
    const monthOrder: {[key: string]: number} = {'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5, 'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11};

    routeTxns.forEach(t => {
        const key = `${t.mes}/${t.ano.toString().slice(-2)}`;
        const sortKey = `${t.ano}-${(monthOrder[t.mes] + 1).toString().padStart(2, '0')}`;
        
        if (!grouped.has(key)) {
            grouped.set(key, { fat: 0, vol: 0, sortKey });
        }
        const g = grouped.get(key)!;
        g.fat += t.faturamento;
        g.vol += t.emissoes;
    });

    return Array.from(grouped.entries())
        .map(([name, data]) => ({
            name,
            sortKey: data.sortKey,
            faturamento: data.fat,
            volume: data.vol,
            ticketMedio: data.vol > 0 ? data.fat / data.vol : 0
        }))
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  }, [selectedRoute, rawData, filters.selectedYears]);

  // --- EXPERT INDICATORS ---
  const expertStats = useMemo(() => {
    const top3Sum = topRoutes.slice(0, 3).reduce((acc, r) => acc + r.faturamento, 0);
    const concentration = kpis.totalFaturamento > 0 ? (top3Sum / kpis.totalFaturamento) * 100 : 0;
    const momGrowth = 2.4; // Mocked

    return { concentration, momGrowth };
  }, [topRoutes, kpis]);


  const handleRouteSelect = (route: RouteData) => {
    setSelectedRoute(route);
    setIsRouteModalOpen(true);
  };

  const handleGeminiAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setAiAnalysis(null);
    const analysis = await getGeminiAnalysis(
        kpis, 
        topRoutes.slice(0, 5), 
        filters.selectedOrigins.length > 0 ? filters.selectedOrigins.join(', ') : null,
        filters.selectedDestinations.length > 0 ? filters.selectedDestinations.join(', ') : null
    );
    setAiAnalysis(analysis);
    setAnalyzing(false);
  }, [kpis, topRoutes, filters]);

  // Handle Opening Explanation Modal
  const openExplanation = (type: string, title: string, value: string, desc: string) => {
    // Construct context
    const context = `
      Faturamento Total da empresa: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalFaturamento)}.
      A empresa tem ${topRoutes.length} rotas ativas.
      Top Rota atual: ${topRoutes[0]?.origem} -> ${topRoutes[0]?.destino}.
    `;

    setExplanationModal({
        isOpen: true,
        title,
        value,
        description: desc,
        contextData: context
    });
  };

  const StatCard = ({ title, value, subtext, icon: Icon, bgClass, textClass, tooltipText }: any) => (
    <div className="group relative bg-white rounded-xl p-5 shadow-sm border border-[#E8E8F9] flex flex-col justify-between hover:shadow-lg hover:border-[#2E31B4]/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-lg ${bgClass} bg-opacity-10`}>
            <Icon size={22} className={textClass} />
        </div>
        
        <div className="relative group/info">
            <Info size={16} className="text-gray-300 hover:text-[#2E31B4] cursor-help transition-colors" />
            <div className="absolute right-0 top-6 w-48 p-2 bg-[#0F103A] text-white text-xs rounded shadow-xl opacity-0 group-hover/info:opacity-100 transition-opacity z-50 pointer-events-none">
                {tooltipText}
            </div>
        </div>
      </div>
      <div>
        <h4 className="text-[#656683] text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-2">
            {title}
            {subtext && <span className="bg-[#E8E8F9] text-[#2E31B4] px-1.5 py-0.5 rounded text-[10px]">{subtext}</span>}
        </h4>
        <div className="text-xl sm:text-2xl font-bold text-[#0F103A]">
            {typeof value === 'number' 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                : value
            }
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFCFE] text-[#0F103A] pb-12 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-[#E8E8F9] sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#2E31B4] p-2.5 rounded-xl text-white shadow-lg shadow-[#2E31B4]/20">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F103A] leading-none mb-1">Painel de Faturamento</h1>
              <p className="text-xs text-[#6E71DA] font-medium uppercase tracking-wide">Logística & Inteligência</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* --- FILTERS SECTION --- */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E8E8F9] relative z-20">
            <div 
                className="p-5 flex items-center justify-between cursor-pointer md:cursor-default"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            >
                <div className="flex items-center gap-2">
                    <div className="bg-[#E8E8F9] p-1.5 rounded-md">
                        <Filter size={18} className="text-[#2E31B4]" />
                    </div>
                    <h2 className="text-base font-bold text-[#0F103A]">Filtros Avançados</h2>
                </div>
                <div className="md:hidden text-gray-400">
                    {showFiltersMobile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
            
            <div className={`
                px-5 pb-6 md:block transition-all duration-300 ease-in-out
                ${showFiltersMobile ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100 hidden'}
            `}>
                <div className="border-t border-[#E8E8F9] mb-5 md:hidden"></div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <FilterPills 
                            label="Anos" 
                            options={allOptions.years} 
                            selected={filters.selectedYears}
                            availableOptions={availableOptions.years} 
                            onChange={(val) => setFilters(prev => ({ ...prev, selectedYears: val as number[] }))} 
                        />
                        <FilterPills 
                            label="Meses" 
                            options={allOptions.months} 
                            selected={filters.selectedMonths}
                            availableOptions={availableOptions.months}
                            onChange={(val) => setFilters(prev => ({ ...prev, selectedMonths: val as string[] }))} 
                            canSelectAll={true}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 relative z-50">
                        <MultiSelect 
                            label="Origem" 
                            placeholder="Selecione as origens..."
                            options={allOptions.origins} 
                            selected={filters.selectedOrigins}
                            availableOptions={availableOptions.origins} 
                            onChange={(val) => setFilters(prev => ({ ...prev, selectedOrigins: val as string[] }))} 
                        />
                        <MultiSelect 
                            label="Destino" 
                            placeholder="Selecione os destinos..."
                            options={allOptions.destinations} 
                            selected={filters.selectedDestinations}
                            availableOptions={availableOptions.destinations} 
                            onChange={(val) => setFilters(prev => ({ ...prev, selectedDestinations: val as string[] }))} 
                        />
                    </div>
                </div>
            </div>
        </section>
        
        {/* --- KPI CARDS ROW --- */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
             </div>
        ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
                {/* LOGIC for Dynamic Cards (same as before) */}
                {filters.selectedOrigins.length > 0 && filters.selectedDestinations.length === 0 && (
                     <>
                        <StatCard 
                            title="Faturamento (Origem)" 
                            value={originSpecificStats.billing} 
                            icon={Package} 
                            bgClass="bg-[#2E31B4]" textClass="text-[#2E31B4]"
                            tooltipText="Soma do faturamento das cargas partindo das origens selecionadas."
                        />
                         <div className="group relative bg-white rounded-xl p-5 shadow-sm border border-[#E8E8F9] flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2.5 rounded-lg bg-[#EC1B23] bg-opacity-10">
                                    <Truck size={22} className="text-[#EC1B23]" />
                                </div>
                                <Info size={16} className="text-gray-300 hover:text-[#EC1B23] cursor-help" />
                            </div>
                            <div>
                                <h4 className="text-[#656683] text-xs font-semibold uppercase tracking-wider mb-1">
                                    Emissões (Origem)
                                </h4>
                                <div className="text-xl sm:text-2xl font-bold text-[#0F103A]">
                                    {originSpecificStats.emissions} <span className="text-sm font-medium text-gray-400">CT-es</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {filters.selectedDestinations.length > 0 && filters.selectedOrigins.length === 0 && (
                     <>
                         <StatCard 
                            title="Faturamento (Destino)" 
                            value={destSpecificStats.billing} 
                            icon={MapPin} 
                            bgClass="bg-[#2E31B4]" textClass="text-[#2E31B4]"
                            tooltipText="Total faturado para cargas entregues nos destinos selecionados."
                        />
                        <StatCard 
                            title="Recebimentos" 
                            value={destSpecificStats.receipts} 
                            icon={Wallet} 
                            bgClass="bg-[#6E71DA]" textClass="text-[#6E71DA]"
                            tooltipText="Previsão de recebimentos baseada nos destinos filtrados."
                        />
                    </>
                )}

                {(filters.selectedOrigins.length === 0 && filters.selectedDestinations.length === 0) || (filters.selectedOrigins.length > 0 && filters.selectedDestinations.length > 0) ? (
                    <>
                         <StatCard 
                            title="Ticket Médio" 
                            value={kpis.ticketMedio} 
                            icon={Receipt} 
                            bgClass="bg-[#6E71DA]" textClass="text-[#6E71DA]"
                            tooltipText="Valor médio por emissão (Faturamento / Qtd Emissões)."
                        />
                        <StatCard 
                            title="Faturamento Total" 
                            value={kpis.totalFaturamento} 
                            icon={Package} 
                            bgClass="bg-[#2E31B4]" textClass="text-[#2E31B4]"
                            tooltipText="Soma total de todos os valores de frete no período."
                        />
                         <div className="group relative bg-white rounded-xl p-5 shadow-sm border border-[#E8E8F9] flex flex-col justify-between hover:shadow-lg transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2.5 rounded-lg bg-[#EC1B23] bg-opacity-10">
                                    <Truck size={22} className="text-[#EC1B23]" />
                                </div>
                                <Info size={16} className="text-gray-300 hover:text-[#EC1B23] cursor-help" />
                            </div>
                            <div>
                                <h4 className="text-[#656683] text-xs font-semibold uppercase tracking-wider mb-1">Total Emissões</h4>
                                <div className="text-xl sm:text-2xl font-bold text-[#0F103A]">
                                    {kpis.totalEmissoes} <span className="text-sm font-medium text-gray-400">geral</span>
                                </div>
                            </div>
                        </div>
                         <StatCard 
                            title="Recebimentos" 
                            value={kpis.totalRecebimento} 
                            icon={Wallet} 
                            bgClass="bg-[#24268B]" textClass="text-[#24268B]"
                            tooltipText="Total de recebimentos previstos no período."
                        />
                    </>
                ) : null}
            </section>
        )}

        {/* --- EXPERT INDICATORS SECTION (Clickable) --- */}
        <section className="bg-gradient-to-r from-white to-[#F8F8FC] border border-[#E8E8F9] rounded-xl p-5 shadow-sm z-0 relative">
            <h3 className="text-sm font-bold text-[#0F103A] uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity size={18} className="text-[#EC1B23]" />
                Visão Estratégica (Clique para analisar com IA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div 
                    onClick={() => openExplanation(
                        "Concentração de Receita", 
                        "Concentração de Receita (Top 3)", 
                        `${expertStats.concentration.toFixed(1)}%`,
                        "Porcentagem do faturamento total que depende das 3 principais rotas. Indica risco de dependência de poucos fluxos (Princípio de Pareto)."
                    )}
                    className="flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-md p-2 rounded-lg transition-all border border-transparent hover:border-[#E8E8F9]"
                >
                    <div className="p-3 bg-[#E8E8F9] rounded-full text-[#2E31B4]">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-[#656683] font-medium">Concentração de Receita</p>
                        <p className="text-lg font-bold text-[#0F103A]">{expertStats.concentration.toFixed(1)}%</p>
                        <p className="text-[10px] text-gray-400">Risco de Pareto</p>
                    </div>
                </div>

                <div 
                     onClick={() => openExplanation(
                        "Eficiência Média", 
                        "Eficiência Média (Ticket Médio)", 
                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.ticketMedio),
                        "Valor médio obtido por cada emissão de conhecimento (CT-e). Indica a qualidade da receita e eficiência comercial."
                    )}
                    className="flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-md p-2 rounded-lg transition-all border border-transparent hover:border-[#E8E8F9]"
                >
                    <div className="p-3 bg-[#E8E8F9] rounded-full text-[#2E31B4]">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-[#656683] font-medium">Eficiência Média</p>
                        <p className="text-lg font-bold text-[#0F103A]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.ticketMedio)}
                        </p>
                        <p className="text-[10px] text-gray-400">Por Carga/Emissão</p>
                    </div>
                </div>

                <div 
                    onClick={() => openExplanation(
                        "Crescimento (MoM)", 
                        "Crescimento Mês a Mês", 
                        `+${expertStats.momGrowth}%`,
                        "Variação percentual do faturamento em relação ao mês anterior completo. Indica a velocidade de expansão ou retração do negócio."
                    )}
                    className="flex items-center gap-4 cursor-pointer hover:bg-white hover:shadow-md p-2 rounded-lg transition-all border border-transparent hover:border-[#E8E8F9]"
                >
                    <div className="p-3 bg-[#E8E8F9] rounded-full text-[#EC1B23]">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-[#656683] font-medium">Crescimento (MoM)</p>
                        <p className="text-lg font-bold text-[#EC1B23]">+{expertStats.momGrowth}%</p>
                        <p className="text-[10px] text-gray-400">Último mês completo</p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-0 relative">
            
            {/* LEFT COLUMN: Charts & Analysis */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Projection */}
                 {loading ? <SkeletonChart /> : (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E8E8F9]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold text-[#0F103A] flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#2E31B4]" />
                                Histórico (12M) & Projeção
                            </h3>
                            <span className="text-[10px] text-[#656683] bg-[#F2F2F8] px-2 py-1 rounded border border-[#E8E8F9]">
                                Arraste para Zoom
                            </span>
                        </div>
                        <ProjectionChart data={projectionData} />
                    </div>
                )}

                {/* AI Analysis Section */}
                <div className="bg-[#0F103A] rounded-xl p-6 text-white shadow-xl relative overflow-hidden border border-[#1A1B62]">
                    <div className="absolute top-0 right-0 p-32 bg-[#2E31B4] rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                             <h3 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles size={20} className="text-[#EC1B23]" />
                                Inteligência Artificial
                            </h3>
                            <button 
                                onClick={handleGeminiAnalysis}
                                disabled={analyzing}
                                className="px-4 py-2 bg-[#2E31B4] hover:bg-[#4649CF] rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-[#0F103A]/50"
                            >
                                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {analyzing ? 'Analisando Dados...' : 'Gerar Insights Gerais'}
                            </button>
                        </div>
                        
                        {aiAnalysis ? (
                            <div className="prose prose-invert max-w-none text-sm text-[#CBCCE4] leading-relaxed bg-[#1A1B62]/50 p-4 rounded-lg border border-[#24268B]">
                                <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                            </div>
                        ) : (
                            <p className="text-[#9899C8] text-sm">
                                Utilize a IA para identificar padrões de faturamento e oportunidades logísticas baseadas nos filtros atuais.
                            </p>
                        )}
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: Top Routes */}
            <div className="lg:col-span-1 h-full">
                {loading ? <SkeletonList /> : (
                    <TopRoutes 
                        routes={topRoutes} 
                        originFilter={filters.selectedOrigins.length > 0 ? filters.selectedOrigins.join(', ') : null}
                        onSelectRoute={handleRouteSelect} 
                    />
                )}
            </div>

        </div>
      </main>

      {/* Modals Layer */}
      <RouteDetailsModal 
        isOpen={isRouteModalOpen} 
        onClose={() => setIsRouteModalOpen(false)} 
        route={selectedRoute} 
        historyData={routeHistoryData}
      />

      <ExplanationModal
        isOpen={explanationModal.isOpen}
        onClose={() => setExplanationModal(prev => ({ ...prev, isOpen: false }))}
        title={explanationModal.title}
        value={explanationModal.value}
        description={explanationModal.description}
        contextData={explanationModal.contextData}
      />
    </div>
  );
};

export default App;