const normalizeText = (value) =>
  String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getRoleKey = (rawRole) => {
  const role = normalizeText(rawRole);

  if (role === 'admin' || role === 'pastor' || role === 'pastora') return 'ADMIN';
  if (role === 'productor') return 'PRODUCTOR';
  if (role === 'lider' || role === 'leader') return 'LIDER';
  if (role === 'recepcion') return 'RECEPCION';
  return 'COLABORADOR';
};

export const canManageServices = (rawRole) => {
  const roleKey = getRoleKey(rawRole);
  return roleKey === 'ADMIN' || roleKey === 'PRODUCTOR';
};

