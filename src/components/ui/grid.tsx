import React from 'react'

export function Grid({ 
  children, 
  preset = "4-col", 
  gap = "1rem", 
  className = "" 
}: { 
  children: React.ReactNode
  preset?: "2-col" | "3-col" | "4-col"
  gap?: string
  className?: string 
}) {
  let gridClass = "grid-cols-1"
  if (preset === "4-col") gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  if (preset === "3-col") gridClass = "grid-cols-1 sm:grid-cols-3"
  if (preset === "2-col") gridClass = "grid-cols-1 sm:grid-cols-2"
  
  return (
    <div className={`grid ${gridClass} ${className}`} style={{ gap }}>
      {children}
    </div>
  )
}
