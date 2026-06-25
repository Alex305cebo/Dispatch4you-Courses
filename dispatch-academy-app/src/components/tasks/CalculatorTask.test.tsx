import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalculatorTask from './CalculatorTask';
import type { CalculatorData } from '../../types/index';
import { generateCalculatorOptions } from '../../logic/calculator-options';

const mockCalcData: CalculatorData = {
  problem: 'Рассчитайте стоимость перевозки',
  context: 'Расстояние 500 миль, ставка $2.50/миля',
  correctAnswer: 1250,
  tolerancePercent: 2,
  unit: '$',
};

describe('generateCalculatorOptions', () => {
  it('returns exactly 6 options with one correct index', () => {
    const result = generateCalculatorOptions(2.4, '$/mile');
    expect(result.options).toHaveLength(6);
    expect(result.correctIndex).toBeGreaterThanOrEqual(0);
    expect(result.correctIndex).toBeLessThan(6);
    expect(result.options[result.correctIndex]).toBe('2.40 $/mile');
  });

  it('generates unique options', () => {
    const result = generateCalculatorOptions(1250, '$');
    expect(new Set(result.options).size).toBe(6);
  });
});

describe('CalculatorTask', () => {
  it('renders the problem and context', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getByText('Рассчитайте стоимость перевозки')).toBeInTheDocument();
    expect(screen.getByText('Расстояние 500 миль, ставка $2.50/миля')).toBeInTheDocument();
  });

  it('renders six answer options', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('calls onAnswer(true) when correct option is selected', () => {
    const onAnswer = vi.fn();
    const { correctIndex } = generateCalculatorOptions(
      mockCalcData.correctAnswer,
      mockCalcData.unit
    );
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const btn = screen.getAllByRole('button')[correctIndex];
    if (btn) fireEvent.click(btn);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(false) when wrong option is selected', () => {
    const onAnswer = vi.fn();
    const { correctIndex } = generateCalculatorOptions(
      mockCalcData.correctAnswer,
      mockCalcData.unit
    );
    const wrongIndex = correctIndex === 0 ? 1 : 0;
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const btn = screen.getAllByRole('button')[wrongIndex];
    if (btn) fireEvent.click(btn);
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('shows success message when correct', () => {
    const onAnswer = vi.fn();
    const { correctIndex, options } = generateCalculatorOptions(
      mockCalcData.correctAnswer,
      mockCalcData.unit
    );
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const btn = screen.getAllByRole('button')[correctIndex];
    if (btn) fireEvent.click(btn);
    expect(screen.getByText(`Верно! Ответ: ${options[correctIndex]}`)).toBeInTheDocument();
  });

  it('shows error message when incorrect', () => {
    const onAnswer = vi.fn();
    const { correctIndex, options } = generateCalculatorOptions(
      mockCalcData.correctAnswer,
      mockCalcData.unit
    );
    const wrongIndex = correctIndex === 0 ? 1 : 0;
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const btn = screen.getAllByRole('button')[wrongIndex];
    if (btn) fireEvent.click(btn);
    expect(
      screen.getByText(`Неверно. Правильный ответ: ${options[correctIndex]}`)
    ).toBeInTheDocument();
  });

  it('disables options after answering', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    const btn = buttons[0];
    if (btn) fireEvent.click(btn);
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onAnswer more than once', () => {
    const onAnswer = vi.fn();
    render(<CalculatorTask data={mockCalcData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    const btn0 = buttons[0];
    const btn1 = buttons[1];
    if (btn0) fireEvent.click(btn0);
    if (btn1) fireEvent.click(btn1);
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('handles zero correct answer', () => {
    const zeroData: CalculatorData = {
      problem: 'Рассчитайте прибыль',
      context: 'Доход равен расходу',
      correctAnswer: 0,
      tolerancePercent: 2,
      unit: '$',
    };
    const onAnswer = vi.fn();
    const { correctIndex } = generateCalculatorOptions(0, '$');
    render(<CalculatorTask data={zeroData} onAnswer={onAnswer} />);
    const btn = screen.getAllByRole('button')[correctIndex];
    if (btn) fireEvent.click(btn);
    expect(onAnswer).toHaveBeenCalledWith(true);
  });
});
