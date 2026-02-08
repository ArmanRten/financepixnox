import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#ec4899',
  bills: '#8b5cf6',
  entertainment: '#10b981',
  health: '#ef4444',
  education: '#06b6d4',
  travel: '#f59e0b',
  groceries: '#84cc16',
  subscriptions: '#6366f1',
  other: '#64748b'
};

const CATEGORY_LABELS = {
  food: 'Food & Dining',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  entertainment: 'Entertainment',
  health: 'Health',
  education: 'Education',
  travel: 'Travel',
  groceries: 'Groceries',
  subscriptions: 'Subscriptions',
  other: 'Other'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-sm font-semibold text-slate-900">{payload[0].payload.label}</p>
        <p className="text-lg font-bold text-slate-700">${payload[0].value.toFixed(2)}</p>
        <p className="text-xs text-slate-400">{payload[0].payload.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ expenses }) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const data = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      label: CATEGORY_LABELS[category] || category,
      value: amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
      color: CATEGORY_COLORS[category] || '#64748b'
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending by Category</h3>
        <div className="flex items-center justify-center h-64 text-slate-400">
          No expenses yet
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending by Category</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full lg:w-1/2 space-y-3">
          {data.slice(0, 5).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-900">${item.value.toFixed(2)}</span>
                <span className="text-xs text-slate-400 ml-2">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}