import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StudentPortal } from './components/StudentPortal';
import { MentorPortal } from './components/MentorPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { RegistrationAndConnectionHub } from './components/RegistrationAndConnectionHub';
import { UserProfile } from './components/UserProfile';
import { PluginCodeViewer } from './components/PluginCodeViewer';
import { ApiExplorer } from './components/ApiExplorer';
import { UserRole } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'student' | 'mentor' | 'hub' | 'admin' | 'profile' | 'plugin_code' | 'api_docs'>('hub');
  const [currentRole, setCurrentRole] = useState<UserRole>('rksp_student');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" dir="rtl">
      {/* هدر اصلی برنامه */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* محتوای تب فعال */}
      <main className="flex-1 pb-16">
        {activeTab === 'hub' && (
          <RegistrationAndConnectionHub
            onNavigateToStudent={(student) => {
              if (student) setSelectedStudent(student);
              setCurrentRole('rksp_student');
              setActiveTab('student');
            }}
            onNavigateToMentor={() => {
              setCurrentRole('rksp_mentor');
              setActiveTab('mentor');
            }}
            onNavigateToAdmin={() => {
              setCurrentRole('administrator');
              setActiveTab('admin');
            }}
          />
        )}
        {activeTab === 'student' && <StudentPortal currentStudent={selectedStudent} />}
        {activeTab === 'mentor' && <MentorPortal />}
        {activeTab === 'profile' && <UserProfile currentRole={currentRole} onRoleSwitch={setCurrentRole} />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'plugin_code' && <PluginCodeViewer />}
        {activeTab === 'api_docs' && <ApiExplorer />}
      </main>

      {/* فوتر مینیمال و تمیز */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">افزونه پرتال راه کنکور (RK Student Portal)</span>
            <span>·</span>
            <span>نسخه ۱.۰.۰ پایدار</span>
          </div>
          <div className="text-slate-400">
            طراحی مستقل از قالب · بدون نیاز به المنتور، فرم‌ساز یا ACF · کاملاً بومی با گوتنبرگ و هسته وردپرس · معماری REST API محور
          </div>
        </div>
      </footer>
    </div>
  );
}
