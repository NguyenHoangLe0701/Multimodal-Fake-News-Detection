import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ label, id, type = 'text', icon: Icon, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-[#1E293B]">
          {label}
        </label>
      )}
      <div 
        className={`relative flex items-center w-full rounded-xl border bg-white transition-all overflow-hidden px-4 h-12 ${
          error 
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' 
            : 'border-slate-200 focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB]/10'
        }`}
      >
        {Icon && <Icon size={18} className={`shrink-0 ${error ? 'text-red-400' : 'text-slate-400'}`} />}
        
        <input
          id={id}
          type={inputType}
          className="w-full h-full bg-transparent px-3 text-base text-[#1E293B] outline-none placeholder:text-slate-400 font-medium"
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="shrink-0 p-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:text-[#2563EB]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs font-semibold text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default AuthInput;
