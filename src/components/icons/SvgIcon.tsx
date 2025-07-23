'use client';

import Image from 'next/image';

interface SvgIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function SvgIcon({ name, className = "", size = 24 }: SvgIconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  );
}
