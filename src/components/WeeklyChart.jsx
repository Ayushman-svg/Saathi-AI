import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const WeeklyChart = ({ data, height = 280 }) => {
  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold' }} 
            dy={10} 
          />
          <YAxis 
            stroke="#64748b" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 'bold' }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b', 
              borderRadius: '16px', 
              color: '#fff', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              padding: '12px' 
            }}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '10px', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }} 
          />
          <Area 
            type="monotone" 
            dataKey="created" 
            stroke="#818cf8" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCreated)" 
            name="Created Tasks"
          />
          <Area 
            type="monotone" 
            dataKey="completed" 
            stroke="#34d399" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCompleted)" 
            name="Completed Tasks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;
