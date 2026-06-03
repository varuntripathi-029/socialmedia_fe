import React, { useState } from 'react';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) color = color.split('').map(c => c + c).join('');
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// Spread positions for up to 6 items when folder opens
const getOpenTransform = (index: number, total: number): string => {
  const spread = [
    'translate(-160%, -90%) rotate(-30deg)',
    'translate(-80%, -110%) rotate(-15deg)',
    'translate(0%, -120%) rotate(0deg)',
    'translate(80%, -110%) rotate(15deg)',
    'translate(160%, -90%) rotate(30deg)',
    'translate(240%, -70%) rotate(42deg)',
  ];
  // Center the spread around the folder
  const offset = Math.floor((total - 1) / 2);
  const idx = Math.min(index + (3 - offset), spread.length - 1);
  return spread[Math.max(0, idx)];
};

const Folder: React.FC<FolderProps> = ({ color = '#5227FF', size = 1, items = [], className = '' }) => {
  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    items.map(() => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paperColors = ['#E8E8E8', '#EFEFEF', '#F5F5F5', '#F9F9F9', '#FAFAFA', '#FFFFFF'];

  const handleClick = () => {
    setOpen(prev => !prev);
    if (open) setPaperOffsets(items.map(() => ({ x: 0, y: 0 })));
  };

  const handlePaperMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
    setPaperOffsets(prev => { const n = [...prev]; n[index] = { x: offsetX, y: offsetY }; return n; });
  };

  const handlePaperMouseLeave = (_e: React.MouseEvent<HTMLDivElement>, index: number) => {
    setPaperOffsets(prev => { const n = [...prev]; n[index] = { x: 0, y: 0 }; return n; });
  };

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`group relative transition-all duration-200 ease-in cursor-pointer ${!open ? 'hover:-translate-y-2' : ''}`}
        style={{ transform: open ? 'translateY(-8px)' : undefined }}
        onClick={handleClick}
      >
        <div
          className="relative w-[100px] h-[80px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[10px]"
          style={{ backgroundColor: folderBackColor }}
        >
          {/* Folder tab */}
          <span
            className="absolute z-0 bottom-[98%] left-0 w-[30px] h-[10px] rounded-tl-[5px] rounded-tr-[5px]"
            style={{ backgroundColor: folderBackColor }}
          />

          {/* Paper items */}
          {items.map((item, i) => {
            const transformStyle = open
              ? `${getOpenTransform(i, items.length)} translate(${paperOffsets[i]?.x ?? 0}px, ${paperOffsets[i]?.y ?? 0}px)`
              : undefined;

            return (
              <div
                key={i}
                onMouseMove={e => handlePaperMouseMove(e, i)}
                onMouseLeave={e => handlePaperMouseLeave(e, i)}
                className={`absolute z-20 bottom-[10%] left-1/2 w-[75%] h-[75%] transition-all duration-300 ease-in-out ${
                  !open
                    ? `transform -translate-x-1/2 translate-y-[${8 - i * 4}%] group-hover:translate-y-0`
                    : 'hover:scale-110'
                }`}
                style={{
                  ...(!open ? { transform: `translateX(-50%) translateY(${(items.length - 1 - i) * 4}%)` } : { transform: transformStyle }),
                  backgroundColor: paperColors[i % paperColors.length],
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                {item}
              </div>
            );
          })}

          {/* Front flap left skew */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(open && { transform: 'skew(15deg) scaleY(0.6)' }),
            }}
          />
          {/* Front flap right skew */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              borderRadius: '5px 10px 10px 10px',
              ...(open && { transform: 'skew(-15deg) scaleY(0.6)' }),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Folder;
