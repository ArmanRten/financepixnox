import React from 'react';
import { motion } from 'framer-motion';

const periods = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

export default function PeriodSelector({ selected, onChange }) {
  return (
    <div className="inline-flex bg-slate-100 rounded-xl p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            selected === period.value 
              ? 'text-slate-900' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {selected === period.value && (
            <motion.div
              layoutId="period-bg"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10">{period.label}</span>
        </button>
      ))}
    </div>
  );
}