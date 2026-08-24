import React from 'react';
import {
  Database,
  Plus,
  Sliders,
  RefreshCw,
  Terminal,
  Sparkles,
  Layers,
  Globe,
  FlaskConical,
  Play,
  Users,
  Home,
  User,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'api_gateway' | 'sandbox';
  onChangeTab: (tab: 'dashboard' | 'api_gateway' | 'sandbox') => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenSqlModal: () => void;
  onOpenTestModal: () => void;
  onRefresh: () => void;
  onBackToPortal: () => void;
  onNavigateToCommunity: () => void;
  isRefreshing: boolean;
  activeCount: number;
  totalCount: number;
  leaderName: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onOpenSettingsModal,
  onOpenSqlModal,
  onOpenTestModal,
  onRefresh,
  onBackToPortal,
  onNavigateToCommunity,
  isRefreshing,
  activeCount,
  totalCount,
  leaderName,
}) => {
  const isMaxReached = totalCount >= 10;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          
          {/* Logo, Title & Portal Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              title="العودة للصفحة الشخصية (المدخل الرئيسي)"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">الرئيسية</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs ring-4 ring-blue-50 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  منظومة OCR & إدارة القواعد
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  القواعد ({totalCount} / 10)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع الحمل بين قواعد Supabase بالدور مع بوابة الـ API ومطابقة النصوص
              </p>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>لوحة القواعد</span>
            </button>

            <button
              onClick={() => onChangeTab('api_gateway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'api_gateway'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>بوابة الربط (API)</span>
            </button>

            <button
              onClick={() => onChangeTab('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sandbox'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>مختبر الفحص</span>
            </button>

            {/* Community Direct Switch Tab */}
            <button
              onClick={onNavigateToCommunity}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>المجتمع</span>
            </button>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="refresh-data-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="تحديث البيانات"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="open-sql-modal-btn"
              onClick={onOpenSqlModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>SQL Schema</span>
            </button>

            <button
              id="open-test-modal-btn"
              onClick={onOpenTestModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
              <span>اختبار</span>
            </button>

            <button
              id="open-add-db-modal-btn"
              onClick={onOpenAddModal}
              disabled={isMaxReached}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                isMaxReached
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isMaxReached ? 'مكتمل (10/10)' : 'إضافة قاعدة'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
