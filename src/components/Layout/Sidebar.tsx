import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, PlusCircle, Gem } from 'lucide-react'

const navItems = [
  {
    category: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    category: 'Loans',
    items: [
      { to: '/loans/entry', label: 'New Loan Entry', icon: PlusCircle },
      { to: '/loans/search', label: 'Search Loan', icon: Search },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-navy-900 flex flex-col h-full shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-700">
        <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/30">
          <Gem className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base tracking-tight">iJewellery</p>
          <p className="text-slate-500 text-xs">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-hide">
        {navItems.map((section) => (
          <div key={section.category}>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">
              {section.category}
            </p>
            {section.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150 ${
                    isActive
                      ? 'bg-gold-500 text-white shadow-md shadow-gold-500/25'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-navy-700">
        <p className="text-slate-600 text-xs text-center">v2.0 &bull; New Stack</p>
      </div>
    </aside>
  )
}
