import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import NewProjectDialog from './NewProjectDialog'

describe('NewProjectDialog', () => {
  it('renders the dialog when open is true', () => {
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('New Project')).toBeInTheDocument()
  })

  it('calls onClose when the cancel button is clicked', () => {
    const handleClose = vi.fn()
    render(<NewProjectDialog open={true} onClose={handleClose} onCreate={() => {}} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onCreate with the project name when create is clicked', () => {
    const handleCreate = vi.fn()
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={handleCreate} />)

    const input = screen.getByLabelText('Project name')
    fireEvent.change(input, { target: { value: '  My New Project  ' } })

    fireEvent.click(screen.getByText('Create'))
    expect(handleCreate).toHaveBeenCalledWith('My New Project')
  })

  it('calls onCreate when Enter is pressed in the text field', () => {
    const handleCreate = vi.fn()
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={handleCreate} />)

    const input = screen.getByLabelText('Project name')
    fireEvent.change(input, { target: { value: 'Enter Project' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(handleCreate).toHaveBeenCalledWith('Enter Project')
  })

  it('disables the create button when the name is empty', () => {
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={() => {}} />)
    const createButton = screen.getByText('Create')
    expect(createButton).toBeDisabled()
  })

  it('enables the create button when a name is entered', () => {
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={() => {}} />)
    const createButton = screen.getByText('Create')
    expect(createButton).toBeDisabled()

    const input = screen.getByLabelText('Project name')
    fireEvent.change(input, { target: { value: 'A valid name' } })

    expect(createButton).not.toBeDisabled()
  })

  it('does not call onCreate if the name is only whitespace', () => {
    const handleCreate = vi.fn()
    render(<NewProjectDialog open={true} onClose={() => {}} onCreate={handleCreate} />)
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: '   ' } })
    fireEvent.click(screen.getByText('Create'))
    expect(handleCreate).not.toHaveBeenCalled()
  })
})
