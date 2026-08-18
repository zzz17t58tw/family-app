import React, { useState, useEffect } from 'react';
import './index.css';
import { initGoogleAuth, signIn, signOut, isSignedIn, setTokenChangeHandler } from './googleAuth';
import { loadData, saveData } from './drive';

// ── 工具函數 ──
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmt(n) { return 'NT$ ' + Math.abs(n).toLocaleString(); }
function today() { return new Date().toISOString().slice(0, 10); }
function accName(data, id) { const a = (data.accounts || []).find(x => x.id === id); return a ? a.name : '—'; }

// 計算總資產
function totalAssets(data) {
  return (data.accounts || []).reduce((s, a) => s + (a.balance || 0), 0);
}
// 本月收支
function monthlySummary(data) {
  const m = today().slice(0, 7);
  let income = 0, expense = 0;
  (data.transactions || []).forEach(t => {
    if (!t.date || !t.date.startsWith(m)) return;
    if (t.amount > 0) income += t.amount; else expense += Math.abs(t.amount);
  });
  return { income, expense, saving: income > 0 ? Math.round((income - expense) / income * 1000) / 10 : 0 };
}

// ── 登入頁 ──
function LoginScreen({ onSignIn, error }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ maxWidth: 420, width: '90%', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ fontSize: 48 }}>💎</div>
        <h1 style={{ margin: '12px 0 8px' }}>Family Finance</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>家庭財務管理 · 登入 Google 帳戶即可使用</p>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
        <button className="btn btn-primary" onClick={onSignIn} style={{ width: '100%', padding: '14px', fontSize: 16 }}>
          使用 Google 帳戶登入
        </button>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
          財務資料儲存在你自己的 Google 雲端硬碟，登入才看得到
        </p>
      </div>
    </div>
  );
}

// ── 側邊欄 ──
function Sidebar({ activePage, setActivePage, onSignOut }) {
  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: '📊' },
    { id: 'transactions', label: '交易記錄', icon: '💰' },
    { id: 'accounts', label: '帳戶管理', icon: '🏦' },
    { id: 'budget', label: '預算追蹤', icon: '📋' },
    { id: 'reports', label: '報表分析', icon: '📈' },
    { id: 'loans', label: '貸款管理', icon: '🏠' },
    { id: 'settings', label: '設定', icon: '⚙️' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💎</div>
          <div className="sidebar-logo-text">Family Finance</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">主要功能</div>
          {navItems.map(item => (
            <div key={item.id} className={`nav-item ${activePage === item.id ? 'active' : ''}`} onClick={() => setActivePage(item.id)}>
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
      <div style={{ padding: '16px' }}>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onSignOut}>登出</button>
      </div>
    </div>
  );
}

// ── 儀表板 ──
function DashboardPage({ data }) {
  const assets = totalAssets(data);
  const { income, expense, saving } = monthlySummary(data);
  const recent = [...(data.transactions || [])].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8);
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">財務儀表板</h1>
        <p className="page-subtitle">你的財務總覽</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">總資產</span><div className="stat-card-icon assets">💎</div></div><div className="stat-card-value">{fmt(assets)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">本月收入</span><div className="stat-card-icon income">📈</div></div><div className="stat-card-value">{fmt(income)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">本月支出</span><div className="stat-card-icon expense">📉</div></div><div className="stat-card-value">{fmt(expense)}</div></div>
        <div className="stat-card"><div className="stat-card-header"><span className="stat-card-label">儲蓄率</span><div className="stat-card-icon savings">💰</div></div><div className="stat-card-value">{saving}%</div></div>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">帳戶概覽</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>帳戶名稱</th><th>類型</th><th>餘額</th></tr></thead>
            <tbody>
              {(data.accounts || []).map(a => (
                <tr key={a.id}>
                  <td>{a.name}</td>
                  <td><span className="badge badge-info">{a.type === 'bank' ? '銀行' : a.type === 'wallet' ? '電子錢包' : '投資'}</span></td>
                  <td>{fmt(a.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">最近交易</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>日期</th><th>描述</th><th>類別</th><th>金額</th></tr></thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td><td>{t.desc}</td>
                  <td><span className={`badge ${t.amount > 0 ? 'badge-success' : 'badge-warning'}`}>{t.category}</span></td>
                  <td style={{ color: t.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>{t.amount > 0 ? '+' : ''}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 交易記錄（記帳）──
function TransactionsPage({ data, onUpdate }) {
  const [form, setForm] = useState({ date: today(), desc: '', amount: '', type: 'expense', category: '飲食', accountId: '' });
  const tx = [...(data.transactions || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  function addTx() {
    const amt = parseFloat(form.amount);
    if (!form.desc || isNaN(amt) || amt <= 0 || !form.accountId) { alert('請填寫描述、金額並選擇帳戶'); return; }
    const amount = form.type === 'income' ? amt : -amt;
    const newTx = { id: genId(), date: form.date, desc: form.desc, amount, type: form.type, category: form.category, accountId: form.accountId };
    const accounts = data.accounts.map(a => a.id === form.accountId ? { ...a, balance: a.balance + amount } : a);
    onUpdate({ ...data, transactions: [newTx, ...data.transactions], accounts });
    setForm({ ...form, desc: '', amount: '' });
  }
  function delTx(id) {
    const t = data.transactions.find(x => x.id === id);
    if (!t) return;
    const accounts = data.accounts.map(a => a.id === t.accountId ? { ...a, balance: a.balance - t.amount } : a);
    onUpdate({ ...data, transactions: data.transactions.filter(x => x.id !== id), accounts });
  }
  return (
    <div>
      <div className="page-header"><h1 className="page-title">交易記錄</h1><p className="page-subtitle">手動記帳</p></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">新增交易</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 20px 20px' }}>
          <input className="form-select" style={{ width: 130 }} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <select className="form-select" style={{ width: 120 }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="expense">支出</option><option value="income">收入</option>
          </select>
          <input className="form-select" style={{ width: 200 }} placeholder="描述（例如：超市購物）" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
          <input className="form-select" style={{ width: 130 }} type="number" placeholder="金額" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <select className="form-select" style={{ width: 120 }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {['飲食','交通','生活','娛樂','薪資','投資','醫療','教育','其他'].map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-select" style={{ width: 140 }} value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })}>
            <option value="">選擇帳戶</option>
            {(data.accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={addTx}>+ 新增</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">所有交易</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>日期</th><th>描述</th><th>類別</th><th>帳戶</th><th>金額</th><th>操作</th></tr></thead>
            <tbody>
              {tx.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td><td>{t.desc}</td>
                  <td><span className={`badge ${t.amount > 0 ? 'badge-success' : 'badge-warning'}`}>{t.category}</span></td>
                  <td>{accName(data, t.accountId)}</td>
                  <td style={{ color: t.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>{t.amount > 0 ? '+' : ''}{fmt(t.amount)}</td>
                  <td><button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => delTx(t.id)}>刪除</button></td>
                </tr>
              ))}
              {tx.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無交易</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 帳戶管理（餘額 + 轉帳）──
function AccountsPage({ data, onUpdate }) {
  const [form, setForm] = useState({ fromId: '', toId: '', amount: '' });
  const [newAcc, setNewAcc] = useState({ name: '', type: 'bank', balance: '' });
  function transfer() {
    const amt = parseFloat(form.amount);
    if (!form.fromId || !form.toId || form.fromId === form.toId || isNaN(amt) || amt <= 0) { alert('請填寫正確的轉帳資訊'); return; }
    const accounts = data.accounts.map(a => a.id === form.fromId ? { ...a, balance: a.balance - amt } : a.id === form.toId ? { ...a, balance: a.balance + amt } : a);
    const tx = { id: genId(), date: today(), desc: '帳戶轉帳', amount: -amt, type: 'expense', category: '轉帳', accountId: form.fromId };
    onUpdate({ ...data, accounts, transactions: [tx, ...data.transactions] });
    setForm({ fromId: '', toId: '', amount: '' });
  }
  function addAccount() {
    const bal = parseFloat(newAcc.balance);
    if (!newAcc.name || isNaN(bal)) { alert('請填寫帳戶名稱與餘額'); return; }
    onUpdate({ ...data, accounts: [...data.accounts, { id: genId(), name: newAcc.name, type: newAcc.type, balance: bal }] });
    setNewAcc({ name: '', type: 'bank', balance: '' });
  }
  return (
    <div>
      <div className="page-header"><h1 className="page-title">帳戶管理</h1><p className="page-subtitle">管理帳戶餘額與轉帳</p></div>
      <div className="stats-grid">
        {(data.accounts || []).map(a => (
          <div key={a.id} className="stat-card">
            <div className="stat-card-header"><span className="stat-card-label">{a.name}</span><div className={`stat-card-icon ${a.type === 'bank' ? 'assets' : a.type === 'wallet' ? 'savings' : 'income'}`}>{a.type === 'bank' ? '🏦' : a.type === 'wallet' ? '💳' : '📈'}</div></div>
            <div className="stat-card-value">{fmt(a.balance)}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">帳戶間轉帳</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 20px 20px' }}>
          <select className="form-select" style={{ width: 160 }} value={form.fromId} onChange={e => setForm({ ...form, fromId: e.target.value })}>
            <option value="">轉出帳戶</option>{(data.accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select className="form-select" style={{ width: 160 }} value={form.toId} onChange={e => setForm({ ...form, toId: e.target.value })}>
            <option value="">轉入帳戶</option>{(data.accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input className="form-select" style={{ width: 150 }} type="number" placeholder="轉帳金額" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <button className="btn btn-primary" onClick={transfer}>轉帳</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">新增帳戶</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 20px 20px' }}>
          <input className="form-select" style={{ width: 180 }} placeholder="帳戶名稱" value={newAcc.name} onChange={e => setNewAcc({ ...newAcc, name: e.target.value })} />
          <select className="form-select" style={{ width: 140 }} value={newAcc.type} onChange={e => setNewAcc({ ...newAcc, type: e.target.value })}>
            <option value="bank">銀行</option><option value="wallet">電子錢包</option><option value="investment">投資</option>
          </select>
          <input className="form-select" style={{ width: 150 }} type="number" placeholder="初始餘額" value={newAcc.balance} onChange={e => setNewAcc({ ...newAcc, balance: e.target.value })} />
          <button className="btn btn-primary" onClick={addAccount}>+ 新增帳戶</button>
        </div>
      </div>
    </div>
  );
}

// ── 預算追蹤（超支紅字）──
function BudgetPage({ data, onUpdate }) {
  const [form, setForm] = useState({ category: '飲食', limit: '' });
  const m = today().slice(0, 7);
  const spentByCat = {};
  (data.transactions || []).forEach(t => { if (t.date && t.date.startsWith(m) && t.amount < 0) spentByCat[t.category] = (spentByCat[t.category] || 0) + Math.abs(t.amount); });
  function addBudget() {
    const lim = parseFloat(form.limit);
    if (isNaN(lim) || lim <= 0) { alert('請填寫預算上限'); return; }
    if ((data.budgets || []).some(b => b.category === form.category)) { alert('此類別已有預算'); return; }
    onUpdate({ ...data, budgets: [...(data.budgets || []), { category: form.category, limit: lim }] });
    setForm({ category: '飲食', limit: '' });
  }
  function delBudget(cat) { onUpdate({ ...data, budgets: data.budgets.filter(b => b.category !== cat) }); }
  return (
    <div>
      <div className="page-header"><h1 className="page-title">預算追蹤</h1><p className="page-subtitle">超支會顯示紅字警示</p></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">設定預算</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 20px 20px' }}>
          <select className="form-select" style={{ width: 130 }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {['飲食','交通','生活','娛樂','醫療','教育','其他'].map(c => <option key={c}>{c}</option>)}
          </select>
          <input className="form-select" style={{ width: 160 }} type="number" placeholder="每月預算上限" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} />
          <button className="btn btn-primary" onClick={addBudget}>+ 新增預算</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">本月預算進度</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
          {(data.budgets || []).map(b => {
            const spent = spentByCat[b.category] || 0;
            const pct = Math.min(100, Math.round(spent / b.limit * 100));
            const over = spent > b.limit;
            return (
              <div key={b.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: over ? 'var(--danger)' : 'var(--text-primary)' }}>{b.category} {over && '⚠️ 超支'}</span>
                  <span style={{ color: over ? 'var(--danger)' : 'var(--text-secondary)' }}>{fmt(spent)} / {fmt(b.limit)}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : 'var(--success)', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12 }}>
                  <span style={{ color: over ? 'var(--danger)' : 'var(--text-muted)' }}>{pct}% 已使用</span>
                  <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => delBudget(b.category)}>移除</button>
                </div>
              </div>
            );
          })}
          {(data.budgets || []).length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚未設定預算</p>}
        </div>
      </div>
    </div>
  );
}

// ── 報表分析（圖表）──
function ReportsPage({ data }) {
  const catSpent = {};
  (data.transactions || []).forEach(t => { if (t.amount < 0) catSpent[t.category] = (catSpent[t.category] || 0) + Math.abs(t.amount); });
  const cats = Object.entries(catSpent).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...cats.map(c => c[1]), 1);
  const months = {};
  (data.transactions || []).forEach(t => { if (!t.date) return; const m = t.date.slice(0, 7); if (t.amount > 0) months[m] = (months[m] || { i: 0, e: 0 }) && { i: (months[m]?.i || 0) + t.amount, e: months[m]?.e || 0 }; else months[m] = { i: months[m]?.i || 0, e: (months[m]?.e || 0) + Math.abs(t.amount) }; });
  const monList = Object.keys(months).sort().slice(-6);
  const maxMon = Math.max(...monList.map(m => Math.max(months[m].i, months[m].e)), 1);
  return (
    <div>
      <div className="page-header"><h1 className="page-title">報表分析</h1><p className="page-subtitle">視覺化財務數據</p></div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3 className="card-title">花費分類（長條圖）</h3></div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cats.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚無支出資料</p>}
            {cats.map(([cat, val]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span>{cat}</span><span>{fmt(val)}</span></div>
                <div style={{ height: 10, background: 'var(--bg-primary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val / max * 100}%`, background: 'var(--primary)', borderRadius: 5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">近 6 個月收支</h3></div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monList.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>尚無資料</p>}
            {monList.map(m => (
              <div key={m}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>{m}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ height: 10, background: 'var(--bg-primary)', borderRadius: 5, overflow: 'hidden', flex: 1 }}>
                    <div style={{ height: '100%', width: `${months[m].i / maxMon * 100}%`, background: 'var(--success)', borderRadius: 5 }} />
                  </div>
                  <span style={{ fontSize: 11, width: 70, color: 'var(--success)' }}>收 {fmt(months[m].i)}</span>
                  <div style={{ height: 10, background: 'var(--bg-primary)', borderRadius: 5, overflow: 'hidden', flex: 1 }}>
                    <div style={{ height: '100%', width: `${months[m].e / maxMon * 100}%`, background: 'var(--danger)', borderRadius: 5 }} />
                  </div>
                  <span style={{ fontSize: 11, width: 70, color: 'var(--danger)' }}>支 {fmt(months[m].e)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 貸款管理 ──
function LoansPage({ data, onUpdate }) {
  const [form, setForm] = useState({ name: '', total: '', rate: '', payDay: '', monthly: '' });
  function addLoan() {
    const total = parseFloat(form.total), monthly = parseFloat(form.monthly), payDay = parseInt(form.payDay);
    if (!form.name || isNaN(total) || isNaN(monthly) || isNaN(payDay) || payDay < 1 || payDay > 31) { alert('請完整填寫貸款資料'); return; }
    onUpdate({ ...data, loans: [...(data.loans || []), { id: genId(), name: form.name, total, rate: parseFloat(form.rate) || 0, payDay, monthly }] });
    setForm({ name: '', total: '', rate: '', payDay: '', monthly: '' });
  }
  function delLoan(id) { onUpdate({ ...data, loans: data.loans.filter(l => l.id !== id) }); }
  return (
    <div>
      <div className="page-header"><h1 className="page-title">貸款管理</h1><p className="page-subtitle">記錄貸款與還款日（之後會自動在 Google 日曆提醒）</p></div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">新增貸款</h3></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '0 20px 20px' }}>
          <input className="form-select" style={{ width: 180 }} placeholder="貸款名稱（例：房貸）" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="form-select" style={{ width: 150 }} type="number" placeholder="總額" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} />
          <input className="form-select" style={{ width: 120 }} type="number" step="0.1" placeholder="年利率 %" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} />
          <input className="form-select" style={{ width: 130 }} type="number" placeholder="每月還款日(1-31)" value={form.payDay} onChange={e => setForm({ ...form, payDay: e.target.value })} />
          <input className="form-select" style={{ width: 150 }} type="number" placeholder="每月還款金額" value={form.monthly} onChange={e => setForm({ ...form, monthly: e.target.value })} />
          <button className="btn btn-primary" onClick={addLoan}>+ 新增</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3 className="card-title">貸款列表</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>名稱</th><th>總額</th><th>年利率</th><th>每月還款日</th><th>每月金額</th><th>操作</th></tr></thead>
            <tbody>
              {(data.loans || []).map(l => (
                <tr key={l.id}>
                  <td>{l.name}</td><td>{fmt(l.total)}</td><td>{l.rate}%</td><td>每月 {l.payDay} 日</td><td>{fmt(l.monthly)}</td>
                  <td><button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => delLoan(l.id)}>刪除</button></td>
                </tr>
              ))}
              {(data.loans || []).length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無貸款</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── 設定 ──
function SettingsPage({ onSignOut, onRefresh, error }) {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">設定</h1><p className="page-subtitle">帳戶與同步</p></div>
      <div className="card" style={{ maxWidth: 480 }}>
        <div className="card-header"><h3 className="card-title">帳戶</h3></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 20px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>財務資料儲存在你的 Google 雲端硬碟「family app」資料夾</p>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button className="btn btn-secondary" onClick={onRefresh}>重新載入資料</button>
          <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={onSignOut}>登出</button>
        </div>
      </div>
    </div>
  );
}

// ── 主應用程式 ──
function App() {
  const [authState, setAuthState] = useState('loading');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  async function loadUserData() {
    setAuthState('signedIn');
    setLoading(true);
    setError(null);
    try {
      const d = await loadData();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTokenChangeHandler(async (token) => {
      if (token) await loadUserData();
      else { setAuthState('signedOut'); setData(null); }
    });
    initGoogleAuth(() => {
      if (isSignedIn()) loadUserData();
      else setAuthState('signedOut');
    });
  }, []);

  async function updateData(updater) {
    const newData = updater(data);
    setData(newData);
    try { await saveData(newData); setError(null); }
    catch (e) { setError('儲存失敗：' + e.message); }
  }

  if (authState === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}><p style={{ color: 'var(--text-secondary)' }}>載入中…</p></div>;
  }
  if (authState === 'signedOut') {
    return <LoginScreen onSignIn={signIn} error={error} />;
  }

  const renderPage = () => {
    if (loading) return <p style={{ color: 'var(--text-secondary)' }}>載入資料中…</p>;
    switch (activePage) {
      case 'dashboard': return <DashboardPage data={data} />;
      case 'transactions': return <TransactionsPage data={data} onUpdate={updateData} />;
      case 'accounts': return <AccountsPage data={data} onUpdate={updateData} />;
      case 'budget': return <BudgetPage data={data} onUpdate={updateData} />;
      case 'reports': return <ReportsPage data={data} />;
      case 'loans': return <LoansPage data={data} onUpdate={updateData} />;
      case 'settings': return <SettingsPage onSignOut={signOut} onRefresh={loadUserData} error={error} />;
      default: return <DashboardPage data={data} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onSignOut={signOut} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="main-content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;
