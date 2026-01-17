/**
 * 防抖更新 Composable
 *
 * 用于对输入框的更新操作进行防抖处理，避免频繁更新导致性能问题
 *
 * @module composables/useDebounceUpdate
 * @author Report Designer Team
 * @since 2026-01-17
 */

import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export interface UseDebounceUpdateOptions {
  /** 防抖延迟时间（毫秒），默认 300ms */
  delay?: number;
  /** 是否立即执行第一次更新，默认 false */
  immediate?: boolean;
}

/**
 * 防抖更新 Hook
 *
 * @param updateFn - 实际执行的更新函数
 * @param options - 配置选项
 * @returns 防抖后的更新函数和临时值
 *
 * @example
 * ```typescript
 * const { debouncedUpdate, tempValue } = useDebounceUpdate(
 *   (value: string) => {
 *     designerStore.updateComponent(componentId, { content: value });
 *   },
 *   { delay: 300 }
 * );
 *
 * // 在模板中使用 v-model 绑定 tempValue
 * // 监听 @input 触发 debouncedUpdate
 * ```
 */
export function useDebounceUpdate<T>(
  updateFn: (value: T) => void,
  options: UseDebounceUpdateOptions = {}
) {
  const { delay = 300, immediate = false } = options;

  // 临时值，用于 v-model 绑定
  const tempValue = ref<T>() as Ref<T>;

  // 防抖定时器
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * 防抖更新函数
   */
  function debouncedUpdate(value: T) {
    // 更新临时值
    tempValue.value = value;

    // 清除之前的定时器
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // 如果是立即执行模式
    if (immediate && timeoutId === null) {
      updateFn(value);
      return;
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      updateFn(value);
      timeoutId = null;
    }, delay);
  }

  /**
   * 立即执行更新（忽略防抖）
   */
  function flush() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (tempValue.value !== undefined) {
      updateFn(tempValue.value);
    }
  }

  /**
   * 取消防抖
   */
  function cancel() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  return {
    debouncedUpdate,
    tempValue,
    flush,
    cancel,
  };
}

/**
 * 创建带防抖的输入处理器
 *
 * 适用于表单输入场景，提供更简洁的 API
 *
 * @example
 * ```typescript
 * const inputHandler = useDebouncedInput(
 *   (value) => designerStore.updateComponent(id, { content: value }),
 *   300
 * );
 *
 * // 在模板中
 * // <el-input :model-value="inputHandler.displayValue" @input="inputHandler.handleInput" />
 * ```
 */
export function useDebouncedInput<T>(
  updateFn: (value: T) => void,
  delay = 300
) {
  const displayValue = ref<T>() as Ref<T>;
  const { debouncedUpdate, flush } = useDebounceUpdate(updateFn, { delay });

  function handleInput(value: T) {
    displayValue.value = value;
    debouncedUpdate(value);
  }

  return {
    displayValue,
    handleInput,
    flush,
  };
}

export default useDebounceUpdate;
