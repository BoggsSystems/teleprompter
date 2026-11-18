import React from 'react';
import { Download, RotateCcw, X, CheckCircle } from 'lucide-react';

interface VideoReviewModalProps {
  isOpen: boolean;
  videoUrl: string | null;
  durationSeconds: number;
  onDownload: () => void;
  onRetake: () => void;
  onClose: () => void;
}

export const VideoReviewModal: React.FC<VideoReviewModalProps> = ({
  isOpen,
  videoUrl,
  durationSeconds,
  onDownload,
  onRetake,
  onClose,
}) => {
  if (!isOpen || !videoUrl) return null;

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const formattedDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle size={18} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Speech Recording Complete!</h2>
              <p className="text-neutral-400 text-xs">
                Take Duration: <span className="font-mono text-emerald-400 font-semibold">{formattedDuration}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Controls */}
        <div className="p-6 bg-neutral-950/70 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onRetake}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium transition-colors border border-neutral-700"
          >
            <RotateCcw size={16} />
            <span>Record New Take</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={16} />
              <span>Save Video File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
