import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.6rem 0.9rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
          {payload[0].name ? `${payload[0].name}: ` : 'Clicks: '}
          <span style={{ color: payload[0].color || 'var(--primary-light)' }}>
            {payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// 1. Clicks Over Time Area Chart
export const ClicksOverTimeChart = ({ data = [], height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
        No timeline data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-subtle)"
            fontSize={11}
            tickFormatter={(val) => {
              if (!val) return '';
              const parts = val.split('-');
              return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
            }}
          />
          <YAxis stroke="var(--text-subtle)" fontSize={11} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#818cf8"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#clicksGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Breakdown Distribution Donut / Pie Chart
export const DistributionPieChart = ({ dataMap = {}, title, height = 240 }) => {
  const chartData = Object.entries(dataMap).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0 || chartData.every((d) => d.value === 0)) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
        No click breakdown data yet
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Bar Chart for Breakdown
export const BreakdownBarChart = ({ dataMap = {}, height = 240 }) => {
  const chartData = Object.entries(dataMap).map(([name, count]) => ({
    name,
    count,
  }));

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
        No click records yet
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis dataKey="name" stroke="var(--text-subtle)" fontSize={11} />
          <YAxis stroke="var(--text-subtle)" fontSize={11} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
