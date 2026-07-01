import React from 'react';

interface TitanLogoProps {
  className?: string;
}

export function TitanLogo({ className = 'w-32 h-32' }: TitanLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={`${className} transition-all duration-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7f1d1d" />
          <stop offset="50%" stopColor="#450a0a" />
          <stop offset="100%" stopColor="#0a0000" />
        </radialGradient>
        
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        
        <linearGradient id="silver-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#e5e7eb" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>

        <linearGradient id="text-gold-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer circular frame with metallic golden border */}
      <circle cx="256" cy="256" r="242" fill="url(#bg-grad)" stroke="url(#gold-grad)" strokeWidth="10" />
      <circle cx="256" cy="256" r="230" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />

      {/* Background abstract sharp elements in dark red */}
      <path d="M 90 256 L 256 70 L 422 256 L 256 442 Z" fill="#7f1d1d" opacity="0.2" />
      <path d="M 256 40 L 472 256 L 256 472 L 40 256 Z" fill="none" stroke="#7f1d1d" strokeWidth="2" opacity="0.15" />

      {/* Golden shield frame container behind character */}
      <path d="M 125 175 L 256 80 L 387 175 L 387 315 L 256 415 L 125 315 Z" fill="none" stroke="url(#gold-grad)" strokeWidth="5" />
      <path d="M 135 183 L 256 95 L 377 183 L 377 307 L 256 400 L 135 307 Z" fill="none" stroke="url(#gold-grad)" strokeWidth="1.5" opacity="0.5" />

      {/* Neck & Chest base */}
      <path d="M 235 225 L 235 255 L 277 255 L 277 225 Z" fill="#fecaca" />
      {/* Chest opening skin */}
      <path d="M 235 255 L 256 295 L 277 255 Z" fill="#fee2e2" />

      {/* Anime Character Hair Back */}
      <path d="M 170 190 Q 155 220 185 230 M 342 190 Q 357 220 327 230" fill="none" stroke="url(#silver-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.8" />

      {/* Face Base */}
      <path d="M 205 175 C 205 175, 208 235, 256 235 C 304 235, 307 175, 307 175 Z" fill="#fef2f2" />

      {/* Anime eyes & details */}
      <path d="M 216 178 Q 228 174 236 182 M 296 178 Q 284 174 276 182" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="227" cy="191" rx="5" ry="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
      <ellipse cx="285" cy="191" rx="5" ry="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
      {/* Eye highlights */}
      <circle cx="225" cy="188" r="1.5" fill="#ffffff" />
      <circle cx="283" cy="188" r="1.5" fill="#ffffff" />
      {/* Cool red subtle eyeshadow highlight */}
      <path d="M 212 186 Q 227 194 238 186 M 300 186 Q 285 194 274 186" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />

      {/* Nose */}
      <path d="M 254 194 L 256 204 L 251 206" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />

      {/* Mouth & smoking cigarette */}
      <path d="M 246 215 Q 256 219 266 214" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hand smoking detail (finger holding cigarette) */}
      <path d="M 256 216 L 242 225 L 244 234 L 258 221 Z" fill="#fef2f2" opacity="0.9" />
      {/* Cigarette */}
      <line x1="254" y1="217" x2="231" y2="230" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="231" y1="230" x2="227" y2="232" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      {/* Glowing tip of cigarette with filter glow */}
      <circle cx="225" cy="233" r="3.5" fill="#ef4444" filter="url(#red-glow)" />

      {/* Pendant necklace */}
      <path d="M 236 250 Q 256 278 276 250" fill="none" stroke="#1f2937" strokeWidth="2.5" />
      <polygon points="251,273 261,273 256,283" fill="#030712" stroke="#fbbf24" strokeWidth="1" />

      {/* Anime Character Hair Front (White/Silver spikes overlay) */}
      <path d="M 175 170 C 170 120, 205 95, 256 95 C 307 95, 342 120, 337 170 C 330 195, 310 215, 290 225 Q 256 205 222 225 C 202 215, 182 195, 175 170 Z" fill="url(#silver-grad)" />
      
      {/* Spikey layered details on hair */}
      <path d="
        M 175 170 L 158 190 L 182 195 L 172 215 L 195 210 L 202 235 
        L 217 220 L 227 250 L 242 225 L 256 255 L 270 225 L 285 250 
        L 295 220 L 310 235 L 317 210 L 340 215 L 330 190 L 348 185 L 337 170
      " fill="url(#silver-grad)" />
      
      {/* Hair shadow lines to create depth */}
      <path d="M 195 140 L 210 175 M 225 125 L 235 180 M 256 120 L 256 185 M 287 125 L 277 180 M 317 140 L 302 175" fill="none" stroke="#d1d5db" strokeWidth="1.5" opacity="0.6" />
      <path d="M 215 110 L 225 80 L 240 105 M 256 100 L 256 70 L 268 95 M 297 110 L 287 80 L 272 105" fill="url(#silver-grad)" stroke="#9ca3af" strokeWidth="1" />

      {/* Shirt Collar and Shoulders */}
      <path d="M 175 275 Q 256 245 337 275 L 342 335 L 170 335 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
      {/* Shirt Collar Flaps */}
      <path d="M 228 250 L 205 290 L 242 290 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M 284 250 L 307 290 L 270 290 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

      {/* Skull Graphics on Pockets */}
      {/* Left pocket with skull */}
      <rect x="192" y="295" width="24" height="26" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M 198 304 C 198 301, 210 301, 210 304 C 210 307, 207 308, 207 311 L 201 311 C 201 308, 198 307, 198 304 Z" fill="#1e293b" />
      <circle cx="201" cy="304" r="1.5" fill="#ffffff" />
      <circle cx="207" cy="304" r="1.5" fill="#ffffff" />
      <path d="M 203 311 L 205 311 L 204 314 Z" fill="#1e293b" />
      
      {/* Right pocket with skull */}
      <rect x="296" y="295" width="24" height="26" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M 302 304 C 302 301, 314 301, 314 304 C 314 307, 311 308, 311 311 L 305 311 C 305 308, 302 307, 302 304 Z" fill="#1e293b" />
      <circle cx="305" cy="304" r="1.5" fill="#ffffff" />
      <circle cx="311" cy="304" r="1.5" fill="#ffffff" />
      <path d="M 307 311 L 309 311 L 308 314 Z" fill="#1e293b" />

      {/* Golden Shield Border overlapping front */}
      <path d="M 125 315 L 256 415 L 387 315" fill="none" stroke="url(#gold-grad)" strokeWidth="7" strokeLinecap="round" />

      {/* Metallic-textured gold plaque background for "TITAN PANEL" */}
      <polygon points="75,335 437,335 407,398 105,398" fill="#1e1b4b" stroke="url(#gold-grad)" strokeWidth="4.5" />
      <polygon points="80,340 432,340 403,393 109,393" fill="#0f0b29" />
      {/* Highlight glow behind text */}
      <path d="M 115 365 Q 256 345 397 365" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.3" filter="url(#logo-glow)" />

      {/* TITAN PANEL Bold Stylized metallic golden text */}
      <text
        x="256"
        y="380"
        textAnchor="middle"
        fill="url(#text-gold-grad)"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="43"
        fontWeight="bold"
        letterSpacing="2.5"
        stroke="#000000"
        strokeWidth="3"
        strokeLinejoin="miter"
      >
        TITAN PANEL
      </text>
      
      {/* Extra metallic surface details on the text */}
      <text
        x="256"
        y="378"
        textAnchor="middle"
        fill="none"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="43"
        fontWeight="bold"
        letterSpacing="2.5"
        stroke="#ffffff"
        strokeWidth="0.75"
        opacity="0.8"
      >
        TITAN PANEL
      </text>

      {/* "★ 1M ★" Stars Subtext Ribbon/Banner */}
      <polygon points="175,407 337,407 317,437 195,437" fill="#000000" stroke="url(#gold-grad)" strokeWidth="2" />
      <text
        x="256"
        y="429"
        textAnchor="middle"
        fill="#fef08a"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="19"
        fontWeight="bold"
        letterSpacing="4"
        stroke="#000"
        strokeWidth="1"
      >
        ★ 1M ★
      </text>
    </svg>
  );
}
