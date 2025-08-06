import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../../src/components/ui/Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const overlay = screen.getByText('Test Modal').parentElement?.parentElement?.parentElement!
    fireEvent.click(overlay)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should not call onClose when clicking modal content', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const content = screen.getByText('Modal Content')
    fireEvent.click(content)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should display correct title', () => {
    render(<Modal {...defaultProps} title="Custom Title" />)

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should render children correctly', () => {
    const customChildren = (
      <div>
        <p>Custom content</p>
        <button>Custom button</button>
      </div>
    )

    render(<Modal {...defaultProps} children={customChildren} />)

    expect(screen.getByText('Custom content')).toBeInTheDocument()
    expect(screen.getByText('Custom button')).toBeInTheDocument()
  })
})