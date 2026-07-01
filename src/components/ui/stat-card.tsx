import React from 'react'

export function StatCard({ 
  label, 
  value, 
  variant = "DEFAULT", 
  sublabel 
}: { 
  label: string
  value: string | number
  variant?: "DEFAULT" | "ACTIVE" | "WARNING" | "CRITICAL"
  sublabel?: string 
}) {
  let colorClass = "text-sci-bone border-border bg-surface"
  let glowClass = ""
  
  switch (variant) {
    case "ACTIVE":
      colorClass = "text-sci-green border-sci-green bg-sci-green/5"
      glowClass = "shadow-[0_0_10px_rgba(0,237,63,0.15)]"
      break
    case "WARNING":
      colorClass = "text-sci-amber border-sci-amber bg-sci-amber/5"
      glowClass = "shadow-[0_0_10px_rgba(255,136,0,0.15)]"
      break
    case "CRITICAL":
      colorClass = "text-sci-red border-sci-red bg-sci-red/5"
      glowClass = "shadow-[0_0_10px_rgba(204,34,0,0.15)]"
      break
    case "DEFAULT":
    default:
      colorClass = "text-sci-blue border-border bg-surface"
      break
  }

  return (
    <div className={`border p-4 flex flex-col gap-1 rounded-sm transition-all relative overflow-hidden ${colorClass} ${glowClass}`}>
      {/* Decorative scanline for flavor */}
      <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="text-[10px] font-mono tracking-widest uppercase opacity-80 relative z-10">{label}</div>
      <div className="text-2xl font-mono font-bold tracking-wider relative z-10">{value}</div>
      {sublabel && <div className="text-[10px] font-mono tracking-widest uppercase opacity-70 mt-1 relative z-10">{sublabel}</div>}
    </div>
  )
}
