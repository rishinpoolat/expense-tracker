import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { budgetService } from '../../services/budgetService';
import type { BudgetStatus } from '../../types/budget';
import './SetBudgetModal.css';

interface SetBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: BudgetStatus | null;
  onSaved: () => void;
}

const SetBudgetModal: React.FC<SetBudgetModalProps> = ({ isOpen, onClose, currentBudget, onSaved }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget?.budget != null ? String(currentBudget.budget) : '');
      setError('');
    }
  }, [isOpen, currentBudget]);

  const submitBudget = async (amount: number | null, errorMsg: string) => {
    try {
      setLoading(true);
      if (amount === null) await budgetService.clearBudget();
      else await budgetService.setBudget(amount);
      onSaved();
      onClose();
    } catch {
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const parsed = parseFloat(amount);
    if (amount !== '' && (isNaN(parsed) || parsed <= 0)) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    submitBudget(amount === '' ? null : parsed, 'Failed to save budget. Please try again.');
  };

  const handleClear = () => {
    submitBudget(null, 'Failed to clear budget. Please try again.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Budget">
      <div className="set-budget-modal">
        <p className="set-budget-modal__hint">
          Set a spending limit for the current month. You'll be alerted when you reach 90%.
        </p>

        <div className="set-budget-modal__field">
          <label htmlFor="budget-amount" className="set-budget-modal__label">
            Monthly Budget ($)
          </label>
          <input
            id="budget-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 1500"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            className="set-budget-modal__input"
            autoFocus
          />
          {error && <p className="set-budget-modal__error">{error}</p>}
        </div>

        <div className="set-budget-modal__actions">
          {currentBudget?.budget != null && (
            <button
              className="set-budget-modal__clear-btn"
              onClick={handleClear}
              disabled={loading}
            >
              Clear budget
            </button>
          )}
          <div className="set-budget-modal__right">
            <button className="set-budget-modal__cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="set-budget-modal__save-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SetBudgetModal;
