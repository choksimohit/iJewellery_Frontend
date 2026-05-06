import { useState } from 'react'
import { Search } from 'lucide-react'
import { loansApi } from '../../api/loans'
import type { Loan } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const SEARCH_TYPES = [
  { value: 'number',  label: 'Loan Number' },
  { value: 'name',    label: 'Customer Name' },
  { value: 'phone',   label: 'Phone Number' },
  { value: 'address', label: 'Address' },
  { value: 'source',  label: 'Source' },
]

export default function LoanSearch() {
  const [searchType, setSearchType]     = useState('name')
  const [searchValue, setSearchValue]   = useState('')
  const [results, setResults]           = useState<Loan[]>([])
  const [loading, setLoading]           = useState(false)
  const [hasSearched, setHasSearched]   = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) {
      toast.error('Please enter a search value')
      return
    }
    setLoading(true)
    setHasSearched(false)
    try {
      const data = await loansApi.search(searchType, searchValue.trim())
      setResults(data)
      setHasSearched(true)
      if (data.length === 0) toast('No loans found', { icon: 'ℹ️' })
    } catch {
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const placeholder = SEARCH_TYPES.find((t) => t.value === searchType)?.label ?? 'value'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Loans</h1>
        <p className="text-gray-500 text-sm mt-0.5">Find loans by number, name, phone or address</p>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500
                         text-gray-700 font-medium"
            >
              {SEARCH_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={`Search by ${placeholder}...`}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500
                         placeholder:text-gray-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5
                         bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white
                         rounded-xl font-semibold text-sm transition-all shadow-sm shadow-gold-500/20"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Results</CardTitle>
              <span className="text-sm text-gray-400">
                {results.length} loan{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="text-center py-14 text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No loans found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Loan #', 'Date', 'Customer', 'Phone', 'Item', 'Amount', 'Source', 'Status'].map((h) => (
                        <th
                          key={h}
                          className="text-left text-gray-500 font-semibold px-5 py-3 text-xs uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.map((loan) => (
                      <tr key={loan.LoanNumber} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-bold text-gold-600 whitespace-nowrap">
                          #{loan.LoanNumber}
                        </td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {formatDate(loan.LoanDate)}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                          {loan.Name || '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {loan.Phone || '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 max-w-[140px] truncate">
                          {loan.ItemDescription || loan.MetalType || '-'}
                        </td>
                        <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                          {loan.LoanAmount ? formatCurrency(loan.LoanAmount) : '-'}
                        </td>
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                          {loan.SourceName || '-'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={loan.IsClosure ? 'default' : 'success'}>
                            {loan.IsClosure ? 'Closed' : 'Active'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
