import React from 'react'

export default function ArxivIcon({
  size = 20,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>arXiv</title>
      <path d="M3 4c0-.55.45-1 1-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm13.707 2.293a1 1 0 00-1.414 0L12 9.586 8.707 6.293a1 1 0 00-1.414 1.414L10.586 11l-3.293 3.293a1 1 0 001.414 1.414L12 12.414l3.293 3.293a1 1 0 001.414-1.414L13.414 11l3.293-3.293a1 1 0 000-1.414z" />
    </svg>
  )
}
