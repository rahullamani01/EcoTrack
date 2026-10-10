import React, { useRef, useState } from 'react';
import { CampusMetrics, HallBenchmark, DateRangeFilter } from '../types';
import { X, Download, FileSpreadsheet, Image as ImageIcon, Printer, Share2, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: CampusMetrics;
  benchmarks: HallBenchmark[];
  dateRange: DateRangeFilter;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  benchmarks,
  dateRange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingPng, setGeneratingPng] = useState(false);

  if (!isOpen) return null;

  // Export CSV functionality
  const handleExportCSV = () => {
    const headers = ['Hall Name', 'Students Enrolled', 'Diversion Rate (%)', 'Points Per Capita', 'Avg Leak Turnaround (Hrs)', 'Trend'];
    const rows = benchmarks.map((b) => [
      `"${b.name}"`,
      b.studentsCount,
      b.wasteDiversionPct,
      b.pointsPerCapita,
      b.leakTurnaroundHours,
      b.trend,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`Sanjay Ghodawat University (SGU) Sustainability Report - ${dateRange.label}`, '']
        .concat([headers.join(',')])
        .concat(rows.map((e) => e.join(',')))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sgu-campus-metrics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-Resolution Visual Export via HTML5 Canvas
  const handleExportPNG = () => {
    setGeneratingPng(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setGeneratingPng(false);
      return;
    }

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1200, 700);

    // Header bar
    ctx.fillStyle = '#0b2545';
    ctx.fillRect(0, 0, 1200, 110);

    // Title & Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Sanjay Ghodawat University (SGU) · EcoTrack', 48, 64);

    ctx.fillStyle = '#b9d7f2';
    ctx.font = '500 15px "Inter", sans-serif';
    ctx.fillText(`Atigre Campus, Kolhapur · sguk.ac.in · Filter Range: ${dateRange.label} · Verified Telemetry`, 48, 92);

    // Metric tiles
    const tileW = 250;
    const tileH = 110;
    const startY = 145;
    const metricsData = [
      { label: 'Students Participating', val: `${metrics.studentsParticipating.toLocaleString()}+`, sub: '+22% in Eng & Pharmacy' },
      { label: 'Challenges Completed', val: metrics.challengesCompleted.toLocaleString(), sub: 'Daily habit logs' },
      { label: 'Waste Diverted', val: `${metrics.wasteDivertedTons} T`, sub: 'Estimated campus rate' },
      { label: 'Issues Managed', val: metrics.issuesResolved.toString(), sub: '96% within 24h' },
    ];

    metricsData.forEach((m, idx) => {
      const x = 48 + idx * (tileW + 36);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(x, startY, tileW, tileH, 16);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Values
      ctx.fillStyle = '#0b2545';
      ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(m.val, x + 20, startY + 45);

      ctx.fillStyle = '#0f233a';
      ctx.font = '600 14px "Inter", sans-serif';
      ctx.fillText(m.label, x + 20, startY + 74);

      ctx.fillStyle = '#475569';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText(m.sub, x + 20, startY + 95);
    });

    // Leaderboard Section Box
    const tableY = 285;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(48, tableY, 1104, 320, 16);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = '#0b2545';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SGU Hostels & Academic Quads Benchmarking', 72, tableY + 42);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Inter", sans-serif';
    ctx.fillText('Hostel / Quad', 72, tableY + 80);
    ctx.fillText('Students Enrolled', 380, tableY + 80);
    ctx.fillText('Diversion Rate', 600, tableY + 80);
    ctx.fillText('Points / Capita', 820, tableY + 80);
    ctx.fillText('Turnaround', 990, tableY + 80);

    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(72, tableY + 92);
    ctx.lineTo(1120, tableY + 92);
    ctx.stroke();

    benchmarks.slice(0, 5).forEach((b, idx) => {
      const rowY = tableY + 128 + idx * 38;
      ctx.fillStyle = '#0f233a';
      ctx.font = '600 14px "Inter", sans-serif';
      ctx.fillText(b.name, 72, rowY);

      ctx.font = '400 14px "Inter", sans-serif';
      ctx.fillText(b.studentsCount.toString(), 380, rowY);

      ctx.fillStyle = '#0b2545';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(`${b.wasteDiversionPct}%`, 600, rowY);

      ctx.fillStyle = '#0f233a';
      ctx.font = '400 14px "Inter", sans-serif';
      ctx.fillText(`${b.pointsPerCapita} pts`, 820, rowY);

      ctx.fillText(`${b.leakTurnaroundHours}h avg`, 990, rowY);
    });

    // Footer note
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('Generated via SGU EcoTrack · Sanjay Ghodawat University Sustainability Office (sguk.ac.in)', 48, 650);

    // Download trigger
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `sgu-ecotrack-report-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setGeneratingPng(false);
    }, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-card-border rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
            Data Export & Dissemination
          </span>
          <h2 className="text-2xl font-bold font-headline text-on-surface">
            Export Campus Report
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Selected Range: <span className="font-semibold text-on-surface">{dateRange.label}</span> ({dateRange.startDate} to {dateRange.endDate})
          </p>
        </div>

        <div className="space-y-3">
          {/* Visual Export Button */}
          <button
            onClick={handleExportPNG}
            disabled={generatingPng}
            className="w-full p-4 rounded-xl border border-card-border bg-surface-container-low hover:bg-secondary-container/50 text-left flex items-start gap-3 transition-colors group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-surface-container-lowest text-primary group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">
                  {generatingPng ? 'Generating High-Res Canvas...' : 'Export Visual Graphic (PNG)'}
                </span>
                <Download className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Renders a presentation-ready high-resolution graphic card with key KPI benchmarks.
              </p>
            </div>
          </button>

          {/* CSV Dataset */}
          <button
            onClick={handleExportCSV}
            className="w-full p-4 rounded-xl border border-card-border bg-surface-container-low hover:bg-secondary-container/50 text-left flex items-start gap-3 transition-colors group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-surface-container-lowest text-primary group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">Raw Dataset (CSV)</span>
                <Download className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Download structured rows for university coursework, spreadsheets, and academic research.
              </p>
            </div>
          </button>

          {/* Printable Report */}
          <button
            onClick={handlePrint}
            className="w-full p-4 rounded-xl border border-card-border bg-surface-container-low hover:bg-secondary-container/50 text-left flex items-start gap-3 transition-colors group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-surface-container-lowest text-primary group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">Print / Save as PDF</span>
                <span className="text-xs text-secondary font-medium">Browser Print</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Formatted for collegiate committee distribution or physical pin boards.
              </p>
            </div>
          </button>

          {/* Share Link */}
          <button
            onClick={handleCopyShareLink}
            className="w-full p-4 rounded-xl border border-card-border bg-surface-container-low hover:bg-secondary-container/50 text-left flex items-start gap-3 transition-colors group cursor-pointer"
          >
            <div className="p-2.5 rounded-lg bg-surface-container-lowest text-primary group-hover:scale-105 transition-transform">
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">
                  {copied ? 'Link Copied to Clipboard!' : 'Share Telemetry Link'}
                </span>
                <span className="text-xs text-secondary font-medium">Live Dashboard</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Direct URL to share with student coalition members and faculty liaisons.
              </p>
            </div>
          </button>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
