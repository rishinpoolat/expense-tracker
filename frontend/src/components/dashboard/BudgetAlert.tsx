import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { authService } from '../../services/authService';
import type { BudgetStatus } from '../../types/budget';
import './BudgetAlert.css';

interface BudgetAlertProps {
  budgetStatus: BudgetStatus;
}

function getDismissKey(): string {
  const user = authService.getCurrentUser();
  const now = new Date();
  return `budget_alert_dismissed_${user?.id ?? 'anon'}_${now.getFullYear()}_${now.getMonth() + 1}`;
}

const BudgetAlert: React.FC<BudgetAlertProps> = ({ budgetStatus }) => {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(getDismissKey()) === 'true'
  );

  // Reset dismissed state if spending drops back below the threshold
  useEffect(() => {
    if (!budgetStatus.isNearLimit) {
      sessionStorage.removeItem(getDismissKey());
      setDismissed(false);
    }
  }, [budgetStatus.isNearLimit]);

  if (!budgetStatus.isNearLimit || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(getDismissKey(), 'true');
    setDismissed(true);
  };

  const isOver = budgetStatus.percentage >= 100;
  const spent = budgetStatus.spent.toFixed(2);
  const budget = budgetStatus.budget?.toFixed(2);
  const pct = budgetStatus.percentage.toFixed(0);

  return (
    <div className={`budget-alert ${isOver ? 'budget-alert--over' : 'budget-alert--warning'}`}>
      <AlertTriangle size={20} className="budget-alert__icon" />
      <span className="budget-alert__message">
        {isOver
          ? `You've exceeded your monthly budget — $${spent} spent of $${budget} (${pct}%).`
          : `You've used ${pct}% of your monthly budget — $${spent} of $${budget}.`}
      </span>
      <button className="budget-alert__dismiss" onClick={handleDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

export default BudgetAlert;
