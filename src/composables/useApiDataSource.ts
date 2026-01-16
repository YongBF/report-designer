/**
 * useApiDataSource.ts
 *
 * API 数据源处理 composable
 *
 * 功能包括：
 * - 发送 API 请求获取数据
 * - 应用数据转换配置（基础模式或高级模式）
 * - 错误处理和重试机制
 *
 * @module composables/useApiDataSource
 * @author Report Designer Team
 * @since 2025-01-16
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';

interface TransformConfig {
  mode: 'basic' | 'advanced';
  basic?: {
    dataPath: string;
    categoryField: string;
    seriesFields: Array<{
      name: string;
      field: string;
    }>;
  };
  advanced?: {
    transformFunction: string;
  };
}

interface ApiResponse {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

/**
 * API 数据源 composable
 */
export function useApiDataSource() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<ApiResponse | null>(null);

  /**
   * 发送 API 请求获取数据
   */
  async function fetchFromApi(
    url: string,
    method: 'GET' | 'POST',
    transformConfig?: TransformConfig
  ): Promise<ApiResponse | null> {
    loading.value = true;
    error.value = null;
    data.value = null;

    try {
      // 发送请求
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();

      // 应用数据转换
      const transformedData = applyTransform(rawData, transformConfig);

      data.value = transformedData;
      return transformedData;
    } catch (err: any) {
      error.value = err.message || '请求失败';
      ElMessage.error(`获取数据失败: ${error.value}`);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 应用数据转换
   */
  function applyTransform(response: any, config?: TransformConfig): ApiResponse {
    if (!config) {
      // 没有配置转换，尝试直接返回
      if (response.categories && response.series) {
        return response;
      }
      throw new Error('API 返回数据格式不正确，请配置数据转换');
    }

    if (config.mode === 'basic' && config.basic) {
      return applyBasicTransform(response, config.basic);
    } else if (config.mode === 'advanced' && config.advanced) {
      return applyAdvancedTransform(response, config.advanced.transformFunction);
    }

    throw new Error('无效的转换配置');
  }

  /**
   * 应用基础模式转换
   */
  function applyBasicTransform(
    data: any,
    config: TransformConfig['basic']!
  ): ApiResponse {
    if (!config) {
      throw new Error('基础模式转换配置为空');
    }

    // 获取数据路径中的数据
    let targetData = data;
    if (config.dataPath && config.dataPath !== 'data' && config.dataPath !== '.') {
      const paths = config.dataPath.split('.');
      for (const path of paths) {
        if (path && targetData && targetData[path] !== undefined) {
          targetData = targetData[path];
        }
      }
    } else {
      targetData = data.data || data;
    }

    if (!Array.isArray(targetData)) {
      throw new Error('数据路径解析结果不是数组');
    }

    if (targetData.length === 0) {
      throw new Error('数据为空');
    }

    // 提取类别
    const categories = targetData.map((item: any) => {
      const value = config.categoryField ? item[config.categoryField] : item;
      return value?.toString() || '';
    });

    // 提取系列数据
    const series = config.seriesFields.map((sf) => {
      const seriesData = targetData.map((item: any) => {
        const value = sf.field ? item[sf.field] : item;
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });

      return {
        name: sf.name,
        data: seriesData,
      };
    });

    return { categories, series };
  }

  /**
   * 应用高级模式转换（JavaScript 函数）
   */
  function applyAdvancedTransform(data: any, transformFunction: string): ApiResponse {
    if (!transformFunction) {
      throw new Error('转换函数为空');
    }

    try {
      // 创建转换函数
      const func = new Function(
        'response',
        `${transformFunction}\nreturn transform(response);`
      );

      const result = func(data);

      // 验证返回结果格式
      if (!result || !result.categories || !Array.isArray(result.series)) {
        throw new Error('转换函数返回格式不正确');
      }

      return result;
    } catch (err: any) {
      throw new Error(`执行转换函数失败: ${err.message}`);
    }
  }

  /**
   * 清除状态
   */
  function clear() {
    loading.value = false;
    error.value = null;
    data.value = null;
  }

  return {
    // 状态
    loading,
    error,
    data,
    // 方法
    fetchFromApi,
    applyTransform,
    clear,
  };
}
