import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppDispatch, useAppSelector } from '@src/app/hooks'
import { importProjects } from '@src/features/projects/projectsSlice'

import Layout from './Layout'

// Mock hooks
vi.mock('@src/app/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

// Mock notistack
const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack')
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    }),
    SnackbarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }
})

// Mock URL methods
window.URL.createObjectURL = vi.fn()
window.URL.revokeObjectURL = vi.fn()

describe('Layout', () => {
  const mockDispatch = vi.fn()
  const mockProjects = [
    {
      id: 'p1',
      name: 'Test Project',
      totalRows: null,
      currentRow: 0,
      sections: [],
      notes: '',
      lastModified: 0,
    },
  ]

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    // Mock selector to return the projects array directly
    vi.mocked(useAppSelector).mockReturnValue(mockProjects)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders layout with children and title', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="test-child">Content</div>
        </Layout>
      </MemoryRouter>,
    )

    expect(screen.getByText('Knit Row Counter')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('opens drawer and navigates', async () => {
    render(
      <MemoryRouter>
        <Layout>Content</Layout>
      </MemoryRouter>,
    )

    // Open drawer
    const menuButton = screen.getByLabelText('open navigation')
    fireEvent.click(menuButton)

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Import')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()

    // Click navigation item (Projects)
    fireEvent.click(screen.getByText('Projects'))

    // Drawer should close
    await waitFor(() => {
      expect(screen.queryByText('GitHub Repo')).not.toBeVisible()
    })
  })

  it('handles project export', () => {
    render(
      <MemoryRouter>
        <Layout>Content</Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('open navigation'))

    // Mock anchor click
    const link = { click: vi.fn(), href: '', download: '' }
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(link as unknown as HTMLElement)
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => link as unknown as HTMLElement)
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => link as unknown as HTMLElement)

    fireEvent.click(screen.getByText('Export'))

    expect(window.URL.createObjectURL).toHaveBeenCalled()
    expect(createElementSpy).toHaveBeenCalledWith('a')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(link.click).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
    expect(link.download).toContain('knit-row-counter-export')
  })

  it('handles project import success', async () => {
    render(
      <MemoryRouter>
        <Layout>Content</Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('open navigation'))

    const file = new File([JSON.stringify(mockProjects)], 'projects.json', {
      type: 'application/json',
    })

    // Mock FileReader
    const readAsTextMock = vi.fn()
    class MockFileReader {
      onload: ((e: { target: { result: string } }) => void) | null = null
      readAsText(file: File) {
        readAsTextMock(file)
        if (this.onload) {
          this.onload({ target: { result: JSON.stringify(mockProjects) } })
        }
      }
    }
    vi.stubGlobal('FileReader', MockFileReader)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(readAsTextMock).toHaveBeenCalledWith(file)
    expect(mockDispatch).toHaveBeenCalledWith(importProjects(mockProjects))
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.stringContaining('imported successfully'),
      { variant: 'success' },
    )
  })

  it('handles project import error', async () => {
    render(
      <MemoryRouter>
        <Layout>Content</Layout>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByLabelText('open navigation'))

    const file = new File(['invalid json'], 'projects.json', { type: 'application/json' })

    // Mock FileReader to fail parsing
    const readAsTextMock = vi.fn()
    class MockFileReader {
      onload: ((e: { target: { result: string } }) => void) | null = null
      readAsText(file: File) {
        readAsTextMock(file)
        if (this.onload) {
          this.onload({ target: { result: 'invalid json' } })
        }
      }
    }
    vi.stubGlobal('FileReader', MockFileReader)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(readAsTextMock).toHaveBeenCalledWith(file)
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.stringContaining('Error: Could not import file'),
      { variant: 'error' },
    )
  })
})
