import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, color = "orange" }) {
  const colorClasses = {
    orange: "from-orange-500 to-amber-500",
    blue: "from-blue-500 to-indigo-500",
    green: "from-emerald-500 to-teal-500",
    purple: "from-purple-500 to-pink-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span>{trend}</span>
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${colorClasses[color]} opacity-5`} />
    </motion.div>
  );
}