import * as XLSX from 'xlsx'

export function exportToExcel(rows, columns, filename = 'export') {
  const header = columns.map(c => c.label)
  const data   = rows.map((r, i) => columns.map(c => {
    const val = typeof c.field === 'function' ? c.field(r, i) : r[c.field]
    return val ?? ''
  }))

  const ws = XLSX.utils.aoa_to_sheet([header, ...data])

  // Auto column width
  const colWidths = columns.map((c, i) => ({
    wch: Math.max(c.label.length, ...data.map(row => String(row[i] ?? '').length)) + 2
  }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
