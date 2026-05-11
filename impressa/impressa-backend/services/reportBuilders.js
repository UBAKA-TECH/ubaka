import prisma from "../prisma.js";

/**
 * 📈 Shared Range Logic
 */
const getRangeReport = async (start, end, sellerId) => {
  const where = { createdAt: { gte: start, lt: end } };
  if (sellerId) {
    where.items = { some: { sellerId } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } }, customer: true }
  });

  // Fetch Expenses in the same range
  const expenseWhere = { date: { gte: start, lt: end } };
  if (sellerId) {
    // Include expenses from the seller AND all their staff
    const staff = await prisma.user.findMany({ where: { managedById: sellerId }, select: { id: true } });
    const staffIds = [sellerId, ...staff.map(s => s.id)];
    expenseWhere.shift = { userId: { in: staffIds } };
  }
  const expenses = await prisma.expense.findMany({
    where: expenseWhere,
    include: { user: { select: { name: true } } }
  });

  // Fetch Shifts in the same range
  const shiftWhere = { startTime: { gte: start, lt: end } };
  if (sellerId) {
    const staff = await prisma.user.findMany({ where: { managedById: sellerId }, select: { id: true } });
    const staffIds = [sellerId, ...staff.map(s => s.id)];
    shiftWhere.userId = { in: staffIds };
  }
  const shifts = await prisma.shift.findMany({
    where: shiftWhere,
    orderBy: { startTime: 'asc' }
  });

  // Fetch Abonne Debt Collections in the same range
  const abonneWhere = { createdAt: { gte: start, lt: end } };
  if (sellerId) {
    // Filter by client ownership instead of responsibleId for better coverage
    abonneWhere.client = { sellerId };
  }

  const abonneTransactions = await prisma.abonneTransaction.findMany({
    where: abonneWhere,
    include: {
      client: { select: { name: true } },
      responsible: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });

  const productCount = {};
  const customizationCount = { customText: 0, customFile: 0, cloudLink: 0 };
  let totalRevenue = 0;
  let totalDebtCollected = 0;
  let totalExpenses = 0;
  let cashRevenue = 0;
  let momoRevenue = 0;

  expenses.forEach(exp => {
    totalExpenses += (exp.amount || 0);
  });

  orders.forEach(order => {
    let orderCash = 0;
    let orderMomo = 0;

    order.items.forEach(item => {
        // If filtering by seller, only count this seller's items
        if (sellerId && item.sellerId !== sellerId) return;

        const product = item.product || {};
        const isService = product.type === "service" || 
                          product.isDigital || 
                          product.name?.toLowerCase().includes("printing") ||
                          product.name?.toLowerCase().includes("service");

        if (isService) return;

        const name = product.name || item.productName;
        if (name) productCount[name] = (productCount[name] || 0) + item.quantity;
        
        const itemRevenue = (item.subtotal || 0);
        totalRevenue += itemRevenue;

        // Categorize revenue by payment method
        const method = (order.paymentMethod || "cash").toLowerCase();
        if (method.includes("cash")) orderCash += itemRevenue;
        else if (method.includes("momo") || method.includes("mobile")) orderMomo += itemRevenue;

        const cust = item.customizations || {};
        if (cust.customText) customizationCount.customText++;
        if (cust.customFile) customizationCount.customFile++;
        if (cust.cloudLink) customizationCount.cloudLink++;
    });

    cashRevenue += orderCash;
    momoRevenue += orderMomo;
  });

  abonneTransactions.forEach(tx => {
    const amount = (tx.amountPaid || 0);
    totalDebtCollected += amount;
    // Debt collection is usually cash in hand
    cashRevenue += amount;
  });

  totalRevenue += totalDebtCollected;

  const topProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topCustomization = Object.entries(customizationCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const totalStartingCash = shifts.length > 0 ? (shifts[0].startingDrawerAmount || 0) : 0;
  const totalClosingCash = shifts.length > 0 ? (shifts[shifts.length - 1].actualEndingDrawerAmount || shifts[shifts.length - 1].expectedEndingDrawerAmount || 0) : 0;


  // Calculate specifically CASH expenses for the drawer formula
  const cashExpenses = expenses
    .filter(e => (e.paymentMethod || "cash").toLowerCase() === "cash" || (e.paymentMethod || "").toLowerCase() === "drawer")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // User's Formula: Opening Cash + Total Cash from Transactions - Expenses
  const expectedDrawerAmount = totalStartingCash + cashRevenue - cashExpenses;

  const summary = {
    total: orders.length,
    totalRevenue,
    cashRevenue,
    momoRevenue,
    totalDebtCollected,
    totalExpenses,
    totalStartingCash,
    totalClosingCash,
    cashExpenses,
    expectedDrawerAmount,
    netProfit: totalRevenue - totalExpenses,
    delivered: orders.filter(o => o.status === "delivered").length,
    pending: orders.filter(o => o.status === "pending").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    topProduct,
    topCustomization,
  };

  return { orders, summary, expenses, shifts, abonneTransactions };
};

/**
 * 📈 Monthly Report
 */
const getMonthlyReport = async ({ month, year, sellerId }) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return await getRangeReport(start, end, sellerId);
};

/**
 * 📈 Weekly Report
 */
const getWeeklyReport = async ({ sellerId }) => {
  const now = new Date();
  const start = new Date(now.setDate(now.getDate() - now.getDay())); // Start of current week (Sunday)
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return await getRangeReport(start, end, sellerId);
};

/**
 * 📈 Daily Report
 */
const getDailyReport = async ({ date, sellerId }) => {
  const day = new Date(date);
  const start = new Date(day.setHours(0, 0, 0, 0));
  const end = new Date(day.setHours(23, 59, 59, 999));
  return await getRangeReport(start, end, sellerId);
};

/**
 * 📈 Custom Range Report
 */
const getCustomRangeReport = async ({ start, end, sellerId }) => {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  
  return await getRangeReport(startDate, endDate, sellerId);
};

/**
 * 📈 Status Report
 */
const getStatusReport = async ({ status, sellerId }) => {
  const where = { status };
  if (sellerId) {
    where.items = { some: { sellerId } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } }, customer: true }
  });
  const summary = {
    total: orders.length,
    status,
  };
  return { orders, summary };
};

/**
 * 📈 Customer Report
 */
const getCustomerReport = async ({ customerId, sellerId }) => {
  const where = { customerId };
  if (sellerId) {
    where.items = { some: { sellerId } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } }, customer: true }
  });

  const productCount = {};
  let totalSpent = 0;

  orders.forEach(order => {
    order.items.forEach(item => {
        if (sellerId && item.sellerId !== sellerId) return;

        const name = item.product?.name || item.productName;
        if (name) productCount[name] = (productCount[name] || 0) + item.quantity;
        totalSpent += (item.price * item.quantity);
    });
  });

  const mostOrderedProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const summary = {
    total: orders.length,
    delivered: orders.filter(o => o.status === "delivered").length,
    totalSpent,
    mostOrderedProduct,
  };

  return { orders, summary };
};

/**
 * 📈 Revenue Report
 */
const getRevenueReport = async ({ start, end, sellerId }) => {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const where = {
    createdAt: { gte: startDate, lt: endDate },
    status: "delivered",
  };
  if (sellerId) {
    where.items = { some: { sellerId } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } }
  });

  let totalRevenue = 0;
  const productRevenue = {};

  orders.forEach(order => {
    order.items.forEach(item => {
        if (sellerId && item.sellerId !== sellerId) return;

        const rev = item.price * item.quantity;
        totalRevenue += rev;
        const name = item.product?.name || item.productName;
        if (name) productRevenue[name] = (productRevenue[name] || 0) + rev;
    });
  });

  const topProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const avgOrderValue = orders.length ? (totalRevenue / orders.length).toFixed(2) : 0;

  const summary = {
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue,
    topProduct,
  };

  return { orders, summary };
};

/**
 * 📈 Inventory Report
 */
const getInventoryReport = async ({ sellerId }) => {
  const where = {};
  if (sellerId) {
    where.sellerId = sellerId;
  }

  const products = await prisma.product.findMany({
    where: {
      ...where,
      NOT: [
        { type: "service" },
        { isDigital: true },
        { name: { contains: "Printing", mode: "insensitive" } },
        { name: { contains: "Service", mode: "insensitive" } }
      ]
    },
    include: { categories: { select: { name: true } } },
    orderBy: { name: 'asc' }
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

  const summary = {
    totalProducts,
    totalStock,
    totalValue,
  };

  return { products, summary };
};

/**
 * 📈 Central Dispatcher
 */
export const buildReportData = async (type, filters) => {
  try {
    switch (type) {
      case "monthly": {
        if (!filters.month || !filters.year) {
          const now = new Date();
          filters.month = filters.month || (now.getMonth() + 1);
          filters.year = filters.year || now.getFullYear();
        }
        return await getMonthlyReport(filters);
      }
      case "weekly": {
        return await getWeeklyReport(filters);
      }
      case "daily": {
        if (!filters.date) {
          filters.date = new Date().toISOString().split('T')[0];
        }
        return await getDailyReport(filters);
      }
      case "custom-range": {
        if (!filters.start || !filters.end) throw new Error("Custom range requires 'start' and 'end'");
        return await getCustomRangeReport(filters);
      }
      case "customer": {
        if (!filters.customerId) throw new Error("Customer report requires 'customerId'");
        return await getCustomerReport(filters);
      }
      case "status": {
        if (!filters.status) throw new Error("Status report requires 'status'");
        return await getStatusReport(filters);
      }
      case "revenue": {
        if (!filters.start || !filters.end) throw new Error("Revenue report requires 'start' and 'end'");
        return await getRevenueReport(filters);
      }
      case "inventory": {
        return await getInventoryReport(filters);
      }
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  } catch (error) {
    console.error("buildReportData error:", error.message);
    throw error;
  }
};

