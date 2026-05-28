import { vi } from 'vitest';
import pino from 'pino';

// Mock Prisma
vi.mock('../prisma.js', () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    flashSale: {
      findFirst: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    coupon: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    account: {
      findUnique: vi.fn().mockResolvedValue({ id: 'account-123', name: 'Mock Account', code: '1000' }),
      create: vi.fn().mockResolvedValue({ id: 'account-123', name: 'Mock Account', code: '1000' }),
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

// Mock RRA EBM Service
vi.mock('../services/rraEbmService.js', () => ({
  default: {
    initializeDevice: vi.fn(),
    saveItem: vi.fn(),
    submitSaleInvoice: vi.fn(),
    generateEbmReceiptsForOrder: vi.fn(async () => ({ success: true })),
  }
}));

// Mock Finance Controller
vi.mock('../controllers/financeController.js', () => ({
  recordTransaction: vi.fn(),
  createTransaction: vi.fn(),
  getAccounts: vi.fn(),
  createAccount: vi.fn(),
  getLedger: vi.fn(),
  getFinancialSummary: vi.fn(),
}));

// Mock Logger to keep test output clean
vi.mock('../config/logger.js', () => ({
  default: pino({ level: 'silent' }),
}));

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MOMO_ENV = 'sandbox';
