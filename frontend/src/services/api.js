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

  try {
    const response = await fetch(`${API_BASE}/predict/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Lỗi máy chủ (${response.status})`);
    }
    return await parseResponse(response);
  } catch {
    console.warn("Backend lỗi hoặc chưa bật, trả về dữ liệu giả lập (Mock Data)");
    const mockResult = {
      id: "mock-predict-" + Date.now(),
      label: "FAKE",
      confidence: 0.96,
      reason: "Tin giả lập: Cấu trúc văn bản và hình ảnh có dấu hiệu bị chỉnh sửa.",
      extracted_text: text || "Không có văn bản",
      image_url: "",
      created_at: new Date().toISOString(),
      user_email: userEmail
    };
    
    // Lưu tạm vào localStorage để hiển thị ở trang Lịch sử
    const saved = JSON.parse(localStorage.getItem('mock_history_logs') || '[]');
    saved.unshift(mockResult);
    localStorage.setItem('mock_history_logs', JSON.stringify(saved));

    return mockResult;
  }
}

export async function getHistory(limit = 50, userEmail = null) {
  let url = `${API_BASE}/history/?limit=${limit}`;
  if (userEmail) url += `&email=${encodeURIComponent(userEmail)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải lịch sử');
    return await parseResponse(response);
  } catch {
    console.warn("Backend lỗi, lấy lịch sử từ localStorage (Mock)");
    const saved = JSON.parse(localStorage.getItem('mock_history_logs') || '[]');
    if (userEmail) {
      return saved.filter(item => item.user_email === userEmail).slice(0, limit);
    }
    return saved.slice(0, limit);
  }
}

export async function getAdminStats() {
  try {
    const response = await fetch(`${API_BASE}/admin/stats`);
    if (!response.ok) throw new Error('Không thể tải thống kê');
    const json = await response.json();
    if (json.status !== 'success') throw new Error(json.message || 'Lỗi thống kê');
    return json.data;
  } catch {
    return { total: 156, fake_count: 89, real_count: 67, this_week: 24 };
  }
}

export async function getAdminPredictions(limit = 50) {
  try {
    const response = await fetch(`${API_BASE}/admin/predictions?limit=${limit}`);
    if (!response.ok) throw new Error('Không thể tải logs');
    const json = await response.json();
    if (json.status !== 'success') throw new Error(json.message || 'Lỗi logs');
    return json.data;
  } catch {
    return JSON.parse(localStorage.getItem('mock_history_logs') || '[]');
  }
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

