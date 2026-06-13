import { useEffect, useRef } from 'react';

interface SmokeParticle {
  angle: number;
  drift: number;
  radius: number;
  spin: number;
  x: number;
  y: number;
}

interface SmokeBackgroundProps {
  theme: 'dark' | 'light';
}

export function SmokeBackground({ theme }: SmokeBackgroundProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let animation = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    const smoke: SmokeParticle[] = [];

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.floor(window.innerWidth * scale);
      height = Math.floor(window.innerHeight * scale);
      canvas.width = width;
      canvas.height = height;
      smoke.length = 0;
      const count = Math.min(42, Math.max(22, Math.floor((window.innerWidth * window.innerHeight) / 36000)));
      for (let index = 0; index < count; index += 1) {
        smoke.push({
          angle: Math.random() * Math.PI * 2,
          drift: 0.002 + Math.random() * 0.006,
          radius: 110 * scale + Math.random() * 190 * scale,
          spin: Math.random() > 0.5 ? 1 : -1,
          x: Math.random() * width,
          y: Math.random() * height
        });
      }
    };

    const move = (event: PointerEvent) => {
      pointerX = event.clientX / Math.max(1, window.innerWidth);
      pointerY = event.clientY / Math.max(1, window.innerHeight);
    };

    const draw = () => {
      const dark = theme === 'dark';
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      const base = context.createLinearGradient(0, 0, width, height);
      if (dark) {
        base.addColorStop(0, '#090b10');
        base.addColorStop(0.55, '#10131a');
        base.addColorStop(1, '#202019');
      } else {
        base.addColorStop(0, '#f7f5ef');
        base.addColorStop(0.55, '#eef7f5');
        base.addColorStop(1, '#fff4ec');
      }
      context.fillStyle = base;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = dark ? 'screen' : 'multiply';

      const pullX = (pointerX - 0.5) * width * 0.018;
      const pullY = (pointerY - 0.5) * height * 0.018;
      for (const particle of smoke) {
        particle.angle += particle.drift * particle.spin;
        particle.x += Math.cos(particle.angle) * 0.32 + pullX;
        particle.y += Math.sin(particle.angle * 0.82) * 0.24 + pullY;
        if (particle.x < -particle.radius) particle.x = width + particle.radius;
        if (particle.x > width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = height + particle.radius;
        if (particle.y > height + particle.radius) particle.y = -particle.radius;

        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius);
        if (dark) {
          glow.addColorStop(0, 'rgba(79, 209, 197, 0.13)');
          glow.addColorStop(0.45, 'rgba(255, 107, 74, 0.07)');
          glow.addColorStop(1, 'rgba(79, 209, 197, 0)');
        } else {
          glow.addColorStop(0, 'rgba(41, 128, 124, 0.12)');
          glow.addColorStop(0.5, 'rgba(255, 107, 74, 0.09)');
          glow.addColorStop(1, 'rgba(41, 128, 124, 0)');
        }
        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      animation = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.cancelAnimationFrame(animation);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
    };
  }, [theme]);

  return <canvas ref={ref} data-testid="global-smoke-background" className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden="true" />;
}
