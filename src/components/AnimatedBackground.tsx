import { useEffect, useState } from "react";

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

const AnimatedBackground = () => {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const generateDots = () => {
      const newDots: Dot[] = [];
      const numDots = 80;
      const colors = [
        "from-cyan-400 to-blue-500",
        "from-purple-400 to-pink-500",
        "from-blue-400 to-indigo-500",
        "from-teal-400 to-cyan-500",
        "from-violet-400 to-purple-500",
      ];

      for (let i = 0; i < numDots; i++) {
        newDots.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 2,
          duration: Math.random() * 8 + 4,
          delay: Math.random() * 3,
          opacity: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setDots(newDots);
    };

    generateDots();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className={`absolute rounded-full bg-gradient-to-r ${dot.color} blur-sm`}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
            animation: `float ${dot.duration}s ease-in-out infinite`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(-40px) translateX(20px) scale(1.1);
          }
          50% {
            transform: translateY(-20px) translateX(-20px) scale(0.9);
          }
          75% {
            transform: translateY(-60px) translateX(10px) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;
