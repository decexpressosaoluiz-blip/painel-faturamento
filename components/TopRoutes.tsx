import React, { useState } from 'react';
import { RouteData } from '../types';
import { ArrowRight, Trophy, MapPin, MousePointerClick, BarChart3, List } from 'lucide-react';
import { TopRoutesBarChart } from './Charts';

interface TopRoutesProps {
  routes: RouteData[];
  originFilter?: string | null;
  onSelectRoute: (route: RouteData) => void;
}

export const TopRoutes: React.FC<TopRoutesProps> = ({ routes, originFilter, onSelectRoute }) => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E8E8F9] overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-[#E8E8F9] bg-[#FCFCFE] flex items-center justify-between shrink-0">
        <div>
            <h3 className="font-bold text-[#0F103A] flex items-center gap-2 text-sm uppercase tracking-wide">
            <Trophy size={16} className="text-[#EC1B23]" />
            Top 10 Rotas
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Por Faturamento</p>
        </div>
        
        <div className="flex gap-1">
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#E8E8F9] text-[#2E31B4]' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Lista"
            >
                <List size={16} />
            </button>
            <button 
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-[#E8E8F9] text-[#2E31B4]' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Gráfico"
            >
                <BarChart3 size={16} />
            </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 min-h-[300px] max-h-[600px] custom-scrollbar bg-white">
        {viewMode === 'chart' && (
            <div className="p-4 border-b border-[#E8E8F9]">
                <h4 className="text-xs font-bold text-[#656683] mb-2 uppercase text-center">Distribuição de Receita (Top 5)</h4>
                <TopRoutesBarChart routes={routes} />
            </div>
        )}

        <table className="w-full">
          <thead className="bg-white text-xs text-[#656683] uppercase font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-5 py-3 text-left tracking-wider bg-[#F8FAFC] backdrop-blur-sm">Rota</th>
              <th className="px-5 py-3 text-right tracking-wider bg-[#F8FAFC] backdrop-blur-sm">Faturamento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F2F8]">
            {routes.slice(0, 10).map((route, index) => (
              <tr 
                key={`${route.origem}-${route.destino}`} 
                className="hover:bg-[#E8E8F9] cursor-pointer transition-colors group relative"
                onClick={() => onSelectRoute(route)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold shrink-0 ${index < 3 ? 'bg-[#EC1B23]/10 text-[#EC1B23]' : 'bg-gray-100 text-gray-500'}`}>
                      {index + 1}
                    </span>
                    <div className="flex flex-col w-full">
                        <div className="flex items-start text-xs text-[#656683] mb-1">
                             <MapPin size={12} className="mr-1 mt-0.5 shrink-0" />
                             <span className="whitespace-normal break-words leading-tight">{route.origem}</span>
                        </div>
                        <div className="flex items-start text-xs font-bold text-[#2E31B4] group-hover:text-[#EC1B23] transition-colors">
                             <ArrowRight size={12} className="mr-1 mt-0.5 text-gray-400 shrink-0" />
                             <span className="whitespace-normal break-words leading-tight">{route.destino}</span>
                        </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-sm font-bold text-[#0F103A] whitespace-nowrap align-top pt-5">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(route.faturamento)}
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-12 text-center text-gray-400 text-sm">
                  Nenhuma rota encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};