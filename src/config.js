// Google OAuth 設定
// TODO: 填入你的 OAuth Client ID（建立後貼到這裡）
export const GOOGLE_CLIENT_ID = '571410634682-1s7aqci429g3nin2ga8kctf7kdcao1lr.apps.googleusercontent.com';

// 需要的 Google API 權限（先只留必要的 Drive 讀寫，Sheets/日曆之後再加）
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',      // 讀寫 app 建立的檔案
].join(' ');

// Drive 資料夾與檔案名稱
export const APP_FOLDER_NAME = 'family app';
export const DATA_FILE_NAME = 'data.json';

// 首次登入建立的示範資料
export const DEMO_DATA = {
  accounts: [
    { id: 'a1', name: '銀行帳戶', type: 'bank', balance: 1250000 },
    { id: 'a2', name: '電子錢包', type: 'wallet', balance: 45000 },
    { id: 'a3', name: '投資帳戶', type: 'investment', balance: 1555000 },
  ],
  transactions: [
    { id: 't1', date: '2025-01-15', desc: '薪資收入', amount: 85000, type: 'income', category: '薪資', accountId: 'a1' },
    { id: 't2', date: '2025-01-14', desc: '超市購物', amount: -2500, type: 'expense', category: '飲食', accountId: 'a2' },
    { id: 't3', date: '2025-01-13', desc: '捷運月票', amount: -1200, type: 'expense', category: '交通', accountId: 'a2' },
    { id: 't4', date: '2025-01-12', desc: '水電費', amount: -3500, type: 'expense', category: '生活', accountId: 'a1' },
    { id: 't5', date: '2025-01-11', desc: '股票股息', amount: 8000, type: 'income', category: '投資', accountId: 'a3' },
  ],
  budgets: [
    { category: '飲食', limit: 20000 },
    { category: '交通', limit: 5000 },
    { category: '生活', limit: 10000 },
    { category: '娛樂', limit: 8000 },
  ],
  loans: [
    { id: 'l1', name: '房貸', total: 8000000, rate: 2.1, payDay: 5, monthly: 35000 },
  ],
};
