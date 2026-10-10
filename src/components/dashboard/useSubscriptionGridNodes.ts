import { useEffect, useMemo, useRef, useState } from 'react';

/** Measure on resize only; CSS drives every frame of the scattered right-to-left pulses. */
export function useSubscriptionGridNodes() {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [seed] = useState(() => Math.floor(Math.random() * 65536));

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const width = Math.round(box.width);
      const height = Math.round(box.height);
      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo(() => {
    const columns = Math.max(0, Math.ceil((size.width - 16.5) / 32));
    const rows = Math.max(0, Math.ceil((size.height - 16.5) / 32));
    const noise = (value: number) => {
      const mixed = Math.sin(value * 127.1 + seed * 311.7) * 43758.5453;
      return mixed - Math.floor(mixed);
    };
    const result = [];
    for (let row = 0; row < rows; row++) {
      const rowOffset = 0.2 + noise(row + 1) * 1.2;
      for (let column = 0; column < columns; column++) {
        const variation = noise(row * 97 + column + 17);
        if (column !== 0 && column !== columns - 1 && variation > 0.33) continue;
        const progress = columns > 1 ? 1 - column / (columns - 1) : 0;
        const jitter = variation * Math.min(0.08, 2 / Math.max(1, columns - 1));
        result.push({
          x: 16.5 + column * 32,
          y: 16.5 + row * 32,
          delay: -12 + progress * 8 + rowOffset + jitter,
          radius: 2.05 + variation * 0.4,
        });
      }
    }
    return result;
  }, [size, seed]);

  return { ref, nodes };
}
