import React from 'react';
import { Calendar, Clock, BarChart3 } from 'lucide-react';
import './PeriodFilter.css';

interface PeriodFilterProps {
  selectedPeriod: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: 'week' as const, label: 'This Week', icon: Clock },
    { value: 'month' as const, label: 'This Month', icon: Calendar },
    { value: 'year' as const, label: 'This Year', icon: BarChart3 }
  ];

  return (
    <div className="period-filter">
      <div className="filter-buttons">
        {periods.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={`filter-btn ${selectedPeriod === value ? 'active' : ''}`}
            onClick={() => onPeriodChange(value)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodFilter;