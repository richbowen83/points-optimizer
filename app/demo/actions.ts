'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addWallet(formData: FormData) {
  const program = String(formData.get('program') ?? '').trim().toLowerCase()
  const points = Number(formData.get('points') ?? 0)
  if (!program || !Number.isFinite(points)) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  const existing = await prisma.wallet.findFirst({
    where: { userId: user.id, programId: program },
    select: { id: true },
  })

  if (existing) {
    await prisma.wallet.update({
      where: { id: existing.id },
      data: { points },
    })
  } else {
    await prisma.wallet.create({
      data: { userId: user.id, programId: program, points },
    })
  }

  revalidatePath('/demo')
}

export async function deleteWallet(formData: FormData) {
  const program = String(formData.get('program') ?? '').trim().toLowerCase()
  if (!program) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  // Remove any wallet rows for this user/program (safe even if none exist)
  await prisma.wallet.deleteMany({
    where: { userId: user.id, programId: program },
  })

  revalidatePath('/demo')
}
