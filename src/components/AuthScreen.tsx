import React, { useState, useEffect } from 'react';
import { Lock, Smartphone, KeyRound, UserPlus, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api, tokenStorage, normalizeMobile, ApiError } from '../api';

interface AuthScreenProps {
  onSuccess: (user: any, token: string) => void;
  defaultRole?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'mobile' | 'code'>('mobile');

  // Login inputs
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('دوازدهم');
  const [regField, setRegField] = useState('تجربی');
  const [regCity, setRegCity] = useState('تهران');
  const [regMentorId, setRegMentorId] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 120s timer countdown for OTP
  useEffect(() => {
    let interval: any;
    if (timerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, otpTimer]);

  const handleMobileChange = (val: string, setter: (v: string) => void) => {
    setErrorMessage('');
    setter(val);
  };

  // 1) ورود با رمز عبور
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanMobile = normalizeMobile(mobile);
    if (!cleanMobile.startsWith('09') || cleanMobile.length !== 11) {
      setErrorMessage('لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }
    if (!password) {
      setErrorMessage('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login({ mobile: cleanMobile, password });
      if (res && res.token && res.user) {
        tokenStorage.set(res.token);
        tokenStorage.setUser(res.user);
        onSuccess(res.user, res.token);
      } else {
        throw new Error('پاسخ سرور نامعتبر است.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ورود با رمز عبور.');
    } finally {
      setLoading(false);
    }
  };

  // 2) ارسال درخواست کد یک‌بار مصرف (OTP)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanMobile = normalizeMobile(mobile);
    if (!cleanMobile.startsWith('09') || cleanMobile.length !== 11) {
      setErrorMessage('لطفاً شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.requestOtp(cleanMobile);
      setSuccessMessage(res?.message || 'کد تایید پیامکی ارسال شد.');
      setOtpStep('code');
      setOtpTimer(120);
      setTimerActive(true);
      setOtpCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ارسال کد پیامکی. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  // 3) تایید کد یک‌بار مصرف
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const fullCode = otpCode.join('').trim();
    if (fullCode.length < 4) {
      setErrorMessage('لطفاً کد تایید دریافت شده را به صورت کامل وارد کنید.');
      return;
    }

    const cleanMobile = normalizeMobile(mobile);
    try {
      setLoading(true);
      const res = await api.auth.verifyOtp({ mobile: cleanMobile, code: fullCode });
      if (res && res.token && res.user) {
        tokenStorage.set(res.token);
        tokenStorage.setUser(res.user);
        onSuccess(res.user, res.token);
      } else {
        throw new Error('کد تایید صحیح نیست یا نشست نامعتبر است.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'کد تایید اشتباه یا منقضی شده است.');
    } finally {
      setLoading(false);
    }
  };

  // 4) ثبت‌نام دانش‌آموز جدید
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanMobile = normalizeMobile(regMobile);

    if (!regName.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی را وارد کنید.');
      return;
    }
    if (!cleanMobile.startsWith('09') || cleanMobile.length !== 11) {
      setErrorMessage('شماره موبایل باید ۱۱ رقمی و با ۰۹ شروع شود.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.register({
        name: regName.trim(),
        mobile: cleanMobile,
        password: regPassword,
        grade: regGrade,
        field: regField,
        city: regCity,
        mentor_id: regMentorId ? Number(regMentorId) : undefined,
      });

      if (res && res.token && res.user) {
        tokenStorage.set(res.token);
        tokenStorage.setUser(res.user);
        onSuccess(res.user, res.token);
      } else {
        throw new Error('ثبت‌نام انجام نشد. پاسخ سرور نامعتبر است.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ثبت‌نام دانش‌آموز.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-lg text-center">
        {/* لوگو نارنجی مطابق برند درس‌باما و راه کنکور */}
        <div className="inline-block mb-4">
          <div className="text-3xl font-black text-amber-500 tracking-wider flex items-center justify-center gap-1">
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              درس‌باما
            </span>
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-1">پرتال راه کنکور</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-900 text-right">
          <strong>🔒 پرتال یکپارچه دانش‌آموز و مشاور:</strong> برای مشاهده گزارش‌ها و ثبت ساعات مطالعه، با حساب کاربری خود وارد شوید.
        </div>

        {/* پیام‌های وضعیت */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 text-right flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && !errorMessage && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 text-right">
            {successMessage}
          </div>
        )}

        {/* تب‌های اصلی: ورود / ثبت‌نام */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              authMode === 'login'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ورود به پرتال
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              authMode === 'register'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ثبت‌نام دانش‌آموز جدید
          </button>
        </div>

        {authMode === 'login' ? (
          <div>
            {/* زیرتب‌های روش ورود: ورود با رمز عبور / ورود با کد پیامکی */}
            <div className="flex justify-center gap-6 mb-5 text-xs font-bold border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  setErrorMessage('');
                }}
                className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                  loginMethod === 'password'
                    ? 'border-orange-500 text-orange-600 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>ورود با رمز عبور</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  setErrorMessage('');
                }}
                className={`pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
                  loginMethod === 'otp'
                    ? 'border-orange-500 text-orange-600 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>ورود با کد پیامکی</span>
              </button>
            </div>

            {/* ۱) ورود با رمز عبور */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    شماره موبایل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={mobile}
                    onChange={e => handleMobileChange(e.target.value, setMobile)}
                    placeholder="09123456789"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-mono text-sm"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">شماره موبایل ثبت‌شده در سامانه راه کنکور</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    رمز عبور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-black py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>در حال ورود...</span>
                    </>
                  ) : (
                    <span>ورود با رمز عبور</span>
                  )}
                </button>
              </form>
            )}

            {/* ۲) ورود با کد پیامکی (دو مرحله‌ای) */}
            {loginMethod === 'otp' && (
              <>
                {otpStep === 'mobile' ? (
                  <form onSubmit={handleRequestOtp} className="space-y-5 text-right">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        شماره موبایل <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={mobile}
                        onChange={e => handleMobileChange(e.target.value, setMobile)}
                        placeholder="09123456789"
                        className="w-full text-left px-4 py-3 text-base border-2 border-orange-400 focus:border-orange-500 rounded-xl outline-none font-mono"
                        required
                      />
                      <p className="text-[11px] text-slate-500 mt-2">
                        کد تایید یک‌بار مصرف به این شماره پیامک خواهد شد.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>در حال ارسال پیامک...</span>
                        </>
                      ) : (
                        <span>دریافت کد تایید پیامکی</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        کد تایید پیامک شده به <span className="font-mono text-orange-600 font-bold">{normalizeMobile(mobile)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('mobile');
                          setErrorMessage('');
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        <span>تغییر شماره</span>
                        <ArrowRight className="w-3 h-3 rotate-180" />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2" dir="ltr">
                      {[0, 1, 2, 3, 4, 5].map(idx => (
                        <input
                          key={`otp-digit-${idx}`}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otpCode[idx]}
                          onChange={e => {
                            const val = e.target.value;
                            const newArr = [...otpCode];
                            newArr[idx] = val ? val[val.length - 1] : '';
                            setOtpCode(newArr);
                            if (val && idx < 5) {
                              const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                              nextInput?.focus();
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                              const prevInput = document.getElementById(`otp-input-${idx - 1}`);
                              prevInput?.focus();
                            }
                          }}
                          className="w-10 sm:w-11 h-12 text-center text-lg font-black border-2 border-orange-400 rounded-xl focus:bg-orange-50 outline-none font-mono"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>در حال بررسی کد...</span>
                        </>
                      ) : (
                        <span>تایید و ورود به سامانه</span>
                      )}
                    </button>

                    {/* شمارنده ۱۲۰ ثانیه‌ای برای ارسال دوباره */}
                    <div className="text-xs text-center">
                      {timerActive && otpTimer > 0 ? (
                        <span className="text-amber-700 font-bold">
                          ارسال دوباره کد تا {otpTimer} ثانیه دیگر امکان‌پذیر است
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleRequestOtp()}
                          className="text-orange-600 hover:text-orange-700 font-extrabold flex items-center justify-center gap-1 mx-auto underline"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>ارسال مجدد کد تایید</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        ) : (
          /* تب ثبت‌نام دانش‌آموز جدید */
          <form onSubmit={handleRegister} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نام و نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="مثال: علی محمدی"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                شماره موبایل <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                dir="ltr"
                value={regMobile}
                onChange={e => handleMobileChange(e.target.value, setRegMobile)}
                placeholder="09123456789"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز عبور <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                dir="ltr"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">پایه تحصیلی</label>
                <select
                  value={regGrade}
                  onChange={e => setRegGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:border-orange-500 outline-none"
                >
                  <option value="دهم">دهم</option>
                  <option value="یازدهم">یازدهم</option>
                  <option value="دوازدهم">دوازدهم</option>
                  <option value="فارغ‌التحصیل">فارغ‌التحصیل / کنکوری</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رشته تحصیلی</label>
                <select
                  value={regField}
                  onChange={e => setRegField(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:border-orange-500 outline-none"
                >
                  <option value="تجربی">تجربی</option>
                  <option value="ریاضی">ریاضی و فیزیک</option>
                  <option value="انسانی">علوم انسانی</option>
                  <option value="هنر">هنر / زبان</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر محل سکونت</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={e => setRegCity(e.target.value)}
                  placeholder="تهران"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">کد مشاور (اختیاری)</label>
                <input
                  type="number"
                  dir="ltr"
                  value={regMentorId}
                  onChange={e => setRegMentorId(e.target.value)}
                  placeholder="مثلاً 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:border-orange-500 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال ایجاد حساب...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>تکمیل ثبت‌نام و ورود</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
