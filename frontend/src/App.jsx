import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  History,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CreditCard,
  User,
  Settings,
  Bell,
  Search,
  Activity,
  ShieldCheck
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

  // UI State
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
    <div className="flex min-h-screen bg-[#05060e] text-slate-100 font-inter overflow-hidden">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/5 bg-[#080914] transition-all duration-300 relative shadow-2xl ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0b18]">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-xl shadow-blue-600/20">
                POS
              </div>
              <span className="text-lg font-black tracking-[3px] text-white uppercase italic">INTERPOS</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="w-10 h-10 bg-blue-600 rounded-xl mx-auto flex items-center justify-center font-black text-white">P</div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 absolute -right-4 top-7 bg-[#0a0b18] z-50 hidden lg:block"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-3 mt-4">
          <NavItem
            icon={<LayoutDashboard size={18} strokeWidth={2.5} />}
            label="DASHBOARD"
            active={activeTab === 'dashboard'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<History size={18} strokeWidth={2.5} />}
            label="TRANSACTIONS"
            active={activeTab === 'transactions'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('transactions')}
          />
          <NavItem
            icon={<Settings size={18} strokeWidth={2.5} />}
            label="CONTROLS"
            active={activeTab === 'settings'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-4 border-t border-white/5 bg-[#0a0b18]/50">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors uppercase text-[10px] font-black tracking-widest ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={18} />
            {!isSidebarCollapsed && <span>Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* --- MOBILE NAVIGATION (WITH LABELS) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0b18] border-t border-white/10 flex items-center justify-between px-6 z-50 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <MobileNavItem
          icon={<LayoutDashboard size={20} />}
          label="Home"
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
        />
        <MobileNavItem
          icon={<History size={20} />}
          label="Logs"
          active={activeTab === 'transactions'}
          onClick={() => setActiveTab('transactions')}
        />

        <div className="relative -top-6">
          <button
            onClick={() => setPaymentOpen(true)}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 ring-4 ring-[#05060e]"
          >
            <PlusCircle size={32} />
          </button>
        </div>

        <MobileNavItem
          icon={<Settings size={20} />}
          label="Setup"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
        <MobileNavItem
          icon={<LogOut size={20} />}
          label="Exit"
          onClick={handleLogout}
        />
      </nav>

      {/* --- MAIN CORE AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-white/5 bg-[#0a0b18]/60 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-500 tracking-[3px] uppercase">Control Panel</span>
              <h1 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter">
                {activeTab}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden lg:flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-2 focus-within:ring-1 focus-within:ring-blue-600/50 transition-all">
              <Search size={14} className="text-slate-600" />
              <input type="text" placeholder="SECURE SEARCH ACCESS..." className="bg-transparent border-none focus:ring-0 text-[10px] font-black tracking-widest w-48 text-slate-400 placeholder:text-slate-700" />
            </div>

            <div className="flex items-center gap-4 md:gap-8 border-l border-white/10 pl-6 md:pl-10">
              <button className="relative text-slate-500 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-[10px] flex items-center justify-center text-white rounded-full font-black shadow-lg shadow-red-600/30">
                  2
                </span>
              </button>

              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[10px] font-black text-white leading-none">POS-ADMIN</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-none mt-1">Authorized Hub</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border border-white/10 flex items-center justify-center text-white shadow-lg">
                  <User size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-32 md:pb-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === 'dashboard' && (
              <>
                {/* --- ANALYTICS HUB --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="stat-card group">
                    <div className="absolute top-0 right-0 p-4 text-blue-600/5 transition-transform scale-125 group-hover:scale-150">
                      <CreditCard size={100} strokeWidth={1} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">Verified Revenue</p>
                    <div className="flex items-end gap-3 relative z-10">
                      <h3 className="text-4xl font-black text-white italic tracking-tighter">$1,280.00</h3>
                      <span className="text-[10px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-1 rounded-md mb-2 border border-emerald-500/20">
                        +12.4%
                      </span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">Process Queue</p>
                    <div className="flex items-center gap-4">
                      <h3 className="text-4xl font-black text-white italic tracking-tighter">{transactions.length}</h3>
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0d0e1a] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono">
                            {i}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest flex items-center gap-2">
                      <Activity size={10} className="text-blue-500" /> System Link Active
                    </p>
                  </div>

                  <div className="stat-card hidden lg:block border-l-4 border-blue-600">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-2">Shield Status</p>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-blue-500" size={32} />
                      <span className="text-2xl font-black text-white tracking-widest uppercase italic leading-none">SECURE</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest">
                      LATENCY: 0.12MS • HUB: MAIN
                    </p>
                  </div>
                </div>

                {/* --- LIVE INTERFACE --- */}
                <div className="bg-[#0d0e1a] border border-white/5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
                  <div className="p-6 md:px-8 md:py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                      <h2 className="text-sm md:text-base font-black text-white uppercase tracking-[4px]">Live System Feed</h2>
                    </div>
                    <button
                      className="hidden sm:flex btn btn-blue"
                      onClick={() => setPaymentOpen(true)}
                    >
                      <PlusCircle size={14} strokeWidth={3} />
                      NEW TERMINAL AUTH
                    </button>
                  </div>

                  <div className="p-2 md:p-4">
                    <TransactionTable
                      transactions={transactions.slice(0, 10)}
                      onSelectTransaction={handleViewReceipt}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 tracking-[4px] uppercase">Archive Hub</span>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Verified Logs</h2>
                  </div>
                  <button
                    className="btn btn-blue h-12 px-8"
                    onClick={() => setPaymentOpen(true)}
                  >
                    <PlusCircle size={16} strokeWidth={3} />
                    Authorize Registry
                  </button>
                </div>
                <div className="bg-[#0d0e1a] border border-white/5 rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-4">
                    <TransactionTable
                      transactions={transactions}
                      onSelectTransaction={handleViewReceipt}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-3xl mx-auto mt-12 bg-[#0d0e1a] border border-white/5 rounded-3xl p-16 text-center shadow-2xl">
                <div className="mx-auto w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-slate-700 mb-8 border border-white/5">
                  <Settings size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Protocol Controls</h2>
                <p className="text-slate-500 text-sm mt-4 font-bold max-w-sm mx-auto leading-relaxed">
                  Administrative registry is locked during active terminal session to prevent payload corruption.
                </p>
                <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Node ID</p>
                    <p className="text-xs font-mono text-blue-500">INTERPOS-HUB-A1</p>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Enc Level</p>
                    <p className="text-xs font-mono text-emerald-500">AES-256-GCM</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- PROTOCOL MODALS --- */}
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

// --- SUB-COMPONENTS ---
function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <div
      onClick={onClick}
      className={`sidebar-link flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-150 cursor-pointer group ${active
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]'
          : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
        } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <span className={`transition-colors duration-150 ${active ? 'text-white' : 'group-hover:text-blue-500'}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="font-black text-[10px] tracking-[2px] uppercase pt-0.5 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  )
}

function MobileNavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-150 active:scale-90 ${active ? 'text-blue-500 underline decoration-2 underline-offset-8 transition-none' : 'text-slate-600'
        }`}
    >
      {icon}
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-blue-500' : 'text-slate-600'}`}>
        {label}
      </span>
    </button>
  )
}

export default App
