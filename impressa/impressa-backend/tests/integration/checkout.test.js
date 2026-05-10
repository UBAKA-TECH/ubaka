import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import prisma from '../../prisma.js';

describe('Checkout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/checkout/create-order', () => {
    const validCheckoutData = {
      shippingAddress: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0788123456',
        addressLine1: 'Street 123',
        city: 'Kigali',
        country: 'Rwanda',
      },
      paymentMethod: 'mtn_momo',
    };

    it('should create an order successfully from a valid cart', async () => {
      // Mock cart data
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            product: {
              id: 'prod-1',
              name: 'Test Product',
              price: 1000,
              stock: 10,
              visibility: 'public',
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.order.create).mockResolvedValue({
        id: 'order-123',
        publicId: 'ABC-123',
        grandTotal: 2000,
        status: 'pending',
      });
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/checkout/create-order')
        .set('x-cart-session', 'cart-123') // Simulate session token
        .send(validCheckoutData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe('order-123');
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.product.updateMany).toHaveBeenCalled();
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should return 400 if cart is empty', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/checkout/create-order')
        .set('x-cart-session', 'empty-cart')
        .send(validCheckoutData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cart is empty');
    });

    it('should return 400 if product is out of stock', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 100,
            product: {
              id: 'prod-1',
              name: 'Test Product',
              price: 1000,
              stock: 10,
              visibility: 'public',
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 0 }); // Simulate update failed due to WHERE stock >= quantity

      const response = await request(app)
        .post('/api/checkout/create-order')
        .set('x-cart-session', 'cart-123')
        .send(validCheckoutData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });
  });
});
