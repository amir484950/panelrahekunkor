import React from 'react';
import { Download, BookOpen, UserCheck, ShieldCheck, Terminal, FileCode2, Sparkles, Smartphone, UserCircle } from 'lucide-react';
import { UserRole } from '../types';
import { downloadPluginZip } from '../data/pluginFiles';

interface NavbarProps {
  activeTab: 'student' | 'mentor' | 'hub' | 'profile' | 'admin' | 'plugin_code' | 'api_docs';
  setActiveTab: (tab: 'student' | 'mentor' | 'hub' | 'profile' | 'admin' | 'plugin_code' | 'api_docs') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
}) => {
  const handleDownloadZip = () => {
    downloadPluginZip();
  };


  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* ردیف اصلی هدر */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* سمت راست: نام و برند */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              RK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">راه کنکور</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 border border-orange-200">
                  rk-student-portal.php
                </span>
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">نسخه ۱.۰.۰</span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                موتور مستقل REST API وردپرس + شورتکد وب و کلاینت اپلیکیشن موبایل
              </p>
            </div>
          </div>

          {/* سمت چپ: دکمه دانلود زیپ افزونه و تغییر نقش */}
          <div className="flex items-center gap-3">
            {/* سلکتور نقش */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setCurrentRole('rksp_student');
                  setActiveTab('student');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'rksp_student'
                    ? 'bg-white text-orange-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                دانش‌آموز
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentRole('rksp_mentor');
                  setActiveTab('mentor');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'rksp_mentor'
                    ? 'bg-white text-orange-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                مشاور
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentRole('administrator');
                  setActiveTab('admin');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentRole === 'administrator'
                    ? 'bg-white text-orange-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                مدیر سایت
              </button>
            </div>

            {/* دکمه دانلود فوری ZIP افزونه */}
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>دانلود افزونه (ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ردیف تب‌ها */}
      <div className="bg-slate-50/80 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-reverse space-x-2 sm:space-x-4 overflow-x-auto py-2 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'student'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>پرتال و اپ دانش‌آموز</span>
              <span className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.2 rounded-full">ویو اپ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mentor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'mentor'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>پرتال مشاور تحصیلی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hub')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'hub'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>چرخه ۳ مرحله‌ای (ثبت‌نام، اتصال و نظارت مدیر)</span>
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">مراحل ۱، ۲، ۳</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              <span>پروفایل اختصاصی کاربر</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">REST API</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>داشبورد مدیر (پیشخوان وردپرس)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">درسباما</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plugin_code')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'plugin_code'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>سورس کد افزونه و راهنمای نصب</span>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full">PHP آماده</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('api_docs')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === 'api_docs'
                  ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>آزمایشگاه REST API (`rksp/v1`)</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
