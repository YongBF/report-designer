/**
 * 本地存储相关常量
 */

/**
 * 本地存储键名前缀
 */
export const STORAGE_PREFIX = 'report_designer_';

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  CURRENT_DESIGN: `${STORAGE_PREFIX}current`,
  USER_SETTINGS: `${STORAGE_PREFIX}settings`,
  RECENT_FILES: `${STORAGE_PREFIX}recent`,
} as const;
