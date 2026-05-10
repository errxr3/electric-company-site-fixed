import { prisma } from '@/lib/prisma';

export async function writeAuditLog(action: string, entity: string, message: string, entityId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        message,
      },
    });
  } catch (error) {
    console.error('Audit log write failed', error);
  }
}
