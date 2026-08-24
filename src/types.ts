export type ProjectStatus = 'active' | 'disabled';

export interface BaseErrorLog {
  id: string;
  timestamp: string;
  error: string;
  question?: string;
  statusCode?: number;
}

export interface OcrProject {
  id: string;
  name: string;
  project_url: string;
  status: ProjectStatus;
  is_current_leader: boolean;
  request_count: number;
  success_count: number;
  failure_count: number;
  last_failure_reason?: string;
  last_failure_at?: string | null;
  recent_errors?: BaseErrorLog[];
  load_limit: number;
  priority_order: number;
  has_service_role_key: boolean; // Indicates dedicated Service Role key exists
  has_ocr_api_key: boolean;      // Indicates dedicated OCR key exists (1:1 mapping)
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseConnectionStatus {
  hasServiceKey: boolean;
  isConnectedToSupabase: boolean;
  isTableFound: boolean;
  supabaseUrl: string | null;
  projectRef: string | null;
  mode: 'live_supabase' | 'local_storage';
  errorMessage?: string | null;
}

export interface SystemKeysStatus {
  hasServiceKey: boolean;
  hasDeepseekKey: boolean;
  hasDefaultOcrKey: boolean;
}

export interface ProjectFormData {
  name: string;
  project_url: string;
  status: ProjectStatus;
  load_limit: number;
  priority_order: number;
  service_role_key?: string;
  ocr_api_key?: string;
  is_current_leader?: boolean;
}

export interface SystemSettings {
  defaultMaxRequests: number;
  leadershipHandoverLimit: number;
  autoRotationEnabled: boolean;
  alertThresholdPercent: number;
  updatedAt?: string;
}

export interface BaseAttemptLog {
  projectId: string;
  projectName: string;
  status: 'completed' | 'failed';
  error?: string;
  durationMs?: number;
}

export interface OcrComparisonResult {
  id: string; // Unique image ID (e.g. img_xxxx)
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  questionText: string;
  extractedAnswer: string;
  similarityScore: number; // 0 to 100%
  matchVerdict: 'full_match' | 'partial_match' | 'no_match';
  matchedKeywords: string[];
  missingKeywords: string[];
  explanation?: string;
  processingTimeMs: number;
  processedByProject: {
    id: string;
    name: string;
  } | null;
  ocrEngineUsed?: string;
  createdAt: string;
  status: 'completed' | 'failed';
  errorMessage?: string;
  attemptedBases?: BaseAttemptLog[];
  failoverOccurred?: boolean;
  failoverNote?: string;
}

export interface BaseTestStep {
  ok: boolean;
  message: string;
  durationMs?: number;
  sampleText?: string;
}

export interface BaseTestReport {
  projectId: string;
  projectName: string;
  steps: {
    supabaseConnection: BaseTestStep;
    serviceRole: BaseTestStep;
    ocrApi: BaseTestStep;
    textExtraction: BaseTestStep;
    deepseek: BaseTestStep;
  };
  finalVerdict: {
    success: boolean;
    message: string;
    extractedAnswer?: string;
    similarityScore?: number;
  };
  totalDurationMs?: number;
}

export interface FacebookGroupTarget {
  id: string;
  name: string;
  url: string;
  groupUrl?: string; // Compatibility helper
  group_url?: string;
  isActive: boolean;
  is_active?: boolean;
  isValidGroup: boolean;
  validationError?: string | null;
  lastFetchedAt?: string | null;
  lastFetchStatus?: 'success' | 'failed' | 'pending' | 'never';
  postsCount?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookComment {
  id: string;
  source_comment_id?: string;
  sourceCommentId?: string;
  post_id: string; // Foreign Key to posts.id
  postId?: string;
  author_name?: string;
  authorName?: string;
  author_id?: string;
  authorId?: string;
  author_image_url?: string;
  authorImageUrl?: string;
  authorAvatar?: string; // Compatibility
  author_avatar?: string;
  comment_text: string;
  commentText?: string;
  comment_created_at?: string;
  commentCreatedAt?: string;
  createdAt?: string;
  fetched_at?: string;
  fetchedAt?: string;
  likes_count?: number;
  likesCount?: number;
  author_profile_id?: string;
  is_bot?: boolean;
  profile_type?: 'bot' | 'user' | 'admin';
  raw_data?: Record<string, any>;
  rawData?: Record<string, any>;
}

export interface CommunityProfile {
  id: string;
  display_name: string;
  author_name_key: string;
  avatar_url?: string | null;
  bio?: string | null;
  profile_type: 'bot' | 'user' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface FacebookPost {
  id: string; // Internal PK (UUID / Text)
  source_post_id?: string;
  sourcePostId?: string;
  group_id: string; // Foreign key to groups.id
  groupId?: string;
  group_name?: string;
  groupName?: string;
  group_url?: string;
  groupUrl?: string;
  post_url: string; // Distinct link to the Facebook post
  postUrl?: string;
  post_text: string; // Original post text (strictly unclassified)
  postText?: string;
  content?: string; // Compatibility
  author_profile_id?: string;
  profile_type?: 'bot' | 'user' | 'admin';
  is_bot?: boolean;
  post_created_at?: string;
  postCreatedAt?: string;
  postedAt?: string; // Compatibility
  media_urls?: string[]; // Array of image/video URLs
  mediaUrls?: string[];
  media_url?: string; // Single media helper
  mediaUrl?: string;
  media_type?: 'image' | 'video' | 'none';
  mediaType?: 'image' | 'video' | 'none';
  author_name?: string;
  authorName?: string;
  author_id?: string;
  authorId?: string;
  author_avatar?: string;
  authorAvatar?: string;
  comments_count?: number;
  commentsCount?: number;
  reactions_count?: number;
  reactionsCount?: number;
  likes_count?: number;
  likesCount?: number;
  source_api?: string;
  sourceApi?: string;
  source_type?: string;
  status?: string;
  fetched_at?: string;
  fetchedAt?: string;
  raw_data?: Record<string, any>;
  rawData?: Record<string, any>;
  comments?: FacebookComment[]; // Linked comments (max 50)
  targetDatabaseId?: string;
  targetDatabaseName?: string;
  isSyncedToBase1?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ApifyApiTokenConfig {
  id: 'APIFY_TOKEN_1' | 'APIFY_TOKEN_2' | 'APIFY_TOKEN_3' | 'APIFY_TOKEN_4';
  label: string;
  tokenMasked: string;
  isConfigured: boolean;
  lastUsedAt?: string | null;
  status: 'healthy' | 'standby' | 'rate_limited' | 'error';
}

export interface FacebookApifyConfig {
  tokens: ApifyApiTokenConfig[];
  activeTokenId: 'APIFY_TOKEN_1' | 'APIFY_TOKEN_2' | 'APIFY_TOKEN_3' | 'APIFY_TOKEN_4';
  postsEndpoint: string;
  commentsEndpoint: string;
  maxPostsPerRequest: number; // User decides
  includeMediaUrls: boolean;
  includeComments: boolean;
  includeGroupInfo: boolean;
  maxCommentsPerPost: number; // User decides: 0 to any number
  maxImagesPerPost: number; // User decides: 0, 1, 2, 5, 10, unlimited
  autoRotateTokens: boolean;
  scheduledTime?: string; // User decides execution time
  scheduleInterval?: 'manual' | 'hourly' | 'every_3h' | 'every_6h' | 'daily' | 'custom';
  isScheduledEnabled?: boolean;
  instantPublishMode?: boolean; // Instant live publishing toggle
  customFilterKeyword?: string;
  minPostLength?: number;
}

export interface GroupFetchProgress {
  currentGroupId: string | null;
  currentGroupName: string | null;
  currentGroupIndex: number;
  totalGroups: number;
  step: 'idle' | 'validating' | 'fetching_posts' | 'fetching_comments' | 'storing_supabase' | 'completed' | 'failed';
  postsFetched: number;
  postsStored: number;
  commentsStored: number;
  mediaCount: number;
  errorsCount: number;
  currentError?: string | null;
}

export interface FacebookPipelineRunLog {
  id: string;
  timestamp: string;
  groupId?: string;
  groupName?: string;
  groupUrl?: string;
  groupCount?: number;
  postsFetched: number;
  postsStored: number;
  commentsStored: number;
  mediaCount: number;
  usedTokenId: string;
  status: 'completed' | 'partial' | 'failed' | 'success';
  details: string;
  durationMs: number;
  error?: string | null;
}

export interface FacebookSyncResult {
  success: boolean;
  message: string;
  syncedPostsCount?: number;
  syncedCommentsCount?: number;
  fetchedCount?: number;
  fetchedCommentsCount?: number;
  mediaCount?: number;
  usedTokenId?: string;
  targetBase?: {
    id: string;
    name: string;
    project_url: string;
  };
  posts?: FacebookPost[];
  timestamp?: string;
  durationMs?: number;
  runLog?: FacebookPipelineRunLog;
  logs?: FacebookPipelineRunLog[];
  diagnostic?: {
    tokenUsed?: string;
    actorStatus?: string;
    groupNotice?: string;
    supabaseStatus?: string;
    mode?: string;
  };
  instantPublishedPost?: FacebookPost;
}

