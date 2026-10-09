import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import JobListScreen from './screens/JobListScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import CreateJobScreen from './screens/CreateJobScreen';
import ApplicationsScreen from './screens/ApplicationsScreen';
import ProfileScreen from './screens/ProfileScreen';

const MainContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold tracking-wider uppercase">Loading TalentHub Application...</p>
      </div>
    );
  }

  // Navigation handlers
  const handleSelectJob = (job) => {
    setSelectedJobId(job._id);
    setActiveTab('job-detail');
  };

  const handleEditJob = (job) => {
    setJobToEdit(job);
    setActiveTab('edit-job');
  };

  const renderActiveScreen = () => {
    if (!isAuthenticated) {
      if (authMode === 'register') {
        return <RegisterScreen onNavigateLogin={() => setAuthMode('login')} />;
      }
      return <LoginScreen onNavigateRegister={() => setAuthMode('register')} />;
    }

    switch (activeTab) {
      case 'jobs':
        return (
          <JobListScreen
            onSelectJob={handleSelectJob}
            onEditJob={handleEditJob}
            onCreateJobClick={() => setActiveTab('create-job')}
          />
        );

      case 'job-detail':
        return (
          <JobDetailScreen
            jobId={selectedJobId}
            onBack={() => setActiveTab('jobs')}
            onAppliedSuccess={() => setActiveTab('applications')}
          />
        );

      case 'create-job':
        return (
          <CreateJobScreen
            onComplete={() => setActiveTab('jobs')}
            onCancel={() => setActiveTab('jobs')}
          />
        );

      case 'edit-job':
        return (
          <CreateJobScreen
            jobToEdit={jobToEdit}
            onComplete={() => {
              setJobToEdit(null);
              setActiveTab('jobs');
            }}
            onCancel={() => {
              setJobToEdit(null);
              setActiveTab('jobs');
            }}
          />
        );

      case 'applications':
        return <ApplicationsScreen />;

      case 'profile':
        return <ProfileScreen />;

      default:
        return (
          <JobListScreen
            onSelectJob={handleSelectJob}
            onEditJob={handleEditJob}
            onCreateJobClick={() => setActiveTab('create-job')}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isMobileFrame ? 'py-6 px-4 bg-slate-900' : ''}`}>
      {/* Outer Shell Wrapper (Mobile App simulator option) */}
      <div className={isMobileFrame ? 'mobile-app-shell rounded-[40px] border-4 border-slate-800 overflow-hidden shadow-2xl' : 'w-full'}>
        <Header isMobileFrame={isMobileFrame} setIsMobileFrame={setIsMobileFrame} />
        <main className="min-h-[85vh]">{renderActiveScreen()}</main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
};

export default App;
