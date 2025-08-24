// app/demo/actions.ts
'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

function sanitizeProgram(input: FormDataEntryValue | null): string {
  return String(input ?? '').trim().toLowerCase().replace(/\s+/g, '_')
}

function clampPoints(n: number) {
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 10_000_000) return 10_000_000
  return Math.floor(n)
}

export async function addWallet(formData: FormData) {
  // normalize inputs
  const program = sanitizeProgram(formData.get('program'))
  const pointsRaw = String(formData.get('points') ?? '').replace(/[,_\s]/g, '')
  const points = clampPoints(Number(pointsRaw))
  if (!program) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  // upsert by (userId, programId)
  const existing = await prisma.wallet.findFirst({
    where: { userId: user.id, programId: program },
    select: { id: true },
  })

  if (existing) {
    await prisma.wallet.update({ where: { id: existing.id }, data: { points } })
  } else {
    await prisma.wallet.create({ data: { userId: user.id, programId: program, points } })
  }

  revalidatePath('/demo')
}

export async function deleteWallet(formData: FormData) {
  const program = sanitizeProgram(formData.get('program'))
  if (!program) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  await prisma.wallet.deleteMany({ where: { userId: user.id, programId: program } })

  revalidatePath('/demo')
}
