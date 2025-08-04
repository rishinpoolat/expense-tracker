import React, { useState, useEffect } from 'react';
import type { CreateExpenseDto, UpdateExpenseDto, Category, Expense } from '../../types/expense';
import { expenseService } from '../../services/expenseService';
import './ExpenseForm.css';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (expense: CreateExpenseDto | UpdateExpenseDto) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSubmit, onCancel, loading = false }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    description: expense?.description || '',
    amount: expense?.amount || 0,
    expenseDate: expense?.expenseDate ? expense.expenseDate.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
    categoryId: expense?.categoryId || 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await expenseService.getCategories();
        setCategories(data);
        if (!expense && data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err) {
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, [expense]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'categoryId' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (formData.categoryId === 0) {
      setError('Please select a category');
      return;
    }

    const expenseData = {
      ...formData,
      expenseDate: new Date(formData.expenseDate).toISOString()
    };

    if (expense) {
      onSubmit({ ...expenseData, id: expense.id } as UpdateExpenseDto);
    } else {
      onSubmit(expenseData as CreateExpenseDto);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter expense title"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value={0}>Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="expenseDate">Date *</label>
        <input
          type="date"
          id="expenseDate"
          name="expenseDate"
          value={formData.expenseDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (expense ? 'Updating...' : 'Creating...') : (expense ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;