import { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, History, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ContentDetector } from './components/ContentDetector';
import { AlertHistory } from './components/AlertHistory';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { StorageService } from './services/StorageService';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'detector' | 'history' | 'analytics' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const settings = StorageService.getSettings();
    setApiKey(settings.apiKey);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'detector':
        return <ContentDetector apiKey={apiKey} />;
      case 'history':
        return <AlertHistory />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings onApiKeyChange={setApiKey} />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Misinformation Detector
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            {apiKey ? (
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                System Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                API Key Required
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0 space-y-1">
            <NavButton
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
            />
            <NavButton
              active={activeTab === 'detector'}
              onClick={() => setActiveTab('detector')}
              icon={<Shield className="w-5 h-5" />}
              label="Content Detector"
            />
            <NavButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<History className="w-5 h-5" />}
              label="Alert History"
            />
            <NavButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<BarChart3 className="w-5 h-5" />}
              label="Analytics"
            />
            <div className="pt-4 mt-4 border-t border-slate-200">
              <NavButton
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                icon={<SettingsIcon className="w-5 h-5" />}
                label="Settings"
              />
            </div>
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default App;
