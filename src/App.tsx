import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StorageProvider } from './contexts/StorageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Reports } from './pages/Reports/Reports';
import { Search } from './pages/Search/Search';
import { Settings } from './pages/Settings/Settings';
import './styles/index.css';

const DashboardAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-text-primary)] flex flex-col font-sans selection:bg-[color:var(--theme-primary)] selection:text-white">
      <Navbar />
      <div className="flex-1 flex min-h-[calc(100vh-65px)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'history' && <Search />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StorageProvider>
        <DashboardAppContent />
      </StorageProvider>
    </ThemeProvider>
  );
};

export default App;
