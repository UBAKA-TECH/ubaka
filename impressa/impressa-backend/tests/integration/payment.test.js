import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import prisma from '../../prisma.js';
import * as momoService from '../../services/momoService.js';

describe('Payment Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/payments/process', () => {
    it('should initiate MoMo payment successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        grandTotal: 5000,
        publicId: 'ABC-123',
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder);
      vi.mocked(momoService.requestToPay).mockResolvedValue({
        success: true,
        referenceId: 'ref-999',
      });

      const response = await request(app)
        .post('/api/payments/process')
        .send({
          orderId: 'order-123',
          paymentMethod: 'mtn_momo',
          phone: '0788123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toBe('ref-999');
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-123' },
        data: expect.objectContaining({
          transactionId: 'ref-999',
          paymentStatus: 'pending',
        }),
      }));
    });
  });

  describe('GET /api/payments/status/:orderId', () => {
    it('should update order status when MoMo payment is successful', async () => {
      const mockOrder = {
        id: 'order-123',
        paymentMethod: 'mtn_momo',
        transactionId: 'ref-999',
        paymentStatus: 'pending',
        grandTotal: 5000,
        publicId: 'ABC-123',
        items: [{ productName: 'Test Product' }],
        channel: 'website'
      };

      vi.mocked(prisma.order.findUnique)
        .mockResolvedValueOnce(mockOrder) // First call to find order
        .mockResolvedValueOnce({ ...mockOrder, paymentStatus: 'completed' }); // Second call after update

      vi.mocked(momoService.getTransactionStatus).mockResolvedValue({
        status: 'SUCCESSFUL',
      });

      const response = await request(app)
        .get('/api/payments/status/order-123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-123' },
        data: expect.objectContaining({
          paymentStatus: 'completed',
          status: 'processing',
        }),
      }));
    });
  });

  describe('POST /api/payments/webhook/momo', () => {
    it('should handle MoMo successful webhook', async () => {
      const mockOrder = {
        id: 'order-123',
        transactionId: 'ref-999',
      };

      vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/payments/webhook/momo')
        .send({
          resourceId: 'ref-999',
          status: 'SUCCESSFUL',
        });

      expect(response.status).toBe(200);
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-123' },
        data: expect.objectContaining({
          paymentStatus: 'completed',
          status: 'processing',
        }),
      }));
    });
  });
});
