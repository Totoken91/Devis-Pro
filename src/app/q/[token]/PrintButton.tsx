'use client'

import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white px-3 py-1.5 rounded-lg transition-colors print:hidden cursor-pointer"
    >
      <Download size={13} />
      PDF
    </button>
  )
}
