import React, { useState, useEffect } from 'react';
import { FileCode, Download, Copy, Check, Folder, File, ExternalLink, Terminal, Shield, Database } from 'lucide-react';
import { PluginFile } from '../types';
import { getPluginFiles, downloadPluginZip } from '../data/pluginFiles';

export const PluginCodeViewer: React.FC = () => {
  const [files, setFiles] = useState<PluginFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<PluginFile | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = getPluginFiles();
      setFiles(data);
      if (data.length > 0) {
        const main = data.find(f => f.name === 'rk-student-portal.php') || data[0];
        setSelectedFile(main);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    downloadPluginZip();
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* بنر دانلود و خلاصه معماری */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-md">
              RK-STUDENT-PORTAL.ZIP
            </span>
            <span className="text-xs text-slate-300 font-semibold">پکیج نهایی و آماده بارگذاری در پیشخوان وردپرس</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            سورس کامل و تست‌شده افزونه پرتال راه کنکور
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            کدنویسی ۱۰۰٪ استاندارد PHP، پیشوند سراسری <code className="text-amber-400 font-mono">rksp_</code>، ۷ جدول مستقل با <code className="text-amber-400 font-mono">dbDelta</code>، بدون وابستگی به قالب یا افزونه‌های ACF/CPT UI.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZip}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 transition-transform active:scale-95 whitespace-nowrap"
        >
          <Download className="w-5 h-5" />
          <span>دانلود فایل زیپ افزونه (۲۹ کیلوبایت)</span>
        </button>
      </div>

      {/* راهنمای نصب در وردپرس و شورتکدها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm mb-2">
            <Download className="w-4 h-4 text-orange-600" />
            ۱. نحوه نصب در پیشخوان وردپرس
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            فایل <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">rk-student-portal.zip</code> را دانلود کرده و در پیشخوان وردپرس به مسیر <strong>افزونه‌ها &gt; افزودن &gt; بارگذاری افزونه</strong> بروید، فایل را انتخاب کرده و بر روی <strong>فعال‌سازی</strong> کلیک کنید.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm mb-2">
            <Database className="w-4 h-4 text-emerald-600" />
            ۲. راه‌اندازی خودکار جداول
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            در لحظه فعال‌سازی، تابع <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">dbDelta</code> هفت جدول مستقل (<code className="font-mono text-[11px]">wp_rksp_*</code>) را به صورت خودکار با ایندکس‌های بهینه روی پایگاه‌داده MySQL ایجاد می‌کند.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 font-black text-slate-900 text-sm mb-2">
            <FileCode className="w-4 h-4 text-purple-600" />
            ۳. برگه‌های خودکار و بلاک‌های گوتنبرگ
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            بدون نیاز به المنتور یا هیچ صفحه‌سازی؛ در فعال‌سازی ۴ برگه استاندارد در وردپرس ساخته می‌شود و در ادیتور گوتنبرگ بلاک‌های زیر در دسترسند:
          </p>
          <div className="text-xs text-slate-600 space-y-1 font-mono">
            <div>• <code className="text-orange-700 font-bold">rksp/student-portal</code> (برگه /student-portal/)</div>
            <div>• <code className="text-orange-700 font-bold">rksp/mentor-portal</code> (برگه /mentor-portal/)</div>
            <div>• <code className="text-orange-700 font-bold">rksp/leaderboard</code> (باشگاه مطالعه)</div>
            <div>• <code className="text-orange-700 font-bold">rksp/achievements</code> (باشگاه پیشرفت)</div>
          </div>
        </div>
      </div>

      {/* مرورگر فایل و نمایشگر سورس‌کد */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          {/* ستون راست: درخت فایل‌ها */}
          <div className="lg:col-span-4 border-l border-slate-200 p-4 bg-slate-50/70">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
              ساختار فایل‌های افزونه ({files.length} فایل)
            </div>

            <div className="space-y-1">
              {files.map(file => {
                const isSelected = selectedFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors font-mono ${
                      isSelected
                        ? 'bg-orange-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.name.endsWith('.php') ? (
                        <FileCode className="w-4 h-4 shrink-0 text-amber-500" />
                      ) : (
                        <File className="w-4 h-4 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate" dir="ltr">{file.path}</span>
                    </div>
                    <span className="text-[10px] opacity-70 shrink-0">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ستون چپ: نمایش محتوای فایل انتخاب‌شده */}
          <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-100">
            {/* نوار بالای ادیتور */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-bold" dir="ltr">
                  rk-student-portal/{selectedFile?.path}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد!' : 'کپی سورس'}</span>
              </button>
            </div>

            {/* بدنه سورس‌کد با خطوط تمیز */}
            <div className="flex-1 p-4 overflow-auto max-h-[600px] text-xs font-mono leading-relaxed" dir="ltr">
              <pre className="text-slate-200">
                <code>{selectedFile?.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
