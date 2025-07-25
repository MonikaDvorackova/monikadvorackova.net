import React from "react";

interface ArxivIconProps {
  size?: number;
  color?: string;
}

export default function ArxivIcon({ size = 20, color = "white" }: ArxivIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 225 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M112.5 0C50.4 0 0 50.4 0 112.5C0 174.6 50.4 225 112.5 225C174.6 225 225 174.6 225 112.5C225 50.4 174.6 0 112.5 0ZM169.5 162.225H143.325L112.5 112.725L81.675 162.225H55.5L97.65 99.225L55.5 38.775H81.675L112.5 84.15L143.325 38.775H169.5L127.35 99.225L169.5 162.225Z"
        fill={color}
      />
    </svg>
  );
}
