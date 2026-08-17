import React, { useState } from 'react';
import './index.css';

// 模擬資料
const mockData = {
  totalAssets: 2850000,
  monthlyIncome: 185000,
  monthlyExpense: 92000,
  savingsRate: 50.3,
  accounts: [
    { name: '銀行帳戶', balance: 1250000, type: 'bank' },
    { name: '電子錢包', balance: 45000, type: 'wallet' },
    { name: '投資帳戶', balance: 1555000, type: 'investment' },
  ],
  recentTransactions: [
    { id: 1, date: '2025-01-15', description: '薪資收入', amount: 85000, type: 'income', category: '薪資' },
    { id: 2, date: '2025-01-14', description: '超市購物', amount: -2500, type: 'expense', category: '飲食' },
    { id: 3, date: '2025-01-13', description: '捷運月票', amount: -1200, type: 'expense', category: '交通' },
    { id: 4, date: '2025-01-12', description: '水電費', amount: -3500, type: 'expense', category: '生活' },
    { id: 5, date: '2025-01-11', description: '股票股息', amount: 8000, type: 'income', category: '投資' },
  ],
  budgetProgress: [
    { category: '飲食', spent: 15000, limit: 20000, percentage: 75 },
    { category: '交通', spent: 3500, limit: 5000, percentage: 70 },
    { category: '生活', spent: 8000, limit: 10000, percentage: 80 },
    { category: '娛樂', spent: 4500, limit: 8000, percentage: 56 },
  ],
};

// 側邊欄組件
function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', label: '儀表板', icon: '📊' },
    { id: 'transactions', label: '交易記錄', icon: '💰' },
    { id: 'accounts', label: '帳戶管理', icon: '🏦' },
    { id: 'budget', label: '預算追蹤', icon: '📋' },
    { id: 'reports', label: '報表分析', icon: '📈' },
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
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

// 儀表板頁面
function DashboardPage() {
  const data = mockData;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">財務儀表板</h1>
        <p className="page-subtitle">歡迎回來！這是你的財務總覽</p>
      </div>

      {/* 統計卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">總資產</span>
            <div className="stat-card-icon assets">💎</div>
          </div>
          <div className="stat-card-value">
            NT$ {data.totalAssets.toLocaleString()}
          </div>
          <div className="stat-card-change positive">↑ 較上月 +5.2%</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">本月收入</span>
            <div className="stat-card-icon income">📈</div>
          </div>
          <div className="stat-card-value">
            NT$ {data.monthlyIncome.toLocaleString()}
          </div>
          <div className="stat-card-change positive">↑ 正常</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">本月支出</span>
            <div className="stat-card-icon expense">📉</div>
          </div>
          <div className="stat-card-value">
            NT$ {data.monthlyExpense.toLocaleString()}
          </div>
          <div className="stat-card-change negative">↑ 超支 12%</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">儲蓄率</span>
            <div className="stat-card-icon savings">💰</div>
          </div>
          <div className="stat-card-value">{data.savingsRate}%</div>
          <div className="stat-card-change positive">↑ 健康</div>
        </div>
      </div>

      {/* 帳戶概覽 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">帳戶概覽</h3>
          <button className="btn btn-secondary">查看全部</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>帳戶名稱</th>
                <th>類型</th>
                <th>餘額</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account, index) => (
                <tr key={index}>
                  <td>{account.name}</td>
                  <td>
                    <span className={`badge badge-info`}>
                      {account.type === 'bank' ? '銀行' : account.type === 'wallet' ? '電子錢包' : '投資'}
                    </span>
                  </td>
                  <td>NT$ {account.balance.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-success">正常</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 最近交易 */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">最近交易</h3>
          <button className="btn btn-primary">+ 新增交易</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>描述</th>
                <th>類別</th>
                <th>金額</th>
                <th>類型</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span className={`badge ${
                      tx.category === '薪資' ? 'badge-success' :
                      tx.category === '投資' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td style={{ color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.amount > 0 ? '+' : ''}NT$ {Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 交易記錄頁面
function TransactionsPage() {
  const data = mockData;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">交易記錄</h1>
        <p className="page-subtitle">管理所有收支交易</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">所有交易</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary">篩選</button>
            <button className="btn btn-primary">+ 新增交易</button>
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>日期</th>
                <th>描述</th>
                <th>類別</th>
                <th>帳戶</th>
                <th>金額</th>
                <th>類型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.description}</td>
                  <td>
                    <span className={`badge ${
                      tx.category === '薪資' ? 'badge-success' :
                      tx.category === '投資' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td>銀行帳戶</td>
                  <td style={{ color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {tx.amount > 0 ? '+' : ''}NT$ {Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${tx.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.type === 'income' ? '收入' : '支出'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 帳戶管理頁面
function AccountsPage() {
  const data = mockData;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">帳戶管理</h1>
        <p className="page-subtitle">管理所有財務帳戶</p>
      </div>

      <div className="stats-grid">
        {data.accounts.map((account, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{account.name}</span>
              <div className={`stat-card-icon ${
                account.type === 'bank' ? 'assets' :
                account.type === 'wallet' ? 'savings' : 'income'
              }`}>
                {account.type === 'bank' ? '🏦' : account.type === 'wallet' ? '💳' : '📈'}
              </div>
            </div>
            <div className="stat-card-value">
              NT$ {account.balance.toLocaleString()}
            </div>
            <div className="stat-card-change">
              <span className="badge badge-success">正常</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">帳戶詳情</h3>
          <button className="btn btn-primary">+ 新增帳戶</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>帳戶名稱</th>
                <th>類型</th>
                <th>餘額</th>
                <th>上月變動</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account, index) => (
                <tr key={index}>
                  <td>{account.name}</td>
                  <td>
                    <span className={`badge badge-info`}>
                      {account.type === 'bank' ? '銀行帳戶' : account.type === 'wallet' ? '電子錢包' : '投資帳戶'}
                    </span>
                  </td>
                  <td>NT$ {account.balance.toLocaleString()}</td>
                  <td style={{ color: 'var(--success)' }}>+2.5%</td>
                  <td>
                    <span className="badge badge-success">正常</span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      管理
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 預算追蹤頁面
function BudgetPage() {
  const data = mockData;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">預算追蹤</h1>
        <p className="page-subtitle">監控各類別預算使用情況</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">預算進度</h3>
          <button className="btn btn-primary">+ 新增預算</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.budgetProgress.map((budget, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{budget.category}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  NT$ {budget.spent.toLocaleString()} / NT$ {budget.limit.toLocaleString()}
                </span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${budget.percentage}%`,
                  background: budget.percentage > 80 ? 'var(--danger)' : 
                              budget.percentage > 60 ? 'var(--warning)' : 'var(--success)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: budget.percentage > 80 ? 'var(--danger)' : 'var(--text-muted)',
                marginTop: '4px'
              }}>
                {budget.percentage}% 已使用
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 報表分析頁面
function ReportsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">報表分析</h1>
        <p className="page-subtitle">視覺化財務數據分析</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">收支趨勢</h3>
          </div>
          <div className="placeholder">
            <div className="placeholder-icon">📈</div>
            <div className="placeholder-title">圖表區域</div>
            <div className="placeholder-text">這裡將顯示收支趨勢圖表</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">類別分布</h3>
          </div>
          <div className="placeholder">
            <div className="placeholder-icon">🥧</div>
            <div className="placeholder-title">圖表區域</div>
            <div className="placeholder-text">這裡將顯示類別分布圖表</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">資產配置</h3>
          </div>
          <div className="placeholder">
            <div className="placeholder-icon">💎</div>
            <div className="placeholder-title">圖表區域</div>
            <div className="placeholder-text">這裡將顯示資產配置圖表</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">儲蓄趨勢</h3>
          </div>
          <div className="placeholder">
            <div className="placeholder-icon">💰</div>
            <div className="placeholder-title">圖表區域</div>
            <div className="placeholder-text">這裡將顯示儲蓄趨勢圖表</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 設定頁面
function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">設定</h1>
        <p className="page-subtitle">應用程式設定與偏好</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">一般設定</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">應用程式語言</label>
            <select className="form-select">
              <option>繁體中文</option>
              <option>English</option>
              <option>日本語</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">貨幣單位</label>
            <select className="form-select">
              <option>NTD (新台幣)</option>
              <option>USD (美元)</option>
              <option>JPY (日圓)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">資料同步</label>
            <select className="form-select">
              <option>手動同步</option>
              <option>每日同步</option>
              <option>每週同步</option>
            </select>
          </div>

          <button className="btn btn-primary">儲存設定</button>
        </div>
      </div>
    </div>
  );
}

// 主應用程式
function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'budget':
        return <BudgetPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      {/* 側邊欄 */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      {/* 主要內容 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 標題列 */}
        <div className="titlebar">
          <div className="titlebar-drag">
            <span className="titlebar-title">Family Finance - 家庭財務管理</span>
          </div>
          <div className="titlebar-controls">
            <button className="titlebar-btn" title="最小化">─</button>
            <button className="titlebar-btn" title="最大化">□</button>
            <button className="titlebar-btn close" title="關閉">✕</button>
          </div>
        </div>
        
        {/* 頁面內容 */}
        <div className="main-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
