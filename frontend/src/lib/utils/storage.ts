/**
 * Lưu trạng thái phiên luyện tập vào sessionStorage (PR-03/04/09/10/11/12)
 * để không mất thao tác khi refresh, theo đặc tả.
 */

export function saveSession<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage đầy / bị chặn — bỏ qua, chỉ là cache tạm
  }
}

export function loadSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearSession(key: string): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(key);
}
