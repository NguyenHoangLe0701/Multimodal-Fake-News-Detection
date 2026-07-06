const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function parseResponse(response) {
  const json = await response.json();
  if (json.status !== 'success') {
    throw new Error(json.message || 'Yêu cầu thất bại');
  }
  return json.data;
}

export async function predictNews(text, imageFile, userEmail = null) {
  const formData = new FormData();
  if (text?.trim()) formData.append('text', text.trim());
  if (imageFile) formData.append('image', imageFile);
  if (userEmail) formData.append('user_email', userEmail);

  const response = await fetch(`${API_BASE}/predict/`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    let errorMsg = `Lỗi máy chủ (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.detail) errorMsg = errJson.detail;
    } catch {}
    throw new Error(errorMsg);
  }
  return await parseResponse(response);
}

export async function getHistory(limit = 50, userEmail = null) {
  let url = `${API_BASE}/history/?limit=${limit}`;
  if (userEmail) url += `&email=${encodeURIComponent(userEmail)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Không thể tải lịch sử');
  return await parseResponse(response);
}

export async function getAdminStats() {
  const response = await fetch(`${API_BASE}/admin/dashboard`);
  if (!response.ok) throw new Error('Không thể tải thống kê');
  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.message || 'Lỗi thống kê');
  return json.stats;
}

export async function getAdminPredictions(limit = 50) {
  const response = await fetch(`${API_BASE}/admin/predictions?limit=${limit}`);
  if (!response.ok) throw new Error('Không thể tải logs');
  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.message || 'Lỗi logs');
  return json.data;
}

export async function submitPredictionFeedback(id, feedback) {
  const response = await fetch(`${API_BASE}/admin/predictions/${id}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback }),
  });
  const json = await response.json();
  if (json.status !== 'success') throw new Error(json.message || 'Lưu feedback thất bại');
  return json.data;
}

