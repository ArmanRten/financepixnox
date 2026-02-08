import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachWeekOfInterval, eachMonthOfInterval, subMonths, subYears } from 'date-fns';
import { FileText, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PeriodSelector from '../components/dashboard/PeriodSelector';

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {CATEGORY_LABELS[entry.dataKey] || entry.dataKey}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  // Generate time periods based on selection
  const getTimePeriodsData = () => {
    const today = new Date();
    let intervals = [];
    let dateFormat = '';

    switch (period) {
      case 'week':
        // Last 8 weeks
        const weeksStart = subMonths(today, 2);
        intervals = eachWeekOfInterval({ start: weeksStart, end: today }, { weekStartsOn: 1 });
        dateFormat = 'MMM d';
        break;
      case 'month':
        // Last 6 months
        intervals = eachMonthOfInterval({ start: subMonths(today, 5), end: today });
        dateFormat = 'MMM yyyy';
        break;
      case 'year':
        // Last 3 years by month
        intervals = eachMonthOfInterval({ start: subYears(today, 1), end: today });
        dateFormat = 'MMM yy';
        break;
    }

    return intervals.map(date => {
      let start, end;
      
      switch (period) {
        case 'week':
          start = startOfWeek(date, { weekStartsOn: 1 });
          end = endOfWeek(date, { weekStartsOn: 1 });
          break;
        case 'month':
        case 'year':
          start = startOfMonth(date);
          end = endOfMonth(date);
          break;
      }

      const periodExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate >= start && expDate <= end;
      });

      const categoryTotals = periodExpenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {});

      return {
        period: format(date, dateFormat),
        ...categoryTotals,
        total: periodExpenses.reduce((sum, e) => sum + e.amount, 0)
      };
    });
  };

  const timePeriodsData = getTimePeriodsData();
  
  // Get unique categories in data
  const activeCategories = [...new Set(expenses.map(e => e.category))];

  // Calculate category comparison
  const getCategoryComparison = () => {
    const today = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (period) {
      case 'week':
        currentStart = startOfWeek(today, { weekStartsOn: 1 });
        currentEnd = endOfWeek(today, { weekStartsOn: 1 });
        previousStart = startOfWeek(subMonths(today, 0.25), { weekStartsOn: 1 });
        previousEnd = endOfWeek(subMonths(today, 0.25), { weekStartsOn: 1 });
        break;
      case 'month':
        currentStart = startOfMonth(today);
        currentEnd = endOfMonth(today);
        previousStart = startOfMonth(subMonths(today, 1));
        previousEnd = endOfMonth(subMonths(today, 1));
        break;
      case 'year':
        currentStart = startOfYear(today);
        currentEnd = endOfYear(today);
        previousStart = startOfYear(subYears(today, 1));
        previousEnd = endOfYear(subYears(today, 1));
        break;
    }

    const currentExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= currentStart && expDate <= currentEnd;
    });

    const previousExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate >= previousStart && expDate <= previousEnd;
    });

    const currentByCategory = currentExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const previousByCategory = previousExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const allCategories = [...new Set([...Object.keys(currentByCategory), ...Object.keys(previousByCategory)])];

    return allCategories.map(category => {
      const current = currentByCategory[category] || 0;
      const previous = previousByCategory[category] || 0;
      const change = previous > 0 ? ((current - previous) / previous * 100) : (current > 0 ? 100 : 0);

      return {
        category,
        label: CATEGORY_LABELS[category] || category,
        current,
        previous,
        change: change.toFixed(1),
        color: CATEGORY_COLORS[category] || '#64748b'
      };
    }).sort((a, b) => b.current - a.current);
  };

  const categoryComparison = getCategoryComparison();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500 mt-1">Detailed spending analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>
        </motion.div>

        <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
          <TabsList className="bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg">By Category</TabsTrigger>
            <TabsTrigger value="comparison" className="rounded-lg">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Spending Over Time</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePeriodsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
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
                    <Bar dataKey="total" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="categories">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Spending by Category</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePeriodsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="period" 
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
                    <Legend />
                    {activeCategories.map(category => (
                      <Bar 
                        key={category}
                        dataKey={category} 
                        stackId="a"
                        fill={CATEGORY_COLORS[category]} 
                        name={CATEGORY_LABELS[category]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="comparison">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Category Comparison (vs previous {period})
              </h3>
              <div className="space-y-4">
                {categoryComparison.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    No data available for comparison
                  </div>
                ) : (
                  categoryComparison.map((item, index) => (
                    <motion.div
                      key={item.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-50"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <p className="font-medium text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-400">
                            Previous: ${item.previous.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          ${item.current.toFixed(2)}
                        </p>
                        <div className={`flex items-center justify-end gap-1 text-sm ${
                          parseFloat(item.change) > 0 
                            ? 'text-red-500' 
                            : parseFloat(item.change) < 0 
                              ? 'text-emerald-500' 
                              : 'text-slate-400'
                        }`}>
                          {parseFloat(item.change) > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : parseFloat(item.change) < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <Minus className="w-4 h-4" />
                          )}
                          <span>{Math.abs(parseFloat(item.change))}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}