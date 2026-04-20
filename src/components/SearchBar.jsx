import React from 'react';
import { Search, Loader2 } from 'lucide-react';


const SearchBar = ({ value, onChange, placeholder = "Search...", loading = false }) => {
  return (
    <div className="relative group w-full max-w-lg">
      <div className="absolute inset-0 bg-linear-to-r from-zinc-400/5 to-zinc-500/5 hidden group-focus-within:opacity-100 opacity-0 transition-opacity duration-500" />
      <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xl focus-within:border-slate-400 transition-all duration-300">
        <div className="pl-4 pr-3 text-slate-600">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 outline-none py-3 px-2 text-sm text-slate-900 placeholder-slate-500 font-medium"
        />
      </div>
    </div>
  );
};

export default SearchBar;
