import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BudgetAlert from '../../../src/components/dashboard/BudgetAlert'
import type { BudgetStatus } from '../../../src/types/budget'

vi.mock('../../../src/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({ id: 'user-123', email: 'test@test.com', firstName: 'Test', lastName: 'User', fullName: 'Test User' })),
  },
}))

const nearStatus: BudgetStatus = { budget: 1000, spent: 920, percentage: 92, isNearLimit: true }
const overStatus: BudgetStatus = { budget: 1000, spent: 1150, percentage: 115, isNearLimit: true }
const safeStatus: BudgetStatus = { budget: 1000, spent: 400, percentage: 40, isNearLimit: false }

describe('BudgetAlert', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders nothing when isNearLimit is false', () => {
    const { container } = render(<BudgetAlert budgetStatus={safeStatus} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a warning banner when spending is between 90% and 100%', () => {
    render(<BudgetAlert budgetStatus={nearStatus} />)
    expect(screen.getByText(/92%/)).toBeInTheDocument()
    expect(screen.getByText(/\$920\.00 of \$1000\.00/)).toBeInTheDocument()
  })

  it('renders an exceeded message when spending is over 100%', () => {
    render(<BudgetAlert budgetStatus={overStatus} />)
    expect(screen.getByText(/exceeded/i)).toBeInTheDocument()
    expect(screen.getByText(/115%/)).toBeInTheDocument()
  })

  it('shows the actual percentage, not capped at 100', () => {
    render(<BudgetAlert budgetStatus={overStatus} />)
    expect(screen.getByText(/115%/)).toBeInTheDocument()
    expect(screen.queryByText(/100%/)).not.toBeInTheDocument()
  })

  it('hides the banner and writes to sessionStorage when dismissed', () => {
    render(<BudgetAlert budgetStatus={nearStatus} />)
    const dismissBtn = screen.getByRole('button', { name: /dismiss/i })
    fireEvent.click(dismissBtn)

    expect(screen.queryByText(/92%/)).not.toBeInTheDocument()
    const key = Object.keys(sessionStorage).find(k => k.startsWith('budget_alert_dismissed'))
    expect(key).toBeDefined()
    expect(sessionStorage.getItem(key!)).toBe('true')
  })

  it('is hidden on mount if sessionStorage already has the dismiss key', () => {
    // Pre-set the dismiss key for this user/month
    const now = new Date()
    const key = `budget_alert_dismissed_user-123_${now.getFullYear()}_${now.getMonth() + 1}`
    sessionStorage.setItem(key, 'true')

    const { container } = render(<BudgetAlert budgetStatus={nearStatus} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies warning CSS class for near-limit status', () => {
    const { container } = render(<BudgetAlert budgetStatus={nearStatus} />)
    expect(container.firstChild).toHaveClass('budget-alert--warning')
  })

  it('applies over-limit CSS class for over-100% status', () => {
    const { container } = render(<BudgetAlert budgetStatus={overStatus} />)
    expect(container.firstChild).toHaveClass('budget-alert--over')
  })
})
