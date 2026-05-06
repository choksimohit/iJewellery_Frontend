import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { loansApi } from '../../api/loans'
import type { Lookups, LoanItem } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import toast from 'react-hot-toast'

const emptyItem = (): LoanItem => ({
  item_type_id: 0,
  metal_type: '',
  item_description: '',
  item_weight: 0,
  metal_price: 0,
  melting: 0,
})

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all'

const selectCls = inputCls

export default function LoanEntry() {
  const [lookups, setLookups]     = useState<Lookups | null>(null)
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successLoan, setSuccessLoan] = useState<number | null>(null)

  const blankForm = () => ({
    loan_date:         new Date().toISOString().split('T')[0],
    customer_name:     '',
    customer_address:  '',
    customer_phone:    '',
    loan_source_id:    0,
    loan_amount:       '',
  })

  const [form, setForm] = useState(blankForm)
  const [items, setItems] = useState<LoanItem[]>([emptyItem()])

  useEffect(() => {
    loansApi
      .getLookups()
      .then(setLookups)
      .catch(() => toast.error('Failed to load form data'))
      .finally(() => setLoading(false))
  }, [])

  const updateItem = (idx: number, field: keyof LoanItem, val: string | number) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)))

  const addItem    = () => setItems((prev) => [...prev, emptyItem()])
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const resetForm = () => {
    setForm(blankForm())
    setItems([emptyItem()])
    setSuccessLoan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer_name.trim()) { toast.error('Customer name is required'); return }
    if (!form.loan_source_id)       { toast.error('Please select a loan source'); return }
    if (!form.loan_amount)          { toast.error('Loan amount is required'); return }

    const badItem = items.find((it) => !it.item_type_id || !it.metal_type || !it.item_weight)
    if (badItem) { toast.error('Please fill Item Type, Metal Type and Weight for every item'); return }

    setSubmitting(true)
    try {
      const res = await loansApi.create({
        ...form,
        loan_source_id: Number(form.loan_source_id),
        loan_amount:    Number(form.loan_amount),
        items,
      })
      setSuccessLoan(res.loan_number)
      toast.success(`Loan #${res.loan_number} created!`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Failed to create loan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  /* Success banner */
  if (successLoan) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Loan Created!</h2>
        <p className="text-gray-500">
          Loan <span className="font-bold text-gold-600">#{successLoan}</span> has been saved successfully.
        </p>
        <button
          onClick={resetForm}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-600
                     text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Another Loan
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Loan Entry</h1>
        <p className="text-gray-500 text-sm mt-0.5">Create a new loan with one or more pledged items</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
                  className={inputCls}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm((p) => ({ ...p, customer_phone: e.target.value }))}
                  className={inputCls}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Address / Village</label>
                <input
                  type="text"
                  value={form.customer_address}
                  onChange={(e) => setForm((p) => ({ ...p, customer_address: e.target.value }))}
                  className={inputCls}
                  placeholder="Village or address"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.loan_date}
                  onChange={(e) => setForm((p) => ({ ...p, loan_date: e.target.value }))}
                  className={inputCls}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Source <span className="text-red-500">*</span></label>
                <select
                  value={form.loan_source_id}
                  onChange={(e) => setForm((p) => ({ ...p, loan_source_id: Number(e.target.value) }))}
                  className={selectCls}
                  required
                >
                  <option value={0}>Select source...</option>
                  {lookups?.loan_sources.map((s) => (
                    <option key={s.SourceID} value={s.SourceID}>{s.SourceName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Amount (&#8377;) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={form.loan_amount}
                  onChange={(e) => setForm((p) => ({ ...p, loan_amount: e.target.value }))}
                  className={inputCls}
                  placeholder="0"
                  min={1}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pledged Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pledged Items</CardTitle>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600
                           text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Item {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Item Type <span className="text-red-400">*</span></label>
                    <select
                      value={item.item_type_id}
                      onChange={(e) => updateItem(idx, 'item_type_id', Number(e.target.value))}
                      className={selectCls}
                      required
                    >
                      <option value={0}>Select...</option>
                      {lookups?.item_types.map((t) => (
                        <option key={t.ItemTypeID} value={t.ItemTypeID}>{t.ItemName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Metal Type <span className="text-red-400">*</span></label>
                    <select
                      value={item.metal_type}
                      onChange={(e) => updateItem(idx, 'metal_type', e.target.value)}
                      className={selectCls}
                      required
                    >
                      <option value="">Select...</option>
                      {lookups?.metal_types.map((t) => (
                        <option key={t.MetalTypeID} value={t.MetalType}>{t.MetalType}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Weight (g) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={item.item_weight || ''}
                      onChange={(e) => updateItem(idx, 'item_weight', Number(e.target.value))}
                      className={inputCls}
                      placeholder="0.00"
                      step="0.01"
                      min={0.01}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Metal Price / 10g</label>
                    <input
                      type="number"
                      value={item.metal_price || ''}
                      onChange={(e) => updateItem(idx, 'metal_price', Number(e.target.value))}
                      className={inputCls}
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Melting %</label>
                    <input
                      type="number"
                      value={item.melting || ''}
                      onChange={(e) => updateItem(idx, 'melting', Number(e.target.value))}
                      className={inputCls}
                      placeholder="0"
                      min={0}
                      max={100}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Description</label>
                    <input
                      type="text"
                      value={item.item_description}
                      onChange={(e) => updateItem(idx, 'item_description', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Chain, Ring, Bangle..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm
                       font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-2.5 bg-gold-500 hover:bg-gold-600
                       disabled:opacity-60 text-white rounded-xl font-bold text-sm
                       transition-all shadow-md shadow-gold-500/20"
          >
            {submitting && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {submitting ? 'Saving...' : 'Create Loan'}
          </button>
        </div>
      </form>
    </div>
  )
}
