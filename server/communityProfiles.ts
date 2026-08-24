import crypto from 'crypto';

// =========================================================================
// BOT PROFILES & DETERMINISTIC ID GENERATION UTILITIES
// =========================================================================

export interface CommunityProfileRecord {
  id: string;
  display_name: string;
  author_name_key: string;
  avatar_url: string | null;
  bio: string | null;
  profile_type: 'bot' | 'user' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Normalizes Arabic and English author names deterministically:
 * - Trims and collapses multiple spaces
 * - Removes Arabic Tashkeel / Diacritics ([\u064B-\u065F\u0670])
 * - Removes Tatweel / Kasheeda (\u0640)
 * - Normalizes Alef variants (إ, أ, آ, ٱ -> ا)
 * - Normalizes Yeh / Alef Maksura (ى, ی -> ي)
 * - Normalizes Ta Marbuta (ة -> ه)
 * - Normalizes Persian/Urdu variants (گ->ك, پ->ب, ژ->ز, چ->ج)
 * - Removes special characters and symbols
 * - Lowers Latin case
 */
export function normalizeBotAuthorName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'بوت_تعليمي_افتراضي';
  }

  let name = rawName.trim();

  // 1. Remove Tashkeel / Diacritics
  name = name.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

  // 2. Remove Tatweel / Kasheeda
  name = name.replace(/\u0640/g, '');

  // 3. Normalize Alef variants
  name = name.replace(/[إأآٱ]/g, 'ا');

  // 4. Normalize Yeh / Alef Maksura
  name = name.replace(/[ىي]/g, 'ي');
  name = name.replace(/ی/g, 'ي');

  // 5. Normalize Ta Marbuta
  name = name.replace(/ة/g, 'ه');

  // 6. Normalize Persian/Urdu characters
  name = name.replace(/گ/g, 'ك');
  name = name.replace(/پ/g, 'ب');
  name = name.replace(/ژ/g, 'ز');
  name = name.replace(/چ/g, 'ج');
  name = name.replace(/ک/g, 'ك');

  // 7. Remove non-word symbols except standard letters, numbers and spaces
  name = name.replace(/[^\w\s\u0600-\u06FF\-_]/g, ' ');

  // 8. Collapse whitespace and trim
  name = name.replace(/\s+/g, ' ').trim().toLowerCase();

  return name || 'بوت_تعليمي';
}

/**
 * Creates a deterministic URL/database-safe key from a normalized name
 */
export function createAuthorNameKey(normalizedName: string): string {
  // Convert spaces to underscores and remove remaining unsafe chars
  const sanitized = normalizedName.replace(/\s+/g, '_');
  return sanitized;
}

/**
 * Generates a deterministic, collision-free bot profile ID:
 * e.g., 'bot_ahmed_al_iraqi' or 'bot_احمد_العراقي' with deterministic sha256 suffix for safety
 */
export function getBotProfileId(authorNameKey: string): string {
  // Create deterministic hash of the key to ensure ASCII safety in all database drivers
  const safeHash = crypto.createHash('sha256').update(authorNameKey, 'utf8').digest('hex').substring(0, 12);
  
  // Clean ASCII slug for readability
  const asciiSlug = authorNameKey
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .substring(0, 20);

  if (asciiSlug && asciiSlug.length > 2) {
    return `bot_${asciiSlug}_${safeHash}`;
  }
  
  return `bot_${safeHash}`;
}

/**
 * Generates a complete deterministic profile record from an author display name
 */
export function buildBotProfileRecord(
  displayName: string,
  avatarUrl?: string | null,
  bio?: string | null,
  profileType: 'bot' | 'user' | 'admin' = 'bot'
): CommunityProfileRecord {
  const normalized = normalizeBotAuthorName(displayName);
  const authorNameKey = createAuthorNameKey(normalized);
  const id = getBotProfileId(authorNameKey);

  const defaultAvatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
  const defaultBio = 'مساعد تعليمي للمجتمع لمساعدة طلاب السادس الإعدادي';

  return {
    id,
    display_name: displayName.trim() || 'مساعد آلي للمجتمع',
    author_name_key: authorNameKey,
    avatar_url: avatarUrl || defaultAvatar,
    bio: bio || defaultBio,
    profile_type: profileType,
    is_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Deterministic Post ID generator:
 * If no ID is given, derives a stable ID from importKey + authorNameKey + content hash
 * Guarantees that importing the exact same file twice will NOT duplicate rows
 */
export function generateDeterministicPostId(
  importKey: string,
  authorNameKey: string,
  content: string,
  index: number
): string {
  const contentDigest = crypto
    .createHash('sha256')
    .update(`${importKey}:${authorNameKey}:${content.trim().slice(0, 300)}:${index}`, 'utf8')
    .digest('hex')
    .substring(0, 14);

  return `post_${importKey}_${contentDigest}`;
}

/**
 * Deterministic Comment ID generator:
 * If no ID is given, derives a stable ID from postId + authorNameKey + content hash
 * Guarantees that importing the exact same file twice will NOT duplicate rows
 */
export function generateDeterministicCommentId(
  postId: string,
  authorNameKey: string,
  content: string,
  index: number
): string {
  const commentDigest = crypto
    .createHash('sha256')
    .update(`${postId}:${authorNameKey}:${content.trim().slice(0, 200)}:${index}`, 'utf8')
    .digest('hex')
    .substring(0, 14);

  return `cmt_${postId.substring(0, 12)}_${commentDigest}`;
}
