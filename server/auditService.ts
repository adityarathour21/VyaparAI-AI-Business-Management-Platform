import { db } from './db';
import { AuditLog, AuditSeverity, AuditEntityType } from './types';

export class AuditService {
  /**
   * Record a critical business action in the immutable audit log
   */
  public static log(entry: {
    businessId: string;
    userId: string;
    userName: string;
    userRole?: string;
    action: string;
    severity?: AuditSeverity;
    entityType: AuditEntityType;
    entityId?: string;
    details: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }): AuditLog {
    const auditRecord: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId: entry.businessId,
      userId: entry.userId,
      userName: entry.userName,
      userRole: entry.userRole || 'Staff',
      action: entry.action,
      severity: entry.severity || 'info',
      entityType: entry.entityType,
      entityId: entry.entityId,
      details: entry.details,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress || '127.0.0.1 (Local POS Terminal)',
      timestamp: new Date().toISOString()
    };

    db.logAudit(auditRecord);

    // If critical severity (e.g. deletion or refund), trigger an automated notification as well!
    if (entry.severity === 'critical') {
      db.createNotification({
        id: `notif-crit-${Date.now()}`,
        businessId: entry.businessId,
        type: 'system',
        title: `Security Alert: ${entry.action.replace(/_/g, ' ')}`,
        message: `${entry.userName} performed critical action: ${entry.details}`,
        read: false,
        timestamp: new Date().toISOString(),
        link: '/audit-logs'
      });
    }

    return auditRecord;
  }

  /**
   * Query audit logs with multi-factor filtering (severity, entity, search query)
   */
  public static getLogs(businessId: string, filters?: {
    severity?: string;
    entityType?: string;
    search?: string;
    limit?: number;
  }): AuditLog[] {
    let logs = db.getAuditLogs(businessId).map(l => ({
      ...l,
      severity: l.severity || 'info',
      entityType: l.entityType || 'inventory',
      userRole: l.userRole || 'Staff',
      ipAddress: l.ipAddress || '192.168.1.10 (Store Terminal)'
    }));

    if (filters?.severity && filters.severity !== 'all') {
      logs = logs.filter(l => (l.severity || 'info') === filters.severity);
    }

    if (filters?.entityType && filters.entityType !== 'all') {
      logs = logs.filter(l => (l.entityType || 'inventory') === filters.entityType);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.entityId && l.entityId.toLowerCase().includes(q))
      );
    }

    const limit = filters?.limit || 100;
    return logs.slice(0, limit);
  }

  /**
   * Generate CSV format for compliance export
   */
  public static exportToCSV(businessId: string): string {
    const logs = this.getLogs(businessId, { limit: 1000 });
    const headers = [
      'Timestamp',
      'Action',
      'Severity',
      'Entity Type',
      'Entity ID',
      'User Name',
      'User Role',
      'Details',
      'IP Address'
    ];

    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.severity}"`,
      `"${l.entityType}"`,
      `"${l.entityId || ''}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
