import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import prisma from '../../prisma.js';
import * as iremboPayService from '../../services/iremboPayService.js';

vi.mock('../../services/iremboPayService.js');

describe('IremboPay Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/payments/process', () => {
    it('should initiate IremboPay payment successfully', async () => {
      const mockOrder = {
        id: 'order-irembo-123',
        grandTotal: 12000,
        publicId: 'KM-IREMBO-456',
        guestInfo: { name: 'Audit User', email: 'audit@irembo.com', phone: '0788123456' },
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder);
      vi.mocked(iremboPayService.createInvoice).mockResolvedValue({
        success: true,
        invoiceNumber: 'SIM-IREMBO-123456',
      });

      const response = await request(app)
        .post('/api/payments/process')
        .send({
          orderId: 'order-irembo-123',
          paymentMethod: 'irembo_pay',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toBe('SIM-IREMBO-123456');
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-irembo-123' },
        data: expect.objectContaining({
          transactionId: 'SIM-IREMBO-123456',
          paymentStatus: 'pending',
          paymentMethod: 'irembo_pay',
        }),
      }));
    });
  });

  describe('GET /api/payments/status/:orderId', () => {
    it('should update order status when IremboPay payment is SUCCESSFUL', async () => {
      const mockOrder = {
        id: 'order-irembo-123',
        paymentMethod: 'irembo_pay',
        transactionId: 'SIM-IREMBO-123456',
        paymentStatus: 'pending',
        grandTotal: 12000,
        publicId: 'KM-IREMBO-456',
        items: [{ productName: 'Test Invoicing Product' }],
        channel: 'website'
      };

      vi.mocked(prisma.order.findUnique)
        .mockResolvedValueOnce(mockOrder)
        .mockResolvedValueOnce({ ...mockOrder, paymentStatus: 'completed' });

      vi.mocked(iremboPayService.getInvoiceStatus).mockResolvedValue({
        invoiceNumber: 'SIM-IREMBO-123456',
        status: 'SUCCESSFUL',
        amount: 12000,
      });

      const response = await request(app)
        .get('/api/payments/status/order-irembo-123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-irembo-123' },
        data: expect.objectContaining({
          paymentStatus: 'completed',
          status: 'processing',
        }),
      }));
    });
  });

  describe('POST /api/payments/webhook/irembopay', () => {
    it('should handle IremboPay successful webhook callback', async () => {
      const mockOrder = {
        id: 'order-irembo-123',
        transactionId: 'SIM-IREMBO-123456',
      };

      vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder);
      vi.mocked(iremboPayService.validateIremboWebhook).mockReturnValue(true);

      const response = await request(app)
        .post('/api/payments/webhook/irembopay')
        .send({
          invoiceNumber: 'SIM-IREMBO-123456',
          status: 'SUCCESSFUL',
        });

      expect(response.status).toBe(200);
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-irembo-123' },
        data: expect.objectContaining({
          paymentStatus: 'completed',
          status: 'processing',
        }),
      }));
    });
  });
});
