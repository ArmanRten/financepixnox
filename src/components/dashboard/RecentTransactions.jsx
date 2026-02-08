import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Utensils, Car, ShoppingBag, Receipt, Film, Heart, 
  GraduationCap, Plane, ShoppingCart, CreditCard, MoreHorizontal,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORY_ICONS = {
  food: Utensils,
  transport: Car,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Film,
  health: Heart,
  education: GraduationCap,
  travel: Plane,
  groceries: ShoppingCart,
  subscriptions: CreditCard,
  other: MoreHorizontal
};

const CATEGORY_COLORS = {
  food: 'bg-orange-100 text-orange-600',
  transport: 'bg-blue-100 text-blue-600',
  shopping: 'bg-pink-100 text-pink-600',
  bills: 'bg-purple-100 text-purple-600',
  entertainment: 'bg-emerald-100 text-emerald-600',
  health: 'bg-red-100 text-red-600',
  education: 'bg-cyan-100 text-cyan-600',
  travel: 'bg-amber-100 text-amber-600',
  groceries: 'bg-lime-100 text-lime-600',
  subscriptions: 'bg-indigo-100 text-indigo-600',
  other: 'bg-slate-100 text-slate-600'
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

export default function RecentTransactions({ expenses, onDelete, limit = 10 }) {
  const sortedExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);

  if (sortedExpenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Receipt className="w-12 h-12 mb-3 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm">Add your first expense to get started</p>
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
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        <AnimatePresence>
          {sortedExpenses.map((expense, index) => {
            const Icon = CATEGORY_ICONS[expense.category] || MoreHorizontal;
            const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other;
            
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {expense.description || CATEGORY_LABELS[expense.category]}
                    </p>
                    <p className="text-sm text-slate-400">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-slate-900">
                    -${expense.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => onDelete(expense.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}