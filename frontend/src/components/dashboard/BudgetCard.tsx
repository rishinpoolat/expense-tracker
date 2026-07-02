import React from 'react';
import { Wallet } from 'lucide-react';
import type { BudgetStatus } from '../../types/budget';
import './BudgetCard.css';

interface BudgetCardProps {
  budgetStatus: BudgetStatus | null;
  onSetBudget: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budgetStatus, onSetBudget }) => {
  const hasBudget = budgetStatus?.budget != null;
  const pct = hasBudget ? Math.min(budgetStatus!.percentage, 100) : 0;
  const isNear = budgetStatus?.isNearLimit ?? false;
  const isOver = (budgetStatus?.percentage ?? 0) >= 100;

  return (
    <div className="budget-card">
      <div className="budget-card__content">
        <div className="budget-card__icon">
          <Wallet size={24} />
        </div>
        <div className="budget-card__text">
          <span className="budget-card__label">Monthly Budget</span>
          {hasBudget ? (
            <span className="budget-card__value">
              ${budgetStatus!.spent.toFixed(2)}
              <span className="budget-card__of"> / ${budgetStatus!.budget!.toFixed(2)}</span>
            </span>
          ) : (
            <span className="budget-card__value budget-card__value--empty">Not set</span>
          )}
        </div>
      </div>

      {hasBudget && (
        <div className="budget-card__bar-wrap">
          <div className="budget-card__bar">
            <div
              className={`budget-card__bar-fill ${isOver ? 'budget-card__bar-fill--over' : isNear ? 'budget-card__bar-fill--near' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`budget-card__pct ${isOver ? 'budget-card__pct--over' : isNear ? 'budget-card__pct--near' : ''}`}>
            {Math.min(budgetStatus!.percentage, 9999).toFixed(0)}%
          </span>
        </div>
      )}

      <button className="budget-card__set-btn" onClick={onSetBudget}>
        {hasBudget ? 'Edit Budget' : 'Set Budget'}
      </button>
    </div>
  );
};

export default BudgetCard;
