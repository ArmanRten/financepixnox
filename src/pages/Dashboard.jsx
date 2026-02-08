import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, Calendar, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

import StatsCard from '../components/dashboard/StatsCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import SpendingTrend from '../components/dashboard/SpendingTrend';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import AddExpenseModal from '../components/expense/AddExpenseModal';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState('month');
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date')
  });

  const createExpense = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const deleteExpense = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  // Filter expenses by period
  const getStartDate = () => {
    const today = new Date();
    switch (period) {
      case 'week':
        return startOfWeek(today, { weekStartsOn: 1 });
      case 'month':
        return startOfMonth(today);
      case 'year':
        return startOfYear(today);
      default:
        return startOfMonth(today);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= getStartDate();
  });

  // Calculate stats
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = filteredExpenses.length;
  const avgTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  // Get previous period expenses for comparison
  const getPreviousPeriodStart = () => {
    const startDate = getStartDate();
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    return subDays(startDate, days);
  };

  const previousPeriodExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= getPreviousPeriodStart() && expenseDate < getStartDate();
  });

  const previousTotal = previousPeriodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const percentChange = previousTotal > 0 
    ? ((totalSpent - previousTotal) / previousTotal * 100).toFixed(1)
    : 0;

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
            <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
            <p className="text-slate-500 mt-1">Track and manage your expenses</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector selected={period} onChange={setPeriod} />
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 rounded-xl h-11 px-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            icon={Wallet}
            trend={previousTotal > 0 ? `${Math.abs(percentChange)}%` : null}
            trendUp={parseFloat(percentChange) < 0}
            color="orange"
          />
          <StatsCard
            title="Transactions"
            value={transactionCount}
            subtitle={`This ${period}`}
            icon={TrendingDown}
            color="blue"
          />
          <StatsCard
            title="Average"
            value={`$${avgTransaction.toFixed(2)}`}
            subtitle="Per transaction"
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Daily Avg"
            value={`$${(totalSpent / (period === 'week' ? 7 : period === 'month' ? 30 : 365)).toFixed(2)}`}
            subtitle={`This ${period}`}
            icon={PiggyBank}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CategoryChart expenses={filteredExpenses} />
          <SpendingTrend expenses={expenses} period={period} />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions 
          expenses={filteredExpenses} 
          onDelete={(id) => deleteExpense.mutate(id)}
        />

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => createExpense.mutateAsync(data)}
        />
      </div>
    </div>
  );
}