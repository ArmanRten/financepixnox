const STORAGE_KEY = 'financepixnox_expenses';

const readExpenses = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse local expenses:', error);
    return [];
  }
};

const writeExpenses = (expenses) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

const getId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const listExpenses = (sortDirection = '-date') => {
  const expenses = readExpenses();
  if (sortDirection === '-date') {
    return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const createExpense = (data) => {
  const expenses = readExpenses();
  const expense = {
    ...data,
    id: getId(),
    createdAt: new Date().toISOString()
  };
  const nextExpenses = [expense, ...expenses];
  writeExpenses(nextExpenses);
  return expense;
};

export const deleteExpense = (id) => {
  const expenses = readExpenses();
  const nextExpenses = expenses.filter((expense) => expense.id !== id);
  writeExpenses(nextExpenses);
  return nextExpenses.length !== expenses.length;
};

export const clearExpenses = () => {
  writeExpenses([]);
};
