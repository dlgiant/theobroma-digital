'use client';

interface SvgIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function SvgIcon({ name, className = "", size = 24 }: SvgIconProps) {
  return (
    <img
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  );
}
