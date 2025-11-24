import React, { useEffect, useState } from 'react';
import { X, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { getStrategicInsight } from '../services/geminiService';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  description: string;
  contextData: string; // Additional context for AI
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ 
    isOpen, onClose, title, value, description, contextData 
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setAnalysis(null);
        setLoading(true);
        // Call AI
        getStrategicInsight(title, value, description, contextData)
            .then(res => {
                setAnalysis(res);
                setLoading(false);
            })
            .catch(() => {
                setAnalysis("Não foi possível carregar a análise.");
                setLoading(false);
            });
    }
  }, [isOpen, title, value, contextData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0F103A]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E8E8F9] flex items-center justify-between bg-[#FCFCFE]">
          <div className="flex items-center gap-2 text-[#2E31B4]">
            <Lightbulb size={20} className="text-[#EC1B23]" />
            <h2 className="text-sm font-bold uppercase tracking-wide">Entenda o Indicador</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E8E8F9] rounded-full text-gray-400 hover:text-[#EC1B23] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
            <div className="mb-6 text-center">
                <p className="text-sm text-[#656683] mb-1">{title}</p>
                <div className="text-3xl font-bold text-[#0F103A]">{value}</div>
            </div>

            <div className="bg-[#F2F2F8] p-4 rounded-xl border border-[#E8E8F9] mb-4">
                <h4 className="text-xs font-bold text-[#656683] uppercase mb-2">O que é?</h4>
                <p className="text-sm text-[#0F103A] leading-relaxed">{description}</p>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-[#0F103A] p-5 text-white">
                 <div className="absolute top-0 right-0 p-16 bg-[#2E31B4] rounded-full mix-blend-overlay filter blur-2xl opacity-30 -mr-8 -mt-8"></div>
                 
                 <h4 className="text-xs font-bold text-[#EC1B23] uppercase mb-3 flex items-center gap-2 relative z-10">
                    <Sparkles size={14} />
                    Análise IA
                 </h4>
                 
                 {loading ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2">
                        <Loader2 size={24} className="animate-spin text-[#BFC0EF]" />
                        <p className="text-xs text-[#9899C8]">Gerando insights...</p>
                    </div>
                 ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed text-[#E5E5F1] relative z-10">
                         <div dangerouslySetInnerHTML={{ __html: analysis?.replace(/\n/g, '<br/>') || '' }} />
                    </div>
                 )}
            </div>
        </div>

        <div className="bg-[#FCFCFE] px-6 py-3 border-t border-[#E8E8F9] text-right">
             <button 
                onClick={onClose}
                className="px-4 py-2 bg-[#E8E8F9] text-[#2E31B4] hover:bg-[#D8D9EB] rounded-lg text-sm font-medium transition-colors"
             >
                Fechar
             </button>
        </div>
      </div>
    </div>
  );
};