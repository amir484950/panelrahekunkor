import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  MessageSquare,
  Clock,
  Search,
  Send,
  User,
  Shield,
  Briefcase,
  GraduationCap,
  LogOut,
  Sparkles,
  Lock,
  Phone,
  BookOpen
} from 'lucide-react';
import { api, apiRequest, tokenStorage, normalizeMobile } from '../api';

interface AssignedStudent {

  student_id: number;
  name: string;
  phone: string;
  grade: string;
  city: string;
  total_hours: number;
  last_log_date: string;
  pending_tasks: number;
  plan_name: string;
  plan_end: string;
}

export const MentorPortal: React.FC = () => {
  // وضعیت احراز هویت مشاور
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [mentorUser, setMentorUser] = useState({
    id: 2,
    name: 'مشاور تحصیلی ۱',
    mobile: '09121111111',
    specialty: 'مشاور تخصصی کنکور سراسری (تجربی و ریاضی)',
    experience: 'رتبه برتر کنکور و عضو سابق بنیاد ملی نخبگان',
  });

  // فرم ورود
  const [loginMobile, setLoginMobile] = useState('09121111111');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  // فرم ثبت‌نام مشاور جدید
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('مشاوره تخصصی کنکور تجربی و پزشکی');
  const [regExperience, setRegExperience] = useState('فارغ‌التحصیل دانشگاه تهران');
  const [regBio, setRegBio] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // داده‌های پنل
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // جزئیات تکمیلی عملکرد دانش‌آموز انتخابی
  const [studentDetail, setStudentDetail] = useState<{
    tasks: any[];
    task_stats: { total: number; completed: number; pending: number; rate: number };
    total_hours: number;
    study_summary: {
      today_hours: number;
      streak_days: number;
      total_tests: number;
      subjects: Array<{ id: string; name: string; hours: number; tests: number; percent: number; topic: string }>;
    };
  } | null>(null);

  const loadStudentDetail = async (studentId: number) => {
    try {
      const data = await apiRequest<any>(`/rksp/v1/mentor/student-full-detail?student_id=${studentId}&mentor_id=${mentorUser.id}`);
      if (data && data.success) {
        setStudentDetail({
          tasks: data.tasks || [],
          task_stats: data.task_stats || { total: 0, completed: 0, pending: 0, rate: 0 },
          total_hours: data.total_hours || 0,
          study_summary: data.study_summary || {
            today_hours: 0,
            streak_days: 0,
            total_tests: 0,
            subjects: [],
          },
        });
      }
    } catch (e) {
      console.error('Error loading student detail:', e);
    }
  };

  // فرم ثبت تسک جدید
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-18');
  const [taskMsg, setTaskMsg] = useState('');

  // فرم ثبت نظر عملکرد
  const [noteContent, setNoteContent] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'public' | 'private'>('public');
  const [noteMsg, setNoteMsg] = useState('');

  const loadStudents = async (mentorId: number = mentorUser.id) => {
    try {
      setLoading(true);
      const data = await apiRequest<any[]>(`/rksp/v1/students?mentor_id=${mentorId}`);
      setStudents(data || []);
      if (data && data.length > 0) {
        setSelectedStudent(data[0]);
        loadStudentDetail(data[0].student_id);
      } else {
        setSelectedStudent(null);
        setStudentDetail(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadStudents(mentorUser.id);
    }
  }, [isLoggedIn, mentorUser.id]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentDetail(selectedStudent.student_id);
    }
  }, [selectedStudent?.student_id]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const data = await apiRequest<any>('/rksp/v1/auth/login', {
        method: 'POST',
        body: {
          username: normalizeMobile(loginMobile),
          password: loginPassword,
          expected_role: 'rksp_mentor',
        },
      });
      if (data.token) {
        tokenStorage.set(data.token);
      }
      if (data.success && data.user) {
        setMentorUser({
          id: data.user.id,
          name: data.user.name,
          mobile: data.user.mobile,
          specialty: data.user.specialty || 'مشاور تحصیلی کنکور سراسری',
          experience: data.user.experience || 'سوابق ثبت‌شده در سیستم',
        });
        setIsLoggedIn(true);
        loadStudents(data.user.id);
      } else {
        setLoginError(data.message || 'اطلاعات ورود اشتباه است.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'خطا در برقراری ارتباط با سامانه.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regMobile || !regPassword) {
      setRegError('لطفاً نام، شماره موبایل و رمز عبور را تکمیل فرمایید.');
      return;
    }
    try {
      setRegLoading(true);
      const data = await apiRequest<any>('/rksp/v1/auth/register-mentor', {
        method: 'POST',
        body: {
          name: regName,
          mobile: normalizeMobile(regMobile),
          password: regPassword,
          specialty: regSpecialty,
          experience: regExperience,
          bio: regBio,
        },
      });
      if (data.token) {
        tokenStorage.set(data.token);
      }
      if (data.success && data.user) {
        setMentorUser({
          id: data.user.id,
          name: data.user.name,
          mobile: data.user.mobile,
          specialty: regSpecialty,
          experience: regExperience,
        });
        setIsLoggedIn(true);
        loadStudents(data.user.id);
      } else {
        setRegError(data.message || 'خطا در ثبت‌نام مشاور.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'خطا در ارسال درخواست.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickSwitchMentor = (id: number, name: string, phone: string) => {
    setMentorUser(prev => ({
      ...prev,
      id,
      name,
      mobile: phone,
    }));
    loadStudents(id);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !taskTitle) return;
    try {
      const data = await apiRequest<any>('/rksp/v1/tasks', {
        method: 'POST',
        body: {
          student_id: selectedStudent.student_id,
          mentor_id: mentorUser.id,
          title: taskTitle,
          description: taskDesc,
          due_date: taskDueDate,
        },
      });
      if (data.success) {
        setTaskMsg('تکلیف جدید با موفقیت برای دانش‌آموز ثبت و ارسال شد.');
        setTaskTitle('');
        setTaskDesc('');
        loadStudents(mentorUser.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !noteContent) return;
    try {
      const data = await apiRequest<any>('/rksp/v1/notes', {
        method: 'POST',
        body: {
          student_id: selectedStudent.student_id,
          mentor_id: mentorUser.id,
          content: noteContent,
          visibility: noteVisibility,
        },
      });
      if (data.success) {
        setNoteMsg('نظر عملکرد درسی در پرونده دانش‌آموز ثبت گردید.');
        setNoteContent('');
      }
    } catch (e) {
      console.error(e);
    }
  };


  // اگر مشاور لاگین نکرده است، گیت احراز هویت و ثبت‌نام نمایش داده می‌شود
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        {/* هشدار محافظت از پرتال */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center text-amber-900 text-xs sm:text-sm">
          <Shield className="w-5 h-5 mx-auto mb-1 text-amber-600" />
          <p className="font-bold">پرتال اختصاصی مشاوران تحصیلی راه کنکور</p>
          <p className="text-slate-600 mt-1">
            این پرتال عمومی نیست و تنها مشاوران تحصیلی ثبت‌نام‌شده با نقش <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">rksp_mentor</code> امکان ورود و مشاهده اطلاعات شاگردان خود را دارند.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
          {/* تب‌های ورود یا ثبت‌نام */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAuthTab('login')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                authTab === 'login'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>ورود مشاور تحصیلی</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthTab('register')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                authTab === 'register'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>ثبت‌نام و مشخصات مشاور جدید</span>
            </button>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شماره موبایل یا نام کاربری مشاور
                </label>
                <div className="relative">
                  <input
                    type="text"
                    dir="ltr"
                    value={loginMobile}
                    onChange={e => setLoginMobile(e.target.value)}
                    placeholder="09121111111"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-mono text-sm"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="******"
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-mono text-sm"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                ورود به پنل مشاوره
              </button>

              {/* مشاوران نمونه جهت تست سریع */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-semibold block mb-2">
                  ورود سریع با مشاوران آزمایشی سیستم:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMobile('09121111111');
                      setLoginPassword('123456');
                    }}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    مشاور ۱ (۰۹۱۲۱۱۱۱۱۱۱)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMobile('09122222222');
                      setLoginPassword('123456');
                    }}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    مشاور ۲ (۰۹۱۲۲۲۲۲۲۲۲)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMobile('09123333333');
                      setLoginPassword('123456');
                    }}
                    className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    مشاور ۳ (۰۹۱۲۳۳۳۳۳۳۳)
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام و نام خانوادگی مشاور <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="مثال: دکتر مهدی حسینی"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    شماره همراه (نام کاربری) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={regMobile}
                    onChange={e => setRegMobile(e.target.value)}
                    placeholder="0912xxxxxxx"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  رمز عبور ورود <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  تخصص و حوزه مشاوره
                </label>
                <input
                  type="text"
                  value={regSpecialty}
                  onChange={e => setRegSpecialty(e.target.value)}
                  placeholder="مثال: مشاوره تخصصی کنکور سراسری، رتبه‌های برتر تجربی و ریاضی"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  سوابق و دانشگاه
                </label>
                <input
                  type="text"
                  value={regExperience}
                  onChange={e => setRegExperience(e.target.value)}
                  placeholder="مثال: رتبه برتر کنکور سراسری، فارغ‌التحصیل دانشگاه علوم پزشکی تهران"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  معرفی کوتاه و سبک برنامه‌ریزی (بیوگرافی)
                </label>
                <textarea
                  value={regBio}
                  onChange={e => setRegBio(e.target.value)}
                  rows={2}
                  placeholder="توضیح مختصر درباره روش پایش گزارش کار و برنامه‌ریزی هفتگی..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:border-orange-500 outline-none text-sm"
                />
              </div>

              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                {regLoading ? 'در حال ثبت در پایگاه داده...' : 'ثبت مشخصات و ورود به پنل مشاور'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* نوار بالایی مشخصات مشاور لاگین‌شده */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">{mentorUser.name}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                مشاور تحصیلی
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mentorUser.specialty} · همراه: <span className="font-mono">{mentorUser.mobile}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* سوئیچ سریع مشاور برای تست */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 ml-2">
            <span>مشاور فعال:</span>
            {[2, 3, 4].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => handleQuickSwitchMentor(id, `مشاور تحصیلی ${id - 1}`, `0912${id}${id}${id}${id}${id}${id}`)}
                className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  mentorUser.id === id
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                مشاور {id - 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج از پنل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ستون راست: لیست دانش‌آموزان تحت پوشش مشاور */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-orange-600" />
              <span>دانش‌آموزان شما</span>
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
              {students.length} دانش‌آموز
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">در حال بارگذاری دانش‌آموزان...</div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                هنوز دانش‌آموزی به این مشاور اختصاص نیافته است. مدیر می‌تواند از پیشخوان دانش‌آموزان را به شما متصل کند.
              </div>
            ) : (
              students.map(s => {
                const isSelected = selectedStudent?.student_id === s.student_id;
                return (
                  <button
                    key={s.student_id}
                    type="button"
                    onClick={() => setSelectedStudent(s)}
                    className={`w-full text-right p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {s.grade} {s.city && `· ${s.city}`}
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {s.total_hours} ساعت
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span>طرح: {s.plan_name}</span>
                      {s.pending_tasks > 0 && (
                        <span className="text-amber-600 font-bold">
                          {s.pending_tasks} تکلیف در انتظار
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ستون چپ: جزئیات دانش‌آموز انتخابی و فرم‌های تسک و نظر */}
        <div className="lg:col-span-7 space-y-6">
          {selectedStudent ? (
            <>
              {/* کارت پروفایل و وضعیت شاگرد */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      شماره تماس: <span className="font-mono">{selectedStudent.phone}</span> · پایه: {selectedStudent.grade}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      اشتراک فعال
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">تا {selectedStudent.plan_end}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500">مجموع مطالعه</span>
                    <div className="text-lg font-black text-slate-900 mt-1">
                      {studentDetail?.total_hours || selectedStudent.total_hours} ساعت
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500">تکالیف در انتظار</span>
                    <div className="text-lg font-black text-amber-600 mt-1">
                      {studentDetail?.task_stats?.pending ?? selectedStudent.pending_tasks} عدد
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-500">نرخ عمل به تکالیف</span>
                    <div className="text-lg font-black text-emerald-600 mt-1">
                      {studentDetail?.task_stats?.rate ?? 67}٪
                    </div>
                  </div>
                </div>
              </div>

              {/* بخش اختصاصی: دانش‌آموز چقدر عمل کرده؟ */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      📊
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        پایش عملکرد: دانش‌آموز چقدر عمل کرده؟
                      </h4>
                      <p className="text-xs text-slate-500">
                        تحلیل تعهد به تکالیف ابلاغ‌شده و ساعات مطالعه دروس کنکور
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {studentDetail?.task_stats?.completed ?? 2} از {studentDetail?.task_stats?.total ?? 3} تکلیف انجام شده
                  </span>
                </div>

                {/* پروگرس بار نرخ انطباق */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span>درصد عمل به برنامه و تکالیف</span>
                    <span className="text-emerald-600 font-extrabold">{studentDetail?.task_stats?.rate ?? 67}٪</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all"
                      style={{ width: `${studentDetail?.task_stats?.rate ?? 67}%` }}
                    />
                  </div>
                </div>

                {/* ریز دروس مطالعه‌شده توسط این دانش‌آموز */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                    <span>کدوم درس‌ها رو مطالعه کرده؟</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(studentDetail?.study_summary?.subjects || [
                      { id: 'bio', name: 'زیست‌شناسی', hours: 5.3, tests: 105, percent: 42, topic: 'ژنتیک و اسمز' },
                      { id: 'chem', name: 'شیمی', hours: 3.5, tests: 70, percent: 25, topic: 'تعادل شیمیایی' },
                      { id: 'phy', name: 'فیزیک', hours: 2.7, tests: 45, percent: 20, topic: 'حرکت‌شناسی' },
                      { id: 'math', name: 'ریاضیات', hours: 2.0, tests: 35, percent: 13, topic: 'مشتق و حد' },
                    ]).map(sub => (
                      <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-xs font-black text-slate-800">{sub.name}</div>
                        <div className="text-sm font-black text-orange-600 mt-1">
                          {sub.hours} <span className="text-[10px] font-normal text-slate-500">ساعت</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                          {sub.tests} تست
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate" title={sub.topic}>
                          {sub.topic}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* بخش اختصاصی: چه تکالیفی قرار داده شده؟ */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        تکالیف قرار داده شده برای {selectedStudent.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        وضعیت اجرای تکالیف محول‌شده توسط شما
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {(studentDetail?.tasks || []).length} تکلیف ثبت‌شده
                  </span>
                </div>

                <div className="space-y-2.5 mb-6">
                  {(!studentDetail?.tasks || studentDetail.tasks.length === 0) ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                      هنوز تکلیفی برای این دانش‌آموز ثبت نشده است. از فرم زیر می‌توانید اولین تکلیف را ارسال کنید.
                    </div>
                  ) : (
                    studentDetail.tasks.map(t => {
                      const isDone = t.status === 'done';
                      return (
                        <div
                          key={t.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                            isDone ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                                isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {isDone ? 'انجام داده ✅' : 'در انتظار اقدام ⏳'}
                              </span>
                              <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                {t.title}
                              </span>
                            </div>
                            {t.description && (
                              <p className="text-xs text-slate-500 mt-1">
                                {t.description}
                              </p>
                            )}
                            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-3">
                              <span>مهلت تحویل: {t.due_date}</span>
                              {t.done_at && <span className="text-emerald-700 font-semibold">تکمیل‌شده: {t.done_at}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* فرم ثبت نظر عملکرد مشاور (مطابق مستندات بخش یادداشت) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  <span>ثبت تحلیل و نظر عملکرد برای {selectedStudent.name}</span>
                </h4>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <textarea
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    rows={3}
                    placeholder="تحلیل برنامه هفتگی، بررسی نوسان ساعت مطالعه یا توصیه انگیزشی..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm"
                    required
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="note_vis"
                          value="public"
                          checked={noteVisibility === 'public'}
                          onChange={() => setNoteVisibility('public')}
                          className="text-orange-600"
                        />
                        <span>قابل مشاهده توسط دانش‌آموز (عمومی)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="note_vis"
                          value="private"
                          checked={noteVisibility === 'private'}
                          onChange={() => setNoteVisibility('private')}
                          className="text-orange-600"
                        />
                        <span>یادداشت محرمانه مشاور</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-2 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ثبت در پرونده</span>
                    </button>
                  </div>

                  {noteMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                      {noteMsg}
                    </div>
                  )}
                </form>
              </div>

              {/* فرم افزودن تکلیف (تسک) هفتگی یا روزانه */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  <span>ارسال تکلیف و تسک تحصیلی</span>
                </h4>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      عنوان تکلیف <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                      placeholder="مثال: حل ۵۰ تست زمان‌دار ژنتیک + تحلیل و خلاصه نویسی"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        توضیحات تکمیلی
                      </label>
                      <input
                        type="text"
                        value={taskDesc}
                        onChange={e => setTaskDesc(e.target.value)}
                        placeholder="نکات حل، شماره صفحات یا منبع تستی..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        مهلت تحویل (Due Date)
                      </label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={e => setTaskDueDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن به گزارش کارهای دانش‌آموز</span>
                  </button>

                  {taskMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                      {taskMsg}
                    </div>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              دانش‌آموزی انتخاب نشده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
