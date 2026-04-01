import { motion } from 'framer-motion';

const particles = [
  { emoji: '☁️', size: 'text-3xl', x: '10%', y: '15%', duration: 18, delay: 0 },
  { emoji: '✨', size: 'text-xl', x: '85%', y: '10%', duration: 12, delay: 2 },
  { emoji: '🌤️', size: 'text-2xl', x: '70%', y: '80%', duration: 20, delay: 4 },
  { emoji: '💧', size: 'text-lg', x: '20%', y: '75%', duration: 15, delay: 1 },
  { emoji: '⚡', size: 'text-xl', x: '50%', y: '5%', duration: 14, delay: 3 },
  { emoji: '🌈', size: 'text-2xl', x: '90%', y: '50%', duration: 22, delay: 5 },
  { emoji: '❄️', size: 'text-lg', x: '30%', y: '45%', duration: 16, delay: 2.5 },
  { emoji: '🌙', size: 'text-xl', x: '5%', y: '40%', duration: 19, delay: 1.5 },
];

export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} opacity-20 select-none`}
          style={{ left: p.x, top: p.y }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            rotate: [0, 10, -10, 5, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        style={{ left: '60%', top: '20%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-secondary/5 blur-3xl"
        style={{ left: '10%', top: '60%' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute w-36 h-36 rounded-full bg-accent/5 blur-3xl"
        style={{ left: '80%', top: '70%' }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}
