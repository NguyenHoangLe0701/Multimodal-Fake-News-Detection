import { useMemo } from 'react';

const PasswordStrength = ({ password }) => {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return score;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
  }, [password]);

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
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-2 h-1.5 w-full">
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(1)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(2)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(3)}`}></div>
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(4)}`}></div>
      </div>
      {password && (
        <p className="text-xs font-semibold text-slate-500 text-right">
          Độ mạnh: <span className={strength >= 3 ? 'text-[#2563EB]' : strength === 2 ? 'text-yellow-600' : 'text-red-500'}>{getStrengthText()}</span>
        </p>
      )}
    </div>
  );
};

export default PasswordStrength;
