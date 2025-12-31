// frontend/src/services/auth.js

const KEY_NAME = 'adminKey';

// 1. Check if user is logged in (Used by Router)
export function isLoggedIn() {
  const key = localStorage.getItem(KEY_NAME);
  // Return true if key exists and is not empty
  return !!key && key !== 'undefined' && key !== 'null';
}

// 2. Get the key (Used by API)
export function getAdminKey() {
  return localStorage.getItem(KEY_NAME);
}

// 3. Logout (Clear the key)
export function clearAdminKey() {
  localStorage.removeItem(KEY_NAME);
  localStorage.removeItem('userName');
  // Optional: Force reload to clear memory
  // window.location.href = '/login';
}
