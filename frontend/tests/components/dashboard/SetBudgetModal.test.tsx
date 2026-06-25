import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SetBudgetModal from '../../../src/components/dashboard/SetBudgetModal'
import type { BudgetStatus } from '../../../src/types/budget'

vi.mock('../../../src/services/budgetService', () => ({
  budgetService: {
    setBudget: vi.fn(),
  },
}))

import { budgetService } from '../../../src/services/budgetService'

const noBudgetStatus: BudgetStatus = { budget: null, spent: 0, percentage: 0, isNearLimit: false }
const existingBudgetStatus: BudgetStatus = { budget: 1000, spent: 400, percentage: 40, isNearLimit: false }

describe('SetBudgetModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <SetBudgetModal isOpen={false} onClose={vi.fn()} currentBudget={null} onSaved={vi.fn()} />
    )
    expect(screen.queryByText('Set Monthly Budget')).not.toBeInTheDocument()
  })

  it('renders the modal title and hint when open', () => {
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    expect(screen.getByText('Set Monthly Budget')).toBeInTheDocument()
    expect(screen.getByText(/90%/i)).toBeInTheDocument()
  })

  it('pre-fills the input with the existing budget', () => {
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={existingBudgetStatus} onSaved={vi.fn()} />
    )
    const input = screen.getByLabelText(/monthly budget/i) as HTMLInputElement
    expect(input.value).toBe('1000')
  })

  it('shows an error for a negative amount', async () => {
    const user = userEvent.setup()
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    const input = screen.getByLabelText(/monthly budget/i)
    await user.clear(input)
    await user.type(input, '-50')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText(/greater than 0/i)).toBeInTheDocument()
    expect(budgetService.setBudget).not.toHaveBeenCalled()
  })

  it('shows an error for zero', async () => {
    const user = userEvent.setup()
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    const input = screen.getByLabelText(/monthly budget/i)
    await user.clear(input)
    await user.type(input, '0')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText(/greater than 0/i)).toBeInTheDocument()
  })

  it('calls setBudget with the parsed number on a valid save', async () => {
    vi.mocked(budgetService.setBudget).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    const onSaved = vi.fn()
    const onClose = vi.fn()
    render(
      <SetBudgetModal isOpen={true} onClose={onClose} currentBudget={noBudgetStatus} onSaved={onSaved} />
    )
    const input = screen.getByLabelText(/monthly budget/i)
    await user.clear(input)
    await user.type(input, '1500')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(budgetService.setBudget).toHaveBeenCalledWith(1500))
    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('calls setBudget(null) when input is empty', async () => {
    vi.mocked(budgetService.setBudget).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    const input = screen.getByLabelText(/monthly budget/i)
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(budgetService.setBudget).toHaveBeenCalledWith(null))
  })

  it('shows "Clear budget" button only when a budget exists', () => {
    const { rerender } = render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    expect(screen.queryByText(/clear budget/i)).not.toBeInTheDocument()

    rerender(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={existingBudgetStatus} onSaved={vi.fn()} />
    )
    expect(screen.getByText(/clear budget/i)).toBeInTheDocument()
  })

  it('calls setBudget(null) when Clear budget is clicked', async () => {
    vi.mocked(budgetService.setBudget).mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(
      <SetBudgetModal isOpen={true} onClose={vi.fn()} currentBudget={existingBudgetStatus} onSaved={vi.fn()} />
    )
    await user.click(screen.getByText(/clear budget/i))

    await waitFor(() => expect(budgetService.setBudget).toHaveBeenCalledWith(null))
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SetBudgetModal isOpen={true} onClose={onClose} currentBudget={noBudgetStatus} onSaved={vi.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
