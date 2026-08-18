import { getAccessToken } from './googleAuth';
import { APP_FOLDER_NAME, DATA_FILE_NAME, DEMO_DATA } from './config';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';

async function apiFetch(url, options = {}) {
  const token = getAccessToken();
  if (!token) throw new Error('未登入');
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let detail = errText;
    try {
      const j = JSON.parse(errText);
      detail = j.error?.message || errText;
    } catch (e) { /* ignore */ }
    throw new Error(`Google API 錯誤 (${res.status})：${detail}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// 找到或建立「family app」資料夾
async function getOrCreateFolder() {
  const q = encodeURIComponent(`name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const list = await apiFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`);
  if (list.files && list.files.length > 0) return list.files[0].id;
  const created = await apiFetch(`${DRIVE_API}/files`, {
    method: 'POST',
    body: JSON.stringify({ name: APP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  return created.id;
}

async function findDataFile(folderId) {
  const q = encodeURIComponent(`name='${DATA_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
  const list = await apiFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`);
  return list.files && list.files.length > 0 ? list.files[0].id : null;
}

async function createDataFile(folderId, data) {
  const meta = await apiFetch(`${DRIVE_API}/files`, {
    method: 'POST',
    body: JSON.stringify({ name: DATA_FILE_NAME, mimeType: 'application/json', parents: [folderId] }),
  });
  await uploadContent(meta.id, data);
  return meta.id;
}

async function uploadContent(fileId, data) {
  const token = getAccessToken();
  const res = await fetch(`${DRIVE_API}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`上傳失敗 ${res.status}`);
}

// 讀取資料（首次登入自動建立示範資料）
export async function loadData() {
  const folderId = await getOrCreateFolder();
  const fileId = await findDataFile(folderId);
  if (!fileId) {
    const demo = JSON.parse(JSON.stringify(DEMO_DATA));
    await createDataFile(folderId, demo);
    return demo;
  }
  return await apiFetch(`${DRIVE_API}/files/${fileId}?alt=media`);
}

// 寫入資料
export async function saveData(data) {
  const folderId = await getOrCreateFolder();
  let fileId = await findDataFile(folderId);
  if (!fileId) {
    fileId = await createDataFile(folderId, data);
  } else {
    await uploadContent(fileId, data);
  }
}
