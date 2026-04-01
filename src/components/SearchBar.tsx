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
  onChangeApiKey: () => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, onGeolocate, onToggleFavorite, isFavorite, isDark, onToggleTheme, onChangeApiKey, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const iconBtnClass = "p-3 rounded-xl bg-card border border-border text-muted-foreground transition-all duration-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center gap-2"
    >
      <form onSubmit={handleSubmit} className="flex-1 relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search city..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm"
        />
      </form>

      {[
        { onClick: onGeolocate, disabled: loading, title: 'Use my location', icon: <MapPin className="w-4 h-4" />, hover: 'hover:text-primary hover:border-primary/40 hover:shadow-md hover:shadow-primary/10' },
        { onClick: onToggleFavorite, title: isFavorite ? 'Remove from favorites' : 'Add to favorites', icon: <Star className={`w-4 h-4 transition-all duration-300 ${isFavorite ? 'fill-secondary text-secondary scale-110' : ''}`} />, hover: 'hover:text-secondary hover:border-secondary/40 hover:shadow-md hover:shadow-secondary/10' },
        { onClick: onChangeApiKey, title: 'Change API key', icon: <KeyRound className="w-4 h-4" />, hover: 'hover:text-primary hover:border-primary/40 hover:shadow-md hover:shadow-primary/10' },
        { onClick: onToggleTheme, title: 'Toggle theme', icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, hover: 'hover:text-primary hover:border-primary/40 hover:shadow-md hover:shadow-primary/10' },
      ].map((btn, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={btn.onClick}
          disabled={btn.disabled}
          title={btn.title}
          className={`${iconBtnClass} ${btn.hover}`}
        >
          {btn.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}
