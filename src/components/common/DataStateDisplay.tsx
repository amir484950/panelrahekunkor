import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  title?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'خطا در بارگذاری داده‌ها از سرور.',
  onRetry,
  title = 'عدم برقراری ارتباط با سرور',
}) => {
  return (
    <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto shadow-xs my-6" dir="rtl">
      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 mb-5 leading-relaxed max-w-md mx-auto">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black transition-colors shadow-2xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>تلاش دوباره</span>
      </button>
    </div>
  );
};

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = 'h-24' }) => (
  <div className={`bg-slate-200/70 animate-pulse rounded-2xl ${className}`} />
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" dir="rtl">
      {/* هدر اسکلتون */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="space-y-2">
              <div className="w-40 h-5 bg-slate-200 animate-pulse rounded-lg" />
              <div className="w-24 h-3 bg-slate-100 animate-pulse rounded-md" />
            </div>
          </div>
          <div className="w-28 h-9 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="w-20 h-4 bg-slate-200 animate-pulse rounded-md" />
            <div className="w-16 h-8 bg-slate-300 animate-pulse rounded-lg" />
            <div className="w-32 h-3 bg-slate-100 animate-pulse rounded-md" />
          </div>
        ))}
      </div>

      {/* چارت و جداول */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 h-80">
          <div className="w-36 h-5 bg-slate-200 animate-pulse rounded-lg mb-6" />
          <div className="w-full h-56 bg-slate-100 animate-pulse rounded-xl" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-80">
          <div className="w-28 h-5 bg-slate-200 animate-pulse rounded-lg mb-6" />
          <div className="w-full h-56 bg-slate-100 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
};
