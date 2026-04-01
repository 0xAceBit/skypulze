import { useState } from 'react';
import { setApiKey } from '@/lib/weather';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';

interface Props {
  onSaved: () => void;
}

export default function ApiKeyPrompt({ onSaved }: Props) {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setApiKey(key.trim());
      onSaved();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="weather-card p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">Welcome to SkyPulse</h1>
        <p className="text-muted-foreground mb-6">
          Enter your OpenWeather API key to get started. Get one free at{' '}
          <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer" className="text-primary underline">
            openweathermap.org
          </a>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your API key here..."
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Get Started
          </button>
        </form>
      </motion.div>
    </div>
  );
}
