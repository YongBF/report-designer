/**
 * useComponentLinkage.ts
 *
 * 组件联动管理 composable
 *
 * 功能包括：
 * - 管理组件间的联动关系
 * - 处理联动触发和执行
 * - 参数映射和数据转换
 * - 支持自定义联动逻辑
 * - 持久化联动配置到设计数据
 *
 * @module composables/useComponentLinkage
 * @author Report Designer Team
 * @since 2025-01-16
 */

import { ref, computed, watch } from 'vue';
import type {
  LinkageConfig,
  LinkageContext,
  ParameterMapping,
  LinkageActionType,
  ParameterMappingType,
} from '../types/linkage';
import type { Component, ReportDesign } from '../types';

/**
 * 组件联动管理 composable
 * @param currentDesign - 当前设计对象（用于持久化）
 */
export function useComponentLinkage(currentDesign?: { value: ReportDesign }) {
  // 从设计数据中初始化联动配置
  const linkages = ref<LinkageConfig[]>(currentDesign?.value?.linkages || []);

  // 监听联动配置变化，自动保存到设计数据
  watch(
    linkages,
    (newLinkages) => {
      if (currentDesign) {
        currentDesign.value.linkages = [...newLinkages];
      }
    },
    { deep: true }
  );

  // 监听设计数据加载，恢复联动配置
  if (currentDesign) {
    watch(
      () => currentDesign.value.linkages,
      (loadedLinkages) => {
        if (loadedLinkages && JSON.stringify(loadedLinkages) !== JSON.stringify(linkages.value)) {
          linkages.value = [...loadedLinkages];
        }
      },
      { immediate: true }
    );
  }

  // 联动执行日志
  const executionLogs = ref<
    Array<{
      linkageId: string;
      sourceId: string;
      targetId: string;
      actionType: LinkageActionType;
      timestamp: string;
      success: boolean;
      error?: string;
    }>
  >([]);

  /**
   * 添加联动配置
   */
  function addLinkage(config: LinkageConfig) {
    linkages.value.push(config);
  }

  /**
   * 删除联动配置
   */
  function removeLinkage(linkageId: string) {
    const index = linkages.value.findIndex((l) => l.id === linkageId);
    if (index !== -1) {
      linkages.value.splice(index, 1);
    }
  }

  /**
   * 更新联动配置
   */
  function updateLinkage(linkageId: string, updates: Partial<LinkageConfig>) {
    const linkage = linkages.value.find((l) => l.id === linkageId);
    if (linkage) {
      Object.assign(linkage, updates);
    }
  }

  /**
   * 获取从指定组件出发的所有联动
   */
  function getLinkagesFromSource(sourceId: string): LinkageConfig[] {
    return linkages.value.filter((l) => l.sourceComponentId === sourceId && l.enabled);
  }

  /**
   * 获取指向指定组件的所有联动
   */
  function getLinkagesToTarget(targetId: string): LinkageConfig[] {
    return linkages.value.filter((l) => l.targetComponentId === targetId && l.enabled);
  }

  /**
   * 处理参数映射
   * 如果没有配置映射，返回源数据的所有字段
   * 如果配置了映射，返回源数据 + 映射参数（映射参数可覆盖源数据字段）
   */
  function processParameterMappings(
    mappings: ParameterMapping[],
    sourceData: any
  ): Record<string, any> {
    // 如果没有配置映射或映射为空，返回源数据的所有字段
    if (!mappings || mappings.length === 0) {
      console.log('[Linkage] No parameter mappings configured, passing all source data');
      return { ...sourceData };
    }

    // 先复制源数据的所有字段
    const result: Record<string, any> = { ...sourceData };

    // 应用映射参数（可以覆盖源数据的字段）
    for (const mapping of mappings) {
      try {
        let value: any;

        switch (mapping.type) {
          case 'direct':
            // 直接映射：从源数据获取字段值
            value = getNestedValue(sourceData, mapping.sourceField);
            break;

          case 'rename':
            // 重命名：从源字段获取，赋给目标参数
            value = getNestedValue(sourceData, mapping.sourceField);
            break;

          case 'fixed':
            // 固定值
            value = mapping.fixedValue;
            break;

          case 'expression':
            // 表达式计算
            value = evaluateExpression(mapping.expression!, sourceData);
            break;

          default:
            value = mapping.defaultValue;
        }

        // 如果值为 undefined 或 null，使用默认值
        if (value === undefined || value === null) {
          value = mapping.defaultValue;
        }

        // 映射参数会覆盖源数据的同名字段
        result[mapping.targetParam] = value;
      } catch (error) {
        console.error(`Parameter mapping error for ${mapping.targetParam}:`, error);
        result[mapping.targetParam] = mapping.defaultValue;
      }
    }

    return result;
  }

  /**
   * 获取嵌套对象的属性值
   */
  function getNestedValue(obj: any, path: string): any {
    if (!path) return obj;

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * 求值表达式
   */
  function evaluateExpression(expression: string, data: any): any {
    try {
      // 创建安全的求值函数
      const func = new Function('data', `return ${expression}`);
      return func(data);
    } catch (error) {
      console.error('Expression evaluation error:', error);
      return undefined;
    }
  }

  /**
   * 执行联动
   */
  async function executeLinkage(
    linkage: LinkageConfig,
    context: LinkageContext
  ): Promise<boolean> {
    const { sourceComponent, targetComponent, eventData, sourceValue } = context;

    console.log('[Linkage Execution]', {
      linkageId: linkage.id,
      sourceId: linkage.sourceComponentId,
      targetId: linkage.targetComponentId,
      actionType: linkage.actionType,
      sourceValue,
    });

    try {
      // 处理参数映射
      const mappedParams = processParameterMappings(linkage.parameterMappings, sourceValue);

      console.log('[Linkage] Mapped parameters:', mappedParams);

      // 延迟执行
      if (linkage.delay && linkage.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, linkage.delay));
      }

      // 根据动作类型执行不同的逻辑
      switch (linkage.actionType) {
        case 'refresh':
          // 触发目标组件刷新数据
          await executeRefreshAction(targetComponent, mappedParams);
          break;

        case 'update_config':
          // 更新目标组件配置
          await executeUpdateConfigAction(targetComponent, mappedParams);
          break;

        case 'toggle_visible':
          // 切换目标组件可见性
          await executeToggleVisibleAction(targetComponent, mappedParams);
          break;

        case 'toggle_disabled':
          // 切换目标组件禁用状态
          await executeToggleDisabledAction(targetComponent, mappedParams);
          break;

        case 'custom':
          // 自定义处理
          await executeCustomAction(linkage, context, mappedParams);
          break;

        default:
          throw new Error(`Unknown action type: ${linkage.actionType}`);
      }

      // 记录成功日志
      executionLogs.value.push({
        linkageId: linkage.id,
        sourceId: linkage.sourceComponentId,
        targetId: linkage.targetComponentId,
        actionType: linkage.actionType,
        timestamp: new Date().toISOString(),
        success: true,
      });

      return true;
    } catch (error: any) {
      console.error('[Linkage Execution Error]', error);

      // 记录失败日志
      executionLogs.value.push({
        linkageId: linkage.id,
        sourceId: linkage.sourceComponentId,
        targetId: linkage.targetComponentId,
        actionType: linkage.actionType,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      });

      return false;
    }
  }

  /**
   * 执行刷新动作（用于表格、图表等组件）
   */
  async function executeRefreshAction(component: Component, params: Record<string, any>) {
    console.log('[Linkage] Refresh action:', { componentId: component.id, params });

    // 为目标组件设置触发参数，供组件使用
    if (!component.linkageParams) {
      component.linkageParams = {};
    }

    // 合并新参数
    Object.assign(component.linkageParams, params);

    // 触发刷新事件（组件需要监听此事件）
    const event = new CustomEvent('component-linkage-refresh', {
      detail: {
        componentId: component.id,
        params,
      },
    });

    window.dispatchEvent(event);

    // 如果组件有 refresh 方法，直接调用
    if (typeof (component as any).refresh === 'function') {
      await (component as any).refresh(params);
    }
  }

  /**
   * 执行更新配置动作
   */
  async function executeUpdateConfigAction(component: Component, params: Record<string, any>) {
    console.log('[Linkage] Update config action:', { componentId: component.id, params });

    // 更新组件配置
    for (const [key, value] of Object.entries(params)) {
      if (key in component) {
        (component as any)[key] = value;
      }
    }

    // 触发配置更新事件
    const event = new CustomEvent('component-linkage-update-config', {
      detail: {
        componentId: component.id,
        params,
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * 执行切换可见性动作
   */
  async function executeToggleVisibleAction(component: Component, params: Record<string, any>) {
    console.log('[Linkage] Toggle visible action:', { componentId: component.id, params });

    // 根据参数设置可见性
    if (typeof params.visible === 'boolean') {
      component.visible = params.visible;
    }

    const event = new CustomEvent('component-linkage-toggle-visible', {
      detail: {
        componentId: component.id,
        params,
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * 执行切换禁用状态动作
   */
  async function executeToggleDisabledAction(
    component: Component,
    params: Record<string, any>
  ) {
    console.log('[Linkage] Toggle disabled action:', { componentId: component.id, params });

    if (typeof params.disabled === 'boolean') {
      (component as any).disabled = params.disabled;
    }

    const event = new CustomEvent('component-linkage-toggle-disabled', {
      detail: {
        componentId: component.id,
        params,
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * 执行自定义动作
   */
  async function executeCustomAction(
    linkage: LinkageConfig,
    context: LinkageContext,
    params: Record<string, any>
  ) {
    if (!linkage.customHandler) {
      throw new Error('Custom handler is not defined');
    }

    console.log('[Linkage] Custom action:', { linkage, context, params });

    try {
      let code = linkage.customHandler.trim();

      // 检测是否是函数声明格式（如 async function handle() {...}）
      const functionDeclMatch = code.match(/^(async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
      if (functionDeclMatch) {
        // 是函数声明，需要自动调用它
        const functionName = functionDeclMatch[2];

        // 在代码末尾添加函数调用
        code = `${code}\n\nreturn await ${functionName}(context, params, component);`;
      }

      // 创建安全的执行环境
      const handler = new Function(
        'context',
        'params',
        'component',
        'console',
        'window',
        code
      );

      await handler(context, params, context.targetComponent, console, window);
    } catch (error) {
      console.error('[Linkage] Custom handler error:', error);
      throw new Error(`Custom handler execution failed: ${error}`);
    }
  }

  /**
   * 触发联动
   * 当源组件发生指定事件时，调用此方法
   */
  async function triggerLinkage(
    sourceId: string,
    triggerEvent: string,
    eventData?: any,
    sourceValue?: any,
    getAllComponents: () => Component[]
  ) {
    // 获取所有从源组件出发的联动配置
    const sourceLinkages = getLinkagesFromSource(sourceId);

    // 过滤出匹配触发事件的联动
    const matchedLinkages = sourceLinkages.filter((l) => l.triggerEvent === triggerEvent);

    if (matchedLinkages.length === 0) {
      console.log('[Linkage] No matched linkages for trigger:', { sourceId, triggerEvent });
      return;
    }

    console.log(`[Linkage] Triggered ${matchedLinkages.length} linkages`);

    // 获取所有组件
    const allComponents = getAllComponents();

    // 执行所有匹配的联动
    for (const linkage of matchedLinkages) {
      const sourceComponent = allComponents.find((c) => c.id === linkage.sourceComponentId);
      const targetComponent = allComponents.find((c) => c.id === linkage.targetComponentId);

      if (!sourceComponent || !targetComponent) {
        console.error('[Linkage] Component not found:', { linkage });
        continue;
      }

      const context: LinkageContext = {
        sourceComponent,
        targetComponent,
        eventData,
        sourceValue,
      };

      await executeLinkage(linkage, context);
    }
  }

  /**
   * 获取组件的所有联动关系（作为源或目标）
   */
  function getComponentLinkages(componentId: string) {
    return {
      asSource: getLinkagesFromSource(componentId),
      asTarget: getLinkagesToTarget(componentId),
    };
  }

  /**
   * 清空所有联动配置
   */
  function clearAllLinkages() {
    linkages.value = [];
  }

  /**
   * 批量导入联动配置
   */
  function importLinkages(configs: LinkageConfig[]) {
    linkages.value = [...configs];
  }

  /**
   * 导出所有联动配置
   */
  function exportLinkages(): LinkageConfig[] {
    return [...linkages.value];
  }

  return {
    // 状态
    linkages,
    executionLogs,

    // CRUD 操作
    addLinkage,
    removeLinkage,
    updateLinkage,
    getLinkagesFromSource,
    getLinkagesToTarget,
    getComponentLinkages,

    // 执行操作
    triggerLinkage,
    processParameterMappings,

    // 批量操作
    clearAllLinkages,
    importLinkages,
    exportLinkages,
  };
}
