import { useState, useEffect } from 'react'
import { Search, Plus, Trash2, CheckCircle, UserCheck, UserX, Phone } from 'lucide-react'
import { loansApi } from '../../api/loans'
import { customersApi } from '../../api/customers'
import type { Lookups, LoanItem, CustomerInfo } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all'

const emptyItem = (): LoanItem => ({
  item_type_id: 0,
  metal_type: '',
  item_description: '',
  item_weight: 0,
  melting: 0,
})

function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

export default function LoanEntry() {
  const [lookups, setLookups]         = useState<Lookups | null>(null)
  const [nextLoanNo, setNextLoanNo]   = useState<number | null>(null)
  const [loading, setLoading]         = useState(true)

  // Customer search state
  const [phone, setPhone]             = useState('')
  const [searching, setSearching]     = useState(false)
  const [customer, setCustomer]       = useState<CustomerInfo | null>(null)
  const [notFound, setNotFound]       = useState(false)
  const [newCust, setNewCust]         = useState({ name: '', address: '' })
  const [creating, setCreating]       = useState(false)

  // Loan form state
  const [loanDate, setLoanDate]       = useState(getTodayIST())
  const [sourceId, setSourceId]       = useState(0)
  const [amount, setAmount]           = useState('')
  const [items, setItems]             = useState<LoanItem[]>([emptyItem()])
  const [submitting, setSubmitting]   = useState(false)
  const [successLoan, setSuccessLoan] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([loansApi.getLookups(), loansApi.getNextNumber()])
      .then(([lk, nn]) => {
        setLookups(lk)
        setNextLoanNo(nn.next_loan_number)
        // Default to SourceID=3 (Self), fallback to first source
        const def = lk.loan_sources.find((s) => s.SourceID === 3)
        setSourceId(def ? 3 : (lk.loan_sources[0]?.SourceID ?? 0))
      })
      .catch(() => toast.error('Failed to load form data'))
      .finally(() => setLoading(false))
  }, [])

  // ── Customer search ──────────────────────────────────────────────────────
  const searchCustomer = async () => {
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    setSearching(true)
    setCustomer(null)
    setNotFound(false)
    setNewCust({ name: '', address: '' })
    try {
      const data = await customersApi.getByPhone(phone)
      setCustomer(data)
      toast.success(`Found: ${data.Name}`)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) setNotFound(true)
      else toast.error('Search failed. Try again.')
    } finally {
      setSearching(false)
    }
  }

  const createCustomer = async () => {
    if (!newCust.name.trim() || !newCust.address.trim()) {
      toast.error('Name and address are required')
      return
    }
    setCreating(true)
    try {
      const res = await customersApi.create({ name: newCust.name.trim(), address: newCust.address.trim(), phone })
      setCustomer({
        CustomerID: res.customer_id,
        Name: res.name,
        Address: res.address,
        ActiveLoanCount: 0,
        ClosedLoanCount: 0,
        AvgClosureDays: 0,
      })
      setNotFound(false)
      toast.success('Customer created!')
    } catch {
      toast.error('Failed to create customer')
    } finally {
      setCreating(false)
    }
  }

  // ── Items ────────────────────────────────────────────────────────────────
  const updateItem = (idx: number, field: keyof LoanItem, val: string | number) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)))

  const addItem    = () => setItems((p) => [...p, emptyItem()])
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx))

  // ── Reset ────────────────────────────────────────────────────────────────
  const reset = () => {
    setPhone('')
    setCustomer(null)
    setNotFound(false)
    setNewCust({ name: '', address: '' })
    setLoanDate(getTodayIST())
    setSourceId(lookups?.loan_sources.find((s) => s.SourceID === 3)?.SourceID ?? (lookups?.loan_sources[0]?.SourceID ?? 0))
    setAmount('')
    setItems([emptyItem()])
    setSuccessLoan(null)
    loansApi.getNextNumber().then((r) => setNextLoanNo(r.next_loan_number)).catch(() => null)
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer)                        { toast.error('Search for a customer first'); return }
    if (!sourceId)                        { toast.error('Select a loan source'); return }
    if (!amount || Number(amount) <= 0)   { toast.error('Enter a valid loan amount'); return }
    const badItem = items.find((it) => !it.item_type_id || !it.metal_type || !it.item_weight)
    if (badItem)                          { toast.error('Fill Item Type, Metal and Weight for every item'); return }

    setSubmitting(true)
    try {
      const res = await loansApi.create({
        loan_number:      nextLoanNo!,
        loan_date:        loanDate,
        customer_id:      customer.CustomerID,
        customer_name:    customer.Name,
        customer_address: customer.Address,
        customer_phone:   phone,
        loan_source_id:   sourceId,
        loan_amount:      Number(amount),
        items,
      })
      setSuccessLoan(res.loan_number)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg || 'Failed to create loan')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // ── Success banner ───────────────────────────────────────────────────────
  if (successLoan) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Loan Created Successfully!</h2>
        <p className="text-gray-500">
          Loan <span className="font-bold text-gold-600 text-lg">#{successLoan}</span> saved for{' '}
          <span className="font-semibold">{customer?.Name}</span>.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-600
                     text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Another Loan
        </button>
      </div>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Loan Entry</h1>
        <p className="text-gray-500 text-sm mt-0.5">Search customer by mobile number, then fill loan details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Loan # and Date row */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-3 px-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Loan Number</p>
              <p className="text-2xl font-bold text-gold-600 mt-0.5">#{nextLoanNo ?? '—'}</p>
              <p className="text-xs text-gray-400">Auto-assigned on save</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Loan Date</p>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className={inputCls}
                required
              />
            </CardContent>
          </Card>
        </div>

        {/* Customer search */}
        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-4">

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    setCustomer(null)
                    setNotFound(false)
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchCustomer() } }}
                  className={`${inputCls} pl-9`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              <button
                type="button"
                onClick={searchCustomer}
                disabled={searching}
                className="inline-flex items-center gap-2 px-5 py-2 bg-navy-900 hover:bg-navy-800
                           disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shrink-0"
              >
                <Search className="w-4 h-4" />
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Found */}
            {customer && (
              <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{customer.Name}</p>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{customer.Address}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Active: <strong className="text-gray-800">{customer.ActiveLoanCount}</strong></span>
                    <span>Closed: <strong className="text-gray-800">{customer.ClosedLoanCount}</strong></span>
                    <span>Avg closure: <strong className="text-gray-800">{customer.AvgClosureDays} days</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setCustomer(null); setPhone(''); setNotFound(false) }}
                  className="text-xs text-gray-400 hover:text-red-500 underline shrink-0 transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            {/* Not found → create inline */}
            {notFound && !customer && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-sm font-semibold text-amber-700">
                    No customer found for <span className="font-bold">{phone}</span>. Register a new one:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={newCust.name}
                      onChange={(e) => setNewCust((p) => ({ ...p, name: e.target.value }))}
                      className={inputCls}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Address / Village <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={newCust.address}
                      onChange={(e) => setNewCust((p) => ({ ...p, address: e.target.value }))}
                      className={inputCls}
                      placeholder="Village or address"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={createCustomer}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700
                             disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-all"
                >
                  {creating ? 'Creating...' : 'Create Customer & Continue'}
                </button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Loan details */}
        <Card>
          <CardHeader><CardTitle>Loan Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Loan Source <span className="text-red-500">*</span></label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(Number(e.target.value))}
                  className={inputCls}
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputCls}
                  placeholder="0"
                  min={1}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pledged Items</CardTitle>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600
                           text-white text-xs font-bold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item {idx + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Item Type <span className="text-red-400">*</span></label>
                    <select value={item.item_type_id}
                      onChange={(e) => updateItem(idx, 'item_type_id', Number(e.target.value))}
                      className={inputCls} required>
                      <option value={0}>Select...</option>
                      {lookups?.item_types.map((t) => (
                        <option key={t.ItemTypeID} value={t.ItemTypeID}>{t.ItemName}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Metal Type <span className="text-red-400">*</span></label>
                    <select value={item.metal_type}
                      onChange={(e) => updateItem(idx, 'metal_type', e.target.value)}
                      className={inputCls} required>
                      <option value="">Select...</option>
                      {lookups?.metal_types.map((t) => (
                        <option key={t.MetalTypeID} value={t.MetalType}>{t.MetalType}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Weight (g) <span className="text-red-400">*</span></label>
                    <input type="number" value={item.item_weight || ''}
                      onChange={(e) => updateItem(idx, 'item_weight', Number(e.target.value))}
                      className={inputCls} placeholder="0.00" step="0.01" min={0.01} required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Melting %</label>
                    <input type="number" value={item.melting || ''}
                      onChange={(e) => updateItem(idx, 'melting', Number(e.target.value))}
                      className={inputCls} placeholder="0" min={0} max={100} />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-medium text-gray-600">Description</label>
                    <input type="text" value={item.item_description}
                      onChange={(e) => updateItem(idx, 'item_description', e.target.value)}
                      className={inputCls} placeholder="e.g. Chain, Ring, Bangle..." />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button type="button" onClick={reset}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Reset
          </button>
          <button
            type="submit"
            disabled={submitting || !customer}
            title={!customer ? 'Search for a customer first' : ''}
            className="inline-flex items-center gap-2 px-8 py-2.5 bg-gold-500 hover:bg-gold-600
                       disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl
                       font-bold text-sm transition-all shadow-md shadow-gold-500/20"
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
