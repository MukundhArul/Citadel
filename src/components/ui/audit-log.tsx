import { useEffect, useRef } from 'react'

export interface AuditLogEntry {
  id: string
  created_at: string
  action: string
  details: string
}

export function AuditLog({ logs, className }: { logs: AuditLogEntry[], className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className={`border border-border bg-surface flex flex-col ${className || 'h-64'}`} style={{ clipPath: "var(--clip-corner-sm)" }}>
      <div className="border-b border-border p-2 px-4 flex justify-between items-center bg-surface-raised">
        <span className="text-xs text-sci-green tracking-widest font-mono uppercase">Operator Activity Log</span>
        <span className="text-[10px] text-text-muted tracking-widest uppercase">SYS.SEC.LOG</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs flex flex-col-reverse"
      >
        {logs.length === 0 ? (
          <div className="text-text-muted italic">NO AUDIT LOGS FOUND.</div>
        ) : (
          logs.map((log) => {
            const time = new Date(log.created_at).toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })
            
            return (
              <div key={log.id} className="flex gap-3 leading-relaxed hover:bg-white/5 p-1 -mx-1 px-1 transition-colors">
                <span className="text-text-muted shrink-0">[{time}]</span>
                <span className="text-sci-amber shrink-0">{log.action.padEnd(20, ' ')}</span>
                <span className="text-sci-bone break-words">{log.details}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
