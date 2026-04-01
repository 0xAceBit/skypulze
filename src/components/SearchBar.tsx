import { useState } from 'react';
import { Search, MapPin, Star, Moon, Sun, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onSearch: (city: string) => void;
  onGeolocate: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, onGeolocate, onToggleFavorite, isFavorite, isDark, onToggleTheme, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search city..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
        />
      </form>

      <button
        onClick={onGeolocate}
        disabled={loading}
        title="Use my location"
        className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
      >
        <MapPin className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleFavorite}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className="p-3 rounded-xl bg-card border border-border transition-colors"
      >
        <Star className={`w-4 h-4 ${isFavorite ? 'fill-secondary text-secondary' : 'text-muted-foreground hover:text-secondary'}`} />
      </button>

      <button
        onClick={onToggleTheme}
        title="Toggle theme"
        className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </motion.div>
  );
}
