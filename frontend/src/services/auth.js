const KEY_NAME = 'kyriqlab_admin_key'

export function getAdminKey() {
  return localStorage.getItem(KEY_NAME) || ''
}

export function setAdminKey(key) {
  localStorage.setItem(KEY_NAME, key)
}

export function clearAdminKey() {
  localStorage.removeItem(KEY_NAME)
}

export function isLoggedIn() {
  return !!getAdminKey()
}
