import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Trash2, Edit, Filter, X } from 'lucide-react';
import { Expense, ExpenseFilter } from '../../types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [filter, setFilter] = useState<ExpenseFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = expenses.filter(expense => {
    if (filter.startDate && expense.date < filter.startDate) return false;
    if (filter.endDate && expense.date > filter.endDate) return false;
    if (filter.minAmount && expense.amount < filter.minAmount) return false;
    if (filter.maxAmount && expense.amount > filter.maxAmount) return false;
    if (filter.type && filter.type !== 'all' && expense.type !== filter.type) return false;
    if (filter.category && expense.category !== filter.category) return false;
    return true;
  });

  const sortedExpenses = filteredExpenses.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilter({});
  };

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && value !== '' && value !== 'all'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {sortedExpenses.length} of {expenses.length} transactions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {Object.values(filter).filter(v => v !== undefined && v !== '' && v !== 'all').length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={filter.startDate || ''}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={filter.endDate || ''}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={filter.minAmount || ''}
                  onChange={(e) => setFilter({ ...filter, minAmount: Number(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={filter.maxAmount || ''}
                  onChange={(e) => setFilter({ ...filter, maxAmount: Number(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={filter.type || 'all'} 
                  onValueChange={(value) => setFilter({ ...filter, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {expenses.length === 0 
              ? "No transactions yet. Add your first transaction above!" 
              : "No transactions match your filters."
            }
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{expense.description}</span>
                        <Badge variant={expense.type === 'income' ? 'default' : 'secondary'}>
                          {expense.type}
                        </Badge>
                        {expense.category && (
                          <Badge variant="outline">{expense.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className={`text-lg font-semibold ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}