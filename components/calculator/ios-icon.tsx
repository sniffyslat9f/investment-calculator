import React from "react"

// Standard iOS-style icon badge — size-9 square rounded-xl, matching RetireWell.
export function IOS({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${color} shadow-sm`}>
      {children}
    </div>
  )
}
