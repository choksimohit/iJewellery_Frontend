import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
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
      <style>{`
        @page { size: A6 portrait; margin: 6mm; }
        @media print {
          body, html { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .receipt { width: 100% !important; max-width: 100% !important; box-shadow: none !important;
                     border-radius: 0 !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      {/* Toolbar — hidden when printing */}
      <div className="no-print flex items-center justify-between px-5 py-2.5 bg-navy-900 shadow">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      {/* Receipt preview */}
      <div className="flex justify-center bg-gray-100 min-h-screen py-6 print:bg-white print:py-0 print:min-h-0">
        <div
          className="receipt bg-white shadow-md rounded-lg overflow-hidden"
          style={{ width: '105mm', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', padding: '8px 12px 6px', borderBottom: '1.5px dashed #d1d5db' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#111' }}>iJewellery</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '1px' }}>Gold Loan Management System</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', background: '#f9fafb', borderRadius: '6px', padding: '4px 8px' }}>
              <span>Loan No: <strong style={{ fontSize: '13px', color: '#111' }}>#{header.LoanNumber}</strong></span>
              <span>Date: <strong>{loanDate}</strong></span>
            </div>
          </div>

          {/* Customer */}
          <div style={{ padding: '6px 12px', borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Customer</div>
            <div style={{ fontWeight: '800', fontSize: '13px', color: '#111' }}>{header.Name}</div>
            {header.Address && <div style={{ color: '#6b7280', marginTop: '1px' }}>{header.Address}</div>}
            {header.Phone && <div style={{ color: '#6b7280' }}>📞 {header.Phone}</div>}
            {header.SourceName && (
              <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '9px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '4px', padding: '1px 6px', fontWeight: '600' }}>
                Source: {header.SourceName}
              </span>
            )}
          </div>

          {/* Items */}
          <div style={{ padding: '6px 12px', borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Pledged Items</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ color: '#9ca3af', borderBottom: '1px solid #f3f4f6' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '3px', fontWeight: '600', width: '16px' }}>#</th>
                  <th style={{ textAlign: 'left', paddingBottom: '3px', fontWeight: '600' }}>Item</th>
                  <th style={{ textAlign: 'right', paddingBottom: '3px', fontWeight: '600' }}>Metal</th>
                  <th style={{ textAlign: 'right', paddingBottom: '3px', fontWeight: '600' }}>Wt (g)</th>
                  <th style={{ textAlign: 'right', paddingBottom: '3px', fontWeight: '600' }}>Melt%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '3px 0', color: '#9ca3af' }}>{idx + 1}</td>
                    <td style={{ padding: '3px 0', color: '#111' }}>{row.ItemDescription || '—'}</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', color: '#4b5563' }}>{row.MetalType || '—'}</td>
                    <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: '600', color: '#111' }}>
                      {(row.MetalWeight ?? row.ItemWeight) != null
                        ? Number(row.MetalWeight ?? row.ItemWeight).toFixed(3)
                        : '—'}
                    </td>
                    <td style={{ padding: '3px 0', textAlign: 'right', color: '#4b5563' }}>
                      {row.Melting != null ? row.Melting : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loan amount */}
          <div style={{ padding: '6px 12px 5px', borderBottom: '1.5px dashed #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#4b5563' }}>Loan Amount</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#111' }}>
                ₹{Number(header.LoanAmount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Signature */}
          <div style={{ padding: '8px 12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#6b7280' }}>Customer Signature</div>
            <div style={{ borderTop: '1px solid #d1d5db', width: '100px', margin: '14px auto 0' }} />
            <div style={{ fontSize: '9px', color: '#d1d5db', marginTop: '6px' }}>Thank you for your trust.</div>
          </div>
        </div>
      </div>
    </>
  )
}
