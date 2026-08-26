import { OcrProject, ProjectFormData, SupabaseConnectionStatus, OcrComparisonResult, SystemKeysStatus, FacebookPost } from './types';

const API_BASE = '/api';

export async function fetchProjects(): Promise<{ projects: OcrProject[]; source: string; warning?: string }> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل جلب مشاريع OCR من قاعدة البيانات');
  }
  return res.json();
}

export async function fetchConnectionStatus(): Promise<SupabaseConnectionStatus> {
  const res = await fetch(`${API_BASE}/connection-status`);
  if (!res.ok) {
    throw new Error('فشل فحص حالة الاتصال بـ Supabase');
  }
  return res.json();
}

// System Keys Status (Booleans only - never returns secret values)
export async function fetchKeysStatus(): Promise<SystemKeysStatus> {
  const res = await fetch(`${API_BASE}/config/keys-status`);
  if (!res.ok) {
    return { hasServiceKey: false, hasDeepseekKey: false, hasDefaultOcrKey: false };
  }
  return res.json();
}

// DeepSeek API Key Management
export async function saveDeepseekKey(key: string): Promise<{ success: boolean; hasDeepseekKey: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/config/deepseek-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل حفظ مفتاح DeepSeek API');
  }
  return res.json();
}

export async function removeDeepseekKey(): Promise<{ success: boolean; hasDeepseekKey: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/config/deepseek-key`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل إزالة مفتاح DeepSeek API');
  }
  return res.json();
}

// Project OCR API Key Management
export async function updateProjectOcrKey(projectId: string, key: string): Promise<{ success: boolean; project: OcrProject; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/ocr-key`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تحديث مفتاح OCR API لهذا المشروع');
  }
  return res.json();
}

export async function removeProjectOcrKey(projectId: string): Promise<{ success: boolean; project: OcrProject; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/ocr-key`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل إزالة مفتاح OCR API من هذا المشروع');
  }
  return res.json();
}

export async function updateProjectServiceRoleKey(projectId: string, key: string): Promise<{ success: boolean; project: OcrProject; message: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/service-role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تحديث مفتاح Service Role لهذه القاعدة');
  }
  return res.json();
}

export async function saveServiceRoleKey(serviceRoleKey: string): Promise<{ success: boolean; mode: string; tableExists?: boolean; url?: string; ref?: string; message: string }> {
  const res = await fetch(`${API_BASE}/config/supabase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceRoleKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'فشل التحقق من مفتاح Service Role');
  }
  return res.json();
}

export async function createProject(formData: ProjectFormData & { service_role_key?: string }): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل إنشاء المشروع');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, formData: Partial<ProjectFormData & { is_current_leader?: boolean }>): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تعديل المشروع');
  }
  const data = await res.json();
  return data.project;
}

export async function toggleProjectStatus(id: string): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تغيير حالة المشروع');
  }
  const data = await res.json();
  return data.project;
}

export async function setLeaderProject(id: string): Promise<{ leaderId: string; project: OcrProject }> {
  const res = await fetch(`${API_BASE}/projects/${id}/set-leader`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تعيين المشروع كقائد');
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل حذف المشروع');
  }
}

export async function simulateProjectLoad(id: string, count: number = 10): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل محاكاة الطلبات');
  }
  const data = await res.json();
  return data.project;
}

export async function resetProjectErrors(id: string): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects/${id}/reset-errors`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تصفير سجل الأخطاء');
  }
  const data = await res.json();
  return data.project;
}

export async function resetProjectLoad(id: string): Promise<OcrProject> {
  const res = await fetch(`${API_BASE}/projects/${id}/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تصفير الطلبات');
  }
  const data = await res.json();
  return data.project;
}

export async function batchResetProjects(): Promise<OcrProject[]> {
  const res = await fetch(`${API_BASE}/projects/batch-reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل تصفير عدادات المشاريع');
  }
  const data = await res.json();
  return data.projects || [];
}

// OCR Processing & Comparison API
export async function processOcrImage(params: {
  imageBase64: string;
  questionText: string;
  fileName?: string;
  fileSize?: number;
  language?: string;
  projectId?: string;
}): Promise<OcrComparisonResult> {
  const res = await fetch(`${API_BASE}/ocr/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل استخراج النص والمقارنة');
  }
  return data.result;
}

export async function fetchOcrHistory(): Promise<OcrComparisonResult[]> {
  const res = await fetch(`${API_BASE}/ocr/history`);
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.history || [];
}

export async function deleteOcrHistoryItem(id: string): Promise<void> {
  await fetch(`${API_BASE}/ocr/history/${id}`, { method: 'DELETE' });
}

export async function clearOcrHistory(): Promise<void> {
  await fetch(`${API_BASE}/ocr/history`, { method: 'DELETE' });
}

export async function testProject(projectId: string, imageBase64?: string): Promise<import('./types').BaseTestReport> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل اختبار القاعدة');
  }
  return data;
}

export async function testBatchProjects(projectIds: string[]): Promise<{ reports: import('./types').BaseTestReport[] }> {
  const res = await fetch(`${API_BASE}/projects/test-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectIds }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل اختبار القواعد المحددة');
  }
  return data;
}

// ==========================================
// COMMUNITY: 6TH PREPARATORY FACEBOOK PIPELINE & 4-API ROTATION (BASE 1)
// ==========================================

export async function fetchFacebookPosts(): Promise<{
  posts: import('./types').FacebookPost[];
  base1: { id: string; name: string; url: string };
  source: string;
}> {
  const res = await fetch(`${API_BASE}/community/facebook-posts`);
  if (!res.ok) {
    throw new Error('فشل جلب منشورات الفيسبوك من القاعدة الأولى');
  }
  return res.json();
}

export async function fetchCommunityConfig(): Promise<{
  groups: import('./types').FacebookGroupTarget[];
  apifyConfig: import('./types').FacebookApifyConfig;
  runLogs: import('./types').FacebookPipelineRunLog[];
  base1?: { id: string; name: string; url: string };
}> {
  const res = await fetch(`${API_BASE}/community/config`);
  if (!res.ok) {
    throw new Error('فشل جلب إعدادات مسار سحب منشورات المجموعات');
  }
  return res.json();
}

export async function updateCommunityConfig(payload: {
  groups?: import('./types').FacebookGroupTarget[];
  apifyConfig?: Partial<import('./types').FacebookApifyConfig>;
}): Promise<{
  success: boolean;
  message: string;
  groups: import('./types').FacebookGroupTarget[];
  apifyConfig: import('./types').FacebookApifyConfig;
}> {
  const res = await fetch(`${API_BASE}/community/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تحديث الإعدادات');
  }
  return data;
}

export async function updateApifyToken(tokenId: string, tokenValue: string): Promise<{
  success: boolean;
  message: string;
  apifyConfig: import('./types').FacebookApifyConfig;
}> {
  const res = await fetch(`${API_BASE}/community/apify/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId, tokenValue }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل حفظ مفتاح Apify');
  }
  return data;
}

export async function runCommunityPipeline(options?: {
  groupId?: string;
  maxPosts?: number;
  maxComments?: number;
  maxImages?: number;
  includeImages?: boolean;
  includeComments?: boolean;
  forcedTokenId?: string;
}): Promise<import('./types').FacebookSyncResult> {
  const res = await fetch(`${API_BASE}/community/run-pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options || {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تشغيل عملية جلب بيانات المجموعات');
  }
  return data;
}

export async function addFacebookTargetGroup(payload: {
  name: string;
  url: string;
}): Promise<{ success: boolean; group: import('./types').FacebookGroupTarget; groups: import('./types').FacebookGroupTarget[] }> {
  const res = await fetch(`${API_BASE}/community/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل إضافة رابط المجموعة');
  }
  return data;
}

export async function updateFacebookTargetGroup(
  id: string,
  payload: { name?: string; url?: string; isActive?: boolean }
): Promise<{ success: boolean; group: import('./types').FacebookGroupTarget; groups: import('./types').FacebookGroupTarget[] }> {
  const res = await fetch(`${API_BASE}/community/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تعديل المجموعة');
  }
  return data;
}

export async function toggleFacebookGroupActive(id: string): Promise<{ success: boolean; group: import('./types').FacebookGroupTarget; groups: import('./types').FacebookGroupTarget[] }> {
  const res = await fetch(`${API_BASE}/community/groups/${id}/toggle`, {
    method: 'PATCH',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تغيير حالة المجموعة');
  }
  return data;
}

export async function deleteFacebookTargetGroup(id: string): Promise<{ success: boolean; groups: import('./types').FacebookGroupTarget[] }> {
  const res = await fetch(`${API_BASE}/community/groups/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل حذف المجموعة');
  }
  return data;
}

export async function addFacebookComment(
  postId: string,
  commentText: string,
  authorName?: string
): Promise<{ success: boolean; comment: import('./types').FacebookComment; message: string }> {
  const res = await fetch(`${API_BASE}/community/facebook-posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentText, authorName }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل إضافة التعليق');
  }
  return data;
}

export async function reactToFacebookPost(
  postId: string,
  reaction: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' = 'like'
): Promise<{ success: boolean; post: import('./types').FacebookPost }> {
  const res = await fetch(`${API_BASE}/community/facebook-posts/${postId}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تسجيل التفاعل');
  }
  return data;
}

export async function createManualFacebookPost(payload: {
  groupId?: string;
  groupName?: string;
  groupUrl?: string;
  postText: string;
  mediaUrls?: string[];
  postUrl?: string;
  authorName?: string;
}): Promise<{ success: boolean; post: import('./types').FacebookPost; message: string }> {
  const res = await fetch(`${API_BASE}/community/facebook-posts/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل إنشاء المنشور');
  }
  return data;
}

export async function clearFacebookPosts(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/community/facebook-posts`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function deleteSingleFacebookPost(postId: string): Promise<{ success: boolean; message: string; posts?: FacebookPost[] }> {
  const res = await fetch(`${API_BASE}/community/facebook-posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل حذف المنشور' }));
    throw new Error(err.error || 'فشل حذف المنشور');
  }
  return res.json();
}

export async function updatePostModerationStatus(postId: string, status: string, reason?: string): Promise<{ success: boolean; message: string; post?: any }> {
  const res = await fetch(`${API_BASE}/v1/community/admin/posts/${encodeURIComponent(postId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل تحديث حالة المنشور' }));
    throw new Error(err.error || 'فشل تحديث حالة المنشور');
  }
  return res.json();
}

export async function bulkModerateCommunityPosts(action: 'delete' | 'approve' | 'reject' | 'hide', postIds: string[]): Promise<{ success: boolean; message: string; posts?: FacebookPost[] }> {
  const res = await fetch(`${API_BASE}/community/posts/bulk-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, postIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل تنفيذ الإجراء الجماعي' }));
    throw new Error(err.error || 'فشل تنفيذ الإجراء الجماعي');
  }
  return res.json();
}

export async function importApifyBatchJson(params: {
  items: any[];
  targetGroupName?: string;
  autoApprove?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  importedPostsCount: number;
  importedCommentsCount: number;
  posts: FacebookPost[];
}> {
  const res = await fetch(`${API_BASE}/community/apify-batch-json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل استيراد حزمة Apify' }));
    throw new Error(err.error || 'فشل استيراد حزمة Apify');
  }
  return res.json();
}

export interface SystemDiagnosticsResult {
  timestamp: string;
  supabase: {
    isConnected: boolean;
    url: string | null;
    tablesStatus: Record<string, { exists: boolean; message: string; rows?: number }>;
    missingTables: string[];
    sqlMigration: string;
  };
  apify: {
    tokens: Array<{ id: string; masked: string; isValid: boolean; username?: string; error?: string }>;
    allTokensValid: boolean;
  };
  targets: Array<{
    name: string;
    inputUrl: string;
    canonicalUrl: string;
    isRedirected: boolean;
    facebookStatus: string;
    requiresLogin: boolean;
  }>;
  summaryMessage: string;
}

export async function fetchSystemDiagnostics(): Promise<SystemDiagnosticsResult> {
  const res = await fetch(`${API_BASE}/community/diagnostics`);
  if (!res.ok) {
    throw new Error('فشل جلب نتائج فحص التشخيص');
  }
  return res.json();
}

export interface LinkInspectionResult {
  success: boolean;
  timestamp: string;
  executionTimeMs: number;
  inputUrl: string;
  canonicalUrl: string;
  isRedirected: boolean;
  httpProbe: {
    status: number;
    title: string;
    requiresLogin: boolean;
    isPrivateGroup: boolean;
    notes: string;
  };
  apifyExecution: {
    actorId: string;
    tokenId: string;
    tokenMasked: string;
    status: number;
    hasItems: boolean;
    itemsCount: number;
    rawError?: string;
    rawPayload: any;
  };
  extractedPosts: Array<FacebookPost>;
  sampleCurriculumPosts: Array<FacebookPost>;
}

export async function inspectFacebookLink(payload: {
  url: string;
  tokenId?: string;
  maxPosts?: number;
  maxComments?: number;
  includeImages?: boolean;
}): Promise<LinkInspectionResult> {
  const res = await fetch(`${API_BASE}/community/inspect-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل فحص الرابط' }));
    throw new Error(err.error || 'فشل فحص الرابط');
  }
  return res.json();
}

export async function saveInspectedPosts(posts: FacebookPost[]): Promise<{
  success: boolean;
  savedCount: number;
  posts: FacebookPost[];
  message: string;
}> {
  const res = await fetch(`${API_BASE}/community/save-inspected-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ posts }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل حفظ المنشورات المعاينة' }));
    throw new Error(err.error || 'فشل حفظ المنشورات المعاينة');
  }
  return res.json();
}

// =========================================================================
// COMMUNITY API V1 CLIENT METHODS (FOR SITE 1 & ADMIN DASHBOARD)
// =========================================================================

// Client-Side Session & Token Storage Manager
let inMemoryAuthToken: string = '';

export function getStoredAuthToken(): string {
  if (inMemoryAuthToken && inMemoryAuthToken.trim()) {
    return inMemoryAuthToken.trim();
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored =
      localStorage.getItem('sb_access_token') ||
      localStorage.getItem('supabase_auth_token') ||
      localStorage.getItem('sb-access-token') ||
      localStorage.getItem('admin_jwt_token') ||
      sessionStorage.getItem('sb_access_token') ||
      '';
    if (stored && stored.trim()) return stored.trim();

    // Check Supabase SDK default localstorage keys (sb-<ref>-auth-token)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || '{}');
          if (parsed.access_token) return parsed.access_token;
        } catch (_) {}
      }
    }
  }
  return '';
}

export function setStoredAuthToken(token: string): void {
  inMemoryAuthToken = (token || '').trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    if (inMemoryAuthToken) {
      localStorage.setItem('sb_access_token', inMemoryAuthToken);
    } else {
      localStorage.removeItem('sb_access_token');
    }
  }
}

export function getAuthHeaders(
  customToken?: string,
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  const token = (customToken && customToken.trim()) || getStoredAuthToken();
  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPublishedPosts(params?: {
  cursor?: string;
  limit?: number;
  type?: string;
  search?: string;
  group_id?: string;
}): Promise<{
  success: boolean;
  posts: any[];
  count: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set('cursor', params.cursor);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type) query.set('type', params.type);
  if (params?.search) query.set('search', params.search);
  if (params?.group_id) query.set('group_id', params.group_id);

  const res = await fetch(`/api/v1/community/posts?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل جلب منشورات المجتمع' }));
    throw new Error(err.error || 'فشل جلب منشورات المجتمع');
  }
  return res.json();
}

export async function createStudentPost(
  payload: {
    content: string;
    post_type?: string;
    media?: any[];
    media_urls?: string[];
    group_id?: string;
    group_name?: string;
  },
  token?: string
): Promise<{ success: boolean; post: any; message: string }> {
  const headers = getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch('/api/v1/community/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل نشر المشاركة' }));
    throw new Error(err.error || 'فشل نشر المشاركة');
  }
  return res.json();
}

export async function fetchAdminCommunityStats(tokenOrSecret?: string): Promise<{ success: boolean; stats: any }> {
  const headers = getAuthHeaders(tokenOrSecret);
  if (tokenOrSecret && !tokenOrSecret.startsWith('Bearer ') && tokenOrSecret.length < 100) {
    headers['x-admin-secret'] = tokenOrSecret;
  }

  const res = await fetch('/api/v1/community/admin/stats', { headers });
  if (!res.ok) {
    throw new Error('فشل جلب إحصائيات المجتمع');
  }
  return res.json();
}

export async function moderatePostStatus(
  postId: string,
  status: 'published' | 'pending' | 'rejected' | 'hidden' | 'deleted',
  reason?: string,
  tokenOrSecret?: string
): Promise<{ success: boolean; message: string }> {
  const headers = getAuthHeaders(tokenOrSecret, { 'Content-Type': 'application/json' });
  if (tokenOrSecret && !tokenOrSecret.startsWith('Bearer ') && tokenOrSecret.length < 100) {
    headers['x-admin-secret'] = tokenOrSecret;
  }

  const res = await fetch(`/api/v1/community/admin/posts/${postId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل تحديث حالة المنشور' }));
    throw new Error(err.error || 'فشل تحديث حالة المنشور');
  }
  return res.json();
}

export async function fetchDashboardAdmins(token?: string): Promise<{
  success: boolean;
  maxCapacity: number;
  activeCount: number;
  remainingSeats: number;
  isFull: boolean;
  activeAdmins: any[];
  revokedAdmins: any[];
  currentUserRole: string;
}> {
  const headers = getAuthHeaders(token);

  const res = await fetch('/api/v1/community/admin/admins', { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل جلب الحسابات الإدارية' }));
    throw new Error(err.error || 'فشل جلب الحسابات الإدارية');
  }
  return res.json();
}

export async function addDashboardAdminUser(
  payload: { user_id: string; display_name?: string; email?: string },
  token?: string
): Promise<{ success: boolean; message: string; admin: any }> {
  const headers = getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch('/api/v1/community/admin/admins', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل إضافة المشرف' }));
    throw new Error(err.error || 'فشل إضافة المشرف');
  }
  return res.json();
}

export async function revokeDashboardAdminUser(
  userId: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  const headers = getAuthHeaders(token);

  const res = await fetch(`/api/v1/community/admin/admins/${userId}/revoke`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل إلغاء الحساب الإداري' }));
    throw new Error(err.error || 'فشل إلغاء الحساب الإداري');
  }
  return res.json();
}

export async function restoreDashboardAdminUser(
  userId: string,
  token?: string
): Promise<{ success: boolean; message: string }> {
  const headers = getAuthHeaders(token);

  const res = await fetch(`/api/v1/community/admin/admins/${userId}/restore`, {
    method: 'PATCH',
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل استعادة الحساب الإداري' }));
    throw new Error(err.error || 'فشل استعادة الحساب الإداري');
  }
  return res.json();
}

// Community Manual JSON Import (Parsed, Validated, Upserted to Supabase B)
export async function importCommunityJsonData(
  payload: any,
  token?: string
): Promise<{
  success: boolean;
  message: string;
  report: {
    batch_id: string;
    posts: { total_received: number; inserted: number; updated: number; skipped: number };
    comments: { total_received: number; inserted: number; updated: number; skipped: number; bot_comments: number };
    duration_ms: number;
    skipped_reasons: string[];
  };
}> {
  const headers = getAuthHeaders(token, { 'Content-Type': 'application/json' });

  const res = await fetch('/api/v1/community/admin/import-json', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'فشل استيراد ملف JSON' }));
    throw new Error(err.error || 'فشل استيراد ملف JSON إلى قاعدة البيانات');
  }
  return res.json();
}







export interface CourseReminder {
  id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export async function fetchCourseReminders(token?: string): Promise<{
  success: boolean;
  count: number;
  reminders: CourseReminder[];
}> {
  const headers = getAuthHeaders(token);
  const res = await fetch('/api/v1/community/admin/course-reminders', { headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'فشل جلب تذكيرات الدورات');
  }
  return data;
}
