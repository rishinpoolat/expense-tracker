import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, BarChart3, Filter } from 'lucide-react';
import type { Expense } from '../../types/expense';
import ExpenseList from './ExpenseList';
import ExpenseCharts from './ExpenseCharts';
import { format, parseISO } from 'date-fns';
import './DateRangeTracker.css';

interface DateRangeTrackerProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const DateRangeTracker: React.FC<DateRangeTrackerProps> = ({ 
  expenses, 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [showCharts, setShowCharts] = useState(true);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Filter expenses when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filtered = expenses.filter(expense => {
        const expenseDate = parseISO(expense.expenseDate);
        return (expenseDate >= start && expenseDate <= end);
      });
      
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [expenses, startDate, endDate]);

  const handleQuickRange = (days: number) => {
    const today = new Date();
    const startRange = new Date();
    startRange.setDate(today.getDate() - days);
    
    setStartDate(startRange.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgDaily = filteredExpenses.length > 0 ? totalAmount / Math.max(1, getDaysBetween(startDate, endDate)) : 0;

  function getDaysBetween(start: string, end: string): number {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    return Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  }

  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: { amount: number; count: number } } = {};
    
    filteredExpenses.forEach(expense => {
      const category = expense.category.name;
      if (!breakdown[category]) {
        breakdown[category] = { amount: 0, count: 0 };
      }
      breakdown[category].amount += expense.amount;
      breakdown[category].count += 1;
    });
    
    return Object.entries(breakdown)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="date-range-tracker">
      {/* Date Range Controls */}
      <div className="date-range-header">
        <div className="date-range-title">
          <Calendar size={24} />
          <h2>Custom Date Range</h2>
        </div>
        
        <div className="date-controls">
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="start-date">From</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>
            
            <div className="date-input-group">
              <label htmlFor="end-date">To</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="quick-ranges">
            <button onClick={() => handleQuickRange(7)} className="quick-range-btn">
              Last 7 days
            </button>
            <button onClick={() => handleQuickRange(30)} className="quick-range-btn">
              Last 30 days
            </button>
            <button onClick={() => handleQuickRange(90)} className="quick-range-btn">
              Last 3 months
            </button>
            <button onClick={() => handleQuickRange(365)} className="quick-range-btn">
              Last year
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="range-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <TrendingUp size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">${totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <BarChart3 size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Daily Average</div>
            <div className="summary-value">${avgDaily.toFixed(2)}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Filter size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Transactions</div>
            <div className="summary-value">{filteredExpenses.length}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Calendar size={20} />
          </div>
          <div className="summary-content">
            <div className="summary-label">Date Range</div>
            <div className="summary-value">{getDaysBetween(startDate, endDate)} days</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h3>Category Breakdown</h3>
        <div className="category-list">
          {categoryBreakdown.map((category) => (
            <div key={category.name} className="category-item">
              <div className="category-info">
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.count} transaction{category.count !== 1 ? 's' : ''}</div>
              </div>
              <div className="category-amount">${category.amount.toFixed(2)}</div>
              <div className="category-percentage">
                {totalAmount > 0 ? ((category.amount / totalAmount) * 100).toFixed(1) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-controls">
        <button 
          onClick={() => setShowCharts(!showCharts)}
          className={`view-toggle ${showCharts ? 'active' : ''}`}
        >
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </button>
      </div>

      {/* Charts Section */}
      {showCharts && filteredExpenses.length > 0 && (
        <div className="charts-section">
          <ExpenseCharts expenses={filteredExpenses} period="month" />
        </div>
      )}

      {/* Expenses List */}
      <div className="expenses-section">
        <div className="section-header">
          <h3>
            Expenses {startDate && endDate && (
              <span className="date-range-display">
                ({format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d, yyyy')})
              </span>
            )}
          </h3>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h4>No expenses found</h4>
            <p>No expenses were found in the selected date range.</p>
          </div>
        ) : (
          <ExpenseList
            expenses={filteredExpenses}
            onEdit={onEdit}
            onDelete={onDelete}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default DateRangeTracker;