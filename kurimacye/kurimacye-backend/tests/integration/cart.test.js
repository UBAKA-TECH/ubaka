import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import prisma from '../../prisma.js';

describe('Cart Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/cart', () => {
    it('should return cart with sessionToken', async () => {
      const mockCart = {
        id: '12345678-1234-1234-1234-1234567890ab',
        userId: null,
        items: []
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);

      const response = await request(app)
        .get('/api/cart')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessionToken).toBe('12345678-1234-1234-1234-1234567890ab');
      expect(response.body.data.items).toEqual([]);
    });
  });

  describe('POST /api/cart/items', () => {
    const mockProduct = {
      id: 'prod-123',
      name: 'Product A',
      price: 1500,
      stock: 10,
      visibility: 'public',
      variations: []
    };

    const mockCart = {
      id: '12345678-1234-1234-1234-1234567890ab',
      userId: null,
      items: []
    };

    it('should add a new item and return sessionToken', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
      vi.mocked(prisma.flashSale.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.findMany).mockResolvedValue([]);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({ id: 'item-1' });

      const populatedCart = {
        id: '12345678-1234-1234-1234-1234567890ab',
        userId: null,
        items: [
          {
            id: 'item-1',
            productId: 'prod-123',
            quantity: 2,
            variationId: null,
            customizations: {},
            product: mockProduct
          }
        ]
      };
      // For the getCartPopulated call
      vi.mocked(prisma.cart.findUnique).mockImplementation(async (args) => {
        if (args.where.id === '12345678-1234-1234-1234-1234567890ab') {
          return populatedCart;
        }
        return null;
      });

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab')
        .send({ productId: 'prod-123', quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessionToken).toBe('12345678-1234-1234-1234-1234567890ab');
      expect(response.body.data.items[0].product.name).toBe('Product A');
      expect(prisma.cartItem.create).toHaveBeenCalled();
    });

    it('should increment quantity when adding an exact match item', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
      vi.mocked(prisma.flashSale.findFirst).mockResolvedValue(null);
      
      const existingItem = {
        id: 'item-1',
        productId: 'prod-123',
        quantity: 2,
        variationId: null,
        customizations: {}
      };
      vi.mocked(prisma.cartItem.findMany).mockResolvedValue([existingItem]);
      vi.mocked(prisma.cartItem.update).mockResolvedValue({ id: 'item-1', quantity: 3 });

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab')
        .send({ productId: 'prod-123', quantity: 1 });

      expect(response.status).toBe(200);
      expect(prisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { quantity: 3 }
      });
      expect(prisma.cartItem.create).not.toHaveBeenCalled();
    });

    it('should create new item when customizations differ', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);
      vi.mocked(prisma.flashSale.findFirst).mockResolvedValue(null);
      
      const existingItem = {
        id: 'item-1',
        productId: 'prod-123',
        quantity: 2,
        variationId: null,
        customizations: { customText: 'Hello' }
      };
      vi.mocked(prisma.cartItem.findMany).mockResolvedValue([existingItem]);

      const response = await request(app)
        .post('/api/cart/items')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab')
        .send({ productId: 'prod-123', quantity: 1, customizations: { customText: 'World' } });

      expect(response.status).toBe(200);
      expect(prisma.cartItem.create).toHaveBeenCalled();
      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });
});
