import { useEffect, useRef } from 'react';

interface BackgroundEffectsProps {
  effectId?: string;      // Name of the effect to run
  intensity?: number;     // Number from 1-100 indicating particle density/speed
  primaryColor?: string;  // Active primary hex for colors
  secondaryColor?: string;// Active secondary hex for colors
  accentColor?: string;   // Active accent hex for colors
}

export function BackgroundEffects({
  effectId = 'starfield',
  intensity = 50,
  primaryColor = '#ec4899',
  secondaryColor = '#06b6d4',
  accentColor = '#3b82f6'
}: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resizing Handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Speed / Density multiplier based on intensity (1-100)
    const factor = intensity / 50;

    // --- State Initialization per Effect ---
    
    // Matrix Rain state
    const matrixColumns = Math.floor(width / 16);
    const matrixDrops: number[] = Array(matrixColumns).fill(1);
    const matrixChars = "0101010101011001ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");

    // Starfield state
    const starsCount = Math.floor(100 * factor);
    const stars: { x: number; y: number; z: number; speed: number; size: number }[] = [];
    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        speed: (1 + Math.random() * 3) * factor,
        size: 0.5 + Math.random() * 1.5,
      });
    }

    // Snow state
    const snowCount = Math.floor(70 * factor);
    const snow: { x: number; y: number; radius: number; speedY: number; speedX: number; opacity: number }[] = [];
    for (let i = 0; i < snowCount; i++) {
      snow.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1,
        speedY: (1 + Math.random() * 2) * factor,
        speedX: (Math.random() * 1 - 0.5) * factor,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }

    // Constellation state
    const nodesCount = Math.floor(60 * factor);
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 1 - 0.5) * factor,
        vy: (Math.random() * 1 - 0.5) * factor,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Bubbles state
    const bubblesCount = Math.floor(25 * factor);
    const bubbles: { x: number; y: number; r: number; vy: number; vx: number; o: number }[] = [];
    for (let i = 0; i < bubblesCount; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: height + Math.random() * 100,
        r: Math.random() * 15 + 5,
        vy: -(0.5 + Math.random() * 1.5) * factor,
        vx: (Math.random() * 0.4 - 0.2) * factor,
        o: 0.1 + Math.random() * 0.3,
      });
    }

    // Fireflies state
    const firefliesCount = Math.floor(30 * factor);
    const fireflies: { x: number; y: number; size: number; vx: number; vy: number; phase: number; freq: number }[] = [];
    for (let i = 0; i < firefliesCount; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.5,
        vx: (Math.random() * 0.6 - 0.3) * factor,
        vy: (Math.random() * 0.6 - 0.3) * factor,
        phase: Math.random() * Math.PI * 2,
        freq: 0.02 + Math.random() * 0.03,
      });
    }

    // Sine waves state
    let waveOffset = 0;

    // Aurora blob state
    const blobs = [
      { x: width * 0.2, y: height * 0.2, vx: 0.3 * factor, vy: 0.2 * factor, r: Math.min(width, height) * 0.35, color: primaryColor },
      { x: width * 0.8, y: height * 0.7, vx: -0.2 * factor, vy: -0.3 * factor, r: Math.min(width, height) * 0.4, color: secondaryColor },
      { x: width * 0.5, y: height * 0.5, vx: -0.15 * factor, vy: 0.25 * factor, r: Math.min(width, height) * 0.3, color: accentColor },
    ];

    // Ripple Rings state
    const ripplesCount = 5;
    const ripples: { x: number; y: number; r: number; maxR: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < ripplesCount; i++) {
      ripples.push({
        x: width / 2 + (Math.random() * 200 - 100),
        y: height / 2 + (Math.random() * 200 - 100),
        r: Math.random() * 50,
        maxR: (200 + Math.random() * 300) * factor,
        speed: (1 + Math.random() * 1.5) * factor,
        opacity: 0.5,
      });
    }

    // Vaporwave parameters
    let vaporOffset = 0;

    // Cyber grid variables
    let gridOffset = 0;

    // Helper: color hex to rgba conversion
    const hexToRgb = (hex: string, alpha: number) => {
      const clean = hex.replace('#', '');
      let r = 99, g = 102, b = 241;
      if (clean.length === 6) {
        r = parseInt(clean.substring(0, 2), 16);
        g = parseInt(clean.substring(2, 4), 16);
        b = parseInt(clean.substring(4, 6), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // --- MAIN RENDER LOOP ---
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      switch (effectId) {
        case 'none':
          // Just clear the viewport to reveal CSS styles
          break;

        case 'matrix': {
          // Matrix Green Rain styled with Primary Color
          ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; // trails
          ctx.fillRect(0, 0, width, height);
          ctx.font = '14px monospace';

          for (let i = 0; i < matrixDrops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * 16;
            const y = matrixDrops[i] * 16;

            // Highlight leading character as white, trail in primary theme color
            if (Math.random() > 0.98) {
              ctx.fillStyle = '#ffffff';
            } else {
              ctx.fillStyle = hexToRgb(primaryColor, 0.75);
            }

            ctx.fillText(char, x, y);

            if (y > height && Math.random() > 0.975) {
              matrixDrops[i] = 0;
            }
            matrixDrops[i] += (0.75 * factor);
          }
          break;
        }

        case 'cyber-grid': {
          // Cyberpunk Grid lines
          gridOffset += (1.5 * factor);
          if (gridOffset >= 40) gridOffset = 0;

          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          ctx.strokeStyle = hexToRgb(primaryColor, 0.15);
          ctx.lineWidth = 1;

          // Draw vertical perspective grid
          const center = width / 2;
          const gridHorizon = height * 0.45;
          for (let i = -20; i <= 20; i++) {
            const x1 = center + i * 40;
            const x2 = center + i * 150;
            ctx.beginPath();
            ctx.moveTo(x1, gridHorizon);
            ctx.lineTo(x2, height);
            ctx.stroke();
          }

          // Draw scrolling horizontal grid lines
          for (let y = gridHorizon; y < height; y += 15) {
            const relativeY = (y - gridHorizon) + gridOffset;
            const screenY = gridHorizon + (relativeY * relativeY) / (height - gridHorizon);
            if (screenY > height) continue;

            ctx.strokeStyle = hexToRgb(primaryColor, (screenY - gridHorizon) / (height - gridHorizon) * 0.25);
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();
          }

          // Subtle horizontal ambient line in accent color
          ctx.strokeStyle = hexToRgb(accentColor, 0.3);
          ctx.beginPath();
          ctx.moveTo(0, gridHorizon);
          ctx.lineTo(width, gridHorizon);
          ctx.stroke();
          break;
        }

        case 'starfield': {
          // Cosmic Space Parallax Warp
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.z -= s.speed;
            if (s.z <= 0) {
              s.z = width;
              s.x = Math.random() * width - width / 2;
              s.y = Math.random() * height - height / 2;
            }

            // Project 3D coordinates to 2D screen
            const k = 128 / s.z;
            const px = s.x * k + width / 2;
            const py = s.y * k + height / 2;
            const size = (1 - s.z / width) * 4 * s.size;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
              ctx.fillStyle = hexToRgb(i % 2 === 0 ? primaryColor : secondaryColor, 0.4 + (1 - s.z / width) * 0.6);
              ctx.beginPath();
              ctx.arc(px, py, size, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        }

        case 'aurora': {
          // Slow moving, smoothly blending colorful gaseous clouds
          ctx.fillStyle = 'rgba(2, 6, 23, 0.4)'; // slow clear for smooth trails
          ctx.fillRect(0, 0, width, height);

          // Update & draw glowing blurred blobs
          blobs.forEach((b) => {
            b.x += b.vx;
            b.y += b.vy;

            // Bounce boundary checks
            if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
            if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;

            const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.05, b.x, b.y, b.r);
            grad.addColorStop(0, hexToRgb(b.color, 0.15));
            grad.addColorStop(0.5, hexToRgb(b.color, 0.04));
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'scanlines': {
          // Retro CRT TV screen overlay
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, width, height);

          // Render a warm central glow
          const radialGlow = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, width * 0.7);
          radialGlow.addColorStop(0, hexToRgb(primaryColor, 0.04));
          radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = radialGlow;
          ctx.fillRect(0, 0, width, height);

          // Scanline bars
          ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
          for (let y = 0; y < height; y += 4) {
            ctx.fillRect(0, y, width, 1.5);
          }

          // Random signal interference lines
          if (Math.random() > 0.96) {
            ctx.fillStyle = hexToRgb(secondaryColor, 0.08);
            ctx.fillRect(0, Math.random() * height, width, Math.random() * 6 + 1);
          }
          break;
        }

        case 'sine-waves': {
          // Waving math sine functions
          waveOffset += (0.015 * factor);
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          const lines = 4;
          for (let line = 0; line < lines; line++) {
            ctx.strokeStyle = hexToRgb(line % 2 === 0 ? primaryColor : secondaryColor, 0.12 - line * 0.025);
            ctx.lineWidth = 1.5 + line * 0.5;
            ctx.beginPath();

            const amplitude = (50 + line * 30) * factor;
            const frequency = 0.002 + line * 0.001;

            for (let x = 0; x < width; x += 10) {
              const y = height / 2 + Math.sin(x * frequency + waveOffset + line) * amplitude + Math.cos(x * 0.005 - waveOffset) * 20;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }

        case 'snow': {
          // Blizzard particles
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          snow.forEach((flake) => {
            flake.y += flake.speedY;
            flake.x += flake.speedX;

            if (flake.y > height) {
              flake.y = -10;
              flake.x = Math.random() * width;
            }
            if (flake.x > width) flake.x = 0;
            else if (flake.x < 0) flake.x = width;

            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'constellation': {
          // Floating stars connected by subtle web strings
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          // Draw connections
          ctx.lineWidth = 0.5;
          for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
              const n2 = nodes[j];
              const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
              if (dist < 110) {
                ctx.strokeStyle = hexToRgb(primaryColor, (1 - dist / 110) * 0.12);
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.stroke();
              }
            }
          }

          // Draw actual points
          nodes.forEach((n) => {
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            ctx.fillStyle = secondaryColor;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'neon-rings': {
          // Pulsing water-like concentric glows
          ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; // trail fading
          ctx.fillRect(0, 0, width, height);

          ripples.forEach((r) => {
            r.r += r.speed;
            if (r.r >= r.maxR) {
              r.r = 0;
              r.x = Math.random() * width;
              r.y = Math.random() * height;
            }

            const currentRatio = r.r / r.maxR;
            const opacity = (1 - currentRatio) * 0.25;

            ctx.strokeStyle = hexToRgb(primaryColor, opacity);
            ctx.lineWidth = 2 * factor;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();

            // Inner companion ring
            if (r.r > 30) {
              ctx.strokeStyle = hexToRgb(secondaryColor, opacity * 0.5);
              ctx.beginPath();
              ctx.arc(r.x, r.y, r.r - 30, 0, Math.PI * 2);
              ctx.stroke();
            }
          });
          break;
        }

        case 'bubbles': {
          // Rising glass bubbles
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          bubbles.forEach((b) => {
            b.y += b.vy;
            b.x += b.vx;

            if (b.y + b.r < 0) {
              b.y = height + Math.random() * 80;
              b.x = Math.random() * width;
            }

            ctx.strokeStyle = hexToRgb(secondaryColor, b.o);
            ctx.fillStyle = hexToRgb(primaryColor, b.o * 0.15);
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Add highlight shine dot on top left
            ctx.fillStyle = `rgba(255, 255, 255, ${b.o * 1.5})`;
            ctx.beginPath();
            ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'honeycomb': {
          // Hexagonal outline grid
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, width, height);

          const size = 42; // hexagon side size
          const h = size * Math.sqrt(3);

          ctx.strokeStyle = hexToRgb(primaryColor, 0.05);
          ctx.lineWidth = 1;

          for (let y = 0; y < height + h; y += h) {
            for (let x = 0; x < width + size * 3; x += size * 3) {
              // Draw hexagon node
              ctx.beginPath();
              for (let side = 0; side < 6; side++) {
                const angle = (side * Math.PI) / 3;
                const px = x + size * Math.cos(angle);
                const py = y + size * Math.sin(angle);
                if (side === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.stroke();

              // Draw alternating offset hexagon
              ctx.beginPath();
              const ox = x + size * 1.5;
              const oy = y + h / 2;
              for (let side = 0; side < 6; side++) {
                const angle = (side * Math.PI) / 3;
                const px = ox + size * Math.cos(angle);
                const py = oy + size * Math.sin(angle);
                if (side === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }

          // Subtle random hexagon glows
          ctx.fillStyle = hexToRgb(secondaryColor, 0.02);
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const gx = Math.random() * width;
            const gy = Math.random() * height;
            ctx.arc(gx, gy, 80 * factor, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'vaporwave': {
          // Retro Outrun Wireframe Sun & Scrolling Grid
          vaporOffset += (1.2 * factor);
          if (vaporOffset >= 40) vaporOffset = 0;

          // Pure black base
          ctx.fillStyle = '#04020a';
          ctx.fillRect(0, 0, width, height);

          const horizon = height * 0.5;

          // Draw the rising Wireframe Sun
          const sunRadius = Math.min(width, height) * 0.18;
          const sunX = width / 2;
          const sunY = horizon - 20;

          // Sun radial neon fill gradient
          const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
          sunGrad.addColorStop(0, '#f43f5e'); // Rose
          sunGrad.addColorStop(0.5, '#f59e0b'); // Yellow
          sunGrad.addColorStop(1, '#a855f7'); // Violet
          
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, Math.PI, 0); // half circle on horizon
          ctx.fill();

          // Retro horizontal black scanline gaps on sun
          ctx.fillStyle = '#04020a';
          for (let sy = sunY - sunRadius; sy < sunY; sy += 10) {
            const gapHeight = 1.5 + (sunY - sy) * 0.02;
            ctx.fillRect(sunX - sunRadius - 10, sy, sunRadius * 2 + 20, gapHeight);
          }

          // Draw Perspective grid floor
          ctx.strokeStyle = '#a855f7'; // Neon Purple grid
          ctx.lineWidth = 1;

          for (let i = -15; i <= 15; i++) {
            ctx.beginPath();
            ctx.moveTo(width / 2 + i * 25, horizon);
            ctx.lineTo(width / 2 + i * 110, height);
            ctx.stroke();
          }

          // Horizontal moving grid lines
          for (let y = horizon; y < height; y += 12) {
            const relativeY = (y - horizon) + vaporOffset;
            const screenY = horizon + (relativeY * relativeY) / (height - horizon);
            if (screenY > height) continue;

            ctx.strokeStyle = `rgba(244, 63, 94, ${(screenY - horizon) / (height - horizon) * 0.4})`; // Pink fading lines
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();
          }
          break;
        }

        case 'fireflies': {
          // Forest Firefly lights
          ctx.fillStyle = 'rgba(2, 6, 23, 1)';
          ctx.fillRect(0, 0, width, height);

          fireflies.forEach((ff) => {
            ff.x += ff.vx;
            ff.y += ff.vy;

            // boundaries wrapping
            if (ff.x < 0) ff.x = width;
            else if (ff.x > width) ff.x = 0;
            if (ff.y < 0) ff.y = height;
            else if (ff.y > height) ff.y = 0;

            ff.phase += ff.freq;

            // Pulsing opacity
            const opacity = (Math.sin(ff.phase) + 1) / 2 * 0.8;

            const grad = ctx.createRadialGradient(ff.x, ff.y, 0.1, ff.x, ff.y, ff.size * 4);
            grad.addColorStop(0, hexToRgb(primaryColor, opacity));
            grad.addColorStop(0.3, hexToRgb(secondaryColor, opacity * 0.4));
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(ff.x, ff.y, ff.size * 4, 0, Math.PI * 2);
            ctx.fill();
          });
          break;
        }

        case 'glitch': {
          // Cyber glitch scan effect
          ctx.fillStyle = 'rgba(2, 6, 23, 0.35)'; // trails
          ctx.fillRect(0, 0, width, height);

          // Standard matrix-like stars in background
          ctx.fillStyle = hexToRgb(primaryColor, 0.1);
          for (let i = 0; i < 15; i++) {
            ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, Math.random() * 3 + 1);
          }

          // Dynamic glitches
          if (Math.random() > 0.94) {
            ctx.fillStyle = hexToRgb(accentColor, 0.15);
            ctx.fillRect(0, Math.random() * height, width, Math.random() * 30 + 5);

            // Red/Cyan digital blocks
            ctx.fillStyle = 'rgba(255, 0, 100, 0.1)';
            ctx.fillRect(Math.random() * width - 50, Math.random() * height, Math.random() * 100 + 40, Math.random() * 10 + 2);

            ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.fillRect(Math.random() * width - 50, Math.random() * height, Math.random() * 100 + 40, Math.random() * 10 + 2);
          }
          break;
        }

        default:
          break;
      }

      animationId = requestAnimationFrame(tick);
    };

    // Run the loop!
    tick();

    // Clean up
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effectId, intensity, primaryColor, secondaryColor, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
