import { api } from './api';

/**
 * Persists an audit action into the database.
 * 
 * @param {string} businessId - The ID of the business/tenant
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - Action code (e.g., 'DELETE_PRODUCT', 'VOID_INVOICE', 'STOCK_ADJUSTED')
 * @param {string} targetId - Identifier of the entity affected
 * @param {object|string} details - Additional contextual details
 * @returns {Promise<any>}
 */
export async function logAction(businessId, userId, action, targetId, details = {}) {
  try {
    const payload = {
      businessId,
      userId,
      action,
      targetId,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      timestamp: new Date().toISOString()
    };

    const res = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': businessId
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn('[AuditService] Failed to persist audit log remotely, status:', res.status);
    }
    return await res.json();
  } catch (error) {
    console.error('[AuditService] Error persisting audit log:', error);
    return null;
  }
}

export default {
  logAction
};
