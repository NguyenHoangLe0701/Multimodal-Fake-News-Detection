export const PASSWORD_RULES = [
  { key: 'length', label: 'Tối thiểu 8 ký tự', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'Ít nhất 1 chữ in hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'Ít nhất 1 chữ thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Ít nhất 1 chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'Ít nhất 1 ký tự đặc biệt (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validatePassword = (password) => {
  return PASSWORD_RULES.every((rule) => rule.test(password));
};
