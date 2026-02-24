// Key-based authentication system for BingeBox
// Add more keys here to grant access to new users

export interface AccessKey {
  key: string;
  createdAt: string;
  description?: string;
}

// Default key: Binge50
// Add more keys below to grant access to additional users
export const VALID_ACCESS_KEYS: string[] = [
  "Binge50",           // Default key
  "KeyForMyNigga",      // Example additional key
  "Anti-Indian",         // Example additional key
  // Add more keys here as needed
];

// Storage key for localStorage
const AUTH_STORAGE_KEY = 'bingbox_auth_key';

// Validate if a key is valid
export function isValidKey(key: string): boolean {
  return VALID_ACCESS_KEYS.includes(key.trim());
}

// Save key to localStorage
export function saveAuthKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      key: key.trim(),
      activatedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Failed to save auth key:', e);
  }
}

// Get saved key from localStorage
export function getAuthKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.key || null;
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const key = getAuthKey();
  if (!key) return false;
  return isValidKey(key);
}

// Clear authentication (logout)
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear auth:', e);
  }
}

// Validate and save key (login)
export function loginWithKey(key: string): { success: boolean; message: string } {
  const trimmedKey = key.trim();
  
  if (!trimmedKey) {
    return { success: false, message: 'Please enter an access key' };
  }
  
  if (!isValidKey(trimmedKey)) {
    return { success: false, message: 'Invalid access key. Please check your key and try again.' };
  }
  
  saveAuthKey(trimmedKey);
  return { success: true, message: 'Access granted! Welcome to BingeBox.' };
}

// Add a new key to the valid keys list (for admin use)
export function addKey(newKey: string, description?: string): void {
  const trimmedKey = newKey.trim();
  if (trimmedKey && !VALID_ACCESS_KEYS.includes(trimmedKey)) {
    VALID_ACCESS_KEYS.push(trimmedKey);
    console.log(`New key added: ${trimmedKey}${description ? ` (${description})` : ''}`);
  }
}

// Get all valid keys (for reference)
export function getValidKeys(): string[] {
  return [...VALID_ACCESS_KEYS];
}
