import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import CounterCard from './CounterCard'

describe('CounterCard', () => {
  it('renders children inside CardContent', () => {
    render(<CounterCard>Test Child</CounterCard>)
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('renders cardActions when provided', () => {
    render(<CounterCard cardActions={<button>Action</button>}>Child</CounterCard>)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders CardActions container even when empty', () => {
    const { container } = render(<CounterCard>Child</CounterCard>)
    const actions = container.querySelector('.MuiCardActions-root')
    expect(actions).not.toBeNull()
    expect(actions?.childNodes.length).toBe(0)
  })
})
