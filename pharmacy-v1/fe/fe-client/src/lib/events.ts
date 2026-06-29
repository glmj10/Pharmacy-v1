export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'auth:session-expired',
};

// Hàm helper để bắn sự kiện
export const triggerSessionExpired = () => {
  const event = new Event(AUTH_EVENTS.SESSION_EXPIRED);
  window.dispatchEvent(event);
};