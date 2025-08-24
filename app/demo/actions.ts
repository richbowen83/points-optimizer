'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addWallet(formData: FormData) {
  const program = String(formData.get('program') ?? '').trim().toLowerCase()
  const points = Number(formData.get('points') ?? 0)
  if (!program || !Number.isFinite(points)) return

  const user = await prisma.user.findFirst({ where: { email: 'demo@points.local' } })
  if (!user) return

  await prisma.wallet.upsert({
    where: { userId_programId: { userId: user.id, programId: program } },
    update: { points },
    create: { userId: user.id, programId: program, points },
  })

  revalidatePath('/demo')
}
