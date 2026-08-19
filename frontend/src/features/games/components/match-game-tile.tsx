'use client';

import React from 'react';
import type { Tile } from './match-game-board';
import { cn } from '@/lib/utils/cn';

function getTextSize(content: string, type: 'hanzi' | 'pinyin', totalTiles: number) {
  const len = content.length;
  const isSmall = totalTiles > 16;
  const isMedium = totalTiles > 12 && totalTiles <= 16;

  if (type === 'hanzi') {
    if (len > 4) return isSmall ? 'text-base sm:text-lg' : 'text-lg sm:text-xl drop-shadow-sm';
    if (len > 2) return isSmall ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl drop-shadow-sm';
    return isSmall ? 'text-2xl sm:text-3xl' : isMedium ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl drop-shadow-sm';
  } else {
    if (len > 8) return 'text-[10px] sm:text-xs font-bold px-1 text-center leading-tight break-words';
    if (len > 5) return isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base font-bold px-1 text-center';
    return isSmall ? 'text-sm sm:text-base' : 'text-lg sm:text-xl font-bold';
  }
}

function getTileSizeClass(totalTiles: number) {
  if (totalTiles <= 8) return 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44';
  if (totalTiles <= 12) return 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36';
  if (totalTiles <= 16) return 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32';
  return 'w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28';
}

interface MatchTileProps {
  tile: Tile;
  isSelected: boolean;
  isMatched: boolean;
  onClick: () => void;
  totalTiles: number;
}

export function MatchTile({ tile, isSelected, isMatched, onClick, totalTiles }: MatchTileProps) {
  const sizeClass = getTileSizeClass(totalTiles);
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative', sizeClass, 'rounded-xl sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300',
        isMatched
          ? 'opacity-40 scale-95 pointer-events-none border-2 border-[#8BC34A] bg-[#f2f8ed]'
          : 'bg-white hover:-translate-y-1',
        isSelected
          ? 'ring-4 ring-[#8BC34A] bg-[#f2f8ed] shadow-lg scale-95 border-none'
          : !isMatched ? 'shadow-md hover:shadow-lg border-b-4 border-[#eef7e9]' : ''
      )}
    >
      <span className={cn('text-[#215b3b]', getTextSize(tile.content, tile.type, totalTiles))}>
        {tile.content}
      </span>
    </div>
  );
}
