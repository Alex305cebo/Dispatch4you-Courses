import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { useProgressStore } from '../store/useProgressStore';
import { useUIStore } from '../store/useUIStore';

/**
 * Formats a Date to Russian locale string like "15 марта 2024"
 */
function formatDateRussian(date: Date): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * CertificatePage — Certificate preview and download page.
 *
 * Shows a certificate preview card with gold gradient styling,
 * provides PDF download via jsPDF, and a shareable link copy button.
 * If the final exam has not been passed, shows a redirect message.
 *
 * Requirements covered: 9.5, 9.8
 */
export default function CertificatePage() {
  const { displayName, finalExamPassed, finalExamScore, certificateId } =
    useProgressStore();
  const { showToast } = useUIStore();

  const completionDate = formatDateRussian(new Date());

  const handleDownloadPDF = useCallback(() => {
    if (!certificateId) return;

    // A4 landscape: 297 x 210 mm
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const pageWidth = 297;
    const pageHeight = 210;

    // Background
    doc.setFillColor(26, 32, 44); // dark bg
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Gold border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner border
    doc.setLineWidth(1);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(212, 175, 55);
    doc.text('Dispatch: Career Path', pageWidth / 2, 45, { align: 'center' });

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Сертификат', pageWidth / 2, 58, { align: 'center' });

    // Decorative line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 50, 65, pageWidth / 2 + 50, 65);

    // "Настоящим подтверждается, что"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.text('Настоящим подтверждается, что', pageWidth / 2, 80, { align: 'center' });

    // Student name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(displayName || 'Студент', pageWidth / 2, 95, { align: 'center' });

    // Completion text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.text(
      'успешно завершил(а) курс обучения диспетчера грузоперевозок',
      pageWidth / 2,
      110,
      { align: 'center' }
    );

    // Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(212, 175, 55);
    doc.text(`Итоговый балл: ${finalExamScore}%`, pageWidth / 2, 125, { align: 'center' });

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text(`Дата: ${completionDate}`, pageWidth / 2, 145, { align: 'center' });

    // Certificate ID
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`ID: ${certificateId}`, pageWidth / 2, 155, { align: 'center' });

    // Seal / badge placeholder (gold circle)
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1.5);
    doc.circle(pageWidth / 2, 175, 12);
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 55);
    doc.text('✓', pageWidth / 2, 178, { align: 'center' });

    doc.save('dispatch-academy-certificate.pdf');
  }, [certificateId, displayName, finalExamScore, completionDate]);

  const handleCopyLink = useCallback(async () => {
    if (!certificateId) return;
    const url = `${window.location.origin}/certificate?id=${certificateId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Ссылка скопирована!');
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Ссылка скопирована!');
    }
  }, [certificateId, showToast]);

  // Guard: no certificate yet
  if (!finalExamPassed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Сертификат недоступен
          </h1>
          <p className="text-gray-300 text-base mb-8">
            Сначала сдайте финальный экзамен
          </p>
          <Link
            to="/map"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            ← Вернуться к карте
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Certificate Preview Card */}
      <div className="w-full max-w-2xl">
        <div
          className="relative rounded-2xl border-2 border-yellow-600/50 p-8 sm:p-10 shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1a202c 0%, #2d3748 50%, #1a202c 100%)',
          }}
        >
          {/* Gold gradient overlay at top */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{
              background: 'linear-gradient(90deg, #b8860b, #ffd700, #b8860b)',
            }}
          />

          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{
                background: 'linear-gradient(135deg, #ffd700, #b8860b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Dispatch: Career Path — Сертификат
            </h1>
          </div>

          {/* Decorative line */}
          <div
            className="mx-auto mb-8 h-px w-40"
            style={{
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            }}
          />

          {/* Student Name */}
          <div className="text-center mb-6">
            <p className="text-gray-400 text-sm mb-1">Выдан</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {displayName || 'Студент'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Date */}
            <div className="text-center p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Дата</p>
              <p className="text-white font-semibold text-base">{completionDate}</p>
            </div>

            {/* Score */}
            <div className="text-center p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Балл</p>
              <p
                className="font-bold text-xl"
                style={{ color: '#ffd700' }}
              >
                {finalExamScore}%
              </p>
            </div>

            {/* Certificate ID */}
            <div className="text-center p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">ID сертификата</p>
              <p className="text-white font-mono text-sm break-all">
                {certificateId}
              </p>
            </div>
          </div>

          {/* Badge / Seal */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-2"
              style={{
                borderColor: '#d4af37',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(255,215,0,0.05))',
              }}
            >
              <span className="text-3xl" role="img" aria-label="Seal">🏅</span>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div
            className="mx-auto h-px w-40"
            style={{
              background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="min-h-[44px] px-8 py-3 font-semibold rounded-lg text-base transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 text-gray-900"
            style={{
              background: 'linear-gradient(135deg, #ffd700, #b8860b)',
            }}
          >
            📄 Скачать PDF
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="min-h-[44px] px-8 py-3 font-semibold rounded-lg text-base transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          >
            🔗 Скопировать ссылку
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/map"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
          >
            ← Вернуться к карте
          </Link>
        </div>
      </div>
    </div>
  );
}
