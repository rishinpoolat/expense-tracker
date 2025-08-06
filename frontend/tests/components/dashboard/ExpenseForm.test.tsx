import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseForm from '../../../src/components/dashboard/ExpenseForm'
import { expenseService } from '../../../src/services/expenseService'
import type { Category, Expense } from '../../../src/types/expense'

// Mock the expenseService
vi.mock('../../../src/services/expenseService', () => ({
  expenseService: {
    getCategories: vi.fn(),
  },
}))

// Mock Tesseract
vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}))

describe('ExpenseForm', () => {
  const mockCategories: Category[] = [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Transport' },
    { id: 3, name: 'Entertainment' },
  ]

  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(expenseService.getCategories).mockResolvedValue(mockCategories)
  })

  it('should render form fields', async () => {
    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })
  })

  it('should load and display categories', async () => {
    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
      expect(screen.getByText('Entertainment')).toBeInTheDocument()
    })
  })

  it('should populate form with expense data when editing', async () => {
    const expense: Expense = {
      id: 1,
      title: 'Test Expense',
      amount: 100,
      expenseDate: '2023-01-15T10:30:00Z',
      description: 'Test description',
      notes: 'Test notes',
      categoryId: 2,
      category: { id: 2, name: 'Transport' },
      userId: 1,
    }

    render(<ExpenseForm {...defaultProps} expense={expense} />)

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Expense')).toBeInTheDocument()
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2023-01-15')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument()
    })
  })

  it('should update form data when typing in inputs', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText(/title/i)
    const amountInput = screen.getByLabelText(/amount/i)

    await user.type(titleInput, 'New Expense')
    await user.type(amountInput, '50.25')

    expect(titleInput).toHaveValue('New Expense')
    expect(amountInput).toHaveValue(50.25)
  })

  it('should render form validation logic', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExpenseForm {...defaultProps} onSubmit={onSubmit} />)

    await waitFor(() => {
      expect(screen.getByText('Create')).toBeInTheDocument()
    })

    // Submit empty form to trigger validation
    const submitButton = screen.getByText('Create')
    await user.click(submitButton)

    // Form should not be submitted due to validation
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should validate form state internally', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExpenseForm {...defaultProps} onSubmit={onSubmit} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText(/title/i)
    const amountInput = screen.getByLabelText(/amount/i)
    const submitButton = screen.getByText('Create')

    // Try with invalid amount
    await user.type(titleInput, 'Test Expense')
    await user.clear(amountInput)
    await user.type(amountInput, '0')
    await user.click(submitButton)

    // Should not submit with invalid data
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('should handle category selection', async () => {
    const user = userEvent.setup()
    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    })

    const categorySelect = screen.getByLabelText(/category/i)
    
    // Should have categories loaded
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Entertainment')).toBeInTheDocument()
    
    // Should be able to select a category
    await user.selectOptions(categorySelect, '2')
    expect(categorySelect).toHaveValue('2')
  })

  it('should submit valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ExpenseForm {...defaultProps} onSubmit={onSubmit} />)

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText(/title/i)
    const amountInput = screen.getByLabelText(/amount/i)
    const categorySelect = screen.getByLabelText(/category/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const submitButton = screen.getByText('Create')

    await user.type(titleInput, 'Test Expense')
    await user.type(amountInput, '50.75')
    await user.selectOptions(categorySelect, '1')
    await user.type(descriptionInput, 'Test description')
    await user.click(submitButton)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Expense',
        amount: 50.75,
        categoryId: 1,
        description: 'Test description',
        expenseDate: expect.any(String),
      })
    )
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ExpenseForm {...defaultProps} onCancel={onCancel} />)

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should show loading state when loading is true', async () => {
    render(<ExpenseForm {...defaultProps} loading={true} />)

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    const submitButton = screen.getByText('Creating...')
    expect(submitButton).toBeDisabled()
  })

  it('should show update text when editing expense', async () => {
    const expense: Expense = {
      id: 1,
      title: 'Test Expense',
      amount: 100,
      expenseDate: '2023-01-15T10:30:00Z',
      description: 'Test description',
      notes: 'Test notes',
      categoryId: 1,
      category: { id: 1, name: 'Food' },
      userId: 1,
    }

    render(<ExpenseForm {...defaultProps} expense={expense} />)

    await waitFor(() => {
      expect(screen.getByText('Update')).toBeInTheDocument()
    })
  })

  it('should show updating text when loading and editing', async () => {
    const expense: Expense = {
      id: 1,
      title: 'Test Expense',
      amount: 100,
      expenseDate: '2023-01-15T10:30:00Z',
      description: 'Test description',
      notes: 'Test notes',
      categoryId: 1,
      category: { id: 1, name: 'Food' },
      userId: 1,
    }

    render(<ExpenseForm {...defaultProps} expense={expense} loading={true} />)

    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  it('should render receipt upload functionality', async () => {
    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText(/scan receipt/i)).toBeInTheDocument()
    })

    // Should have file input for receipt upload
    const fileInput = screen.getByRole('button', { name: /Create/i }).closest('form')?.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')
  })

  it('should show error when categories fail to load', async () => {
    vi.mocked(expenseService.getCategories).mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<ExpenseForm {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load categories')).toBeInTheDocument()
    })
  })
})