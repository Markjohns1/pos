import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  User,
  Settings,
  Bell,
  Search,
  Shield
} from 'lucide-react'
import { api } from './services/api'
import Login from './pages/Login'
import PaymentModal from './components/PaymentModal'
import TransactionTable from './components/TransactionTable'
import ReceiptModal from './components/ReceiptModal'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pos_token'))
  const [health, setHealth] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Modal States
  const [isPaymentOpen, setPaymentOpen] = useState(false)
  const [isReceiptOpen, setReceiptOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)

  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      const healthData = await api.checkHealth()
      setHealth(healthData)

      const txData = await api.listTransactions()
      setTransactions(txData.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
      if (err === 'Unauthorized') setIsAuthenticated(false);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isAuthenticated])

  const handleLogout = () => {
    localStorage.removeItem('pos_token')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  const handlePaymentSuccess = (result) => {
    fetchData()
  }

  const handleViewReceipt = (tx) => {
    setSelectedTx(tx)
    setReceiptOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-[#020308] text-slate-200 font-inter overflow-hidden">
      {/* --- DESKTOP NAVIGATION --- */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/5 bg-[#05060f] transition-all duration-200 ${isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        <div className="h-16 flex items-center px-4 border-b border-white/5 gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shrink-0">P</div>
          {!isSidebarCollapsed && <span className="font-bold tracking-tight text-white uppercase text-sm">InterPOS</span>}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<History size={18} />}
            label="Transactions"
            active={activeTab === 'transactions'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('transactions')}
          />
          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activeTab === 'settings'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/5 transition-colors text-xs font-bold uppercase ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 text-slate-600 mt-2 hover:text-slate-400"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* --- MOBILE NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#05060f] border-t border-white/5 flex items-center justify-around px-4 z-50">
        <MobileNavItem icon={<LayoutDashboard size={18} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<History size={18} />} label="Logs" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        <button onClick={() => setPaymentOpen(true)} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white -mt-6 shadow-lg border-4 border-[#020308]">
          <Plus size={20} />
        </button>
        <MobileNavItem icon={<Settings size={18} />} label="Setup" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <MobileNavItem icon={<LogOut size={18} />} label="Exit" onClick={handleLogout} />
      </nav>

      {/* --- MAIN CORE --- */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-[#05060f]/50 flex items-center justify-between px-6 md:px-8">
          <h1 className="text-sm font-bold text-white uppercase tracking-widest leading-none">
            {activeTab}
          </h1>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-black/40 border border-white/5 rounded px-3 py-1.5">
              <Search size={14} className="text-slate-600" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-xs text-slate-300 w-40" />
            </div>
            <button className="relative text-slate-500 hover:text-white">
              <Bell size={18} />
            </button>
            <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
              <User size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <>
                {/* HUD CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <p className="label-cap mb-1">Gross Revenue</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="value-heavy">$1,280.00</h3>
                      <span className="text-[10px] text-emerald-500 font-bold">+12%</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <p className="label-cap mb-1">Process Queue</p>
                    <h3 className="value-heavy">{transactions.length}</h3>
                  </div>

                  <div className="stat-card hidden lg:block">
                    <p className="label-cap mb-1">Network Status</p>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-blue-500" />
                      <span className="font-bold text-white uppercase text-sm">Secured</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#080914] border border-white/5 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Feed</h2>
                    <button className="hidden sm:flex btn btn-blue text-[10px] h-8 px-4" onClick={() => setPaymentOpen(true)}>
                      + Local Auth
                    </button>
                  </div>
                  <TransactionTable
                    transactions={transactions.slice(0, 10)}
                    onSelectTransaction={handleViewReceipt}
                  />
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Full Registry Log</h2>
                  <button className="btn btn-blue h-9 px-6" onClick={() => setPaymentOpen(true)}>
                    New Entry
                  </button>
                </div>
                <div className="bg-[#080914] border border-white/5 rounded-xl overflow-hidden">
                  <TransactionTable transactions={transactions} onSelectTransaction={handleViewReceipt} />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-[#080914] border border-white/5 rounded-xl p-10 text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 mx-auto mb-4">
                  <Settings size={28} />
                </div>
                <h2 className="text-lg font-bold text-white">Registry Settings</h2>
                <p className="text-slate-500 text-xs mt-1">Terminal controls are locked during active synchronization.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={selectedTx}
      />
    </div>
  )
}

function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <div
      onClick={onClick}
      className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="font-bold text-xs uppercase tracking-wide">{label}</span>}
    </div>
  )
}

function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 shrink-0 ${active ? 'text-blue-500' : 'text-slate-600'}`}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  )
}

export default App
