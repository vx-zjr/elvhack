import '@testing-library/jest-dom/vitest';

HTMLCanvasElement.prototype.getContext = (() => ({
  clearRect: () => undefined,
  createLinearGradient: () => ({ addColorStop: () => undefined }),
  createRadialGradient: () => ({ addColorStop: () => undefined }),
  fillRect: () => undefined,
  beginPath: () => undefined,
  moveTo: () => undefined,
  lineTo: () => undefined,
  stroke: () => undefined,
  arc: () => undefined,
  fill: () => undefined,
  set fillStyle(_value: string) {},
  set strokeStyle(_value: string) {},
  set lineWidth(_value: number) {}
})) as typeof HTMLCanvasElement.prototype.getContext;
