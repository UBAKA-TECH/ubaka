import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../../prisma.js';
import axios from 'axios';

vi.unmock('../../services/rraEbmService.js');
import rraEbmService from '../../services/rraEbmService.js';

// Mock axios for RRA API calls
vi.mock('axios');

describe('RRA EBM Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateEbmReceiptsForOrder', () => {
    it('should successfully group items by seller, process invoice, and save SDC data', async () => {
      const orderId = 'order-abc-123';
      const mockOrder = {
        id: orderId,
        publicId: 'ABC-123',
        createdAt: new Date(),
        grandTotal: 10000,
        paymentMethod: 'mtn_momo',
        shippingAddress: {
          fullName: 'John Doe',
          tin: '123456789'
        },
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Soap',
            price: 2000,
            quantity: 2,
            subtotal: 4000,
            sellerId: 'seller-x',
            taxTyCd: 'B'
          },
          {
            id: 'item-2',
            productId: 'prod-2',
            productName: 'Bread',
            price: 1500,
            quantity: 4,
            subtotal: 6000,
            sellerId: 'seller-x',
            taxTyCd: 'B'
          }
        ]
      };

      const mockSeller = {
        id: 'seller-x',
        name: 'Seller X Store',
        rraTin: '999999999',
        rraSdcId: 'SDC001',
        rraMrcNo: 'MRC001',
        rraIntrlKey: 'KEY001',
        rraSignKey: 'SIGN001'
      };

      // Mock Prisma calls
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockSeller);

      // Mock Axios successful response from RRA SDC
      axios.post.mockResolvedValue({
        data: {
          resultCd: '000',
          resultMsg: 'Success',
          data: {
            rcptNo: 777,
            intrlData: 'INTERNAL123456',
            rcptSign: 'SIGNATURE123',
            vsdcRcptPbctDate: '20260525183015',
            sdcId: 'SDC001'
          }
        }
      });

      const result = await rraEbmService.generateEbmReceiptsForOrder(orderId);

      expect(result.success).toBe(true);
      
      // Verify RRA API was called with mapped payload
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/trnsSales/saveSales'),
        expect.objectContaining({
          tin: '999999999',
          totItemCnt: 2,
          totAmt: 10000
        }),
        expect.any(Object)
      );

      // Verify Prisma orderItem update was triggered with EBM signatures
      expect(prisma.orderItem.update).toHaveBeenCalledTimes(2);
      expect(prisma.orderItem.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          ebmRcptNo: 777,
          ebmInternalData: 'INTERNAL123456',
          ebmSignature: 'SIGNATURE123'
        })
      }));
    });

    it('should simulate EBM receipt if seller lacks credentials', async () => {
      const orderId = 'order-abc-123';
      const mockOrder = {
        id: orderId,
        publicId: 'ABC-123',
        createdAt: new Date(),
        grandTotal: 5000,
        items: [
          {
            id: 'item-1',
            productName: 'Legacy Product',
            price: 5000,
            quantity: 1,
            subtotal: 5000,
            sellerId: 'seller-unregistered'
          }
        ]
      };

      const mockUnregisteredSeller = {
        id: 'seller-unregistered',
        name: 'Seller Without RRA Credentials',
        rraTin: null,
        rraSdcId: null
      };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUnregisteredSeller);

      const result = await rraEbmService.generateEbmReceiptsForOrder(orderId);

      expect(result.success).toBe(true);
      expect(axios.post).not.toHaveBeenCalled(); // Should not call RRA API
      
      // Verify fallback simulation stored mock receipt signatures
      expect(prisma.orderItem.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'item-1' },
        data: expect.objectContaining({
          ebmRcptNo: expect.any(Number),
          ebmInternalData: expect.any(String),
          ebmSignature: expect.any(String),
          ebmQrCode: expect.any(String)
        })
      }));
    });
  });
});
