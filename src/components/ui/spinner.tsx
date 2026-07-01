import React from 'react'

export function Spinner({ 
  label, 
  size = "MD" 
}: { 
  label?: string
  size?: "SM" | "MD" | "LG" 
}) {
  const sizeClasses = {
    "SM": "w-4 h-4",
    "MD": "w-6 h-6 border-2",
    "LG": "w-10 h-10 border-[3px]"
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 rounded-full border-t-sci-green border-r-sci-green border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-t-transparent border-r-transparent border-b-sci-green/20 border-l-sci-green/20"></div>
      </div>
      {label && (
        <div className="text-sci-green font-mono text-xs tracking-[0.2em] uppercase animate-pulse">
          {label}
        </div>
      )}
    </div>
  )
}
