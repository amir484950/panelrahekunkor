import React, { useState, useEffect } from 'react';
import { User, Shield, GraduationCap, MapPin, Phone, Calendar, Clock, Award, BookOpen, Save, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Sparkles, Building, Users } from 'lucide-react';
import { UserRole } from '../types';
import { apiRequest, normalizeMobile } from '../api';

interface ProfileData {

  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'rksp_student' | 'rksp_mentor' | 'administrator';
  role_label: string;
  created_at: string;
  // فیلدهای دانش‌آموز
  grade?: string;
  major?: string;
  city?: string;
  school?: string;
  target_year?: string;
  total_hours?: number;
  total_logs?: number;
  active_plan?: string;
  plan_expiry?: string;
  mentor?: {
    id: number;
    name: string;
    phone: string;
    specialty: string;
  } | null;
  // فیلدهای مشاور
  specialty?: string;
  experience?: string;
  bio?: string;
  capacity?: number;
  active_students_count?: number;
}

interface UserProfileProps {
  currentRole: UserRole;
  onRoleSwitch?: (role: UserRole) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentRole, onRoleSwitch }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // فرم قابل ویرایش
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    grade: 'دوازدهم',
    major: 'تجربی',
    city: '',
    school: '',
    target_year: '۱۴۰۶',
    specialty: '',
    experience: '',
    bio: '',
    capacity: 30,
    newPassword: '',
  });

  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  const fetchProfile = async () => {
    setLoading(true);
    setSaveError(null);
    try {
      // شناسه متناسب با نقش جهت شبیه‌سازی
      const userId = currentRole === 'rksp_student' ? 101 : (currentRole === 'rksp_mentor' ? 2 : 1);
      const data = await apiRequest<any>(`/rksp/v1/profile/me?user_id=${userId}`);
      if (data && (data.success || data.profile)) {
        const prof = data.profile || data;
        setProfile(prof);
        setFormData({
          name: prof.name || '',
          phone: prof.phone || '',
          grade: prof.grade || 'دوازدهم',
          major: prof.major || 'تجربی',
          city: prof.city || '',
          school: prof.school || '',
          target_year: prof.target_year || '۱۴۰۶',
          specialty: prof.specialty || '',
          experience: prof.experience || '',
          bio: prof.bio || '',
          capacity: prof.capacity || 30,
          newPassword: '',
        });
      }
    } catch (err: any) {
      setSaveError(err?.message || 'خطا در دریافت اطلاعات پروفایل از REST API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentRole]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const userId = profile?.id || (currentRole === 'rksp_student' ? 101 : 2);
      const data = await apiRequest<any>(`/rksp/v1/profile/me?user_id=${userId}`, {
        method: 'POST',
        body: {
          user_id: userId,
          name: formData.name,
          phone: normalizeMobile(formData.phone),
          grade: formData.grade,
          major: formData.major,
          city: formData.city,
          school: formData.school,
          target_year: formData.target_year,
          specialty: formData.specialty,
          experience: formData.experience,
          bio: formData.bio,
          capacity: formData.capacity,
          password: formData.newPassword || undefined,
        },
      });

      if (data && (data.success || data.profile)) {
        setSaveSuccess('اطلاعات پروفایل اختصاصی با موفقیت در دیتابیس وردپرس ذخیره شد.');
        await fetchProfile();
        setActiveTab('view');
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        setSaveError(data?.message || 'خطا در ثبت اطلاعات.');
      }
    } catch (err: any) {
      setSaveError(err?.message || 'خطای ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-bold">در حال فراخوانی اطلاعات پروفایل اختصاصی از REST API وردپرس...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* پیام راهنمای معماری */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-900">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">پرتال مدیریت پروفایل اختصاصی (بدون داشبورد پیش‌فرض وردپرس):</span>
            <span className="mr-1 text-amber-800">
              این صفحه با شورت‌کد <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-300 font-mono text-amber-900">[rksp_profile]</code> در برگه <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-300 font-mono">/user-profile/</code> قرار گرفته و از اندپوینت رسمی <code className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-300 font-mono">GET /wp-json/rksp/v1/profile/me</code> اطلاعات را می‌خواند.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchProfile}
          className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center gap-1.5 transition-colors self-end md:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تازه‌سازی داده‌ها
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* کارت سربرگ کاربر */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-md">
              {profile?.name ? profile.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{profile?.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  profile?.role === 'rksp_mentor'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  {profile?.role_label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span dir="ltr">{profile?.phone}</span>
                <span className="text-slate-300">|</span>
                <span>شناسه در جدول کاربران: #{profile?.id}</span>
              </p>
            </div>
          </div>

          {/* تب‌های مشاهده یا ویرایش */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'view'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مشاهده اطلاعات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'edit'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ویرایش پروفایل
            </button>
          </div>
        </div>

        {/* محتوای حالت مشاهده */}
        {activeTab === 'view' && (
          <div className="mt-6 space-y-8">
            {profile?.role === 'rksp_student' ? (
              // اطلاعات اختصاصی دانش‌آموز
              <>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-orange-600" />
                    اطلاعات تحصیلی و کنکوری
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">پایه تحصیلی</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.grade || 'نامشخص'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">رشته تحصیلی</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.major || 'تجربی'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">شهر سکونت</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.city || 'تهران'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">کنکور هدف</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.target_year || '۱۴۰۶'}</div>
                    </div>
                  </div>
                </div>

                {/* وضعیت اشتراک و آمار پایش */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    طرح فعال و وضعیت پایش مطالعه
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80">
                      <div className="text-xs text-orange-700 font-bold mb-1">مجموع ساعت مطالعه ثبت‌شده</div>
                      <div className="text-2xl font-black text-orange-950 flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-orange-600" />
                        {profile.total_hours || 0} ساعت
                      </div>
                      <div className="text-[11px] text-orange-600/80 mt-1">در قالب {profile.total_logs || 0} گزارش روزانه</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">بسته اشتراک پرتال</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.active_plan}</div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">معتبر تا {profile.plan_expiry}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">مدرسه / مرکز آموزشی</div>
                      <div className="text-base font-extrabold text-slate-800">{profile.school || 'ثبت نشده'}</div>
                    </div>
                  </div>
                </div>

                {/* مشاور اختصاصی متصل */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    مشاور تخصصی اختصاص‌یافته
                  </h3>
                  {profile.mentor ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                          {profile.mentor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-base">{profile.mentor.name}</div>
                          <div className="text-xs text-blue-800 font-semibold">{profile.mentor.specialty}</div>
                          <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{profile.mentor.phone}</div>
                        </div>
                      </div>
                      <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-900 font-bold text-center">
                        پایش گزارش‌های روزانه فعال
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                      هنوز مشاوری برای حساب شما اختصاص نیافته است. مدیر سامانه به زودی مشاور شما را تعیین خواهد کرد.
                    </div>
                  )}
                </div>
              </>
            ) : (
              // اطلاعات اختصاصی مشاور
              <>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    مشخصات حرفه‌ای و ظرفیت مشاوره
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                      <div className="text-xs text-blue-700 font-bold mb-1">دانش‌آموزان تحت پوشش</div>
                      <div className="text-2xl font-black text-blue-950 flex items-center gap-1.5">
                        <Users className="w-5 h-5 text-blue-600" />
                        {profile?.active_students_count || 0} نفر
                      </div>
                      <div className="text-[11px] text-blue-600 mt-1">حداکثر ظرفیت: {profile?.capacity || 30} نفر</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                      <div className="text-xs text-slate-500 mb-1">حوزه تخصصی مشاوره</div>
                      <div className="text-base font-extrabold text-slate-800">{profile?.specialty}</div>
                      <div className="text-xs text-slate-500 mt-2">سوابق تحصیلی: {profile?.experience}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    معرفی و متدولوژی برنامه‌ریزی
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
                    {profile?.bio || 'متن معرفی کوتاه توسط مشاور تکمیل نشده است.'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* محتوای حالت ویرایش */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">شماره همراه</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {profile?.role === 'rksp_student' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">پایه تحصیلی</label>
                    <select
                      value={formData.grade}
                      onChange={e => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="دهم">دهم</option>
                      <option value="یازدهم">یازدهم</option>
                      <option value="دوازدهم">دوازدهم</option>
                      <option value="فارغ‌التحصیل">فارغ‌التحصیل / پشت کنکور</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">رشته تحصیلی</label>
                    <select
                      value={formData.major}
                      onChange={e => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
                    >
                      <option value="تجربی">تجربی</option>
                      <option value="ریاضی">ریاضی</option>
                      <option value="انسانی">انسانی</option>
                      <option value="هنر">هنر / زبان</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">شهر سکونت</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">مدرسه / مرکز آموزشی</label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={e => setFormData({ ...formData, school: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">سال کنکور هدف</label>
                    <input
                      type="text"
                      value={formData.target_year}
                      onChange={e => setFormData({ ...formData, target_year: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">حوزه تخصصی مشاوره</label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">حداکثر ظرفیت پذیرش شاگرد</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 30 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">سوابق تحصیلی و دانشگاه</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">معرفی و متد برنامه‌ریزی</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                تغییر رمز عبور (اختیاری - در صورت خالی ماندن رمز تغییر نمی‌کند)
              </label>
              <input
                type="password"
                dir="ltr"
                placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>ذخیره تغییرات در دیتابیس</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
