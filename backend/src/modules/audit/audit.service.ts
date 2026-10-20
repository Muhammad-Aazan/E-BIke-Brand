import mongoose from 'mongoose';
import { AuditLog, IAuditLog } from '../../database/models';
import { paginationMeta, PaginationMeta } from '../../common/utils/response';

export interface LogAuditOptions {
  action: string;
  entity: string;
  entityId?: string;
  performedBy: string;
  performedByRole: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

export async function logAction(options: LogAuditOptions): Promise<void> {
  await AuditLog.create({
    action: options.action,
    entity: options.entity,
    entityId: options.entityId,
    performedBy: new mongoose.Types.ObjectId(options.performedBy),
    performedByRole: options.performedByRole,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    changes: options.changes,
    metadata: options.metadata,
  });
}

export async function getAuditLogs(
  page = 1,
  limit = 20,
  filter: Record<string, unknown> = {}
): Promise<{ logs: IAuditLog[]; meta: PaginationMeta }> {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, meta: paginationMeta(page, limit, total) };
}
