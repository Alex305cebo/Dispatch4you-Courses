import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocReviewTask from './DocReviewTask';
import type { DocReviewData } from '../../types/index';

const mockDocReviewData: DocReviewData = {
  documentType: 'rate-con',
  fields: [
    {
      id: 'field-1',
      label: 'Pickup Date',
      value: '2024-03-15',
      hasError: false,
    },
    {
      id: 'field-2',
      label: 'Delivery Address',
      value: '123 Wrong St, Chicago, IL',
      hasError: true,
      errorExplanation: 'Адрес доставки не совпадает с оригинальным заказом.',
    },
    {
      id: 'field-3',
      label: 'Rate',
      value: '$2,500.00',
      hasError: true,
      errorExplanation: 'Ставка отличается от согласованной — было $3,000.',
    },
    {
      id: 'field-4',
      label: 'Carrier Name',
      value: 'ABC Trucking LLC',
      hasError: false,
    },
  ],
};

const mockBOLData: DocReviewData = {
  documentType: 'bol',
  fields: [
    {
      id: 'bol-1',
      label: 'Shipper',
      value: 'Warehouse Inc',
      hasError: false,
    },
    {
      id: 'bol-2',
      label: 'Weight',
      value: '45,000 lbs',
      hasError: true,
      errorExplanation: 'Вес превышает допустимый.',
    },
  ],
};

describe('DocReviewTask', () => {
  it('renders Rate Confirmation document header', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);
    expect(screen.getByText('Rate Confirmation')).toBeInTheDocument();
    expect(screen.getByText('📄 Rate Con')).toBeInTheDocument();
  });

  it('renders BOL document header', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockBOLData} onAnswer={onAnswer} />);
    expect(screen.getByText('Bill of Lading')).toBeInTheDocument();
    expect(screen.getByText('📄 BOL')).toBeInTheDocument();
  });

  it('renders all field labels and values', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    expect(screen.getByText('Pickup Date')).toBeInTheDocument();
    expect(screen.getByText('2024-03-15')).toBeInTheDocument();
    expect(screen.getByText('Delivery Address')).toBeInTheDocument();
    expect(screen.getByText('123 Wrong St, Chicago, IL')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
    expect(screen.getByText('Carrier Name')).toBeInTheDocument();
    expect(screen.getByText('ABC Trucking LLC')).toBeInTheDocument();
  });

  it('shows instruction text before submission', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);
    expect(
      screen.getByText('Нажмите на поля, в которых вы видите ошибку')
    ).toBeInTheDocument();
  });

  it('toggles field selection on tap', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    const fieldButton = screen.getByLabelText(/Delivery Address/);
    fireEvent.click(fieldButton);
    expect(fieldButton).toHaveAttribute('aria-pressed', 'true');

    // Toggle off
    fireEvent.click(fieldButton);
    expect(fieldButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows submit button before submission', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);
    expect(screen.getByText('Проверить')).toBeInTheDocument();
  });

  it('calls onAnswer with correct score when all errors found', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    // Tap both error fields
    fireEvent.click(screen.getByLabelText(/Delivery Address/));
    fireEvent.click(screen.getByLabelText(/Rate/));

    // Submit
    fireEvent.click(screen.getByText('Проверить'));

    // Score: 100 - (0 * 10) - (0 / 2 * 100) = 100
    expect(onAnswer).toHaveBeenCalledWith(true, 100);
  });

  it('calls onAnswer with lower score for missed errors', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    // Only tap one of two error fields
    fireEvent.click(screen.getByLabelText(/Delivery Address/));

    // Submit
    fireEvent.click(screen.getByText('Проверить'));

    // Score: 100 - (0 * 10) - (1 / 2 * 100) = 50
    expect(onAnswer).toHaveBeenCalledWith(false, 50);
  });

  it('penalizes incorrect taps on non-error fields', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    // Tap both error fields + one non-error field
    fireEvent.click(screen.getByLabelText(/Delivery Address/));
    fireEvent.click(screen.getByLabelText(/Rate/));
    fireEvent.click(screen.getByLabelText(/Pickup Date/));

    // Submit
    fireEvent.click(screen.getByText('Проверить'));

    // Score: 100 - (1 * 10) - (0 / 2 * 100) = 90
    expect(onAnswer).toHaveBeenCalledWith(true, 90);
  });

  it('shows results after submission with score', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByLabelText(/Delivery Address/));
    fireEvent.click(screen.getByLabelText(/Rate/));
    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.getByText('✅ Хорошая работа!')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows failure message when score < 70', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    // Don't tap anything — submit
    fireEvent.click(screen.getByText('Проверить'));

    // Score: 100 - (0 * 10) - (2 / 2 * 100) = 0
    expect(onAnswer).toHaveBeenCalledWith(false, 0);
    expect(screen.getByText('❌ Нужно больше практики')).toBeInTheDocument();
  });

  it('shows error explanations after submission', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText('Проверить'));

    expect(
      screen.getByText('Адрес доставки не совпадает с оригинальным заказом.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ставка отличается от согласованной — было $3,000.')
    ).toBeInTheDocument();
  });

  it('disables field toggling after submission', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText('Проверить'));

    // All buttons should be disabled
    const buttons = screen.getAllByRole('button');
    const fieldButtons = buttons.filter((b) => b.getAttribute('aria-pressed') !== null);
    fieldButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('hides submit button after submission', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText('Проверить'));

    expect(screen.queryByText('Проверить')).not.toBeInTheDocument();
  });

  it('does not call onAnswer multiple times on double submit', () => {
    const onAnswer = vi.fn();
    render(<DocReviewTask data={mockDocReviewData} onAnswer={onAnswer} />);

    fireEvent.click(screen.getByText('Проверить'));
    // Button is gone after first submit, so onAnswer should only be called once
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });
});
