import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Users, PenTool, BarChart2, Settings, LogOut, Lock, Download, Trash2, CheckCircle } from 'lucide-react'

// Basic layout and routing
export default function AdminApp() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuth(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Using import.meta.env for Vite
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      setAuth(true)
    } else {
      alert('Invalid Password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth')
    setAuth(false)
  }

  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ padding: '2rem', background: '#111', borderRadius: '12px', border: '1px solid #333', width: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Lock size={32} color="#FF6A30" />
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>Waitlist Admin</h2>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Admin Password"
            style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px', marginBottom: '1rem' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#FF6A30', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Enter
          </button>
        </form>
      </div>
    )
  }

  const renderTab = () => {
    switch (tab) {
      case 'dashboard': return <DashboardTab />
      case 'waitlist': return <WaitlistTab />
      case 'cms': return <CMSTab />
      case 'analytics': return <AnalyticsTab />
      case 'settings': return <SettingsTab />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'sans-serif' }}>
      <aside style={{ width: '240px', background: '#111', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', fontWeight: 700, fontSize: '1.2rem', borderBottom: '1px solid #333' }}>
          <span style={{ color: '#FF6A30' }}>LifeOS</span> Admin
        </div>
        <nav style={{ flex: 1, padding: '1.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'waitlist', label: 'Waitlist', icon: Users },
            { id: 'cms', label: 'CMS Control', icon: PenTool },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%',
                background: tab === item.id ? '#FF6A3020' : 'transparent',
                color: tab === item.id ? '#FF6A30' : '#888',
                border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 500
              }}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', background: 'transparent', color: '#ff4444', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        {renderTab()}
      </main>
    </div>
  )
}

function DashboardTab() {
  const [stats, setStats] = useState({ total: 0, new24h: 0 })

  useEffect(() => {
    async function load() {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const { count: total } = await supabase.from('waitlist').select('*', { count: 'exact', head: true })
      const { count: new24h } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString())
      
      setStats({ total: total || 0, new24h: new24h || 0 })
    }
    load()
  }, [])

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Overview</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid #333' }}>
          <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Signups</p>
          <h2 style={{ fontSize: '2.5rem', color: '#fff' }}>{stats.total.toLocaleString()}</h2>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid #333' }}>
          <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>New (24h)</p>
          <h2 style={{ fontSize: '2.5rem', color: '#FF6A30' }}>+{stats.new24h}</h2>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', flex: 1, border: '1px solid #333' }}>
          <p style={{ color: '#888', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Conversion Rate</p>
          <h2 style={{ fontSize: '2.5rem', color: '#fff' }}>24.1%</h2>
        </div>
      </div>
    </div>
  )
}

function WaitlistTab() {
  const [users, setUsers] = useState<any[]>([])
  
  useEffect(() => {
    supabase.from('waitlist').select('*').order('created_at', { ascending: false }).limit(50).then((res: any) => {
      if (res.data) setUsers(res.data)
    })
  }, [])

  const handleExport = () => {
    const csv = 'Email,Name,Created At\n' + users.map(u => `${u.email},${u.name || ''},${u.created_at}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'waitlist-export.csv'
    a.click()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete user?')) {
      await supabase.from('waitlist').delete().eq('id', id)
      setUsers(users.filter(u => u.id !== id))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Waitlist Management</h1>
        <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Joined</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>{u.name || '-'}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(u.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CMSTab() {
  const [config, setConfig] = useState<any>({
    hero_title: 'Turn Action Into Progress.',
    hero_subtext: 'LifeOS is a proof-driven system where your actions become measurable growth.',
    cta_text: 'Secure Your Position',
    show_features: true
  })
  const [saving, setSaving] = useState(false)

  // In production, we'd load this from a table "site_config".
  // Because we want a quick MVP, we'll store JSON in localStorage to sync if DB table isn't ready.

  useEffect(() => {
    const saved = localStorage.getItem('site_config_mock')
    if (saved) setConfig(JSON.parse(saved))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Supabase table update logic here
    localStorage.setItem('site_config_mock', JSON.stringify(config))
    setTimeout(() => {
      setSaving(false)
      window.dispatchEvent(new Event('storage')) // Force refresh on other tabs if local
    }, 500)
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>CMS Control</h1>
      
      <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Hero Title</label>
          <input type="text" value={config.hero_title} onChange={e => setConfig({ ...config, hero_title: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Hero Subtext</label>
          <textarea rows={3} value={config.hero_subtext} onChange={e => setConfig({ ...config, hero_subtext: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px', resize: 'vertical' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>CTA Button Text</label>
          <input type="text" value={config.cta_text} onChange={e => setConfig({ ...config, cta_text: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: '#222', border: '1px solid #444', color: '#fff', borderRadius: '6px' }} />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.show_features} onChange={e => setConfig({ ...config, show_features: e.target.checked })} style={{ width: '16px', height: '16px' }} />
            Show Features Section
          </label>
        </div>

        <button onClick={handleSave} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--primary, #FF6A30)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          {saving ? 'Publishing...' : <><CheckCircle size={18} /> Publish Live</>}
        </button>
      </div>
    </div>
  )
}

function AnalyticsTab() {
  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Analytics</h1>
      <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center', color: '#888' }}>
        <BarChart2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p>Simple Line Chart (Development Mock)</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Visualizing weekly growth and DAU.</p>
      </div>
    </div>
  )
}

function SettingsTab() {
  const handleClear = () => {
    const code = prompt('Type "PURGE" to clear entire waitlist.')
    if (code === 'PURGE') {
      alert('Delete operations triggered (Simulation)')
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Settings</h1>
      
      <div style={{ background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Export Full Database</h3>
          <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Download a complete JSON dump of the Waitlist table.</p>
          <button style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Export JSON</button>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#ff4444' }}>Danger Zone</h3>
          <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>This action cannot be undone. All waitlist signups will be wiped.</p>
          <button onClick={handleClear} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '6px', cursor: 'pointer' }}>Clear Entire Waitlist</button>
        </div>
      </div>
    </div>
  )
}
