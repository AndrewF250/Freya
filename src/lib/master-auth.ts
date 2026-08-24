const SESSION_KEY = "freya-master-session";
const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "freya2025";

export function isMasterAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function loginMaster(password: string): boolean {
  if (password !== PASSWORD) return false;
  sessionStorage.setItem(SESSION_KEY, "1");
  return true;
}

export function logoutMaster() {
  sessionStorage.removeItem(SESSION_KEY);
}
