import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '../../../src/components/ui/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dialog when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should not render dialog when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument()
  })

  it('should call onCancel when clicking Cancel button', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('should call onConfirm when clicking Confirm button', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    const confirmButton = screen.getByText('Confirm')
    await user.click(confirmButton)

    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('should display custom title and message', () => {
    render(<ConfirmDialog
      {...defaultProps}
      title="Delete Item"
      message="This action cannot be undone."
    />)

    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('should support different dialog types', () => {
    render(<ConfirmDialog {...defaultProps} type="warning" />)

    const dialog = screen.getByRole('button', { name: 'Confirm' }).parentElement?.parentElement
    expect(dialog?.querySelector('.warning')).toBeInTheDocument()
  })

  it('should support custom confirm button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Delete" />)

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('should support custom cancel button text', () => {
    render(<ConfirmDialog {...defaultProps} cancelText="Keep" />)

    expect(screen.getByText('Keep')).toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('should close dialog when clicking overlay', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    const overlay = screen.getByText('Confirm Action').parentElement?.parentElement?.parentElement!
    await user.click(overlay)

    expect(onCancel).toHaveBeenCalledOnce()
  })
})