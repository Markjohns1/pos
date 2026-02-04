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
  Search
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
    <div className="flex min-h-screen bg-[#05060f] text-slate-100 font-inter overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-[#0a0b14] transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">P</div>
              <span className="text-xl font-bold tracking-tight text-white">INTERPOS</span>
            </div>
          )}
          {isSidebarCollapsed && <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto flex items-center justify-center font-bold text-white">P</div>}
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 absolute -right-3 top-6 bg-[#0a0b14] border border-slate-800 z-10 hidden lg:block"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 relative">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('dashboard')}
          />
          <NavItem
            icon={<History size={20} />}
            label="Transactions"
            active={activeTab === 'transactions'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('transactions')}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === 'settings'}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveTab('settings')}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="font-medium text-sm">Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0b14] border-t border-slate-800 flex items-center justify-around px-4 z-50">
        <MobileNavItem icon={<LayoutDashboard size={22} />} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={<History size={22} />} active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
        <button onClick={() => setPaymentOpen(true)} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white -mt-8 shadow-xl shadow-blue-500/40 transform active:scale-95 transition-transform border-4 border-[#05060f]">
          <PlusCircle size={28} />
        </button>
        <MobileNavItem icon={<Settings size={22} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        <MobileNavItem icon={<LogOut size={22} />} onClick={handleLogout} />
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-slate-800 bg-[#0a0b14]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-base md:text-lg font-semibold text-slate-100 uppercase tracking-wider">
              {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <Search size={16} className="text-slate-500" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-64 text-slate-200" />
            </div>
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center text-white rounded-full font-bold">3</span>
            </button>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-slate-300">
              <User size={16} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {activeTab === 'dashboard' && (
              <>
                {/* HERO CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-[#0f111a] border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                      <CreditCard size={80} strokeWidth={1.5} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Revenue</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-black text-white">$1,280.00</h3>
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">↑ 12%</span>
                    </div>
                  </div>

                  <div className="bg-[#0f111a] border border-slate-800 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Process Queue</p>
                    <h3 className="text-3xl font-black text-white">{transactions.length}</h3>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase">System synchronization active</p>
                  </div>

                  <div className="bg-[#0f111a] border border-slate-800 p-6 rounded-2xl hidden lg:block">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Terminal Status</p>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
                      </div>
                      <span className="text-xl font-black text-white">OPERATIONAL</span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 font-mono uppercase">API LATENCY: 24MS</p>
                  </div>
                </div>

                {/* MAIN TABLE SECTION */}
                <div className="bg-[#0f111a] border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <History size={18} />
                      </div>
                      <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-wider">Live Traffic Feed</h2>
                    </div>
                    <button
                      className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                      onClick={() => setPaymentOpen(true)}
                    >
                      <PlusCircle size={14} />
                      New Terminal Charge
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <TransactionTable
                      transactions={transactions.slice(0, 10)}
                      onSelectTransaction={handleViewReceipt}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">History Log</h2>
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    onClick={() => setPaymentOpen(true)}
                  >
                    <PlusCircle size={14} />
                    Initiate Payment
                  </button>
                </div>
                <div className="bg-[#0f111a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                  <TransactionTable
                    transactions={transactions}
                    onSelectTransaction={handleViewReceipt}
                  />
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-[#0f111a] border border-slate-800 rounded-2xl p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mb-4">
                  <Settings size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">System Controls</h2>
                <p className="text-slate-500 text-sm mt-2">Administrative parameters are locked during active terminal session.</p>
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

// SUB-COMPONENTS
function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <div
      onClick={onClick}
      className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer group ${active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-1 ring-white/10'
          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
        } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <span className={`${active ? 'text-white' : 'group-hover:text-blue-400'}`}>{icon}</span>
      {!collapsed && <span className="font-bold text-sm tracking-wide lowercase pt-0.5">{label}</span>}
    </div>
  )
}

function MobileNavItem({ icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${active ? 'text-blue-500' : 'text-slate-500'
        }`}
    >
      {icon}
    </button>
  )
}

export default App
