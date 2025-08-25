'use client'
import type { ProgramId } from '../../data/awardChart'

const COLORS: Record<ProgramId, {bg:string; fg:string; text:string}> = {
  alaska:    { bg:'#e6f0ff', fg:'#0b5ad9', text:'AS' },
  amex_mr:   { bg:'#ece9ff', fg:'#5b55d6', text:'MR' },
  chase_ur:  { bg:'#e8f6ee', fg:'#1a7f42', text:'UR' },
  delta:     { bg:'#fdeaea', fg:'#b02a2a', text:'DL' },
  southwest: { bg:'#efefef', fg:'#555',    text:'WN' },
}

export function ProgramLogo({ program, size=24 }: { program: ProgramId; size?: number }) {
  const c = COLORS[program]
  return (
    <div style={{
      width:size, height:size, borderRadius:6,
      display:'grid', placeItems:'center',
      background:c.bg, color:c.fg, fontWeight:800, fontSize:12,
      border:'1px solid rgba(0,0,0,0.08)'
    }}>
      {c.text}
    </div>
  )
}
