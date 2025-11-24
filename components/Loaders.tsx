import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-[110px] w-full">
    <div className="flex justify-between items-start mb-3">
      <div className="h-10 w-10 bg-slate-200 rounded-lg"></div>
      <div className="h-4 w-16 bg-slate-200 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-24 bg-slate-200 rounded"></div>
      <div className="h-6 w-32 bg-slate-300 rounded"></div>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse h-80 w-full">
    <div className="flex items-center gap-2 mb-6">
      <div className="h-6 w-6 bg-slate-200 rounded"></div>
      <div className="h-5 w-48 bg-slate-200 rounded"></div>
    </div>
    <div className="h-[200px] w-full bg-slate-100 rounded-lg flex items-end gap-2 p-4">
      <div className="h-[40%] w-full bg-slate-200 rounded-t"></div>
      <div className="h-[60%] w-full bg-slate-200 rounded-t"></div>
      <div className="h-[30%] w-full bg-slate-200 rounded-t"></div>
      <div className="h-[80%] w-full bg-slate-200 rounded-t"></div>
      <div className="h-[50%] w-full bg-slate-200 rounded-t"></div>
    </div>
  </div>
);

export const SkeletonList = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 h-14"></div>
        <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className="flex gap-3 w-full">
                        <div className="h-8 w-8 bg-slate-200 rounded"></div>
                        <div className="space-y-1 flex-1">
                            <div className="h-3 w-20 bg-slate-200 rounded"></div>
                            <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                    <div className="h-4 w-16 bg-slate-200 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);