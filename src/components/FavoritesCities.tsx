import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface Props {
  favorites: string[];
  onSelect: (city: string) => void;
  onRemove: (city: string) => void;
}

export default function FavoritesCities({ favorites, onSelect, onRemove }: Props) {
  if (favorites.length === 0) return null;

  return (
    <div className="weather-card p-6">
      <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-secondary" />
        Favorites
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {favorites.map(city => (
            <motion.button
              key={city}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onSelect(city)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-sm text-foreground transition-colors"
            >
              {city}
              <X
                className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => { e.stopPropagation(); onRemove(city); }}
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
