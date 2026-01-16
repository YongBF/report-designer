/**
 * apiHelper.ts
 *
 * API 请求辅助函数
 *
 * 功能：
 * - 处理联动参数与 API 请求的合并
 * - 支持请求拦截器
 * - 统一的 API 请求处理
 *
 * @module utils/apiHelper
 * @author Report Designer Team
 * @since 2025-01-16
 */

import type { DataSource } from '../types';

/**
 * 执行带联动参数的 API 请求
 *
 * @param dataSource - 数据源配置
 * @param linkageParams - 联动参数
 * @param beforeRequest - 请求拦截器代码（可选）
 * @returns API 响应数据
 */
export async function fetchWithLinkageParams(
  dataSource: DataSource,
  linkageParams: Record<string, any> = {},
  beforeRequest?: string
): Promise<any> {
  if (!dataSource || dataSource.type !== 'api') {
    throw new Error('数据源不是 API 类型');
  }

  const { apiUrl, apiMethod = 'POST', apiParams = {} } = dataSource;

  console.log('[API Helper] 准备发送请求:', {
    url: apiUrl,
    method: apiMethod,
    apiParams,
    linkageParams,
  });

  // 构建请求配置对象
  const requestConfig: any = {
    url: apiUrl,
    method: apiMethod,
    headers: {
      'Content-Type': 'application/json',
    },
    body: null,
  };

  // 合并参数：基础参数 + 联动参数（联动参数优先级更高）
  const finalParams = {
    ...apiParams,
    ...linkageParams,
  };

  // 如果是 GET 请求，将参数添加到 URL
  if (apiMethod.toUpperCase() === 'GET') {
    const urlObj = new URL(apiUrl, window.location.origin);
    Object.keys(finalParams).forEach(key => {
      urlObj.searchParams.set(key, JSON.stringify(finalParams[key]));
    });
    requestConfig.url = urlObj.toString();
  } else {
    // POST/PUT/DELETE 等请求，参数放在 body 中
    requestConfig.body = JSON.stringify(finalParams);
  }

  // 如果有请求拦截器，执行它
  if (beforeRequest) {
    try {
      console.log('[API Helper] 执行请求拦截器...');
      const interceptorFn = new Function(
        'config',
        'linkageParams',
        'console',
        'window',
        `return (${beforeRequest})(config, linkageParams)`
      );

      const modifiedConfig = await interceptorFn(
        requestConfig,
        linkageParams,
        console,
        window
      );

      if (modifiedConfig) {
        Object.assign(requestConfig, modifiedConfig);
        console.log('[API Helper] 拦截器已修改请求配置:', requestConfig);
      }
    } catch (error) {
      console.error('[API Helper] 请求拦截器执行失败:', error);
      throw new Error(`请求拦截器错误: ${error}`);
    }
  }

  console.log('[API Helper] 发送请求:', requestConfig);

  // 发送请求
  const response = await fetch(requestConfig.url, {
    method: requestConfig.method,
    headers: requestConfig.headers,
    body: requestConfig.body,
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('[API Helper] 请求成功:', data);

  return data;
}

/**
 * 示例：请求拦截器代码模板
 */
export const interceptorExamples = {
  // 基础示例：添加固定参数
  basic: `
async function intercept(config, linkageParams) {
  // 添加认证 token
  config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');

  // 添加固定参数
  config.body = JSON.parse(config.body);
  config.body.timestamp = Date.now();
  config.body.version = '1.0';
  config.body = JSON.stringify(config.body);

  return config;
}
`,

  // 日期范围处理
  dateRange: `
async function intercept(config, linkageParams) {
  if (linkageParams.date) {
    const body = JSON.parse(config.body);

    // 将单日期转换为日期范围
    body.startDate = linkageParams.date + ' 00:00:00';
    body.endDate = linkageParams.date + ' 23:59:59';

    // 移除原始 date 字段
    delete body.date;

    config.body = JSON.stringify(body);
  }

  return config;
}
`,

  // 参数转换
  transform: `
async function intercept(config, linkageParams) {
  const body = JSON.parse(config.body);

  // 参数名转换
  if (linkageParams.userName) {
    body.user_name = linkageParams.userName;
  }

  // 参数值转换
  if (linkageParams.status === 'active') {
    body.state = 1;
  }

  config.body = JSON.stringify(body);
  return config;
}
`,
};
