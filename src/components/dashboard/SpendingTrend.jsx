import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function SpendingTrend({ expenses, period = 'week' }) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);

  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  const dailyTotals = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayExpenses = expenses.filter(e => e.date === dateStr);
    const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      date: format(date, period === 'year' ? 'MMM' : 'MMM d'),
      amount: total
    };
  });

  // For yearly view, aggregate by month
  const data = period === 'year' 
    ? dailyTotals.reduce((acc, curr) => {
        const existing = acc.find(a => a.date === curr.date);
        if (existing) {
          existing.amount += curr.amount;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [])
    : dailyTotals;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#f97316" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}