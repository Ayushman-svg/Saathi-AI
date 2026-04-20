import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border-slate-300 bg-white shadow-sm">
        <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-end gap-1.5">
          <span className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{payload[0].value}%</span>
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-0.5">Completed</span>
        </div>
      </div>
    );
  }
  return null;
};

const ProgressChart = ({ data, height = 340 }) => {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ height: `${height}px` }} className="w-full relative group/chart">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-linear-to-t from-zinc-400/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity duration-1000 -z-10 hidden" />
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          barSize={40}
          barGap={-40}
        >
          <CartesianGrid 
            strokeDasharray="4 4" 
            stroke="#1e293b" 
            vertical={false} 
            opacity={0.3} 
          />
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
            dy={20}
            // Add custom character limit to avoid overlapping
            tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis 
            stroke="#475569" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
            domain={[0, 100]}
            tickCount={6}
            unit="%"
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)', radius: 12 }}
            content={<CustomTooltip />}
          />
          
          {/* Background Bar (Track) */}
          <Bar 
            dataKey="max" 
            fill="#1e293b" 
            radius={[12, 12, 12, 12]} 
            barSize={40} 
            xAxisId={0} 
            opacity={0.3}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
               <Cell key={`cell-bg-${index}`} fill="#1e293b" />
            ))}
          </Bar>

          <Bar 
            dataKey="progress" 
            radius={[12, 12, 12, 12]} 
            barSize={40}
            animationDuration={1500}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#progress-gradient-${index})`}
                className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.3)] hover:brightness-125 transition-all outline-none"
              />
            ))}
          </Bar>

          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`progress-gradient-${index}`} id={`progress-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color || '#6366f1'} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color || '#6366f1'} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
