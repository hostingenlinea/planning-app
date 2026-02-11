export const authHeaders = (user) => ({
  headers: {
    'x-user-role': user?.role || ''
  }
});

