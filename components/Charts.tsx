import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush,
  LineChart, Line
} from 'recharts';
import { ChartData, RouteHistoryData, RouteData } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-[#E8E8F9] shadow-xl rounded-lg z-[100]">
        <p className="text-sm font-bold text-[#2E31B4] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
             // Enhanced logic to detect currency fields
             const isCurrency = 
                entry.dataKey === 'real' || 
                entry.dataKey === 'projected' ||
                entry.dataKey === 'faturamento' || 
                entry.dataKey === 'ticketMedio' ||
                entry.dataKey === 'value' || // Used in TopRoutesBarChart
                entry.name.toLowerCase().includes('valor') ||
                entry.name.toLowerCase().includes('fatur') ||
                entry.name.toLowerCase().includes('receb') ||
                entry.name.toLowerCase().includes('realizado') ||
                entry.name.toLowerCase().includes('projetado');

             const formattedValue = isCurrency 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)
                : entry.value;

             return (
              <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                 <p className="text-xs font-medium text-gray-600">
                    {entry.name}: <span className="font-bold text-[#0F103A]">
                        {formattedValue}
                    </span>
                 </p>
              </div>
            );
        })}
      </div>
    );
  }
  return null;
};

export const ProjectionChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  return (
    <div className="h-80 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8F9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#6466AD', fontSize: 11}} 
            dy={10}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={40}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#6466AD', fontSize: 11}} 
            tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#E8E8F9', opacity: 0.4}} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: '12px'}} />
          <Brush dataKey="name" height={25} stroke="#2E31B4" fill="#F2F2F8" tickFormatter={() => ''} />
          
          <Bar 
            dataKey="real" 
            name="Realizado" 
            fill="#2E31B4" 
            radius={[4, 4, 0, 0]} 
            barSize={32} 
            animationDuration={1500}
          />
          <Bar 
            dataKey="projected" 
            name="Projetado (Estimativa)" 
            fill="#BFC0EF" 
            radius={[4, 4, 0, 0]} 
            barSize={32} 
            animationDuration={1500}
            strokeDasharray="4 4"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const RouteTrendChart: React.FC<{ data: RouteHistoryData[] }> = ({ data }) => {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8F9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#6466AD', fontSize: 11}} 
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#2E31B4', fontSize: 10, fontWeight: 600}} 
              tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
              width={40}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#EC1B23', fontSize: 10, fontWeight: 600}} 
              tickFormatter={(value) => `TK ${(value/1000).toFixed(1)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
            
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="faturamento" 
              name="Faturamento" 
              stroke="#2E31B4" 
              strokeWidth={3}
              dot={{ fill: '#2E31B4', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="ticketMedio" 
              name="Ticket Médio" 
              stroke="#EC1B23" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: '#EC1B23', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
};

export const TopRoutesBarChart: React.FC<{ routes: RouteData[] }> = ({ routes }) => {
    // Take top 5 for cleaner chart
    const data = routes.slice(0, 5).map(r => ({
        name: `${r.origem} -> ${r.destino}`,
        value: r.faturamento,
        fullRoute: r
    }));

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E8E8F9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{ fontSize: 10, fill: '#656683' }}
                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#E8E8F9', opacity: 0.4}} />
                    <Bar 
                        dataKey="value" 
                        name="Faturamento" 
                        fill="#2E31B4" 
                        radius={[0, 4, 4, 0]} 
                        barSize={16}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};