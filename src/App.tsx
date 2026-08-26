import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Database,
  Plus,
  Sliders,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Shield,
  Layers,
  Crown,
  Sparkles,
  Globe,
  FlaskConical,
  Play,
  Terminal,
} from 'lucide-react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { DatabaseTable } from './components/DatabaseTable';
import { DatabaseModal } from './components/DatabaseModal';
import { SettingsModal } from './components/SettingsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ArchitectureInfo } from './components/ArchitectureInfo';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { OcrComparator } from './components/OcrComparator';
import { ApiGatewayDocs } from './components/ApiGatewayDocs';
import { KeyModal } from './components/KeyModal';
import { BaseTestingModal } from './components/BaseTestingModal';
import { BaseErrorsModal } from './components/BaseErrorsModal';
import { PersonalPortal } from './components/PersonalPortal';
import { CommunityHub } from './components/CommunityHub';
import { CourseRemindersDashboard } from './components/CourseRemindersDashboard';
import {
  OcrProject,
  SystemSettings,
  ProjectFormData,
  SupabaseConnectionStatus,
  OcrComparisonResult,
  SystemKeysStatus,
} from './types';
import * as api from './api';

const DEFAULT_SETTINGS: SystemSettings = {
  defaultMaxRequests: 200,
  leadershipHandoverLimit: 200,
  autoRotationEnabled: false,
  alertThresholdPercent: 85,
};

export function App() {
  // Navigation view: 'portal' (الصفحة الشخصية) | 'ocr' (أداة OCR) | 'community' (المجتمع)
  const [currentView, setCurrentView] = useState<'portal' | 'ocr' | 'community' | 'course_reminders'>('portal');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'api_gateway' | 'sandbox'>('dashboard');
  const [projects, setProjects] = useState<OcrProject[]>([]);
  const [incomingTasks, setIncomingTasks] = useState<OcrComparisonResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [keysStatus, setKeysStatus] = useState<SystemKeysStatus>({
    hasServiceKey: false,
    hasDeepseekKey: true,
    hasDefaultOcrKey: true,
  });
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testTargetProjectId, setTestTargetProjectId] = useState<string | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<OcrProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<OcrProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Key Modal State
  const [keyModalConfig, setKeyModalConfig] = useState<{
    isOpen: boolean;
    keyType: 'ocr' | 'deepseek';
    projectId?: string;
    projectName?: string;
    isReplacing?: boolean;
    title: string;
    subtitle: string;
  }>({
    isOpen: false,
    keyType: 'deepseek',
    title: '',
    subtitle: '',
  });

  // Base Errors & Performance Modal State
  const [isErrorsModalOpen, setIsErrorsModalOpen] = useState(false);
  const [selectedErrorsProject, setSelectedErrorsProject] = useState<OcrProject | null>(null);

  // Show Toast
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Data from Supabase / Backend
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [projectsData, connData, keysData] = await Promise.all([
        api.fetchProjects(),
        api.fetchConnectionStatus().catch(() => null),
        api.fetchKeysStatus().catch(() => ({
          hasServiceKey: false,
          hasDeepseekKey: true,
          hasDefaultOcrKey: true,
        })),
      ]);

      setProjects(projectsData.projects || []);
      if (connData) setConnectionStatus(connData);
      if (keysData) setKeysStatus(keysData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'فشل في تحميل بيانات قواعد OCR');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Handle Save / Add Project
  const handleSaveProject = async (
    formData: ProjectFormData & { service_role_key?: string; ocr_api_key?: string }
  ) => {
    try {
      if (editingProject) {
        const updatedProject = await api.updateProject(editingProject.id, formData);
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? updatedProject : p))
        );
        showToast('تم تحديث بيانات القاعدة بنجاح');
      } else {
        const newProject = await api.createProject(formData);
        setProjects((prev) => [...prev, newProject]);
        showToast('تمت إضافة وربط القاعدة بنجاح');
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في حفظ بيانات القاعدة', 'error');
      throw err;
    }
  };

  // Handle Delete Project
  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(deletingProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      showToast('تم حذف القاعدة بنجاح');
      setDeletingProject(null);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في حذف القاعدة', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Status Toggle (Active / Disabled)
  const handleToggleStatus = async (project: OcrProject) => {
    try {
      const updated = await api.toggleProjectStatus(project.id);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updated : p))
      );
      showToast(`تم تغيير حالة القاعدة إلى ${updated.status}`);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في تغيير حالة القاعدة', 'error');
    }
  };

  // Handle Leader Change
  const handleSetLeader = async (project: OcrProject) => {
    try {
      const res = await api.setLeaderProject(project.id);
      showToast(`تم تعيين ${project.name} كقائد حالي`);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في تعيين القائد', 'error');
    }
  };

  // Handle Simulate Load
  const handleSimulateLoad = async (project: OcrProject, count: number) => {
    try {
      const updated = await api.simulateProjectLoad(project.id, count);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updated : p))
      );
      showToast(`تمت محاكاة ${count} طلبات بنجاح`);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في محاكاة الحمل', 'error');
    }
  };

  // Handle Reset Load
  const handleResetLoad = async (project: OcrProject) => {
    try {
      const updated = await api.resetProjectLoad(project.id);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? updated : p))
      );
      if (selectedErrorsProject?.id === project.id) {
        setSelectedErrorsProject(updated);
      }
      showToast(`تم تصفير عداد ${project.name}`);
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في تصفير العداد', 'error');
    }
  };

  // Handle View Errors & Requests Modal
  const handleViewErrors = (project: OcrProject) => {
    setSelectedErrorsProject(project);
    setIsErrorsModalOpen(true);
  };

  // Handle Reset Only Errors
  const handleResetErrors = async (projectId: string) => {
    try {
      const updated = await api.resetProjectErrors(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? updated : p))
      );
      if (selectedErrorsProject?.id === projectId) {
        setSelectedErrorsProject(updated);
      }
      showToast('تم مسح وتصفير سجل أخطاء القاعدة بنجاح');
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في مسح سجل الأخطاء', 'error');
    }
  };

  // Handle Batch Reset
  const handleBatchReset = async () => {
    try {
      const updatedProjects = await api.batchResetProjects();
      setProjects(updatedProjects);
      showToast('تم تصفير جميع عدادات القواعد');
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في تصفير العدادات', 'error');
    }
  };

  // Save Service Role Key from Settings
  const handleSaveServiceRoleKey = async (key: string) => {
    try {
      const res = await api.saveServiceRoleKey(key);
      showToast(res.message || 'تم ربط مفتاح Service Role بنجاح');
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في ربط مفتاح Service Role', 'error');
    }
  };

  // Project OCR Key Actions
  const handleAddProjectOcrKey = (project: OcrProject) => {
    setKeyModalConfig({
      isOpen: true,
      keyType: 'ocr',
      projectId: project.id,
      projectName: project.name,
      isReplacing: false,
      title: `إضافة مفتاح OCR لـ (${project.name})`,
      subtitle: 'أدخل مفتاح OCR API المخصص لهذه القاعدة لمعالجة الصور واستخراج النصوص',
    });
  };

  const handleReplaceProjectOcrKey = (project: OcrProject) => {
    setKeyModalConfig({
      isOpen: true,
      keyType: 'ocr',
      projectId: project.id,
      projectName: project.name,
      isReplacing: true,
      title: `استبدال مفتاح OCR لـ (${project.name})`,
      subtitle: 'أدخل مفتاح OCR API الجديد ليحل محل المفتاح السابق بأمان',
    });
  };

  const handleRemoveProjectOcrKey = async (project: OcrProject) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في إزالة مفتاح OCR من القاعدة "${project.name}"؟`)) {
      return;
    }
    try {
      const res = await api.removeProjectOcrKey(project.id);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? res.project : p))
      );
      showToast(res.message || 'تمت إزالة مفتاح OCR API بنجاح');
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل في إزالة مفتاح OCR', 'error');
    }
  };

  // DeepSeek Key Actions
  const handleManageDeepseekKey = () => {
    const isReplacing = keysStatus.hasDeepseekKey;
    setKeyModalConfig({
      isOpen: true,
      keyType: 'deepseek',
      isReplacing,
      title: isReplacing ? 'استبدال مفتاح DeepSeek API' : 'إضافة مفتاح DeepSeek API',
      subtitle: 'مفتاح موحد ومشترك للنظام بالكامل للتحليل والمقارنة الدلالية',
    });
  };

  const handleReplaceProjectServiceRoleKey = (project: OcrProject) => {
    setKeyModalConfig({
      isOpen: true,
      keyType: 'service_role',
      projectId: project.id,
      projectName: project.name,
      isReplacing: true,
      title: `تحديث مفتاح Server Role لـ (${project.name})`,
      subtitle: 'يحدد هذا المفتاح دور القاعدة في Supabase وصلاحياتها الكاملة للقيادة والتحكم',
    });
  };

  const handleRemoveDeepseekKey = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إزالة مفتاح DeepSeek API المشترك للنظام؟')) {
      return;
    }
    try {
      const res = await api.removeDeepseekKey();
      setKeysStatus((prev) => ({ ...prev, hasDeepseekKey: false }));
      showToast(res.message || 'تمت إزالة مفتاح DeepSeek API');
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'فشل إزالة مفتاح DeepSeek', 'error');
    }
  };

  // Modal Save Callback
  const handleSaveKeyFromModal = async (keyValue: string) => {
    if (keyModalConfig.keyType === 'deepseek') {
      const res = await api.saveDeepseekKey(keyValue);
      setKeysStatus((prev) => ({ ...prev, hasDeepseekKey: true }));
      showToast(res.message || 'تم حفظ مفتاح DeepSeek API بنجاح');
      await loadData(false);
    } else if (keyModalConfig.keyType === 'ocr' && keyModalConfig.projectId) {
      const res = await api.updateProjectOcrKey(keyModalConfig.projectId, keyValue);
      setProjects((prev) =>
        prev.map((p) => (p.id === res.project.id ? res.project : p))
      );
      showToast(res.message || 'تم حفظ مفتاح OCR API للقاعدة بنجاح');
      await loadData(false);
    } else if (keyModalConfig.keyType === 'service_role') {
      if (keyModalConfig.projectId) {
        const res = await api.updateProjectServiceRoleKey(keyModalConfig.projectId, keyValue);
        setProjects((prev) =>
          prev.map((p) => (p.id === res.project.id ? res.project : p))
        );
        showToast(res.message || 'تم حفظ وتعيين Server Role للقاعدة بنجاح');
      } else {
        const res = await api.saveServiceRoleKey(keyValue);
        showToast(res.message || 'تم ربط مفتاح Service Role بنجاح');
      }
      await loadData(false);
    }
  };

  // Test Actions
  const handleTestProject = (project: OcrProject) => {
    setTestTargetProjectId(project.id);
    setIsTestModalOpen(true);
  };

  const handleOpenGeneralTest = () => {
    setTestTargetProjectId(undefined);
    setIsTestModalOpen(true);
  };

  // Filtered and Searched projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.project_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.priority_order.toString() === searchQuery.trim();

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const leaderProject = projects.find((p) => p.is_current_leader);
  const activeCount = projects.filter((p) => p.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              toastMessage.type === 'success' ? 'bg-slate-900 border border-slate-700' : 'bg-rose-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* VIEW 1: Personal Welcome Portal (الصفحة الشخصية قبل الدخول) */}
      {currentView === 'portal' && (
        <PersonalPortal
          onNavigate={(view) => setCurrentView(view)}
          projects={projects}
          connectionStatus={connectionStatus}
          keysStatus={keysStatus}
          onOpenQuickTest={handleOpenGeneralTest}
        />
      )}

      {/* VIEW 2: Community Hub (مجتمع) */}
      {currentView === 'community' && (
        <CommunityHub
          onBackToPortal={() => setCurrentView('portal')}
          onNavigateToOcr={() => setCurrentView('ocr')}
          showToast={showToast}
        />
      )}

      {/* VIEW 3: Course reminder management (separate from OCR and Community) */}
      {currentView === 'course_reminders' && (
        <CourseRemindersDashboard
          onBackToPortal={() => setCurrentView('portal')}
          showToast={showToast}
        />
      )}

      {/* VIEW 4: Full OCR Management & Routing Tool */}
      {currentView === 'ocr' && (
        <div className="flex flex-col min-h-screen">
          {/* Header with Navigation Tabs */}
          <Header
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenAddModal={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
            onOpenTestModal={handleOpenGeneralTest}
            onRefresh={() => loadData(false)}
            onBackToPortal={() => setCurrentView('portal')}
            onNavigateToCommunity={() => setCurrentView('community')}
            isRefreshing={isRefreshing}
            activeCount={activeCount}
            totalCount={projects.length}
            leaderName={leaderProject?.name || null}
          />

          {/* Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Error Banner if any */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => loadData(true)}
                  className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {/* TAB 1: Base Management Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* 1. Metrics & Overview */}
                <MetricsOverview
                  projects={projects}
                  connectionStatus={connectionStatus}
                  keysStatus={keysStatus}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onQuickLeaderSwitch={(id) => {
                    const target = projects.find((p) => p.id === id);
                    if (target) handleSetLeader(target);
                  }}
                  onManageDeepseekKey={handleManageDeepseekKey}
                  onRemoveDeepseekKey={handleRemoveDeepseekKey}
                  onOpenAddBaseModal={() => {
                    setEditingProject(null);
                    setIsProjectModalOpen(true);
                  }}
                  onOpenTestModal={handleOpenGeneralTest}
                  onOpenSqlModal={() => setIsSqlModalOpen(true)}
                />

                {/* 2. Control Bar (Search, Status Filter, Count) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="البحث باسم القاعدة، الرابط أو الترتيب..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-9 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          statusFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        الكل ({projects.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          statusFilter === 'active'
                            ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        النشطة ({activeCount})
                      </button>
                      <button
                        onClick={() => setStatusFilter('disabled')}
                        className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          statusFilter === 'disabled'
                            ? 'bg-white text-slate-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        المعطلة ({projects.length - activeCount})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
                    <span>حد التدوير التلقائي:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                      {settings.leadershipHandoverLimit} طلب
                    </span>
                  </div>
                </div>

                {/* 3. Base Cards & Grid View */}
                {isLoading ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-medium">جاري جلب قواعد Supabase المسجلة...</p>
                  </div>
                ) : (
                  <DatabaseTable
                    projects={filteredProjects}
                    keysStatus={keysStatus}
                    connectionStatus={connectionStatus}
                    onEdit={(p) => {
                      setEditingProject(p);
                      setIsProjectModalOpen(true);
                    }}
                    onDelete={(p) => setDeletingProject(p)}
                    onToggleStatus={handleToggleStatus}
                    onSetLeader={handleSetLeader}
                    onSimulateLoad={handleSimulateLoad}
                    onResetLoad={handleResetLoad}
                    onAddProject={() => {
                      setEditingProject(null);
                      setIsProjectModalOpen(true);
                    }}
                    onAddOcrKey={handleAddProjectOcrKey}
                    onReplaceOcrKey={handleReplaceProjectOcrKey}
                    onRemoveOcrKey={handleRemoveProjectOcrKey}
                    onAddServiceRoleKey={handleReplaceProjectServiceRoleKey}
                    onReplaceServiceRoleKey={handleReplaceProjectServiceRoleKey}
                    onTestProject={handleTestProject}
                    onViewErrors={handleViewErrors}
                  />
                )}

                {/* 4. Architecture and Security Info */}
                <ArchitectureInfo />

              </div>
            )}

            {/* TAB 2: External Ingestion API Gateway */}
            {activeTab === 'api_gateway' && (
              <div className="animate-in fade-in duration-150">
                <ApiGatewayDocs
                  projects={projects}
                  incomingTasks={incomingTasks}
                  showToast={showToast}
                />
              </div>
            )}

            {/* TAB 3: Testing & Simulation Sandbox Lab */}
            {activeTab === 'sandbox' && (
              <div className="animate-in fade-in duration-150">
                <OcrComparator
                  projects={projects}
                  onProjectLoadUpdated={() => loadData(false)}
                  showToast={showToast}
                />
              </div>
            )}

          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div>
                لوحة التحكم المركزية لإدارة وتوجيه قواعد الـ OCR وتوزيع الحمل لمشاريع <strong className="text-slate-800 font-semibold">Supabase</strong>
              </div>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  مفاتيح OCR و DeepSeek و Service Role مؤمنة في الخادم الخلفي فقط
                </span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Add / Edit Base Modal */}
      <DatabaseModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        editingProject={editingProject}
        defaultMaxRequests={settings.defaultMaxRequests}
        onOpenSqlSchemaModal={() => setIsSqlModalOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        projects={projects}
        connectionStatus={connectionStatus}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onSaveServiceRoleKey={handleSaveServiceRoleKey}
        onSetLeader={handleSetLeader}
        onBatchReset={handleBatchReset}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingProject)}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Key Management Modal (Add / Replace Key) */}
      <KeyModal
        isOpen={keyModalConfig.isOpen}
        onClose={() => setKeyModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={keyModalConfig.title}
        subtitle={keyModalConfig.subtitle}
        keyType={keyModalConfig.keyType}
        projectName={keyModalConfig.projectName}
        isReplacing={keyModalConfig.isReplacing}
        onSave={handleSaveKeyFromModal}
      />

      {/* SQL Schema Modal */}
      <SqlSchemaModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Base Testing Modal */}
      <BaseTestingModal
        isOpen={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setTestTargetProjectId(undefined);
        }}
        projects={projects}
        initialSelectedProjectId={testTargetProjectId}
      />

      {/* Base Errors and Requests Report Modal */}
      <BaseErrorsModal
        isOpen={isErrorsModalOpen}
        project={selectedErrorsProject}
        onClose={() => {
          setIsErrorsModalOpen(false);
          setSelectedErrorsProject(null);
        }}
        onResetErrors={handleResetErrors}
        onResetAllLoad={async (projectId) => {
          const target = projects.find((p) => p.id === projectId);
          if (target) await handleResetLoad(target);
        }}
      />
    </div>
  );
}

export default App;
