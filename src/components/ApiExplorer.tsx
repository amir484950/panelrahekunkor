import React, { useState } from 'react';
import { Terminal, Send, Play, CheckCircle2, Shield, Smartphone, Globe, Copy, Check } from 'lucide-react';
import { apiRequest, API_BASE } from '../api';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  title: string;
  category: 'auth' | 'student' | 'mentor' | 'admin' | 'public';
  description: string;
  defaultPayload?: any;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/rksp/v1/auth/otp-request',
    title: 'ارسال کد یک‌بار مصرف OTP',
    category: 'auth',
    description: 'شروع فرایند ورود با شماره موبایل مطابق عکس ۱ درسباما',
    defaultPayload: { mobile: '09301111101' },
  },
  {
    method: 'POST',
    path: '/rksp/v1/auth/otp-verify',
    title: 'تایید کد OTP و صدور Bearer Token',
    category: 'auth',
    description: 'تایید کد پیامک‌شده و صدور توکن امن برای درخواست‌های بعدی اپ/وب',
    defaultPayload: { mobile: '09301111101', otp: '123456' },
  },
  {
    method: 'POST',
    path: '/rksp/v1/study-logs',
    title: 'ثبت ساعت مطالعه دانش‌آموز',
    category: 'student',
    description: 'ثبت لاگ در جدول اختصاصی، اینولیدیت کش ۵ دقیقه‌ای و بررسی مایل‌استون',
    defaultPayload: { student_id: 101, minutes: 120, subject: 'زیست‌شناسی دوازدهم', source: 'app' },
  },
  {
    method: 'GET',
    path: '/rksp/v1/leaderboard?period=daily',
    title: 'باشگاه ساعت مطالعه (کش ۵ دقیقه)',
    category: 'public',
    description: 'دریافت رتبه‌بندی دانش‌آموزان به همراه وضعیت مدال‌های طلا/نقره/برنز',
  },
  {
    method: 'GET',
    path: '/rksp/v1/tasks/me?student_id=101',
    title: 'لیست گزارش کارهای من',
    category: 'student',
    description: 'دریافت تکالیف محول‌شده توسط مشاور با قابلیت تفکیک انجام شده/نشده',
  },
  {
    method: 'PATCH',
    path: '/rksp/v1/tasks/1',
    title: 'به‌روزرسانی وضعیت تکلیف (انجام شد)',
    category: 'student',
    description: 'تغییر وضعیت تکلیف به done و ثبت تاریخ انجام',
    defaultPayload: { status: 'done' },
  },
  {
    method: 'GET',
    path: '/rksp/v1/notes/me?student_id=106',
    title: 'نظرات عملکرد درسی مشاور',
    category: 'student',
    description: 'دریافت نظرات تحلیلی مشاور تحصیلی مطابق جدول عکس ۵',
  },
  {
    method: 'GET',
    path: '/rksp/v1/plan/me?student_id=101',
    title: 'اطلاعات طرح فعال و روزهای باقیمانده',
    category: 'student',
    description: 'محاسبه خودکار تاریخ انقضا و اعلان هشدار انقضای زیر ۷ روز',
  },
  {
    method: 'GET',
    path: '/rksp/v1/achievements/me?student_id=101',
    title: 'باشگاه پیشرفت — دستاوردها',
    category: 'student',
    description: 'فید افتخارات و رتبه‌های برتر مطابق جدول عکس ۶',
  },
  {
    method: 'GET',
    path: '/rksp/v1/channels',
    title: 'کانال‌های ارتباطی موسسه',
    category: 'public',
    description: 'آدرس‌های وب‌سایت، شماره‌های تماس، کانال تلگرام، اینستاگرام و بله',
  },
  {
    method: 'GET',
    path: '/rksp/v1/students?mentor_id=2',
    title: 'مشاور: دانش‌آموزان تحت پوشش',
    category: 'mentor',
    description: 'دریافت لیست دانش‌آموزان تحت نظر مشاور از جدول assignments',
  },
  {
    method: 'POST',
    path: '/rksp/v1/tasks',
    title: 'مشاور: محول‌کردن تکلیف به دانش‌آموز',
    category: 'mentor',
    description: 'ثبت تسک جدید برای دانش‌آموز با تعیین موعد تحویل',
    defaultPayload: { student_id: 101, mentor_id: 2, title: 'حل ۵۰ تست شیمی', description: 'کتاب شیمی خیلی سبز', due_date: '2026-09-20' },
  },
  {
    method: 'POST',
    path: '/rksp/v1/notes',
    title: 'مشاور: ثبت نظر عملکرد درسی',
    category: 'mentor',
    description: 'ثبت یادداشت عملکردی درسی در پرونده دانش‌آموز',
    defaultPayload: { student_id: 101, mentor_id: 2, content: 'روند مطالعه هفتگی عالی بوده است.', visibility: 'public' },
  },
  {
    method: 'GET',
    path: '/rksp/v1/admin/overview',
    title: 'مدیر: شاخص‌ها و طرح‌های روبه‌انقضا',
    category: 'admin',
    description: 'دریافت خلاصه نظارتی کل سیستم مطابق عکس‌های ۷ و ۱۰',
  },
  {
    method: 'POST',
    path: '/rksp/v1/admin/assign-mentor',
    title: 'مدیر: تخصیص مشاور به دانش‌آموز',
    category: 'admin',
    description: 'خاتمه دادن انتساب قبلی و ثبت رکورد جدید در wp_rksp_assignments',
    defaultPayload: { student_id: 114, mentor_id: 2 },
  },

];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(ENDPOINTS[0].defaultPayload || {}, null, 2)
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: Endpoint) => {
    setSelectedEndpoint(ep);
    setPayloadText(ep.defaultPayload ? JSON.stringify(ep.defaultPayload, null, 2) : '');
    setResponseBody('');
    setResponseStatus(null);
  };

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseBody('');
    try {
      let body: any = undefined;
      if (selectedEndpoint.method !== 'GET' && payloadText.trim()) {
        try {
          body = JSON.parse(payloadText);
        } catch {
          body = payloadText;
        }
      }

      const data = await apiRequest<any>(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        body,
      });
      setResponseStatus(200);
      setResponseBody(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(err?.status || 500);
      setResponseBody(JSON.stringify({ error: err?.message || 'خطا در ارتباط با سرور' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const getCurlSnippet = () => {
    let curl = `curl -X ${selectedEndpoint.method} "${API_BASE}${selectedEndpoint.path}" \\\n`;
    curl += `  -H "Authorization: Bearer <RKSP_TOKEN>" \\\n`;
    curl += `  -H "Content-Type: application/json"`;
    if (selectedEndpoint.method !== 'GET' && payloadText.trim()) {
      curl += ` \\\n  -d '${payloadText.replace(/\n/g, '')}'`;
    }
    return curl;
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* بنر توضیح معماری REST API */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">
              آزمایشگاه زنده REST API اختصاصی (`rksp/v1`)
            </h1>
            <p className="text-xs text-slate-500">
              نیم‌اسپیس واحد برای اتصال همزمان شورتکدهای وب و اپلیکیشن آینده اندروید/iOS بدون تکرار منطق
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* لیست اندپوینت‌ها */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {ENDPOINTS.map((ep, idx) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            let methodColor = 'bg-blue-100 text-blue-800';
            if (ep.method === 'POST') methodColor = 'bg-emerald-100 text-emerald-800';
            if (ep.method === 'PATCH') methodColor = 'bg-amber-100 text-amber-800';

            return (
              <div
                key={idx}
                onClick={() => handleSelectEndpoint(ep)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-orange-50/70 border-orange-400 shadow-xs ring-1 ring-orange-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded font-mono ${methodColor}`}>
                    {ep.method}
                  </span>
                  <span className="text-[11px] font-bold text-slate-900 truncate">
                    {ep.title}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate" dir="ltr">
                  {ep.path}
                </div>
              </div>
            );
          })}
        </div>

        {/* پنل تست زنده اندپوینت انتخاب‌شده */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {selectedEndpoint.category.toUpperCase()}
                </span>
                <h2 className="text-base font-black text-slate-900 mt-1">
                  {selectedEndpoint.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedEndpoint.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteRequest}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-stretch sm:self-auto justify-center"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{loading ? 'در حال ارسال...' : 'ارسال درخواست (Send)'}</span>
              </button>
            </div>

            {/* آدرس اندپوینت */}
            <div className="flex items-center gap-2 bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto" dir="ltr">
              <span className="text-emerald-400 font-bold">{selectedEndpoint.method}</span>
              <span className="text-slate-300">{selectedEndpoint.path}</span>
            </div>

            {/* بدنه درخواست در متدهای POST و PATCH */}
            {selectedEndpoint.method !== 'GET' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Request JSON Body:
                </label>
                <textarea
                  rows={4}
                  value={payloadText}
                  onChange={e => setPayloadText(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl outline-none"
                  dir="ltr"
                />
              </div>
            )}

            {/* خروجی پاسخ سرور */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">
                  Response Body (REST Output):
                </span>
                {responseStatus && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${responseStatus < 300 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    HTTP {responseStatus}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-200 max-h-[300px] overflow-auto" dir="ltr">
                {responseBody ? (
                  <pre>{responseBody}</pre>
                ) : (
                  <span className="text-slate-500 italic">برای مشاهده نتیجه زنده، دکمه «ارسال درخواست» را بزنید.</span>
                )}
              </div>
            </div>

            {/* کد cURL آماده برای دولوپر اپلیکیشن موبایل */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-500">
                  دستور cURL جهت تست در Postman یا سورس اپ فلاتر/ری‌اکت نیتن:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getCurlSnippet());
                    setCopiedCurl(true);
                    setTimeout(() => setCopiedCurl(false), 2000);
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurl ? 'کپی شد!' : 'کپی دستور cURL'}</span>
                </button>
              </div>
              <pre className="bg-slate-100 text-slate-800 p-3 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                {getCurlSnippet()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
