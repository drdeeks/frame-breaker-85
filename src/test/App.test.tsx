import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock Renderer
vi.mock('../game/engine/Renderer', () => {
  return {
    Renderer: vi.fn().mockImplementation(() => {
      return {
        render: vi.fn(),
      };
    }),
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Frame Breaker '85/i)).toBeDefined();
  });

  it('shows the start screen initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Start Game')).toBeDefined();
    expect(getByText('Leaderboard')).toBeDefined();
  });
});
