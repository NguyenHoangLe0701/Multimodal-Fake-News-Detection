import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

const PASSWORD_RULES = [
  { key: 'length', label: 'Tối thiểu 8 ký tự', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'Ít nhất 1 chữ in hoa (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'Ít nhất 1 chữ thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'Ít nhất 1 chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'Ít nhất 1 ký tự đặc biệt (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validatePassword = (password) => {
  return PASSWORD_RULES.every((rule) => rule.test(password));
};

const PasswordStrength = ({ password }) => {
  const results = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: password ? rule.test(password) : false,
    }));
  }, [password]);

  const passedCount = results.filter((r) => r.passed).length;

  const strength = useMemo(() => {
    if (!password) return 0;
    if (passedCount <= 2) return 1;
    if (passedCount <= 3) return 2;
    if (passedCount === 4) return 3;
    return 4;
  }, [password, passedCount]);

  const getStrengthColor = (level) => {
    if (strength === 0) return 'bg-slate-200';
    if (strength <= 1 && level <= 1) return 'bg-red-500';
    if (strength === 2 && level <= 2) return 'bg-yellow-500';
    if (strength >= 3 && level <= strength) return 'bg-[#2563EB]';
    return 'bg-slate-200';
  };

  const getStrengthText = () => {
    if (strength === 0) return 'Bắt buộc';
    if (strength <= 1) return 'Yếu';
    if (strength === 2) return 'Trung bình';
    if (strength >= 3) return 'Mạnh';
  };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-2 h-1.5 w-full">
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(4)}`}></div>
      </div>
      {password && (
        <>
          <p className="text-xs font-semibold text-slate-500 text-right">
            Độ mạnh: <span className={strength >= 3 ? 'text-[#2563EB]' : strength === 2 ? 'text-yellow-600' : 'text-red-500'}>{getStrengthText()}</span>
          </p>
          <ul className="space-y-1">
            {results.map((rule) => (
              <li key={rule.key} className={`flex items-center gap-1.5 text-xs font-medium ${rule.passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                {rule.passed ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                {rule.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default PasswordStrength;
