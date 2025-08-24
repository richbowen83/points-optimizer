// app/demo/actions.ts
'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

function sanitizeProgram(input: FormDataEntryValue | null): string {
  return String(input ?? '').trim().toLowerCase().replace(/\s+/g, '_')
}

export async function addWallet(formData: FormData) {
  const program = sanitizeProgram(formData.get('program'))
  const pointsRaw = String(formData.get('points') ?? '').trim()
  const points = Number(pointsRaw)
  if (!program || !Number.isFinite(points) || points < 0) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

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
