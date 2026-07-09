import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizTask from './QuizTask';
import type { QuizData } from '../../types/index';

const mockQuizData: QuizData = {
  question: 'Что такое MC Number?',
  options: [
    'Уникальный номер перевозчика от FMCSA',
    'Номер страховки трака',
    'Номер водительских прав',
    'Номер грузового терминала',
  ],
  correctIndex: 0,
  explanation: 'MC Number — уникальный номер перевозчика от FMCSA.',
};

describe('QuizTask', () => {
  it('renders the question text', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    expect(screen.getByText('Что такое MC Number?')).toBeInTheDocument();
  });

  it('renders all 4 options as buttons', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(screen.getByText('Уникальный номер перевозчика от FMCSA')).toBeInTheDocument();
    expect(screen.getByText('Номер страховки трака')).toBeInTheDocument();
    expect(screen.getByText('Номер водительских прав')).toBeInTheDocument();
    expect(screen.getByText('Номер грузового терминала')).toBeInTheDocument();
  });

  it('calls onAnswer with (true, correctIndex) when correct option is clicked', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    const correctButton = screen.getByText('Уникальный номер перевозчика от FMCSA');
    fireEvent.click(correctButton);
    expect(onAnswer).toHaveBeenCalledWith(true, 0);
  });

  it('calls onAnswer with (false, selectedIndex) when incorrect option is clicked', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    const incorrectButton = screen.getByText('Номер страховки трака');
    fireEvent.click(incorrectButton);
    expect(onAnswer).toHaveBeenCalledWith(false, 1);
  });

  it('disables all buttons after an answer is selected', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('Номер страховки трака'));
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('shows explanation text after answering', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    // Explanation should not be visible before answering
    expect(screen.queryByText(mockQuizData.explanation)).not.toBeInTheDocument();
    // Answer
    fireEvent.click(screen.getByText('Номер водительских прав'));
    // Explanation should appear
    expect(screen.getByText(mockQuizData.explanation)).toBeInTheDocument();
  });

  it('highlights correct option green and incorrect option red on wrong answer', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('Номер страховки трака'));
    // Correct option should have green background class
    const correctButton = screen.getByText('Уникальный номер перевозчика от FMCSA').closest('button');
    expect(correctButton?.className).toContain('bg-green-600');
    // Selected incorrect option should have red background class
    const incorrectButton = screen.getByText('Номер страховки трака').closest('button');
    expect(incorrectButton?.className).toContain('bg-red-600');
  });

  it('highlights only the correct option green on correct answer', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('Уникальный номер перевозчика от FMCSA'));
    const correctButton = screen.getByText('Уникальный номер перевозчика от FMCSA').closest('button');
    expect(correctButton?.className).toContain('bg-green-600');
  });

  it('does not call onAnswer more than once after multiple clicks', () => {
    const onAnswer = vi.fn();
    render(<QuizTask data={mockQuizData} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText('Номер страховки трака'));
    fireEvent.click(screen.getByText('Уникальный номер перевозчика от FMCSA'));
    fireEvent.click(screen.getByText('Номер водительских прав'));
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });
});
