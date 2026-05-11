import prisma from "../prisma.js";

/**
 * 💸 Record a new expense
 */
export const createExpense = async (req, res, next) => {
  try {
    const { description, amount, category, paymentMethod, shiftId, date } = req.body;
    const userId = req.user.id;

    const expense = await prisma.$transaction(async (tx) => {
      // Auto-detect active shift if not provided
      let effectiveShiftId = shiftId;
      if (!effectiveShiftId) {
        const activeShift = await tx.shift.findFirst({
          where: { userId: userId, status: "open" }
        });
        if (activeShift) effectiveShiftId = activeShift.id;
      }

      const newExpense = await tx.expense.create({
        data: {
          description,
          amount: parseFloat(amount),
          category: category || "General",
          paymentMethod: paymentMethod || "cash",
          date: date ? new Date(date) : new Date(),
          userId,
          shiftId: effectiveShiftId || null,
        },
        include: {
          user: { select: { name: true } },
          shift: true
        }
      });

      // 🕒 If linked to a shift and paid by cash/drawer, update the shift's expected drawer amount
      if (effectiveShiftId && (paymentMethod === "cash" || paymentMethod === "drawer")) {
        await tx.shift.update({
          where: { id: effectiveShiftId },
          data: {
            expectedEndingDrawerAmount: { decrement: parseFloat(amount) }
          }
        });
      }

      return newExpense;
    });

    res.status(201).json({
      success: true,
      message: "Expense recorded successfully",
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 💸 Get all expenses with filtering
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { from, to, category, shiftId, userId } = req.query;
    
    const where = {};
    
    // Multi-tenant isolation
    const isSellerOrAdmin = req.user.role === 'seller' || req.user.role === 'admin';
    const effectiveSellerId = req.user.role === 'cashier' ? req.user.managedById : req.user.id;

    if (isSellerOrAdmin) {
      // Seller/Admin sees their own + their staff's expenses
      const staff = await prisma.user.findMany({ where: { managedById: req.user.id }, select: { id: true } });
      const allRelatedIds = [req.user.id, ...staff.map(s => s.id)];
      where.userId = { in: allRelatedIds };
    } else {
      // Cashier only sees their own
      where.userId = req.user.id;
    }

    if (category) where.category = category;
    if (shiftId) where.shiftId = shiftId;
    
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        shift: { select: { id: true, startTime: true } }
      },
      orderBy: { date: 'desc' }
    });

    // Calculate total
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.json({
      success: true,
      data: expenses,
      totalAmount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 💸 Get expense by ID
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        shift: true
      }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

/**
 * 💸 Update an expense
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount, category, paymentMethod, date } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Get old expense to calculate difference
      const oldExpense = await tx.expense.findUnique({ where: { id } });
      if (!oldExpense) throw new Error("Expense not found");

      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          description,
          amount: amount ? parseFloat(amount) : undefined,
          category,
          paymentMethod,
          date: date ? new Date(date) : undefined
        }
      });

      // If amount changed and it was linked to a shift drawer, adjust the shift
      if (oldExpense.shiftId && (oldExpense.paymentMethod === "cash" || oldExpense.paymentMethod === "drawer")) {
        const diff = (amount ? parseFloat(amount) : oldExpense.amount) - oldExpense.amount;
        if (diff !== 0) {
          await tx.shift.update({
            where: { id: oldExpense.shiftId },
            data: {
              expectedEndingDrawerAmount: { decrement: diff }
            }
          });
        }
      }

      return updatedExpense;
    });

    res.json({ success: true, message: "Expense updated", data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * 💸 Delete an expense
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id } });
      if (!expense) throw new Error("Expense not found");

      // 🕒 If linked to a shift and paid by cash/drawer, "refund" the shift's expected drawer amount
      if (expense.shiftId && (expense.paymentMethod === "cash" || expense.paymentMethod === "drawer")) {
        await tx.shift.update({
          where: { id: expense.shiftId },
          data: {
            expectedEndingDrawerAmount: { increment: expense.amount }
          }
        });
      }

      await tx.expense.delete({ where: { id } });
    });

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};
