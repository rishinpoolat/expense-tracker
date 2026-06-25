import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BudgetCard from '../../../src/components/dashboard/BudgetCard'
import type { BudgetStatus } from '../../../src/types/budget'

const noBudgetStatus: BudgetStatus = { budget: null, spent: 0, percentage: 0, isNearLimit: false }
const safeStatus: BudgetStatus = { budget: 1000, spent: 400, percentage: 40, isNearLimit: false }
const nearStatus: BudgetStatus = { budget: 1000, spent: 920, percentage: 92, isNearLimit: true }
const overStatus: BudgetStatus = { budget: 1000, spent: 1100, percentage: 110, isNearLimit: true }

describe('BudgetCard', () => {
  it('shows "Not set" when no budget is configured', () => {
    render(<BudgetCard budgetStatus={noBudgetStatus} onSetBudget={vi.fn()} />)
    expect(screen.getByText('Not set')).toBeInTheDocument()
  })

  it('shows "Set Budget" button when no budget is configured', () => {
    render(<BudgetCard budgetStatus={noBudgetStatus} onSetBudget={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Set Budget' })).toBeInTheDocument()
  })

  it('shows "Edit Budget" button when a budget exists', () => {
    render(<BudgetCard budgetStatus={safeStatus} onSetBudget={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Edit Budget' })).toBeInTheDocument()
  })

  it('shows spent and budget amounts when budget is set', () => {
    render(<BudgetCard budgetStatus={safeStatus} onSetBudget={vi.fn()} />)
    expect(screen.getByText('$400.00')).toBeInTheDocument()
    expect(screen.getByText('/ $1000.00')).toBeInTheDocument()
  })

  it('calls onSetBudget when button is clicked', () => {
    const onSetBudget = vi.fn()
    render(<BudgetCard budgetStatus={noBudgetStatus} onSetBudget={onSetBudget} />)
    fireEvent.click(screen.getByRole('button', { name: 'Set Budget' }))
    expect(onSetBudget).toHaveBeenCalledOnce()
  })

  it('applies near-limit class on progress bar fill when percentage >= 90', () => {
    const { container } = render(<BudgetCard budgetStatus={nearStatus} onSetBudget={vi.fn()} />)
    expect(container.querySelector('.budget-card__bar-fill--near')).toBeInTheDocument()
  })

  it('applies over-limit class on progress bar fill when percentage >= 100', () => {
    const { container } = render(<BudgetCard budgetStatus={overStatus} onSetBudget={vi.fn()} />)
    expect(container.querySelector('.budget-card__bar-fill--over')).toBeInTheDocument()
  })

  it('renders with null budgetStatus without crashing', () => {
    render(<BudgetCard budgetStatus={null} onSetBudget={vi.fn()} />)
    expect(screen.getByText('Not set')).toBeInTheDocument()
  })
})
