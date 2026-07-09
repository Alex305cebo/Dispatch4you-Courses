import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CrisisTask from './CrisisTask';
import type { CrisisData } from '../../types/index';

const mockCrisisData: CrisisData = {
  scenario: 'Водитель сообщает о поломке на трассе I-80. Что делать?',
  timeLimitSeconds: 60,
  options: [
    {
      text: 'Вызвать эвакуатор и сообщить брокеру о задержке',
      isCorrect: true,
      explanation: 'Правильно! Нужно обеспечить безопасность трака и уведомить брокера.',
    },
    {
      text: 'Попросить водителя починить самостоятельно',
      isCorrect: false,
      explanation: 'Водитель не обязан ремонтировать трак на трассе — это небезопасно.',
    },
    {
      text: 'Игнорировать и найти другой трак',
      isCorrect: false,
      explanation: 'Нельзя бросить водителя и груз на трассе.',
    },
  ],
};

describe('CrisisTask', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders scenario text', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);
    expect(
      screen.getByText('Водитель сообщает о поломке на трассе I-80. Что делать?')
    ).toBeInTheDocument();
  });

  it('renders all option buttons', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);
    expect(
      screen.getByText('Вызвать эвакуатор и сообщить брокеру о задержке')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Попросить водителя починить самостоятельно')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Игнорировать и найти другой трак')
    ).toBeInTheDocument();
  });

  it('displays the countdown timer starting at timeLimitSeconds', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);
    expect(screen.getByRole('timer')).toHaveTextContent('60');
  });

  it('decrements timer each second', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole('timer')).toHaveTextContent('57');
  });

  it('calls onAnswer(true) when correct option is selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Вызвать эвакуатор и сообщить брокеру о задержке')
    );

    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it('calls onAnswer(false) when incorrect option is selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Попросить водителя починить самостоятельно')
    );

    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('shows "✅ Верно!" feedback when correct answer selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Вызвать эвакуатор и сообщить брокеру о задержке')
    );

    expect(screen.getByText('✅ Верно!')).toBeInTheDocument();
  });

  it('shows "❌ Неверно" and correct answer when wrong answer selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Игнорировать и найти другой трак')
    );

    expect(screen.getByText('❌ Неверно')).toBeInTheDocument();
    // Correct answer shown in feedback span
    const correctAnswerSpan = screen.getByText(
      'Вызвать эвакуатор и сообщить брокеру о задержке',
      { selector: 'span.font-semibold' }
    );
    expect(correctAnswerSpan).toBeInTheDocument();
  });

  it('shows explanation after answering', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Попросить водителя починить самостоятельно')
    );

    expect(
      screen.getByText('Водитель не обязан ремонтировать трак на трассе — это небезопасно.')
    ).toBeInTheDocument();
  });

  it('calls onAnswer(false) when timer reaches 0', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  it('shows "⏰ Время вышло!" when timer expires', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(screen.getByText('⏰ Время вышло!')).toBeInTheDocument();
  });

  it('disables all buttons after an answer is selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Попросить водителя починить самостоятельно')
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onAnswer more than once on multiple clicks', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    fireEvent.click(
      screen.getByText('Попросить водителя починить самостоятельно')
    );
    // After selecting wrong answer, correct answer text appears both in button and feedback.
    // Try to click the button directly via aria-label.
    const correctButton = screen.getByLabelText(
      'Вариант 1: Вызвать эвакуатор и сообщить брокеру о задержке'
    );
    fireEvent.click(correctButton);

    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it('stops the timer when an answer is selected', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    // Advance 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Select an answer
    fireEvent.click(
      screen.getByText('Вызвать эвакуатор и сообщить брокеру о задержке')
    );

    // Advance more time — timer should not change
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByRole('timer')).toHaveTextContent('50');
  });

  it('applies yellow color class when timer is between 10-30 seconds', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    // Advance to 25 seconds remaining (35s elapsed)
    act(() => {
      vi.advanceTimersByTime(35000);
    });

    const timer = screen.getByRole('timer');
    expect(timer.className).toContain('text-yellow-400');
  });

  it('applies red + pulse class when timer is below 10 seconds', () => {
    const onAnswer = vi.fn();
    render(<CrisisTask data={mockCrisisData} onAnswer={onAnswer} />);

    // Advance to 5 seconds remaining (55s elapsed)
    act(() => {
      vi.advanceTimersByTime(55000);
    });

    const timer = screen.getByRole('timer');
    expect(timer.className).toContain('text-red-500');
    expect(timer.className).toContain('animate-pulse');
  });

  it('uses default 60 seconds if timeLimitSeconds is 0', () => {
    const onAnswer = vi.fn();
    const dataWithZero: CrisisData = { ...mockCrisisData, timeLimitSeconds: 0 };
    render(<CrisisTask data={dataWithZero} onAnswer={onAnswer} />);
    expect(screen.getByRole('timer')).toHaveTextContent('60');
  });
});
