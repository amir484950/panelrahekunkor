import React, { useState, useEffect } from 'react';
import {
  Clock,
  Trophy,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Phone,
  Globe,
  Send,
  Video,
  Play,
  RotateCcw,
  Check,
  AlertTriangle,
  Smartphone,
  Flame,
  Plus,
  UserCheck,
  GraduationCap,
  BarChart3,
  Target,
} from 'lucide-react';
import { LeaderboardItem, TaskItem, NoteItem, PlanItem, AchievementItem, ChannelItem, MilestoneItem } from '../types';
import { RealtimeStudyTracker } from './student/RealtimeStudyTracker';
import { SubjectProgressCharts } from './student/SubjectProgressCharts';
import { MilestonesCalendarView } from './student/MilestonesCalendarView';
import { api, apiRequest, tokenStorage, normalizeMobile } from '../api';
import { ErrorState, DashboardSkeleton } from './common/DataStateDisplay';
import { AuthScreen } from './AuthScreen';

export interface StudentPortalProps {

  currentStudent?: {
    id: number;
    name: string;
    mobile: string;
    grade?: string;
    city?: string;
  } | null;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentStudent }) => {
  // وضعیت‌های تب‌های داخلی دانش‌آموز
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'realtime_study'
    | 'subject_charts'
    | 'milestones_calendar'
    | 'study_hours'
    | 'leaderboard'
    | 'progress_club'
    | 'tasks'
    | 'notes'
    | 'plan'
    | 'channels'
    | 'videos'
  >('overview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');


  // احراز هویت با موبایل (شبیه‌ساز عکس ۱ و ۲)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginStep, setLoginStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState<string>('09301111101');
  const [loginPassword, setLoginPassword] = useState<string>('123456');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [loginError, setLoginError] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(115);

  // مشخصات دانش‌آموز جاری
  const [studentUser, setStudentUser] = useState(() => {
    if (currentStudent && currentStudent.id) return currentStudent;
    try {
      const saved = localStorage.getItem('rksp_active_student');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: 101,
      name: 'دانش‌آموز شماره ۱',
      mobile: '09301111101',
      grade: 'دوازدهم تجربی',
      city: 'تهران',
    };
  });

  const [allStudents, setAllStudents] = useState<any[]>([]);

  useEffect(() => {
    if (currentStudent && currentStudent.id) {
      setStudentUser(currentStudent);
      setIsLoggedIn(true);
    }
  }, [currentStudent]);

  useEffect(() => {
    apiRequest<any[]>('/rksp/v1/students')
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAllStudents(data);
        }
      })
      .catch(() => {});
  }, []);


  // فرم ثبت‌نام دانش‌آموز جدید
  const [regName, setRegName] = useState<string>('');
  const [regMobile, setRegMobile] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regGrade, setRegGrade] = useState<string>('دوازدهم');
  const [regMajor, setRegMajor] = useState<string>('تجربی');
  const [regCity, setRegCity] = useState<string>('');
  const [regMentorId, setRegMentorId] = useState<string>('2');
  const [regError, setRegError] = useState<string>('');
  const [regLoading, setRegLoading] = useState<boolean>(false);

  // فرم ثبت ساعت مطالعه
  const [studyMinutes, setStudyMinutes] = useState<number>(90);
  const [studySubject, setStudySubject] = useState<string>('زیست‌شناسی فصل ۲ (تنظیم اسمزی)');
  const [studyDate, setStudyDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [submittingLog, setSubmittingLog] = useState<boolean>(false);
  const [logSuccessMessage, setLogSuccessMessage] = useState<string>('');

  // داده‌ها از API
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [myRank, setMyRank] = useState<LeaderboardItem | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [plan, setPlan] = useState<PlanItem | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);


  // داده‌های خلاصه مطالعه، تفکیک دروس و مشاور
  const [studySummary, setStudySummary] = useState<{
    study_stats: {
      total_hours: number;
      today_hours: number;
      today_minutes: number;
      total_tests: number;
      streak_days: number;
      target_daily_hours: number;
    };
    subjects: Array<{
      id: string;
      name: string;
      minutes: number;
      hours: number;
      tests: number;
      percent: number;
      color: string;
      topic: string;
    }>;
    mentor: {
      id: number;
      name: string;
      mobile: string;
      specialty: string;
    } | null;
  }>({
    study_stats: {
      total_hours: 0,
      today_hours: 0,
      today_minutes: 0,
      total_tests: 0,
      streak_days: 0,
      target_daily_hours: 0,
    },
    subjects: [],
    mentor: null,
  });

  const [fetchError, setFetchError] = useState<string | null>(null);

  // بارگذاری داده‌ها
  const fetchData = async () => {
    try {
      setLoadingData(true);
      setFetchError(null);

      // دریافت پایش جامع مطالعه، تفکیک دروس و تکالیف
      let summaryJson: any = null;
      try {
        summaryJson = await api.student.dashboardSummary();
      } catch {
        summaryJson = await apiRequest<any>(`/rksp/v1/student/study-summary?student_id=${studentUser.id}`);
      }

      if (summaryJson && summaryJson.study_stats) {
        setStudySummary({
          study_stats: summaryJson.study_stats,
          subjects: summaryJson.subjects || [],
          mentor: summaryJson.mentor || null,
        });
        if (summaryJson.tasks) {
          setTasks(summaryJson.tasks);
        }
      }

      // لیدربورد
      try {
        const lbJson = await api.student.leaderboard({ period });
        if (lbJson) {
          setLeaderboard(lbJson.leaderboard || []);
          setMyRank(lbJson.my_rank || null);
        }
      } catch {}

      // تسک‌ها
      try {
        const tasksJson = await apiRequest<any[]>(`/rksp/v1/tasks/me?student_id=${studentUser.id}`);
        if (Array.isArray(tasksJson)) setTasks(tasksJson);
      } catch {}

      // نظرات
      try {
        const notesJson = await api.student.notes();
        if (Array.isArray(notesJson)) setNotes(notesJson);
      } catch {}

      // طرح
      try {
        const planJson = await api.student.plan();
        if (planJson) setPlan(planJson);
      } catch {}

      // دستاوردها
      try {
        const achJson = await api.student.achievements();
        if (Array.isArray(achJson)) setAchievements(achJson);
      } catch {}

      // کانال‌ها
      try {
        const chJson = await api.student.channels();
        if (Array.isArray(chJson)) setChannels(chJson);
      } catch {}

      // تقویم و نقاط عطف
      try {
        const msJson = await api.student.milestones();
        if (Array.isArray(msJson)) {
          setMilestones(msJson);
        }
      } catch {}
    } catch (e: any) {
      console.error('Fetch error:', e);
      setFetchError(e?.message || 'خطا در بارگذاری اطلاعات پرتال از سرور.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, studentUser.id]);

  // ثبت ساعت مطالعه جدید
  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLog(true);
    setLogSuccessMessage('');
    try {
      const data = await apiRequest<{ success: boolean }>('/rksp/v1/study-logs', {
        method: 'POST',
        body: {
          student_id: studentUser.id,
          minutes: Number(studyMinutes),
          subject: studySubject,
          date: studyDate,
          source: deviceMode === 'mobile' ? 'app' : 'panel',
        },
      });
      if (data.success) {
        setLogSuccessMessage(`✅ ${studyMinutes} دقیقه مطالعه برای درس "${studySubject}" با موفقیت ثبت شد و در جدول رتبه‌بندی اعمال گردید!`);
        fetchData();
      }
    } catch (err: any) {
      console.error(err);
      setLogSuccessMessage('خطا در ثبت ساعت مطالعه.');
    } finally {
      setSubmittingLog(false);
    }
  };

  // علامت‌زدن تسک به عنوان انجام‌شده
  const handleToggleTask = async (taskId: number, currentStatus: 'pending' | 'done') => {
    const nextStatus = currentStatus === 'done' ? 'pending' : 'done';
    try {
      await apiRequest<any>(`/rksp/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: { status: nextStatus },
      });
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: nextStatus, done_at: nextStatus === 'done' ? 'همین الان' : null } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };


  // احراز هویت با پیامک (OTP)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanMobile = normalizeMobile(mobileNumber);
    if (!cleanMobile.startsWith('09') || cleanMobile.length < 11) {
      setLoginError('لطفاً شماره موبایل معتبر ۱۱ رقمی وارد کنید.');
      return;
    }
    try {
      await api.auth.requestOtp(cleanMobile);
    } catch {}
    setLoginStep('otp');
    setTimer(115);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const cleanMobile = normalizeMobile(mobileNumber);
      const data = await api.auth.verifyOtp(cleanMobile, otpCode.join('') || '123456');
      if (data && (data.success || data.user || data.token)) {
        if (data.token) {
          tokenStorage.set(data.token);
        }
        const user = data.user || {
          id: 101,
          name: 'دانش‌آموز',
          mobile: cleanMobile,
        };
        tokenStorage.setUser(user);
        setStudentUser({
          id: user.id,
          name: user.name || user.display_name,
          mobile: user.mobile || cleanMobile,
          grade: user.grade || 'دوازدهم تجربی',
          city: user.city || 'تهران',
        });
        setIsLoggedIn(true);
        fetchData();
      } else {
        setLoginError(data?.message || 'کد تایید اشتباه است.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'خطا در تایید کد پیامک‌شده.');
    }
  };

  // احراز هویت با نام کاربری/موبایل و رمز عبور
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const cleanUsername = normalizeMobile(mobileNumber);
      const data = await api.auth.login(cleanUsername, loginPassword);
      if (data && (data.success || data.user || data.token)) {
        if (data.token) {
          tokenStorage.set(data.token);
        }
        const user = data.user || {
          id: 101,
          name: cleanUsername,
          mobile: cleanUsername,
        };
        tokenStorage.setUser(user);
        setStudentUser({
          id: user.id,
          name: user.name || user.display_name,
          mobile: user.mobile || cleanUsername,
          grade: user.grade || 'دوازدهم تجربی',
          city: user.city || 'تهران',
        });
        setIsLoggedIn(true);
        fetchData();
      } else {
        setLoginError(data?.message || 'اطلاعات ورود اشتباه است.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'اطلاعات ورود اشتباه است یا خطایی رخ داد.');
    }
  };

  // ثبت‌نام دانش‌آموز جدید
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regMobile || !regPassword) {
      setRegError('لطفاً نام، شماره موبایل و رمز عبور را تکمیل نمایید.');
      return;
    }
    try {
      setRegLoading(true);
      const cleanMobile = normalizeMobile(regMobile);
      const data = await api.auth.registerStudent({
        name: regName,
        mobile: cleanMobile,
        password: regPassword,
        grade: regGrade,
        major: regMajor,
        city: regCity,
        mentor_id: regMentorId,
      });
      if (data && (data.success || data.user || data.token)) {
        if (data.token) {
          tokenStorage.set(data.token);
        }
        const user = data.user || {
          id: data.student_id || 101,
          name: regName,
          mobile: cleanMobile,
        };
        tokenStorage.setUser(user);
        setStudentUser({
          id: user.id,
          name: user.name,
          mobile: user.mobile || cleanMobile,
          grade: `${regGrade} ${regMajor}`,
          city: regCity || 'تهران',
        });
        setIsLoggedIn(true);
        fetchData();
      } else {
        setRegError(data?.message || 'خطا در ثبت‌نام دانش‌آموز.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'خطا در ارسال درخواست ثبت‌نام.');
    } finally {
      setRegLoading(false);
    }
  };


  const handleQuickSwitchStudent = (id: number, name: string, mobile: string, grade: string) => {
    setStudentUser({
      id,
      name,
      mobile,
      grade,
      city: 'تهران',
    });
    fetchData();
  };

  // اگر لاگین نیست، صفحه محافظت‌شده ورود / ثبت‌نام نمایش داده می‌شود
  if (!isLoggedIn) {
    return (
      <AuthScreen
        onSuccess={(user) => {
          setStudentUser({
            id: user.id || 101,
            name: user.name || user.display_name || 'دانش‌آموز',
            mobile: user.mobile || '',
            grade: user.grade || 'دوازدهم تجربی',
            city: user.city || 'تهران',
          });
          setIsLoggedIn(true);
          fetchData();
        }}
      />
    );
  }

  if (loadingData && !studySummary.study_stats?.total_hours && !fetchError) {
    return <DashboardSkeleton />;
  }

  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorState onRetry={fetchData} message={fetchError} />
      </div>
    );
  }


  // محتوای پرتال دانش‌آموز (طراحی ماژولار و بسیار شیک)
  const portalContent = (
    <div className="space-y-6">
      {/* نوار راهنما و تغییر پرونده دانش‌آموز جاری در پنل اختصاصی */}
      <div className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-2">
              <span>پنل اختصاصی دانش‌آموز: <span className="text-orange-700">{studentUser.name}</span> (شناسه #{studentUser.id})</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">فعال در سامانه</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              مسیر اختصاصی در وردپرس: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-orange-700 font-bold" dir="ltr">/student-portal/</code> یا شورت‌کد <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-orange-700 font-bold" dir="ltr">[rksp_student_portal]</code>
            </div>
          </div>
        </div>

        {allStudents.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-600 font-bold whitespace-nowrap">تغییر دانش‌آموز:</span>
            <select
              value={studentUser.id}
              onChange={(e) => {
                const selId = Number(e.target.value);
                const found = allStudents.find((s: any) => (s.id ?? s.student_id) === selId);
                if (found) {
                  const normalized = {
                    id: (found as any).id ?? (found as any).student_id,
                    name: found.name,
                    mobile: found.mobile || (found as any).phone || '',
                    grade: found.grade || 'دوازدهم تجربی',
                    city: found.city || 'تهران',
                  };
                  setStudentUser(normalized);
                  try {
                    localStorage.setItem('rksp_active_student', JSON.stringify(normalized));
                  } catch (err) {}
                }
              }}
              className="text-xs font-bold bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-950 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              {allStudents.map((s: any, idx) => {
                const sId = s.id ?? s.student_id ?? idx;
                return (
                  <option key={`student-opt-${sId}-${idx}`} value={sId}>
                    {s.name} ({s.grade || s.mobile || s.phone || ''})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* کارت خوش‌آمدگویی و خلاصه وضعیت با دکمه خروج */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              دانش‌آموز فعال
            </span>
            <span className="text-xs font-semibold text-amber-100">{studentUser.grade}</span>
            <span className="text-xs font-mono text-amber-200">({studentUser.mobile})</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">سلام، {studentUser.name}! 🌸</h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            به پرتال جامع مطالعه و آزمون راه کنکور خوش آمدید. اطلاعات برنامه و تکالیف شما زیر نظر مشاور تحصیلی پایش می‌شود.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* کارت رتبه فعلی در باشگاه ساعت مطالعه */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 sm:p-4 flex items-center gap-4 border border-white/20 justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/90 text-slate-900 font-black flex items-center justify-center text-lg shadow-xs">
                🏆
              </div>
              <div>
                <div className="text-xs text-amber-100">رتبه در باشگاه مطالعه</div>
                <div className="text-lg font-black">{myRank ? `رتبه ${myRank.rank}` : 'رتبه ۱ امروز (طلا)'}</div>
              </div>
            </div>
            <div className="text-left border-r border-white/20 pr-4">
              <div className="text-xs text-amber-100">ساعت تجمعی</div>
              <div className="text-lg font-black">۱۶ ساعت</div>
            </div>
          </div>

          {/* دکمه خروج برای بازگشت به فرم ورود/ثبت‌نام */}
          <button
            type="button"
            onClick={() => setIsLoggedIn(false)}
            className="px-3.5 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 backdrop-blur-xs"
            title="خروج از حساب جهت ثبت‌نام یا ورود با کاربری دیگر"
          >
            <span>خروج از حساب</span>
          </button>
        </div>
      </div>

      {/* نویگیشن تب‌های داخلی */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-bold border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>خلاصه جامع دانش‌آموز</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('realtime_study')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'realtime_study'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ساعت مطالعه زنده</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('subject_charts')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'subject_charts'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>نمودارهای پیشرفت دروس</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('milestones_calendar')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'milestones_calendar'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>تقویم و نقاط عطف</span>
        </button>


        <button
          type="button"
          onClick={() => setActiveSubTab('leaderboard')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'leaderboard'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" />
          باشگاه ساعت مطالعه
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('progress_club')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'progress_club'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          باشگاه پیشرفت
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('tasks')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          گزارش کارها ({tasks.filter(t => t.status === 'pending').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('notes')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'notes'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          نظرات عملکرد درسی
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('plan')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'plan'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          طرح و اشتراک من
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('channels')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'channels'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          کانال‌های ارتباطی
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('videos')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeSubTab === 'videos'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          ویدیوهای مشاوره
        </button>
      </div>

      {/* تب جامع: خلاصه وضعیت تحصیلی (چقدر درس خونده، کدوم درس‌ها، تکالیف دانش‌آموز) */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* کارت معرفی مشاور تحصیلی متصل */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200">
                    مشاور تحصیلی متصل شما
                  </span>
                  <span className="text-xs text-slate-400 font-mono">مرحله ۳ تکمیل‌شده</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  {studySummary.mentor?.name || 'دکتر سارا احمدی'}
                </h3>
                <p className="text-xs text-slate-500">
                  {studySummary.mentor?.specialty || 'مشاور ارشد رتبه‌های برتر تجربی'} · تماس مستقیم: <span dir="ltr">{studySummary.mentor?.mobile || '۰۹۱۲۱۱۱۱۱۱۱'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('tasks')}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>مشاهده تکالیف من ({tasks.filter(t => t.status === 'pending').length} در انتظار)</span>
              </button>
            </div>
          </div>

          {/* بخش اول: چقدر درس خونده؟ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    بخش اول: چقدر درس خوندم؟ (ساعت مطالعه و پایش زمانی)
                  </h2>
                  <p className="text-xs text-slate-500">
                    گزارش ساعات مطالعه ثبت‌شده توسط شما در دیتابیس راه کنکور
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('realtime_study')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Clock className="w-4 h-4" />
                <span>کرونومتر و ثبت زمان زنده</span>
              </button>
            </div>


            {/* کارت‌های ۴ گانه ساعت مطالعه */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-bold block">مطالعه امروز شما</span>
                <div className="text-2xl font-black text-slate-900 mt-1.5 flex items-baseline gap-1">
                  <span>{studySummary.study_stats.today_hours}</span>
                  <span className="text-xs font-normal text-slate-500">ساعت</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  معادل {studySummary.study_stats.today_minutes} دقیقه
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-bold block">مجموع ساعات مطالعه ثبت‌شده</span>
                <div className="text-2xl font-black text-orange-600 mt-1.5 flex items-baseline gap-1">
                  <span>{studySummary.study_stats.total_hours}</span>
                  <span className="text-xs font-normal text-slate-500">ساعت</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ثبت رسمی در پرونده کنکور
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-bold block">تست‌های حل‌شده</span>
                <div className="text-2xl font-black text-slate-900 mt-1.5 flex items-baseline gap-1">
                  <span>{studySummary.study_stats.total_tests}</span>
                  <span className="text-xs font-normal text-slate-500">تست</span>
                </div>
                <div className="text-[11px] text-blue-600 font-bold mt-1">
                  زمان‌دار و تشخیصی
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-bold block">پیوستگی و زنجیره مطالعه</span>
                <div className="text-2xl font-black text-amber-600 mt-1.5 flex items-baseline gap-1">
                  <span>{studySummary.study_stats.streak_days}</span>
                  <span className="text-xs font-normal text-slate-500">روز متوالی</span>
                </div>
                <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>بدون وقفه در برنامه</span>
                </div>
              </div>
            </div>

            {/* پروگرس بار هدف روزانه */}
            <div className="mt-5 p-4 rounded-xl bg-orange-50/60 border border-orange-200/80">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-1.5">
                <span>پیشرفت هدف مطالعه امروز (هدف: {studySummary.study_stats.target_daily_hours} ساعت)</span>
                <span className="text-orange-700">
                  {Math.min(100, Math.round((studySummary.study_stats.today_hours / studySummary.study_stats.target_daily_hours) * 100))}% تحقق یافته
                </span>
              </div>
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-orange-200">
                <div
                  className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (studySummary.study_stats.today_hours / studySummary.study_stats.target_daily_hours) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* بخش دوم: کدوم درس‌ها رو خونده؟ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    بخش دوم: کدوم درس‌ها رو خوندم؟ (تفکیک دقیق دروس و تست‌ها)
                  </h2>
                  <p className="text-xs text-slate-500">
                    ریز ساعات مطالعه، درصد سهم هر درس و تعداد تست‌های ثبت‌شده
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('subject_charts')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <BarChart3 className="w-4 h-4" />
                <span>نمودارهای تحلیلی و توازن دروس</span>
              </button>
            </div>


            {/* کارت‌های دروس */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {studySummary.subjects.map((subject, idx) => (
                <div
                  key={`subject-${subject.id || idx}-${idx}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-slate-900 text-sm">{subject.name}</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {subject.percent}٪ از کل
                      </span>
                    </div>

                    <div className="text-xl font-black text-slate-900 mt-1">
                      {subject.hours} <span className="text-xs font-normal text-slate-500">ساعت</span>
                      <span className="text-xs text-slate-400 font-normal mr-2">({subject.minutes} دقیقه)</span>
                    </div>

                    <div className="text-xs text-slate-600 font-semibold mt-2">
                      ✍️ {subject.tests} تست تشخیصی و کنکوری
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                      مبحث: {subject.topic}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => {
                        setStudySubject(subject.name);
                        setActiveSubTab('study_hours');
                      }}
                      className="w-full py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت مطالعه {subject.name}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* بخش سوم: تکالیف دانش‌آموز چی بوده؟ */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    بخش سوم: تکالیف دانش‌آموز چی بوده؟ (ابلاغ‌شده توسط مشاور)
                  </h2>
                  <p className="text-xs text-slate-500">
                    تکالیف، آزمون‌های خودسنجی و برنامه‌های ابلاغ‌شده که باید انجام دهید
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {tasks.length} تکلیف فعال
              </span>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  در حال حاضر تکلیفی ثبت نشده است. مشاور تحصیلی شما به زودی تکالیف جدیدی را ابلاغ خواهد کرد.
                </div>
              ) : (
                tasks.map((task, idx) => {
                  const isDone = task.status === 'done';
                  return (
                    <div
                      key={`overview-task-${task.id ?? idx}-${idx}`}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-orange-500 bg-white'
                          }`}
                          title="کلیک برای تغییر وضعیت انجام"
                        >
                          {isDone && <Check className="w-4 h-4" />}
                        </button>

                        <div>
                          <div className={`font-black text-sm ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                            <span>مهلت تحویل: {task.due_date}</span>
                            {task.done_at && <span className="text-emerald-700 font-semibold">انجام‌شده در: {task.done_at}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {isDone ? 'انجام شد ✅' : 'در انتظار انجام ⏳'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isDone
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          }`}
                        >
                          {isDone ? 'بازگردانی' : 'تایید انجام تکلیف'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* بخش چهارم: تقویم و نقاط عطف پیش‌رو (آزمون‌های آزمایشی، ددلاین‌ها و جلسات) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    بخش چهارم: تقویم و رویدادهای پیش‌رو (آزمون‌ها و جلسات)
                  </h2>
                  <p className="text-xs text-slate-500">
                    زمان‌بندی آزمون‌های آزمایشی سنجش، تکالیف مشاور و جلسات مشاوره آنلاین
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSubTab('milestones_calendar')}
                className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Calendar className="w-4 h-4" />
                <span>مشاهده تقویم و نقاط عطف کامل</span>
              </button>
            </div>

            {/* لیست نقاط عطف ۳ گانه نزدیک */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {milestones.slice(0, 3).map(m => {
                let badgeStyle = 'bg-red-50 text-red-700 border-red-200';
                let catName = 'آزمون آزمایشی';
                if (m.category === 'task') {
                  badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  catName = 'تکلیف و گزارش‌کار';
                } else if (m.category === 'consultation') {
                  badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
                  catName = 'جلسه مشاوره';
                } else if (m.category === 'curriculum') {
                  badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  catName = 'نقطه عطف بودجه‌بندی';
                }

                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-purple-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${badgeStyle}`}>
                          {catName}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 font-mono">{m.time || '۰۸:۰۰'}</span>
                      </div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 line-clamp-1 mb-1">{m.title}</h4>
                      {m.description && <p className="text-[11px] text-slate-500 line-clamp-2">{m.description}</p>}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">{m.persian_date || m.date}</span>
                      <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {m.status === 'completed' ? 'تکمیل شد' : 'در انتظار'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* تب تخصصی ۱: کرونومتر هوشمند و پایش زمان واقعی مطالعه */}
      {activeSubTab === 'realtime_study' && (
        <RealtimeStudyTracker
          studentId={studentUser.id}
          studentName={studentUser.name}
          studyStats={{
            total_hours: studySummary.study_stats.total_hours,
            today_hours: studySummary.study_stats.today_hours,
            today_minutes: studySummary.study_stats.today_minutes,
            total_tests: studySummary.study_stats.total_tests,
            streak_days: studySummary.study_stats.streak_days,
            target_daily_hours: studySummary.study_stats.target_daily_hours || 8,
          }}
          subjects={studySummary.subjects}
          onLogSaved={fetchData}
        />
      )}

      {/* تب تخصصی ۲: نمودارهای تحلیلی، مقایسه‌ای و توازن دروس */}
      {activeSubTab === 'subject_charts' && (
        <SubjectProgressCharts
          studentName={studentUser.name}
          studentGrade={studentUser.grade || 'دوازدهم تجربی'}
          subjects={studySummary.subjects}
          totalHours={studySummary.study_stats.total_hours}
        />
      )}

      {/* تب تخصصی ۳: تقویم ماهانه و نقاط عطف آموزشی */}
      {activeSubTab === 'milestones_calendar' && (
        <MilestonesCalendarView
          studentId={studentUser.id}
          studentName={studentUser.name}
        />
      )}

      {/* تب ۱: ثبت ساعت مطالعه */}
      {activeSubTab === 'study_hours' && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                ثبت بازه مطالعه جدید
              </h2>
              <span className="text-xs text-slate-500 font-semibold">ارسال به REST API</span>
            </div>

            <form onSubmit={handleLogStudy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    مدت زمان مطالعه (دقیقه)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={15}
                      max={1440}
                      step={15}
                      value={studyMinutes}
                      onChange={e => setStudyMinutes(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-semibold text-slate-800"
                      required
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400 font-bold">
                      {Math.floor(studyMinutes / 60)} ساعت و {studyMinutes % 60} دقیقه
                    </span>
                  </div>
                  {/* دکمه‌های پرکاربرد دقیقه */}
                  <div className="flex gap-1.5 mt-2">
                    {[60, 90, 120, 150, 180].map(m => (
                      <button
                        key={`preset-min-${m}`}
                        type="button"
                        onClick={() => setStudyMinutes(m)}
                        className={`text-[11px] px-2 py-1 rounded-md border font-semibold ${
                          studyMinutes === m
                            ? 'bg-orange-100 border-orange-300 text-orange-800'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m} دقیقه
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تاریخ مطالعه
                  </label>
                  <input
                    type="date"
                    value={studyDate}
                    onChange={e => setStudyDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-slate-800 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عنوان درس و مبحث
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: زیست‌شناسی فصل ۲، تست‌های تعادل شیمی، هندسه یازدهم..."
                  value={studySubject}
                  onChange={e => setStudySubject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none font-semibold text-slate-800 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingLog}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {submittingLog ? (
                  <span>در حال ثبت...</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>ثبت در باشگاه ساعت مطالعه</span>
                  </>
                )}
              </button>

              {logSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                  {logSuccessMessage}
                </div>
              )}
            </form>
          </div>

          {/* قوانین محاسبه و سیستم ۵ دقیقه ترنزینت */}
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-sm font-extrabold text-amber-900 mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                قوانین باشگاه ساعت مطالعه
              </h3>
              <ul className="text-xs text-amber-800 space-y-2 leading-relaxed">
                <li>• تجمیع کوئری‌ها بر پایه جدول بهینه <code className="bg-amber-200/60 px-1 py-0.5 rounded">wp_rksp_study_logs</code></li>
                <li>• برای حفظ حداکثر سرعت سایت، رتبه‌بندی در ترنزینت کش ۵ دقیقه‌ای نگهداری می‌شود.</li>
                <li>• ثبت لاگ جدید، کش مربوطه را بلافاصله اینولیدیت و رفرش می‌کند.</li>
                <li>• پس از ثبت مطالعه، مایل‌استون‌های هر ۱۰۰ ساعت به صورت خودکار بررسی و ثبت می‌شوند.</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                طرح فعال شما
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{plan?.plan_name || 'طرح سالانه VIP'}</div>
                  <div className="text-xs text-emerald-600 font-bold mt-0.5">وضعیت: فعال و تحت پشتیبانی</div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                  {plan?.days_left || 180} روز مانده
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* تب ۲: باشگاه ساعت مطالعه (منطبق بر عکس ۸) */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                باشگاه ساعت مطالعه
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                برترین ساعات مطالعه ثبت‌شده توسط دانش‌آموزان در سراسر کشور (برگرفته از اسکرین‌شات ۸)
              </p>
            </div>

            {/* فیلتر دوره زمانی */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPeriod('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'daily' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                امروز (چهارشنبه)
              </button>
              <button
                type="button"
                onClick={() => setPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'weekly' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                هفتگی
              </button>
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === 'monthly' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ماهانه
              </button>
            </div>
          </div>

          {/* لیست رده‌بندی دقیقا مطابق استایل جدول درسباما عکس ۸ */}
          <div className="space-y-2">
            {leaderboard.map((item, idx) => {
              const isTop1 = item.rank === 1;
              const isTop2 = item.rank === 2;
              const isTop3 = item.rank === 3;
              const isMe = item.is_current;

              let bgClass = 'bg-white hover:bg-slate-50 border-slate-200';
              if (isTop1) bgClass = 'bg-amber-50/70 border-amber-200';
              else if (isTop2) bgClass = 'bg-slate-50/80 border-slate-300';
              else if (isTop3) bgClass = 'bg-orange-50/60 border-orange-200';

              if (isMe) bgClass += ' ring-2 ring-orange-500';

              return (
                <div
                  key={`leaderboard-${item.student_id ?? idx}-${item.rank ?? idx}-${idx}`}
                  className={`border rounded-xl p-3 sm:p-4 flex items-center justify-between transition-all ${bgClass}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* نشان رتبه با مدال */}
                    <div className="flex items-center gap-1 w-10 sm:w-12">
                      <span className="font-extrabold text-sm sm:text-base text-slate-800">
                        {item.rank}
                      </span>
                      {isTop1 && <span className="text-base">🥇</span>}
                      {isTop2 && <span className="text-base">🥈</span>}
                      {isTop3 && <span className="text-base">🥉</span>}
                    </div>

                    {/* آواتار اختصاری دو حرفی مطابق عکس ۸ */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {item.student_name.slice(0, 2)}
                    </div>

                    <div>
                      <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        <span>{item.student_name}</span>
                        {isMe && (
                          <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.2 rounded-md font-bold">
                            شما
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {item.grade}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="font-black text-xs sm:text-base text-orange-600">
                      {item.formatted_time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* تب ۳: باشگاه پیشرفت (منطبق بر عکس ۶) */}
      {activeSubTab === 'progress_club' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                باشگاه پیشرفت — دستاوردهای خودکار
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ثبت خودکار موفقیت‌ها بر اساس عبور از ۱۰۰ ساعت مطالعه، صعود در رتبه و ترازهای آزمون (مطابق عکس ۶)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">دانش‌آموز</th>
                  <th className="p-3">خلاصه</th>
                  <th className="p-3">توضیحات دستاورد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {achievements.map((ach, idx) => (
                  <tr key={`achievement-${ach.id ?? idx}-${idx}`} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-slate-600 font-medium whitespace-nowrap">{ach.created_at}</td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{ach.student_name || 'دانش‌آموز'}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {ach.type.includes('rank') ? 'رتبه ۱ باشگاه ساعت مطالعه' : 'پیشرفت ترازی و ساعت'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 leading-relaxed font-medium min-w-[280px]">
                      {ach.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تب ۴: گزارش کارها / تسک‌ها (منطبق بر عکس ۴) */}
      {activeSubTab === 'tasks' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                گزارش کارهای محول‌شده توسط مشاور
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تکالیف و برنامه‌های روزانه ارسالی از سمت مشاور اختصاصی شما
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-sm">گزارش کارها یافت نشد.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, idx) => {
                const isDone = task.status === 'done';
                return (
                  <div
                    key={`tab-task-${task.id ?? idx}-${idx}`}
                    className={`border rounded-xl p-4 flex items-center justify-between transition-all ${
                      isDone
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-orange-500'
                        }`}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                      <div>
                        <div className={`font-bold text-sm text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-slate-500 mt-0.5">{task.description}</div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-1">
                          مهلت تحویل: {task.due_date}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isDone ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          انجام شد ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                        >
                          ثبت انجام
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* تب ۵: نظرات عملکرد درسی (منطبق بر عکس ۵) */}
      {activeSubTab === 'notes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-600" />
                نظرات عملکرد درسی
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                بازخوردهای کیفی مشاور تحصیلی شما بر روی روند درس‌خواندن و آزمون‌ها (مطابق جدول عکس ۵)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">متن نظر عملکرد</th>
                  <th className="p-3">دانش‌آموز</th>
                  <th className="p-3">مشاور یا مدیر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notes.map((n, idx) => (
                  <tr key={`note-${n.id ?? idx}-${idx}`} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{n.created_at}</td>
                    <td className="p-3 text-slate-800 font-medium leading-relaxed max-w-md">
                      {n.content}
                    </td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{n.student_name || 'دانش‌آموز'}</td>
                    <td className="p-3 font-bold text-orange-700 whitespace-nowrap">{n.mentor_name || 'مشاور تحصیلی'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* تب ۶: طرح و اشتراک من */}
      {activeSubTab === 'plan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <span className="bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full">
              اشتراک فعال
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              {plan?.plan_name || 'طرح سالانه رتبه برتر VIP پرو'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">مشاور اختصاصی: مشاور تحصیلی</p>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
              <div className="text-xs text-slate-500 font-bold mb-1">تاریخ پایان طرح</div>
              <div className="text-base font-black text-slate-900 font-mono">
                {plan?.end_date || '2027-04-01'}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center border border-orange-100">
              <div className="text-xs text-orange-800 font-bold mb-1">روزهای باقیمانده</div>
              <div className="text-2xl font-black text-orange-600 font-mono">
                {plan?.days_left || 180} روز
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>برنامه‌ریزی روزانه اختصاصی:</span>
              <span className="font-bold text-emerald-600">فعال ✓</span>
            </div>
            <div className="flex justify-between">
              <span>تماس هفتگی با مشاور:</span>
              <span className="font-bold text-emerald-600">هفته‌ای ۲ جلسه ✓</span>
            </div>
            <div className="flex justify-between">
              <span>تحلیل کارنامه و آزمون‌های قلمچی/ماز:</span>
              <span className="font-bold text-emerald-600">نامحدود ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* تب ۷: کانال‌های ارتباطی (منطبق بر عکس ۳ و ۷) */}
      {activeSubTab === 'channels' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-600" />
              کانال‌های ارتباطی رسمی راه کنکور
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              راه‌های تماس مستقیم با موسسه، کانال‌های اطلاع‌رسانی آزمون و صفحات پشتیبانی (مطابق عکس ۷)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map((ch, idx) => (
              <a
                key={`channel-${ch.id ?? idx}-${idx}`}
                href={ch.value.startsWith('http') ? ch.value : `tel:${ch.value}`}
                target="_blank"
                rel="noreferrer"
                className="border border-slate-200 hover:border-orange-400 hover:shadow-xs p-4 rounded-xl flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    {ch.type === 'phone' && <Phone className="w-5 h-5" />}
                    {ch.type === 'website' && <Globe className="w-5 h-5" />}
                    {ch.type === 'telegram' && <Send className="w-5 h-5" />}
                    {ch.type === 'instagram' && <Sparkles className="w-5 h-5" />}
                    {ch.type === 'ble' && <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                      {ch.title}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                      {ch.value}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 rotate-180 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* تب ۸: ویدیوهای مشاوره (منطبق بر عکس ۹) */}
      {activeSubTab === 'videos' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-600" />
                ویدیوهای آموزشی و انگیزشی مشاوره
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                دوره استارت باما، راهکارهای علمی افزایش تمرکز و غلبه بر اهمال‌کاری (مطابق عکس ۹)
              </p>
            </div>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
              ۳ دوره فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ویدیوی ۱ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="text-xs font-bold text-cyan-300">خدمات درسباما</div>
                  <div className="text-lg font-black mt-1">چرا درسباما؟</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current mr-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  ۰۰:۳۴
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">چرا درسباما بالاترین رضایت را دارد؟</h3>
                <p className="text-xs text-slate-500">معرفی خدمات کامل و برنامه مشاوران راه کنکور</p>
              </div>
            </div>

            {/* ویدیوی ۲ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="text-xs font-bold text-amber-300">قسمت ۳ · دوره استارت باما</div>
                  <div className="text-lg font-black mt-1">بالا بردن تمرکز و راهکارهای علمی</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current mr-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  ۲۹:۱۷
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">پکیج مشاوره استارت باما بخش سوم</h3>
                <p className="text-xs text-slate-500">بالا بردن تمرکز و ارائه ۱۰ راهکار خفن و کاربردی</p>
              </div>
            </div>

            {/* ویدیوی ۳ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-red-950 to-purple-950 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="text-xs font-bold text-rose-300">قسمت ۲ · دوره استارت باما</div>
                  <div className="text-lg font-black mt-1">اهمال‌کاری و راهکار مقابله با آن</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current mr-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  ۳۴:۱۰
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">ماتریس آیزنهاور و موانع ذهنی</h3>
                <p className="text-xs text-slate-500">راهنمای ریشه‌کن کردن تعلل در مطالعه کنکور</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* نوار بالایی حالت نمایش (دسکتاپ یا شبیه‌ساز موبایل اپ آینده) */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 mb-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-slate-800">
            شبیه‌ساز معماری یکپارچه (وب و اپلیکیشن موبایل از یک REST API واحد)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              deviceMode === 'desktop' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            صفحه کامل (وب)
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              deviceMode === 'mobile' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            قاب گوشی موبایل (App Preview)
          </button>
        </div>
      </div>

      {deviceMode === 'desktop' ? (
        portalContent
      ) : (
        /* قاب موبایل شیک برای شبیه‌سازی اپلیکیشن آینده فلاتر / ری‌اکت نیتن */
        <div className="flex justify-center my-4">
          <div className="w-[390px] h-[820px] bg-slate-900 p-3 rounded-[48px] shadow-2xl border-4 border-slate-800 relative">
            {/* ناچ بالای صفحه */}
            <div className="w-32 h-5 bg-slate-800 rounded-b-2xl mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* صفحه نمایش درون موبایل */}
            <div className="bg-[#f8fafc] w-full h-[730px] rounded-[36px] overflow-y-auto p-4 text-slate-900 custom-scrollbar">
              {portalContent}
            </div>

            {/* نوار هوم پایین */}
            <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
          </div>
        </div>
      )}
    </div>
  );
};
