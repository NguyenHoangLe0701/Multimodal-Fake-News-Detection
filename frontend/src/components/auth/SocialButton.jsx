const SocialButton = ({ icon: Icon, provider, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 w-full h-12 rounded-xl border border-slate-200 bg-white text-[#1E293B] font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100 shadow-sm"
    >
      {Icon && <Icon />}
      Tiếp tục với {provider}
    </button>
  );
};

export default SocialButton;
