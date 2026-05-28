import prisma from "../prisma.js";

/**
 * ✍️ Get all FAQs (admin)
 */
export const getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✍️ Get active FAQs for public display
 */
export const getActiveFaqs = async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✍️ Get single FAQ
 */
export const getFaqById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const faq = await prisma.faq.findUnique({
      where: { id }
    });

    if (!faq) {
      const error = new Error("FAQ not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✍️ Create FAQ
 */
export const createFaq = async (req, res, next) => {
  try {
    const { question, questionRw, answer, answerRw, order, isActive } = req.body;

    if (!question || !answer) {
      const error = new Error("Question and answer are required");
      error.statusCode = 400;
      return next(error);
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        questionRw,
        answer,
        answerRw,
        order: order ? Number(order) : 0,
        isActive: isActive !== false
      }
    });

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✍️ Update FAQ
 */
export const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.order !== undefined) {
      updates.order = Number(updates.order);
    }

    const faq = await prisma.faq.update({
      where: { id },
      data: updates
    });

    res.json({
      success: true,
      message: "FAQ updated successfully",
      data: faq
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error("FAQ not found");
      err.statusCode = 404;
      return next(err);
    }
    next(error);
  }
};

/**
 * ✍️ Delete FAQ
 */
export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.faq.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "FAQ deleted successfully"
    });
  } catch (error) {
    if (error.code === 'P2025') {
      const err = new Error("FAQ not found");
      err.statusCode = 404;
      return next(err);
    }
    next(error);
  }
};

/**
 * ✍️ Toggle FAQ active status
 */
export const toggleFaqStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({ where: { id } });

    if (!faq) {
      const error = new Error("FAQ not found");
      error.statusCode = 404;
      return next(error);
    }

    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: { isActive: !faq.isActive }
    });

    res.json({
      success: true,
      message: `FAQ ${updatedFaq.isActive ? "activated" : "deactivated"} successfully`,
      data: updatedFaq
    });
  } catch (error) {
    next(error);
  }
};
