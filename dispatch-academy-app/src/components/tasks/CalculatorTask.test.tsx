import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalculatorTask from './CalculatorTask';
import type { CalculatorData } from '../../types/index';

const mockCalcData: CalculatorData = {
  problem: 'Рассчитайте стоимость перевозки',
  context: 'Расстояние 500 миль, ставка $2.50/миля',
  correctAnswer: 1250,
  tolerancePercent: 2,
  unit: '$',
};

describe('CalculatorTask', () => {
  it('renders the problem text', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getByText('Рассчитайте стоимость перевозки')).toBeInTheDocument();
  });

  it('renders the context text', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getByText('Расстояние 500 миль, ставка $2.50/миля')).toBeInTheDocument();
  });

  it('renders the unit label', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders a submit button with text "Проверить"', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getByRole('button', { name: 'Проверить' })).toBeInTheDocument();
  });

  it('calls onAnswer(true) when correct answer is submitted', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '1250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(true) when answer is within ±2% tolerance', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    // 1250 * 0.02 = 25, so 1225 is within tolerance
    fireEvent.change(input, { target: { value: '1225' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(false) when answer is outside tolerance', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    // 1200 is 50 off from 1250, 50/1250 = 4% > 2%
    fireEvent.change(input, { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('shows green success message when correct', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '1250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(screen.getByText('Верно! Ответ: 1250 $')).toBeInTheDocument();
  });

  it('shows red error message when incorrect', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(screen.getByText('Неверно. Правильный ответ: 1250 $')).toBeInTheDocument();
  });

  it('disables input and button after submission', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '1250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Проверить' })).toBeDisabled();
  });

  it('does not submit when input is empty', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it('prevents non-numeric characters in input', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('');
  });

  it('allows decimal input', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1250.50' } });
    expect(input.value).toBe('1250.50');
  });

  it('validates zero answer correctly', () => {
    const zeroData: CalculatorData = {
      problem: 'Рассчитайте прибыль',
      context: 'Доход равен расходу',
      correctAnswer: 0,
      tolerancePercent: 2,
      unit: '$',
    };
    const onAnswer = vi.fn();
    render(<CalculatorTask data={zeroData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('does not call onAnswer more than once on multiple clicks', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const input = screen.getByLabelText('Ваш ответ');
    fireEvent.change(input, { target: { value: '1250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });
});
