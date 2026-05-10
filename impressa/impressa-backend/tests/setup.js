import { vi } from 'vitest';

// Mock Prisma
vi.mock('../prisma.js', () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    shippingZone: {
      findMany: vi.fn(),
    },
    taxRate: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      // In a real transaction, tx is the prisma client or a subset of it
      // We pass the same mock object here for simplicity in integration tests
      const mockPrisma = (await import('../prisma.js')).default;
      return callback(mockPrisma);
    }),
  },
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock MoMo Service
vi.mock('../services/momoService.js', () => ({
  requestToPay: vi.fn(),
  getTransactionStatus: vi.fn(),
  validateWebhook: vi.fn(() => true),
}));

// Mock Finance Controller
vi.mock('../controllers/financeController.js', () => ({
  recordTransaction: vi.fn(),
}));

// Mock Logger to keep test output clean
vi.mock('../config/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    fatal: vi.fn(),
  },
}));

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MOMO_ENV = 'sandbox';
