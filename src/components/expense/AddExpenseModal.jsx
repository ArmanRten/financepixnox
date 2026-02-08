import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍔' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'bills', label: 'Bills & Utilities', emoji: '📄' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'health', label: 'Health', emoji: '💊' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'groceries', label: 'Groceries', emoji: '🛒' },
  { value: 'subscriptions', label: 'Subscriptions', emoji: '📱' },
  { value: 'other', label: 'Other', emoji: '📌' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
];

export default function AddExpenseModal({ isOpen, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    setIsSubmitting(true);
    await onSubmit({
      amount: parseFloat(amount),
      category,
      description,
      date,
      payment_method: paymentMethod
    });
    setIsSubmitting(false);
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setPaymentMethod('cash');
    onClose();
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add Expense</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10 text-2xl font-bold h-14 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    {quickAmounts.map((qa) => (
                      <Button
                        key={qa}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(qa.toString())}
                        className="flex-1 rounded-lg"
                      >
                        ${qa}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Category</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">Payment</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((pm) => (
                          <SelectItem key={pm.value} value={pm.value}>
                            {pm.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">Description (optional)</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What was this expense for?"
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !amount || !category}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25"
                >
                  {isSubmitting ? 'Adding...' : 'Add Expense'}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}