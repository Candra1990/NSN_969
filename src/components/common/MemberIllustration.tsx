import React from 'react';

interface MemberIllustrationProps {
  name: string;
}

export function MemberIllustration({ name }: MemberIllustrationProps) {
  // Setup a consistent seed sum from the member's name for procedural variation
  const charCodeSum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // Procedural attributes for high-fidelity vector representation
  const skinColors = ['#ebd6cd', '#ebc8b2', '#edd4cb', '#edd2ca', '#f3e6e0'];
  const skinColor = skinColors[charCodeSum % skinColors.length];

  const hairColors = ['#121214', '#1a1a1a', '#241b12', '#cca470', '#56504a', '#8c2424', '#3d4d5e'];
  const hairColor = hairColors[charCodeSum % hairColors.length];

  const eyesColors = ['#16161c', '#1f1a17', '#c79133', '#1e40af', '#411317'];
  const eyesColor = eyesColors[charCodeSum % eyesColors.length];

  const innerColors = ['#ffffff', '#2a2b30', '#18181f', '#dc2626', '#e5a93c'];
  const innerColor = innerColors[charCodeSum % innerColors.length];

  const suitColor = '#0b0b0d'; // Clean tactical or suit blazer dark color

  const accOptions: ('none' | 'chain' | 'glasses' | 'chain_and_glasses')[] = ['none', 'chain', 'glasses', 'chain_and_glasses'];
  const accessoriesType = accOptions[charCodeSum % accOptions.length];

  return (
    <div className="relative w-full h-full bg-[#0d0d10] flex items-center justify-center overflow-hidden">
      {/* Background Geometric Shield Emblem & Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#e5a93c]/5 via-transparent to-red-950/5 z-0" />
      
      {/* Giant Shield motif overlaid on background */}
      <svg className="absolute w-[80%] h-[80%] text-zinc-950/40 select-none pointer-events-none z-0" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50,10 L85,25 L85,60 C85,80 50,95 50,95 C50,95 15,80 15,60 L15,25 Z" />
      </svg>
      {/* Wolf logo trace overlay inside shield */}
      <svg className="absolute w-[45%] h-[45%] text-[#e5a93c]/5 select-none pointer-events-none z-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2L9 7l-5 .5 3.5 3.5-1 5 4.5-2.5 4.5 2.5-1-5 3.5-3.5-5-.5z" />
      </svg>

      {/* Vector Illustration Container */}
      <svg className="relative w-full h-[95%] z-10 select-none pointer-events-none text-zinc-900" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Neck Block */}
        <path d="M85 125 L85 155 Q85 160 90 160 L110 160 Q115 160 115 155 L115 125 Z" fill={skinColor} />
        {/* Shadow under chin */}
        <path d="M85 125 L85 138 C100 145 110 138 115 138 L115 125 Z" fill="#cfaaa2" opacity="0.65" />

        {/* Face Silhouette */}
        <path d="M75 80 C75 115 90 132 100 132 C110 132 125 115 125 80 C125 45 115 45 100 45 C85 45 75 45 75 80 Z" fill={skinColor} />

        {/* Ears */}
        <path d="M72 82 C70 82 69 88 72 92 Z M128 82 C130 82 131 88 128 92 Z" fill={skinColor} />

        {/* Dynamic Eyebrows & Eyes */}
        <g>
          {/* Eyebrows matching hair */}
          <path d="M82 72 Q90 68 96 74 M118 72 Q110 68 104 74" stroke={hairColor} strokeWidth="3" strokeLinecap="round" />
          
          {/* Eye shapes */}
          <ellipse cx="89" cy="79" rx="6" ry="3.5" fill="#ffffff" stroke="#121214" strokeWidth="1.5" />
          <ellipse cx="111" cy="79" rx="6" ry="3.5" fill="#ffffff" stroke="#121214" strokeWidth="1.5" />
          
          {/* Pupils */}
          <circle cx="89" cy="79" r="2.5" fill={eyesColor} />
          <circle cx="111" cy="79" r="2.5" fill={eyesColor} />
          
          {/* Sparkles */}
          <circle cx="88" cy="78" r="0.8" fill="#ffffff" />
          <circle cx="110" cy="78" r="0.8" fill="#ffffff" />
        </g>

        {/* Nose & Mouth lines */}
        <path d="M100 84 L100 96 C100 97 101 98 102 98" stroke="#110d0c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="94" y1="111" x2="106" y2="111" stroke="#1d1514" strokeWidth="2" strokeLinecap="round" />

        {/* Hair block (Renders on top and surrounds face) */}
        <g>
          <path d="M68 76 C65 40 90 30 115 30 Q132 40 130 76 Z" fill={hairColor} />
          <path d="M72 70 Q100 60 112 85" stroke={hairColor} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>

        {/* Neck collar apparel node block */}
        <path d="M60 160 L140 160 L146 240 L54 240 Z" fill={suitColor} />

        {/* Procedural basic inner shirts */}
        <path d="M84 150 L116 150 L120 195 L80 195 Z" fill={innerColor} />

        {/* Gang Accessories: Silver crucifix pendant or Golden tags */}
        {(accessoriesType === 'chain' || accessoriesType === 'chain_and_glasses') && (
          <g>
            {/* The chain links */}
            <path d="M84 146 Q100 162 116 146" stroke="#d1d5db" strokeWidth="2" fill="none" />
            <path d="M87 149 Q100 165 113 149" stroke="#9ca3af" strokeWidth="1.5" fill="none" />
            {/* Silver crucifix pendant */}
            <path d="M97 159 H103 M100 156 V168" stroke="#f3f4f6" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* Sharp formal black blazer lapels (Suits) */}
        <path d="M52 170 L80 195 L84 240 H45 Z" fill="#141418" stroke="#000000" strokeWidth="1" />
        <path d="M148 170 L120 195 L116 240 H155 Z" fill="#141418" stroke="#000000" strokeWidth="1" />
        
        {/* Lapel lining */}
        <path d="M60 160 L80 195 V240" stroke="#2a2a30" strokeWidth="2" />
        <path d="M140 160 L120 195 V240" stroke="#2a2a30" strokeWidth="2" />

        {/* Sunglasses or gold Aviators nodes */}
        {(accessoriesType === 'glasses' || accessoriesType === 'chain_and_glasses') && (
          <g opacity="0.9">
            {/* Dark cool aviator shields */}
            <path d="M78 77 Q86 73 94 77 Q92 89 84 89 Q76 89 78 77 Z" fill="#000000" stroke="#d4af37" strokeWidth="1.5" />
            <path d="M122 77 Q114 73 106 77 Q108 89 116 89 Q124 89 122 77 Z" fill="#000000" stroke="#d4af37" strokeWidth="1.5" />
            {/* Bridge */}
            <path d="M94 77 H106" stroke="#d4af37" strokeWidth="2.5" />
            {/* Inner neon gleam lens */}
            <path d="M80 79 L88 87" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            <path d="M120 79 L112 87" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
          </g>
        )}
      </svg>
    </div>
  );
}
