export type UserRole = 'rksp_student' | 'rksp_mentor' | 'administrator';

export interface User {
  id: number;
  name: string;
  mobile: string;
  role: UserRole;
  grade?: string;
  major?: string;
  city?: string;
  specialty?: string;
  experience?: string;
  bio?: string;
  mentor_id?: number;
  mentor_name?: string;
  registered?: string;
}

export interface StudyLog {
  id: number;
  student_id: number;
  log_date: string;
  minutes: number;
  subject: string;
  source: 'app' | 'panel';
  created_at: string;
}

export interface LeaderboardItem {
  rank: number;
  student_id: number;
  student_name: string;
  grade: string;
  city?: string;
  total_minutes: number;
  formatted_time: string;
  is_current: boolean;
  medal: 'gold' | 'silver' | 'bronze' | null;
}

export interface TaskItem {
  id: number;
  student_id: number;
  mentor_id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'done';
  created_at: string;
  done_at: string | null;
}

export interface NoteItem {
  id: number;
  student_id: number;
  mentor_id: number;
  student_name?: string;
  mentor_name?: string;
  content: string;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface PlanItem {
  id: number;
  student_id: number;
  student_name?: string;
  phone?: string;
  mentor_name?: string;
  plan_name: string;
  price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  days_left?: number;
  is_expiring?: boolean;
  is_expired?: boolean;
}

export interface AchievementItem {
  id: number;
  student_id: number;
  student_name?: string;
  type: string;
  message: string;
  created_at: string;
}

export interface ChannelItem {
  id: number;
  title: string;
  type: 'website' | 'phone' | 'telegram' | 'instagram' | 'ble';
  value: string;
}

export interface PluginFile {
  path: string;
  name: string;
  content: string;
  size: number;
}

export interface MilestoneItem {
  id: number;
  student_id: number;
  title: string;
  category: 'exam' | 'task' | 'consultation' | 'curriculum';
  date: string;
  persian_date: string;
  time?: string;
  importance: 'high' | 'medium' | 'low';
  description?: string;
  status: 'upcoming' | 'completed';
  mentor_id?: number;
}

