/**
 * 工具函数统一导出
 *
 * @module utils/index
 */

export * from './componentUtils';
export * from './componentData';
export * from './export';

/**
 * 生成唯一 ID
 *
 * 基于时间戳和随机数生成唯一标识符
 *
 * @returns 唯一 ID 字符串，格式为 "时间戳-随机字符串"
 *
 * @example
 * ```typescript
 * const id = generateId() // "1642234567890-abc123xyz"
 * ```
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深拷贝对象
 *
 * 使用 JSON 序列化/反序列化实现对象的深拷贝
 *
 * @template T - 对象类型
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的新对象
 * @throws {Error} 当对象包含循环引用或不可序列化的内容时抛出错误
 *
 * @example
 * ```typescript
 * const original = { name: 'John', age: 30 }
 * const copy = deepClone(original)
 * ```
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('深拷贝失败:', error);
    throw new Error('无法深拷贝对象：可能包含循环引用或不可序列化的内容');
  }
}

/**
 * 下载文件
 *
 * 在浏览器中触发文件下载
 *
 * @param content - 文件内容
 * @param filename - 文件名
 * @param type - MIME 类型
 * @throws {Error} 当文件下载失败时抛出错误
 *
 * @example
 * ```typescript
 * downloadFile('Hello World', 'test.txt', 'text/plain')
 * ```
 */
export function downloadFile(content: string, filename: string, type: string): void {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('文件下载失败:', error);
    throw new Error(`下载文件 "${filename}" 失败`);
  }
}
