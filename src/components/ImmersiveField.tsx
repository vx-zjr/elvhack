import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
}

export function ImmersiveField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return undefined;
    }
    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    let frame = 0;
    let animation = 0;
    let width = 0;
    let height = 0;
    const particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width * scale));
      height = Math.max(1, Math.floor(rect.height * scale));
      canvas.width = width;
      canvas.height = height;
      particles.length = 0;
      const count = Math.min(90, Math.max(34, Math.floor((width * height) / 28000)));
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.36,
          vy: (Math.random() - 0.5) * 0.36,
          size: 1 + Math.random() * 2.2,
          hue: index % 3 === 0 ? 174 : index % 3 === 1 ? 14 : 48
        });
      }
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, width, height);
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(16, 19, 26, 0.72)');
      gradient.addColorStop(0.52, 'rgba(24, 28, 34, 0.58)');
      gradient.addColorStop(1, 'rgba(37, 34, 24, 0.72)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 170) {
            context.strokeStyle = `rgba(79, 209, 197, ${0.12 * (1 - distance / 170)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (const particle of particles) {
        const pulse = 0.55 + Math.sin(frame / 34 + particle.x) * 0.18;
        context.fillStyle = `hsla(${particle.hue}, 86%, 64%, ${pulse})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      animation = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}
