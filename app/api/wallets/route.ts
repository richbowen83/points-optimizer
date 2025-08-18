// app/api/wallets/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    if (process.env.DEMO_ENABLED !== 'true') {
      return NextResponse.json({ ok: false, error: 'Demo disabled' }, { status: 403 })
    }
    const form = await req.formData()
    const programId = String(form.get('programId') || '').trim()
    const points = Number(form.get('points') || 0)
    if (!programId || !Number.isFinite(points)) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
    if (!user) return NextResponse.json({ ok: false, error: 'Demo user not found' }, { status: 404 })

    await prisma.wallet.create({ data: { userId: user.id, programId, points } })
    return NextResponse.redirect(new URL('/demo', req.url))
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 })
  }
}
