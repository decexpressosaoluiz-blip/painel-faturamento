import React from 'react';
import { X, TrendingUp, Package, Tag, ArrowRight } from 'lucide-react';
import { RouteData, RouteHistoryData } from '../types';
import { RouteTrendChart } from './Charts';

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData | null;
  historyData: RouteHistoryData[];
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({ isOpen, onClose, route, historyData }) => {
  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F103A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E8F9] flex items-center justify-between bg-[#FCFCFE]">
          <div>
            <h2 className="text-sm text-[#656683] font-semibold uppercase tracking-wider mb-1">Análise Detalhada da Rota</h2>
            <div className="flex items-center gap-2 text-xl font-bold text-[#0F103A]">
              <span>{route.origem}</span>
              <ArrowRight className="text-[#EC1B23]" size={20} />
              <span>{route.destino}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E8E8F9] rounded-full text-gray-400 hover:text-[#EC1B23] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[#F2F2F8] border border-[#E8E8F9]">
                <div className="flex items-center gap-2 mb-2 text-[#656683]">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase">Faturamento Total</span>
                </div>
                <div className="text-lg font-bold text-[#2E31B4]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(route.faturamento)}
                </div>
            </div>
            
            <div className="p-4 rounded-xl bg-[#F2F2F8] border border-[#E8E8F9]">
                <div className="flex items-center gap-2 mb-2 text-[#656683]">
                    <Package size={16} />
                    <span className="text-xs font-bold uppercase">Volume Transportado</span>
                </div>
                <div className="text-lg font-bold text-[#0F103A]">
                    {route.volume} <span className="text-sm font-normal text-gray-500">cargas</span>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F2F2F8] border border-[#E8E8F9]">
                <div className="flex items-center gap-2 mb-2 text-[#656683]">
                    <Tag size={16} />
                    <span className="text-xs font-bold uppercase">Ticket Médio</span>
                </div>
                <div className="text-lg font-bold text-[#EC1B23]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(route.ticketMedio)}
                </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#0F103A] mb-4 flex items-center gap-2">
                Evolução de Faturamento e Ticket Médio
            </h3>
            <div className="bg-white rounded-lg border border-[#E8E8F9] p-4 h-[300px]">
                {historyData.length > 0 ? (
                    <RouteTrendChart data={historyData} />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Dados históricos insuficientes para esta rota no período selecionado.
                    </div>
                )}
            </div>
             <p className="text-xs text-gray-400 mt-2 text-center">
                * Exibindo dados correspondentes aos filtros de Ano aplicados no painel principal.
            </p>
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-[#FCFCFE] px-6 py-4 border-t border-[#E8E8F9] text-right">
             <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#2E31B4] text-white rounded-lg font-medium hover:bg-[#1A1B62] transition-colors shadow-lg shadow-[#2E31B4]/20"
             >
                Fechar
             </button>
        </div>
      </div>
    </div>
  );
};