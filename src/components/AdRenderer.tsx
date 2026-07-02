import { useEffect, useRef } from 'react';

interface AdRendererProps {
  code?: string;
  fallbackText?: string;
  className?: string;
}

export function AdRenderer({ code, fallbackText, className = '' }: AdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    // Clear previous ad
    containerRef.current.innerHTML = '';

    const trimmed = code.trim();
    if (!trimmed) return;

    // If it is a clean URL link, just show a custom banner link
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const link = document.createElement('a');
      link.href = trimmed;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'block text-center text-xs text-indigo-400 hover:underline font-mono py-4 px-6 bg-slate-950/40 border border-white/5 rounded-xl w-full';
      link.innerText = fallbackText || trimmed;
      containerRef.current.appendChild(link);
      return;
    }

    // Otherwise, render HTML/JS inside a sandboxed iframe to prevent top-level redirects and frame-busting!
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '120px'; // default start height
    iframe.style.border = 'none';
    iframe.style.background = 'transparent';
    iframe.id = `ad-iframe-${Math.random().toString(36).substring(2, 9)}`;
    
    // Sandbox to allow scripts, popups (opening in new tabs), and forms, and same-origin to ensure ad scripts (such as Adsterra) run and load correctly.
    // By omitting 'allow-top-navigation' and 'allow-top-navigation-by-user-activation', we strictly prevent any redirects of our main website!
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms');

    // Prepare content with <base target="_blank"> so any link clicks naturally open in new tabs
    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_blank">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              color: #94a3b8;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              overflow: hidden;
            }
            a {
              color: #818cf8;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div id="ad-content" style="width: 100%; display: flex; justify-content: center; align-items: center;">
            ${code}
          </div>
          <script>
            function sendHeight() {
              const content = document.getElementById('ad-content');
              if (content) {
                // Force positive min-height if empty to show a placeholder or avoid complete flatness
                const height = Math.max(content.scrollHeight, 110);
                window.parent.postMessage({
                  type: 'resize-ad-iframe',
                  id: '${iframe.id}',
                  height: height
                }, '*');
              }
            }
            window.onload = sendHeight;
            // Periodic check for dynamic ad loaded heights
            setTimeout(sendHeight, 500);
            setTimeout(sendHeight, 1500);
            setTimeout(sendHeight, 3000);
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = iframeContent;
    containerRef.current.appendChild(iframe);
  }, [code, fallbackText]);

  useEffect(() => {
    const handleResizeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize-ad-iframe') {
        const iframe = document.getElementById(event.data.id) as HTMLIFrameElement;
        if (iframe) {
          iframe.style.height = `${event.data.height}px`;
        }
      }
    };

    window.addEventListener('message', handleResizeMessage);
    return () => window.removeEventListener('message', handleResizeMessage);
  }, []);

  if (!code) return null;

  return (
    <div 
      ref={containerRef} 
      className={`w-full flex justify-center items-center overflow-hidden rounded-xl bg-slate-950/20 border border-white/5 p-2 pointer-events-none select-none ${className}`}
    />
  );
}
