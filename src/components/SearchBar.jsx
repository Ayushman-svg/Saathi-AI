import React from 'react';
import { Search, Loader2 } from 'lucide-react';


const SearchBar = ({ value, onChange, placeholder = "Search...", loading = false }) => {
  return (
    <div className="relative group w-full max-w-lg">
      <div className="absolute inset-0 bg-linear-to-r from-indigo-500/5 to-purple-500/5 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity duration-500" />
      <div className="relative flex items-center bg-slate-900 border border-white/5 rounded-2xl p-1 shadow-2xl focus-within:border-indigo-500/50 transition-all duration-300">
        <div className="pl-4 pr-3 text-slate-500">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 outline-none py-3 px-2 text-sm text-white placeholder-slate-500 font-medium"
        />
      </div>
    </div>
  );
};

export default SearchBar;
