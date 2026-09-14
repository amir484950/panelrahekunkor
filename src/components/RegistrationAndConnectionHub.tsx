import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  RefreshCw,
  BookOpen,
  Clock,
  GraduationCap,
  Link as LinkIcon,
  AlertCircle,
  ExternalLink,
  Phone,
  Check
} from 'lucide-react';
import { apiRequest, normalizeMobile } from '../api';
import { UserRole } from '../types';


interface StudentItem {
  id: number;
  name: string;
  mobile: string;
  grade: string;
  city: string;
  mentor_id: number | null;
  mentor_name: string;
  is_assigned: boolean;
  total_hours: number;
  top_subject: string;
  tasks_count: number;
  done_tasks_count: number;
  completion_rate: number;
}

interface MentorItem {
  id: number;
  name: string;
  mobile: string;
  specialty: string;
  experience: string;
  capacity: number;
  active_students_count: number;
  students_list: string[];
}

interface HubProps {
  onNavigateToStudent?: (student?: any) => void;
  onNavigateToMentor?: (mentor?: any) => void;
  onNavigateToAdmin?: () => void;
}

export const RegistrationAndConnectionHub: React.FC<HubProps> = ({
  onNavigateToStudent,
  onNavigateToMentor,
  onNavigateToAdmin,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [newlyRegisteredStudent, setNewlyRegisteredStudent] = useState<any | null>(null);
  const [stats, setStats] = useState({
    total_students: 0,
    assigned_students: 0,
    unassigned_students: 0,
    total_mentors: 0,
    total_tasks: 0,
    completed_tasks: 0,
  });

  // پیام‌ها
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // فرم مرحله ۱: ثبت‌نام دانش‌آموز
  const [studentForm, setStudentForm] = useState({
    name: '',
    mobile: '',
    password: '',
    grade: 'دوازدهم',
    major: 'تجربی',
    city: 'تهران',
    mentor_id: '2',
  });
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // فرم مرحله ۲: ثبت‌نام مشاور
  const [mentorForm, setMentorForm] = useState({
    name: '',
    mobile: '',
    password: '',
    specialty: 'مشاوره تخصصی کنکور تجربی و پزشکی',
    experience: 'رتبه برتر کنکور و فارغ‌التحصیل دانشگاه تهران',
    capacity: 35,
  });
  const [submittingMentor, setSubmittingMentor] = useState(false);

  // فرم مرحله ۳: اتصال سریع
  const [connectStudentId, setConnectStudentId] = useState<number | ''>('');
  const [connectMentorId, setConnectMentorId] = useState<number | ''>('');
  const [submittingConnect, setSubmittingConnect] = useState(false);

  // بارگذاری داده‌های ۳ مرحله‌ای
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<any>('/rksp/v1/admin/three-steps-data');
      if (data) {
        setStudents(data.students || []);
        setMentors(data.mentors || []);
        setStats(data.stats || {});
        if (data.students && data.students.length > 0 && !connectStudentId) {
          const unassigned = data.students.find((s: StudentItem) => !s.is_assigned);
          setConnectStudentId(unassigned ? unassigned.id : data.students[0].id);
        }
        if (data.mentors && data.mentors.length > 0 && !connectMentorId) {
          setConnectMentorId(data.mentors[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // ارسال فرم ثبت‌نام دانش‌آموز (مرحله ۱)
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStudent(true);
    try {
      const data = await apiRequest<any>('/rksp/v1/auth/register-student-step', {
        method: 'POST',
        body: {
          ...studentForm,
          mobile: normalizeMobile(studentForm.mobile),
        },
      });
      if (data.success) {
        if (data.student) {
          setNewlyRegisteredStudent(data.student);
          try {
            localStorage.setItem('rksp_active_student', JSON.stringify(data.student));
          } catch (e) {}
        }
        showFeedback(`دانش‌آموز «${studentForm.name}» با موفقیت ثبت‌نام شد و در دیتابیس قرار گرفت.`);
        setStudentForm({
          name: '',
          mobile: '',
          password: '',
          grade: 'دوازدهم',
          major: 'تجربی',
          city: 'تهران',
          mentor_id: '2',
        });
        await loadData();
      } else {
        showFeedback(data.message || 'خطا در ثبت‌نام دانش‌آموز', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'خطای ارتباط با سرور', 'error');
    } finally {
      setSubmittingStudent(false);
    }
  };

  // ارسال فرم ثبت‌نام مشاور (مرحله ۲)
  const handleRegisterMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingMentor(true);
    try {
      const data = await apiRequest<any>('/rksp/v1/auth/register-mentor-step', {
        method: 'POST',
        body: {
          ...mentorForm,
          mobile: normalizeMobile(mentorForm.mobile),
        },
      });
      if (data.success) {
        showFeedback(`مشاور «${mentorForm.name}» با موفقیت ثبت‌نام شد و به لیست مشاوران اضافه گردید.`);
        setMentorForm({
          name: '',
          mobile: '',
          password: '',
          specialty: 'مشاوره تخصصی کنکور تجربی و پزشکی',
          experience: 'رتبه برتر کنکور و فارغ‌التحصیل دانشگاه تهران',
          capacity: 35,
        });
        await loadData();
      } else {
        showFeedback(data.message || 'خطا در ثبت‌نام مشاور', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'خطای ارتباط با سرور', 'error');
    } finally {
      setSubmittingMentor(false);
    }
  };

  // اتصال دانش‌آموز به مشاور (مرحله ۳)
  const handleConnect = async (studentId: number, mentorId: number) => {
    setSubmittingConnect(true);
    try {
      const data = await apiRequest<any>('/rksp/v1/admin/connect-student-mentor', {
        method: 'POST',
        body: { student_id: studentId, mentor_id: mentorId },
      });
      if (data.success) {
        showFeedback(data.message);
        await loadData();
      } else {
        showFeedback(data.message || 'خطا در برقراری اتصال', 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'خطای ارتباط با سرور', 'error');
    } finally {
      setSubmittingConnect(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      {/* سربرگ اختصاصی راهنمای فرآیند */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-amber-100 mb-3 border border-white/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>گردش‌کار اختصاصی راه کنکور</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            چرخه ۳ مرحله‌ای: ثبت‌نام دانش‌آموز، ثبت‌نام مشاور و اتصال هوشمند
          </h1>
          <p className="text-amber-100 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
            مدیر سایت بر تمام این مراحل نظارت کامل دارد: از ثبت‌نام اولیه، اتصال دانش‌آموز به مشاور تحصیلی، تا پایش دقیق اینکه دانش‌آموز چقدر درس خوانده، کدام درس‌ها را مطالعه کرده و تکالیفش در چه وضعیتی است.
          </p>

          {/* استپ‌بار بصری تعاملی */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-right ${
                activeStep === 1
                  ? 'bg-white text-orange-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                activeStep === 1 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white'
              }`}>
                ۱
              </div>
              <div>
                <div className="text-[11px] opacity-80">مرحله اول</div>
                <div className="text-sm font-black">ثبت‌نام دانش‌آموز</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-right ${
                activeStep === 2
                  ? 'bg-white text-orange-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                activeStep === 2 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white'
              }`}>
                ۲
              </div>
              <div>
                <div className="text-[11px] opacity-80">مرحله دوم</div>
                <div className="text-sm font-black">ثبت‌نام مشاور تحصیلی</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-right ${
                activeStep === 3
                  ? 'bg-white text-orange-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                activeStep === 3 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white'
              }`}>
                ۳
              </div>
              <div>
                <div className="text-[11px] opacity-80">مرحله سوم</div>
                <div className="text-sm font-black">اتصال دانش‌آموز به مشاور</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all text-right ${
                activeStep === 4
                  ? 'bg-white text-orange-900 shadow-md ring-2 ring-white/50'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                activeStep === 4 ? 'bg-orange-600 text-white' : 'bg-white/20 text-white'
              }`}>
                ۴
              </div>
              <div>
                <div className="text-[11px] opacity-80">مدیریت مدیر سایت</div>
                <div className="text-sm font-black">پایش ساعت و تکالیف</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* پیام بازخورد عملیات */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xs ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* ========================================================
          مرحله ۱: ثبت‌نام دانش‌آموز
      ======================================================== */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">فرم ثبت‌نام دانش‌آموز جدید</h2>
                <p className="text-xs text-slate-500">مرحله اول: ورود مشخصات تحصیلی و هویتی دانش‌آموز</p>
              </div>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  نام و نام خانوادگی دانش‌آموز <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: آرمین رضایی"
                  value={studentForm.name}
                  onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    شماره موبایل (نام کاربری) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="0912xxxxxxx"
                    value={studentForm.mobile}
                    onChange={e => setStudentForm({ ...studentForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    رمز عبور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    placeholder="حداقل ۶ کاراکتر"
                    value={studentForm.password}
                    onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">پایه</label>
                  <select
                    value={studentForm.grade}
                    onChange={e => setStudentForm({ ...studentForm, grade: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="دهم">دهم</option>
                    <option value="یازدهم">یازدهم</option>
                    <option value="دوازدهم">دوازدهم</option>
                    <option value="فارغ‌التحصیل">پشت کنکور</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">رشته</label>
                  <select
                    value={studentForm.major}
                    onChange={e => setStudentForm({ ...studentForm, major: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="تجربی">تجربی</option>
                    <option value="ریاضی">ریاضی</option>
                    <option value="انسانی">انسانی</option>
                    <option value="هنر">هنر / زبان</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">شهر</label>
                  <input
                    type="text"
                    placeholder="تهران"
                    value={studentForm.city}
                    onChange={e => setStudentForm({ ...studentForm, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  اتصال اولیه به مشاور (اختیاری - در مرحله ۳ نیز قابل تغییر است)
                </label>
                <select
                  value={studentForm.mentor_id}
                  onChange={e => setStudentForm({ ...studentForm, mentor_id: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">بدون مشاور فعلاً (اتصال در مرحله ۳)</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.specialty} - ظرفیت {m.active_students_count}/{m.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submittingStudent}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submittingStudent ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>ثبت‌نام دانش‌آموز و ایجاد پرونده تحصیلی</span>
              </button>
            </form>

            {/* کارت ورود مستقیم به پنل اختصاصی دانش‌آموز پس از ثبت‌نام */}
            {newlyRegisteredStudent && (
              <div className="mt-5 p-4 bg-emerald-50 border-2 border-emerald-400/80 rounded-2xl shadow-sm animate-fade-in">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                      ثبت‌نام «{newlyRegisteredStudent.name}» با موفقیت انجام شد!
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      کد کاربری #{newlyRegisteredStudent.id} • شماره موبایل: {newlyRegisteredStudent.mobile}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('rksp_active_student', JSON.stringify(newlyRegisteredStudent));
                    } catch (e) {}
                    if (onNavigateToStudent) {
                      onNavigateToStudent(newlyRegisteredStudent);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98"
                >
                  <span>ورود به پنل اختصاصی این دانش‌آموز</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}
          </div>

          {/* لیست دانش‌آموزان ثبت‌شده */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-slate-900 text-base">دانش‌آموزان ثبت‌نام‌شده در سامانه</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                {students.length} دانش‌آموز
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {students.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-sm">{s.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                        {s.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                      <span>موبایل: <span dir="ltr">{s.mobile}</span></span>
                      <span>شهر: {s.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                      s.is_assigned
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {s.is_assigned ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>متصل به {s.mentor_name}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>بدون مشاور (نیازمند اتصال)</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setConnectStudentId(s.id);
                        setActiveStep(3);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200"
                    >
                      تغییر مشاور
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem('rksp_active_student', JSON.stringify({
                            id: s.id,
                            name: s.name,
                            mobile: s.mobile,
                            grade: s.grade,
                            city: s.city,
                          }));
                        } catch (e) {}
                        if (onNavigateToStudent) {
                          onNavigateToStudent({
                            id: s.id,
                            name: s.name,
                            mobile: s.mobile,
                            grade: s.grade,
                            city: s.city,
                          });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1 shadow-xs"
                      title="ورود به پرتال اختصاصی این دانش‌آموز"
                    >
                      <span>ورود به پنل</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          مرحله ۲: ثبت‌نام مشاور تحصیلی
      ======================================================== */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">فرم ثبت‌نام مشاور جدید</h2>
                <p className="text-xs text-slate-500">مرحله دوم: تعیین مشخصات حرفه‌ای، تخصص و ظرفیت شاگردان</p>
              </div>
            </div>

            <form onSubmit={handleRegisterMentor} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  نام و نام خانوادگی مشاور <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: دکتر سارا احمدی"
                  value={mentorForm.name}
                  onChange={e => setMentorForm({ ...mentorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    شماره همراه (نام کاربری) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="0912xxxxxxx"
                    value={mentorForm.mobile}
                    onChange={e => setMentorForm({ ...mentorForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    رمز عبور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    dir="ltr"
                    placeholder="حداقل ۶ کاراکتر"
                    value={mentorForm.password}
                    onChange={e => setMentorForm({ ...mentorForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  تخصص و رشته هدف
                </label>
                <input
                  type="text"
                  placeholder="مثال: رتبه‌های برتر تجربی و قبولی پزشکی دانشگاه تهران"
                  value={mentorForm.specialty}
                  onChange={e => setMentorForm({ ...mentorForm, specialty: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    سوابق تحصیلی و دانشگاه
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: رتبه ۱۲ کنکور سراسری، دانشگاه تهران"
                    value={mentorForm.experience}
                    onChange={e => setMentorForm({ ...mentorForm, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    ظرفیت پذیرش
                  </label>
                  <input
                    type="number"
                    value={mentorForm.capacity}
                    onChange={e => setMentorForm({ ...mentorForm, capacity: parseInt(e.target.value, 10) || 30 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingMentor}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submittingMentor ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>ثبت مشاور جدید در کادر مشاوره راه کنکور</span>
              </button>
            </form>
          </div>

          {/* لیست مشاوران و ظرفیت‌های فعال */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">کادر مشاوران تحصیلی ثبت‌شده</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                {mentors.length} مشاور فعال
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {mentors.map(m => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-slate-900 text-sm">{m.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                        {m.specialty}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      سوابق: {m.experience} · تماس: <span dir="ltr">{m.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-xs font-extrabold text-slate-800">
                        {m.active_students_count} از {m.capacity} شاگرد
                      </div>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, (m.active_students_count / m.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setConnectMentorId(m.id);
                        setActiveStep(3);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200"
                    >
                      تخصیص شاگرد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          مرحله ۳: اتصال دانش‌آموز به مشاور تحصیلی
      ======================================================== */}
      {activeStep === 3 && (
        <div className="space-y-6">
          {/* کادر اتصال سریع انتخابی */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <LinkIcon className="w-5 h-5 text-orange-600" />
              <div>
                <h2 className="text-base font-black text-slate-900">اتصال مستقیم دانش‌آموز به مشاور تحصیلی</h2>
                <p className="text-xs text-slate-500">انتخاب هر دانش‌آموز و اتصال آنی به مشاور مورد نظر توسط مدیر سایت</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  انتخاب دانش‌آموز
                </label>
                <select
                  value={connectStudentId}
                  onChange={e => setConnectStudentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} - {s.is_assigned ? `مشاور فعلی: ${s.mentor_name}` : 'بدون مشاور'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  انتخاب مشاور تحصیلی جهت اتصال
                </label>
                <select
                  value={connectMentorId}
                  onChange={e => setConnectMentorId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-500"
                >
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.specialty} - ظرفیت: {m.active_students_count}/{m.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  disabled={submittingConnect || !connectStudentId || !connectMentorId}
                  onClick={() => connectStudentId && connectMentorId && handleConnect(Number(connectStudentId), Number(connectMentorId))}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {submittingConnect ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  <span>ثبت اتصال فوری</span>
                </button>
              </div>
            </div>
          </div>

          {/* ماتریس جدول کامل اتصال دانش‌آموزان و مشاوران */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                <span>ماتریس اتصال تمام دانش‌آموزان به مشاوران تحصیلی</span>
              </h3>
              <div className="text-xs font-bold text-slate-500">
                {stats.assigned_students} متصل · {stats.unassigned_students} نیازمند اتصال
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">دانش‌آموز</th>
                    <th className="p-3.5">پایه و رشته</th>
                    <th className="p-3.5">وضعیت اتصال</th>
                    <th className="p-3.5">مشاور متصل</th>
                    <th className="p-3.5">تغییر / اتصال سریع مشاور</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{student.mobile}</div>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {student.grade} · {student.city}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                          student.is_assigned
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {student.is_assigned ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>دارای مشاور</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>بدون مشاور</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-800">
                        {student.mentor_name}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue={student.mentor_id || ''}
                            onChange={e => e.target.value && handleConnect(student.id, Number(e.target.value))}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium focus:outline-none focus:border-orange-500"
                          >
                            <option value="" disabled>انتخاب مشاور جدید...</option>
                            {mentors.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.active_students_count}/{m.capacity})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          مرحله ۴: نظارت جامع مدیر سایت (چقدر درس خونده، کدوم درس، تکالیف)
      ======================================================== */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                  <span>داشبورد نظارت مدیر بر مطالعه، تفکیک دروس و وضعیت تکالیف دانش‌آموزان</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  پایش زنده اینکه هر دانش‌آموز چقدر درس خوانده، کدام درس‌ها را مطالعه کرده و تکالیف محول‌شده توسط مشاور را چقدر انجام داده است.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تازه‌سازی</span>
                </button>
              </div>
            </div>

            {/* جدول کامل نظارتی */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">نام دانش‌آموز</th>
                    <th className="p-3.5">مشاور متصل</th>
                    <th className="p-3.5">چقدر درس خونده؟ (ساعت کل)</th>
                    <th className="p-3.5">کدوم درس رو خونده؟ (درس غالب)</th>
                    <th className="p-3.5">تکالیف چی بوده و عملکرد چطوره؟</th>
                    <th className="p-3.5 text-center">اقدام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono" dir="ltr">{student.mobile}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          student.is_assigned
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {student.mentor_name}
                        </span>
                      </td>

                      {/* چقدر درس خونده */}
                      <td className="p-3.5">
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-600" />
                          <span>{student.total_hours} ساعت</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">ثبت در باشگاه مطالعه</div>
                      </td>

                      {/* کدوم درس رو خونده */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{student.top_subject}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">همراه با تست‌های زماندار</div>
                      </td>

                      {/* تکالیف و عملکرد */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold text-slate-800">
                            {student.done_tasks_count} از {student.tasks_count || 2} تکلیف انجام شد
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {student.completion_rate}%
                          </span>
                        </div>
                        <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${student.completion_rate}%` }}
                          />
                        </div>
                      </td>

                      {/* دکمه انتقال */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.setItem('rksp_active_student', JSON.stringify({
                                id: student.id,
                                name: student.name,
                                mobile: student.mobile,
                                grade: student.grade,
                                city: student.city,
                              }));
                            } catch (e) {}
                            if (onNavigateToStudent) {
                              onNavigateToStudent({
                                id: student.id,
                                name: student.name,
                                mobile: student.mobile,
                                grade: student.grade,
                                city: student.city,
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-xs inline-flex items-center gap-1 transition-colors shadow-2xs"
                          title="ورود و مشاهده در پرتال اختصاصی دانش‌آموز"
                        >
                          <span>ورود به پرتال</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
