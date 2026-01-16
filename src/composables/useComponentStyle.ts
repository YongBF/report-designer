/**
 * useComponentStyle.ts
 *
 * 组件样式计算相关的 composable
 *
 * 功能包括：
 * - 通用组件样式计算
 * - 文本组件样式计算
 * - 矩形组件样式计算
 * - 线条组件样式计算
 *
 * @module composables/useComponentStyle
 * @author Report Designer Team
 * @since 2025-01-15
 */

import type { Component } from '../types';

/**
 * 组件样式计算的 composable
 */
export function useComponentStyle() {
  /**
   * 获取组件的通用样式
   */
  function getComponentStyle(component: any) {
    // 矩形组件和线条组件使用自己的特殊样式，不应用卡片样式
    if (component.type === 'rectangle' || component.type === 'line') {
      return {
        height: `${component.height}px`,
        opacity: component.visible ? 1 : 0.3,
        cursor: component.locked ? 'not-allowed' : 'default',
      };
    }

    // 获取背景色，如果没有设置则使用白色
    const backgroundColor = component.backgroundColor || '#ffffff';

    return {
      height: `${component.height}px`,
      opacity: component.visible ? 1 : 0.3,
      cursor: component.locked ? 'not-allowed' : 'default',
      backgroundColor: backgroundColor,
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      boxSizing: 'border-box' as const,
    };
  }

  /**
   * 获取文本组件的样式
   */
  function getTextStyle(component: any) {
    return {
      fontSize: `${component.fontSize}px`,
      fontFamily: component.fontFamily,
      color: component.color,
      fontWeight: component.fontWeight,
      fontStyle: component.fontStyle,
      textAlign: component.textAlign as any,
      lineHeight: component.lineHeight,
      width: '100%',
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
    };
  }

  /**
   * 获取矩形组件的样式
   */
  function getRectangleStyle(component: any) {
    return {
      width: '100%',
      height: '100%',
      backgroundColor: component.backgroundColor,
      border: `${component.borderWidth}px ${component.borderStyle} ${component.borderColor}`,
      borderRadius: `${component.borderRadius}px`,
    };
  }

  /**
   * 获取线条组件的样式
   */
  function getLineStyle(component: any) {
    return {
      width: '100%',
      height: '100%',
      borderTop: `${component.strokeWidth}px ${component.strokeStyle} ${component.stroke}`,
    };
  }

  return {
    getComponentStyle,
    getTextStyle,
    getRectangleStyle,
    getLineStyle,
  };
}
