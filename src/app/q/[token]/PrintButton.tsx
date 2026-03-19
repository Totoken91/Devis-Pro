'use client'

import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-sm font-medium text-[#2E86C1] hover:text-[#1E3A5F] border border-[#2E86C1] hover:border-[#1E3A5F] px-3 py-1.5 rounded-xl transition-colors print:hidden"
    >
      <Download size={14} />
      PDF
    </button>
  )
}
