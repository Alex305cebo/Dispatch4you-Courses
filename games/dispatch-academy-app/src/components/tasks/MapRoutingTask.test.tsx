import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapRoutingTask from './MapRoutingTask';
import type { MapRoutingData } from '../../types/index';

const mockMapData: MapRoutingData = {
  origin: 'Chicago, IL',
  destination: 'Dallas, TX',
  routes: [
    { name: 'I-55 South', miles: 920, rate: 2.1, isOptimal: false },
    { name: 'I-44 Direct', miles: 850, rate: 1.8, isOptimal: true },
    { name: 'I-35 via KC', miles: 900, rate: 2.0, isOptimal: false },
  ],
};

describe('MapRoutingTask', () => {
  it('renders origin and destination', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
  });

  it('renders all route cards as buttons', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByText('I-55 South')).toBeInTheDocument();
    expect(screen.getByText('I-44 Direct')).toBeInTheDocument();
    expect(screen.getByText('I-35 via KC')).toBeInTheDocument();
  });

  it('displays miles and rate for each route', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    expect(screen.getByText(/920 миль/)).toBeInTheDocument();
    expect(screen.getByText(/\$2\.10\/миля/)).toBeInTheDocument();
    expect(screen.getByText(/850 миль/)).toBeInTheDocument();
    expect(screen.getByText(/\$1\.80\/миля/)).toBeInTheDocument();
  });

  it('displays calculated total cost for each route', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    // I-55: 920 * 2.1 = 1932.00
    expect(screen.getByText(/\$1932\.00/)).toBeInTheDocument();
    // I-44: 850 * 1.8 = 1530.00
    expect(screen.getByText(/\$1530\.00/)).toBeInTheDocument();
    // I-35: 900 * 2.0 = 1800.00
    expect(screen.getByText(/\$1800\.00/)).toBeInTheDocument();
  });

  it('calls onAnswer(true) when the optimal route is selected', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const optimalButton = screen.getByText('I-44 Direct').closest('button')!;
    fireEvent.click(optimalButton);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(false) when a non-optimal route is selected', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const suboptimalButton = screen.getByText('I-55 South').closest('button')!;
    fireEvent.click(suboptimalButton);
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('disables all buttons after selection', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('I-55 South').closest('button')!);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onAnswer more than once on multiple clicks', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]!);
    fireEvent.click(buttons[1]!);
    fireEvent.click(buttons[2]!);
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('highlights optimal route green after incorrect selection', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]!); // I-55 South (non-optimal)
    // Optimal route button should get green border styling
    expect(buttons[1]!.className).toContain('border-green-500');
    // Selected incorrect should get red styling
    expect(buttons[0]!.className).toContain('border-red-500');
  });

  it('shows feedback with correct answer name when wrong route selected', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]!); // I-55 South
    expect(screen.getByText(/Оптимальный маршрут:/)).toBeInTheDocument();
    // The feedback section mentions I-44 Direct
    const allMatches = screen.getAllByText('I-44 Direct');
    expect(allMatches.length).toBeGreaterThanOrEqual(2); // once in card, once in feedback
  });

  it('shows success feedback when correct route is selected', () => {
    const onAnswer = vi.fn();
    render(<MapRoutingTask data={mockMapData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('I-44 Direct').closest('button')!);
    expect(screen.getByText(/Верно!/)).toBeInTheDocument();
  });
});
