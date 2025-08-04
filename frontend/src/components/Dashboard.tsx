import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import Navbar from './dashboard/Navbar';
import ExpenseList from './dashboard/ExpenseList';
import ExpenseCharts from './dashboard/ExpenseCharts';
import ExpenseForm from './dashboard/ExpenseForm';
import PeriodFilter from './dashboard/PeriodFilter';
import Modal from './ui/Modal';
import ConfirmDialog from './ui/ConfirmDialog';
import { expenseService } from '../services/expenseService';
import type { Expense, CreateExpenseDto, UpdateExpenseDto } from '../types/expense';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses();
      setExpenses(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load expenses. Please try again.');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData: CreateExpenseDto) => {
    try {
      setFormLoading(true);
      const newExpense = await expenseService.createExpense(expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      setShowAddModal(false);
      setError('');
    } catch (err: any) {
      setError('Failed to create expense. Please try again.');
      console.error('Error creating expense:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditExpense = async (expenseData: UpdateExpenseDto) => {
    try {
      setFormLoading(true);
      const updatedExpense = await expenseService.updateExpense(expenseData);
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === updatedExpense.id ? updatedExpense : expense
        )
      );
      setShowEditModal(false);
      setEditingExpense(null);
      setError('');
    } catch (err: any) {
      setError('Failed to update expense. Please try again.');
      console.error('Error updating expense:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingExpenseId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpenseId) return;

    try {
      await expenseService.deleteExpense(deletingExpenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== deletingExpenseId));
      setError('');
    } catch (err: any) {
      setError('Failed to delete expense. Please try again.');
      console.error('Error deleting expense:', err);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingExpenseId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeletingExpenseId(null);
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-main">
              <div className="header-info">
                <h1>Dashboard</h1>
                <p>Track and manage your expenses</p>
              </div>
              
              <div className="stats-card">
                <div className="stats-content">
                  <div className="stats-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stats-text">
                    <span className="stats-label">Total Expenses</span>
                    <span className="stats-value">${totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="add-expense-btn"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        </div>

        <div className="period-filter-container">
          <PeriodFilter 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
        </div>

        <div className="dashboard-content">
          <div className="charts-section">
            <ExpenseCharts expenses={expenses} period={selectedPeriod} />
          </div>

          <div className="expenses-section">
            <div className="section-header">
              <h2>Recent Expenses</h2>
              <div className="expense-count">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </div>
            </div>
            
            <ExpenseList
              expenses={expenses}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              loading={loading}
            />
          </div>
        </div>

        <div className="bottom-spacing"></div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModals}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAddExpense}
          onCancel={handleCloseModals}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            expense={editingExpense}
            onSubmit={(expense) => handleEditExpense(expense as UpdateExpenseDto)}
            onCancel={handleCloseModals}
            loading={formLoading}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;