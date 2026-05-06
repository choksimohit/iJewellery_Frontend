import { useEffect, useState } from 'react'
import { TrendingUp, Coins, Activity, IndianRupee, CalendarDays } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import type { DashboardStats } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1.5 truncate">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-3 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-7 bg-gray-100 rounded w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const goldRateDisplay = stats?.metal_rates?.gold_rate
    ? `₹${stats.metal_rates.gold_rate.toLocaleString('en-IN')}/10g`
    : 'N/A'

  const silverRateDisplay = stats?.metal_rates?.silver_rate
    ? `₹${stats.metal_rates.silver_rate.toLocaleString('en-IN')}/kg`
    : 'N/A'

  const rateDate = stats?.metal_rates?.rate_date
    ? new Date(stats.metal_rates.rate_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : undefined

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview of your gold loan portfolio</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Loans"
            value={(stats?.total_active_loans ?? 0).toLocaleString('en-IN')}
            icon={Activity}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Portfolio"
            value={formatCurrency(stats?.total_loan_amount ?? 0)}
            icon={IndianRupee}
            color="bg-gold-500"
          />
          <StatCard
            title="Gold Rate"
            value={goldRateDisplay}
            subtitle={rateDate}
            icon={TrendingUp}
            color="bg-yellow-500"
          />
          <StatCard
            title="Silver Rate"
            value={silverRateDisplay}
            subtitle={rateDate}
            icon={Coins}
            color="bg-slate-500"
          />
        </div>
      )}

      {/* Today's quick stat */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Today&apos;s Loans</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.today_loans ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">New loans entered today</p>
            </CardContent>
          </Card>

          {/* Source-wise table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Source-wise Loan Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats.source_wise_amounts.length === 0 ? (
                <p className="text-sm text-gray-400 px-6 py-4">No data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-gray-500 font-semibold px-6 py-3 text-xs uppercase tracking-wide">Source</th>
                        <th className="text-right text-gray-500 font-semibold px-6 py-3 text-xs uppercase tracking-wide">Loans</th>
                        <th className="text-right text-gray-500 font-semibold px-6 py-3 text-xs uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.source_wise_amounts.map((s, i) => {
                        const source = (s['SourceName'] ?? s['source_name'] ?? 'Unknown') as string
                        const count = Number(s['LoanCount'] ?? s['loan_count'] ?? 0)
                        const amount = Number(s['TotalAmount'] ?? s['total_amount'] ?? 0)
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-900">{source}</td>
                            <td className="px-6 py-3 text-right text-gray-600">{count.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatCurrency(amount)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
