import React from 'react';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import type { Expense } from '../../types/expense';
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear } from 'date-fns';
import './ExpenseCharts.css';

interface ExpenseChartsProps {
  expenses: Expense[];
  period: 'week' | 'month' | 'year';
}

const categoryColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
  '#fd79a8', '#fdcb6e', '#6c5ce7', '#a29bfe', '#fd79a8', '#2d3436'
];

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, period }) => {
  // Filter expenses by period
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'year':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
  }

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expenseDate);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Category breakdown data
  const categoryData = filteredExpenses.reduce((acc, expense) => {
    const categoryName = expense.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2))
  }));

  // Time-based data
  const getTimeBasedData = () => {
    const timeGroups: Record<string, number> = {};

    filteredExpenses.forEach(expense => {
      const date = new Date(expense.expenseDate);
      let key: string;

      switch (period) {
        case 'week':
          key = format(date, 'EEE'); // Mon, Tue, etc.
          break;
        case 'month':
          key = format(date, 'MMM dd'); // Jan 01, Jan 02, etc.
          break;
        case 'year':
          key = format(date, 'MMM'); // Jan, Feb, etc.
          break;
      }

      if (!timeGroups[key]) {
        timeGroups[key] = 0;
      }
      timeGroups[key] += expense.amount;
    });

    return Object.entries(timeGroups).map(([name, amount]) => ({
      name,
      amount: Number(amount.toFixed(2))
    }));
  };

  const timeData = getTimeBasedData();
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            ${payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="expense-charts">
      <div className="charts-header">
        <h3>Expense Analytics - {period.charAt(0).toUpperCase() + period.slice(1)}</h3>
        <div className="total-amount">
          Total: <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="no-data">
          <p>No expenses found for this {period}</p>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-container">
            <h4>Expenses by Category</h4>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={categoryColors[index % categoryColors.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4>Spending Trend</h4>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#495057" 
                  fill="url(#colorGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#495057" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#495057" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container full-width">
            <h4>Daily Expenses Comparison</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#495057"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h4>Expense Distribution</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6c757d"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#495057" 
                  strokeWidth={3}
                  dot={{ fill: '#495057', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#495057', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="category-summary">
          <h4>Category Breakdown</h4>
          <div className="category-list">
            {pieData.map((category, index) => (
              <div key={category.name} className="category-item">
                <div className="category-info">
                  <span 
                    className="category-color" 
                    style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                  ></span>
                  <span className="category-name">{category.name}</span>
                </div>
                <span className="category-amount">${category.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCharts;