import React from 'react';
import { Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import type { Expense } from '../../types/expense';
import { format } from 'date-fns';
import './ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const categoryColors: { [key: string]: string } = {
  'Food': '#ff6b6b',
  'Transportation': '#4ecdc4',
  'Entertainment': '#45b7d1',
  'Healthcare': '#96ceb4',
  'Shopping': '#feca57',
  'Utilities': '#ff9ff3'
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEdit, onDelete, loading = false }) => {
  if (loading) {
    return (
      <div className="expense-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="empty-state">
          <DollarSign size={48} />
          <h3>No expenses found</h3>
          <p>Start tracking your expenses by adding your first expense.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="expense-grid">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-card">
            <div className="expense-header">
              <div className="expense-category">
                <span 
                  className="category-dot" 
                  style={{ backgroundColor: categoryColors[expense.category.name] || '#6c757d' }}
                ></span>
                <span className="category-name">{expense.category.name}</span>
              </div>
              <div className="expense-actions">
                <button
                  onClick={() => onEdit(expense)}
                  className="action-btn edit-btn"
                  title="Edit expense"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="action-btn delete-btn"
                  title="Delete expense"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="expense-content">
              <h3 className="expense-title">{expense.title}</h3>
              {expense.description && (
                <p className="expense-description">{expense.description}</p>
              )}
              
              <div className="expense-amount">
                <DollarSign size={18} />
                <span>${expense.amount.toFixed(2)}</span>
              </div>

              <div className="expense-date">
                <Calendar size={16} />
                <span>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</span>
              </div>

              {expense.notes && (
                <div className="expense-notes">
                  <small>{expense.notes}</small>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;