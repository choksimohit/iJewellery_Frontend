import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft, Gem } from 'lucide-react'
import { loansApi } from '../../api/loans'
import type { Loan } from '../../types'

export default function LoanReceipt() {
  const { loanNumber } = useParams<{ loanNumber: string }>()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loanNumber) return
    loansApi
      .search('number', loanNumber)
      .then((data) => {
        if (!data.length) setError('Loan not found')
        else setRows(data)
      })
      .catch(() => setError('Failed to load loan details'))
      .finally(() => setLoading(false))
  }, [loanNumber])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3 text-gray-500">
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="text-gold-600 underline text-sm">Go back</button>
      </div>
    )
  }

  const header = rows[0]
  const loanDate = header.LoanDate
    ? new Date(header.LoanDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—'

  return (
    <>
      {/* Screen-only toolbar */}
      <div className="print:hidden flex items-center justify-between px-6 py-3 bg-navy-900 shadow">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold text-sm transition-colors shadow"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
      </div>

      {/* Receipt — centered on screen, fills page when printing */}
      <div className="flex justify-center bg-gray-100 min-h-screen py-8 print:bg-white print:py-0 print:block">
        <div
          className="bg-white w-full max-w-sm mx-4 shadow-lg rounded-xl print:shadow-none print:rounded-none print:mx-0 print:max-w-full"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {/* Receipt header */}
          <div className="text-center px-6 pt-6 pb-4 border-b-2 border-dashed border-gray-300">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
                <Gem className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">iJewellery</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Gold Loan Management System</p>
            <div className="flex justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <span>Loan No: <strong className="text-gray-800 text-sm">#{header.LoanNumber}</strong></span>
              <span>Date: <strong className="text-gray-800">{loanDate}</strong></span>
            </div>
          </div>

          {/* Customer details */}
          <div className="px-6 py-4 border-b border-dashed border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
            <p className="font-bold text-gray-900 text-base">{header.Name}</p>
            {header.Address && <p className="text-sm text-gray-500 mt-0.5">{header.Address}</p>}
            {header.Phone && <p className="text-sm text-gray-500">📞 {header.Phone}</p>}
            {header.SourceName && (
              <span className="inline-block mt-1.5 text-xs bg-gold-50 text-gold-700 border border-gold-200 rounded px-2 py-0.5 font-medium">
                Source: {header.SourceName}
              </span>
            )}
          </div>

          {/* Items table */}
          <div className="px-6 py-4 border-b border-dashed border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pledged Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-1.5 font-semibold">#</th>
                  <th className="text-left pb-1.5 font-semibold">Item</th>
                  <th className="text-right pb-1.5 font-semibold">Metal</th>
                  <th className="text-right pb-1.5 font-semibold">Wt (g)</th>
                  <th className="text-right pb-1.5 font-semibold">Melt%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    <td className="py-1.5 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-1.5 text-gray-800">{row.ItemDescription || '—'}</td>
                    <td className="py-1.5 text-right text-gray-600">{row.MetalType || '—'}</td>
                    <td className="py-1.5 text-right text-gray-800 font-medium">
                      {row.ItemWeight != null ? Number(row.ItemWeight).toFixed(3) : '—'}
                    </td>
                    <td className="py-1.5 text-right text-gray-600">
                      {row.Melting != null ? row.Melting : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loan amount */}
          <div className="px-6 py-4 border-b-2 border-dashed border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Loan Amount</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ₹{Number(header.LoanAmount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 text-center">
            <p className="text-xs text-gray-400">Customer Signature</p>
            <div className="mt-6 border-t border-gray-300 w-32 mx-auto" />
            <p className="text-xs text-gray-300 mt-4">Thank you for your trust.</p>
          </div>
        </div>
      </div>
    </>
  )
}
