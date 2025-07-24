import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest) {
  await requirePermission(PERMISSIONS.VIEW_FINANCIAL_ENTRIES)
  
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const bankAccountId = searchParams.get('bankAccountId')
  const category = searchParams.get('category')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Construir filtros
  const where: any = {}
  
  if (userId) {
    where.userId = userId
  }
  
  if (bankAccountId) {
    where.bankAccountId = bankAccountId
  }
  
  if (category) {
    where.category = { contains: category, mode: 'insensitive' }
  }
  
  if (status) {
    where.status = status
  }
  
  if (type) {
    where.type = type
  }
  
  if (startDate || endDate) {
    where.date = {}
    if (startDate) {
      where.date.gte = new Date(startDate)
    }
    if (endDate) {
      where.date.lte = new Date(endDate)
    }
  }

  const entries = await prisma.financialEntry.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          UserRole: {
            include: {
              role: true
            }
          }
        }
      },
      bankAccount: {
        select: {
          id: true,
          name: true,
          bankName: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(entries)
}

export async function POST(request: NextRequest) {
  await requirePermission(PERMISSIONS.MANAGE_FINANCIAL_ENTRIES)
  const data = await request.json()
  
  // Si se proporciona userId, verificar que el usuario existe
  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    })
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }
  }
  
  const entry = await prisma.financialEntry.create({ 
    data,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      bankAccount: {
        select: {
          id: true,
          name: true,
          bankName: true
        }
      }
    }
  })
  
  return NextResponse.json(entry)
}
