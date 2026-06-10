import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the brand in the header', async () => {
    render(<App />);
    expect((await screen.findAllByText('MathVision')).length).toBeGreaterThan(0);
  });
});
