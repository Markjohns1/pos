import { useState, useEffect } from 'react'
import { api } from './services/api'
import Login from './pages/Login'
import PaymentModal from './components/PaymentModal'
import TransactionTable from './components/TransactionTable'
import ReceiptModal from './components/ReceiptModal'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('pos_token'))
  const [health, setHealth] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

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
    if (result.client_secret) {
      alert('Charge Started on Terminal!')
    } else {
      alert('Payment Link Sent via SMS!')
    }
  }

  const handleViewReceipt = (tx) => {
    setSelectedTx(tx)
    setReceiptOpen(true)
  }

  return (
    <div className="app-container animate-fade-in">
      {/* Sidebar */}
      <nav className="sidebar glass-card">
        <div className="logo">
          <div className="logo-icon">POS</div>
          <span>System</span>
        </div>
        <ul className="nav-links">
          <li className="active">Dashboard</li>
          <li>Transactions</li>
          <li onClick={handleLogout} className="logout-btn">Logout</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h1>Dashboard</h1>
          <div className="user-profile">
            <div className={`status-dot ${health?.status === 'healthy' ? 'online' : 'offline'}`}></div>
            <span>System Status: {health?.status || 'Unknown'}</span>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card glass-card">
            <h3>Total Sales (Mock)</h3>
            <p className="stat-value">$1,280.00</p>
            <span className="stat-change positive">+12% from last week</span>
          </div>
          <div className="stat-card glass-card">
            <h3>Transactions</h3>
            <p className="stat-value">{transactions.length}</p>
            <span className="stat-change">Active in current session</span>
          </div>
          <div className="stat-card glass-card">
            <h3>Connection</h3>
            <p className="stat-value">API Ready</p>
            <span className="stat-change">{health?.version ? `v${health.version}` : 'Connecting...'}</span>
          </div>
        </section>

        <section className="recent-activity glass-card">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="btn-primary" onClick={() => setPaymentOpen(true)}>
              <span>+</span> New Charge
            </button>
          </div>

          <TransactionTable
            transactions={transactions}
            onSelectTransaction={handleViewReceipt}
          />
        </section>
      </main>

      {/* Modals */}
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

export default App
