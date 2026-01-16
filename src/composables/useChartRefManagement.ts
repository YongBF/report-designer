/**
 * useChartRefManagement.ts
 *
 * 图表引用管理相关的 composable
 *
 * 功能包括：
 * - 管理图表 DOM 引用
 * - 设置和清理图表引用
 *
 * @module composables/useChartRefManagement
 * @author Report Designer Team
 * @since 2025-01-15
 */

/**
 * 图表引用管理的 composable
 *
 * @param chartRefsMap - 图表引用映射表
 */
export function useChartRefManagement(chartRefsMap: any) {
  /**
   * 设置图表 DOM 引用
   * @param id - 组件 ID
   * @param el - DOM 元素
   */
  function setChartRef(id: string, el: any) {
    if (el) {
      chartRefsMap.value.set(id, el);
    } else {
      chartRefsMap.value.delete(id);
    }
  }

  return {
    setChartRef,
  };
}
