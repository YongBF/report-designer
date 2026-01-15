import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { currentDesign } from '../stores/designer'
import type { ExportFormat } from '../types'
import { downloadFile } from './index'

// 导出为 JSON
export function exportAsJson() {
  const design = JSON.stringify(currentDesign.value, null, 2)
  downloadFile(design, `${currentDesign.value.name}.json`, 'application/json')
}

// 导出为 PNG
export async function exportAsPng() {
  const canvas = await exportCanvas()
  if (canvas) {
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${currentDesign.value.name}.png`
    a.click()
  }
}

// 导出为 PDF
export async function exportAsPdf() {
  const canvas = await exportCanvas()
  if (canvas) {
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${currentDesign.value.name}.pdf`)
  }
}

// 导出为 Excel
export function exportAsExcel() {
  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 添加报表信息
  const infoData = [
    ['报表名称', currentDesign.value.name],
    ['创建时间', currentDesign.value.createdAt],
    ['更新时间', currentDesign.value.updatedAt],
    ['宽度', currentDesign.value.width],
    ['高度', currentDesign.value.height],
  ]
  const infoSheet = XLSX.utils.aoa_to_sheet(infoData)
  XLSX.utils.book_append_sheet(workbook, infoSheet, '报表信息')

  // 添加组件列表
  const componentsData = currentDesign.value.components.map((comp) => ({
    ID: comp.id,
    类型: comp.type,
    X: comp.x,
    Y: comp.y,
    宽度: comp.width,
    高度: comp.height,
    层级: comp.zIndex,
    可见: comp.visible ? '是' : '否',
    锁定: comp.locked ? '是' : '否',
  }))
  const componentsSheet = XLSX.utils.json_to_sheet(componentsData)
  XLSX.utils.book_append_sheet(workbook, componentsSheet, '组件列表')

  // 导出文件
  XLSX.writeFile(workbook, `${currentDesign.value.name}.xlsx`)
}

// 导出画布为 canvas
async function exportCanvas(): Promise<HTMLCanvasElement | null> {
  // 找到画布内容元素
  const canvasContent = document.querySelector('.canvas-content') as HTMLElement
  if (!canvasContent) return null

  // 临时移除选择框等 UI 元素
  const selectionHandles = canvasContent.querySelectorAll('.selection-handle, .selection-border')
  selectionHandles.forEach((el) => el.remove())

  try {
    const canvas = await html2canvas(canvasContent, {
      scale: 2, // 提高清晰度
      backgroundColor: currentDesign.value.backgroundColor,
      logging: false,
    })
    return canvas
  } catch (error) {
    console.error('导出失败:', error)
    return null
  }
}

// 统一导出函数
export function exportToFile(format: ExportFormat) {
  switch (format) {
    case 'json':
      exportAsJson()
      break
    case 'png':
      exportAsPng()
      break
    case 'pdf':
      exportAsPdf()
      break
    case 'excel':
      exportAsExcel()
      break
  }
}
