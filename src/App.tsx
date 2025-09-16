import { useState } from 'react';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ExpenseForm } from './components/expenses/ExpenseForm';
import { ExpenseList } from './components/expenses/ExpenseList';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Expense, User } from './types/expense';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [user, setUser] = useLocalStorage<User | null>('expense-tracker-user', null);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expense-tracker-expenses', []);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setEditingExpense(null);
    toast.success('Logged out successfully');
  };

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: generateId()
    };
    
    setExpenses(prev => [...prev, newExpense]);
    toast.success(`${expenseData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
  };

  const handleEditExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    
    const updatedExpense: Expense = {
      ...expenseData,
      id: editingExpense.id
    };
    
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === editingExpense.id ? updatedExpense : expense
      )
    );
    
    setEditingExpense(null);
    toast.success('Transaction updated successfully!');
  };

  const handleStartEdit = (expense: Expense) => {
    setEditingExpense(expense);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    
    if (editingExpense && editingExpense.id === id) {
      setEditingExpense(null);
    }
    
    toast.success(`${expenseToDelete?.type === 'income' ? 'Income' : 'Expense'} deleted successfully!`);
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        <Dashboard expenses={expenses} />
        
        <ExpenseForm 
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          editingExpense={editingExpense}
          onCancel={handleCancelEdit}
        />
        
        <ExpenseList 
          expenses={expenses}
          onEdit={handleStartEdit}
          onDelete={handleDeleteExpense}
        />
      </main>
      
      <Toaster />
    </div>
  );
}