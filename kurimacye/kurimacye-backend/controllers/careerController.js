import prisma from "../prisma.js";

// 💼 GET /api/careers (public)
export const getAllJobListings = async (req, res, next) => {
    try {
        const jobs = await prisma.jobListing.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: jobs });
    } catch (error) {
        next(error);
    }
};

// 💼 GET /api/careers/:id (public)
export const getJobListingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await prisma.jobListing.findUnique({
            where: { id }
        });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job listing not found" });
        }
        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

// 💼 POST /api/careers/:id/apply (public)
export const submitJobApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, portfolioLink, coverLetter } = req.body;

        if (!fullName || !email || !phone) {
            return res.status(400).json({ success: false, message: "Full name, email, and phone are required" });
        }

        const jobListing = await prisma.jobListing.findUnique({
            where: { id }
        });

        if (!jobListing) {
            return res.status(404).json({ success: false, message: "Job listing not found" });
        }

        const application = await prisma.jobApplication.create({
            data: {
                fullName,
                email,
                phone,
                portfolioLink,
                coverLetter,
                jobListingId: id
            }
        });

        res.status(201).json({
            success: true,
            message: "Your application has been received successfully! Our HR team will reach out to you within 3 business days.",
            data: application
        });
    } catch (error) {
        next(error);
    }
};

// 💼 POST /api/careers (admin)
export const createJobListing = async (req, res, next) => {
    try {
        const { 
            title, titleRw, 
            department, departmentRw, 
            location, locationRw, 
            type, icon, 
            description, descriptionRw, 
            requirements, requirementsRw, 
            benefits, benefitsRw, 
            isActive 
        } = req.body;

        if (!title || !department || !location || !type || !icon || !description) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newJob = await prisma.jobListing.create({
            data: {
                title,
                titleRw,
                department,
                departmentRw,
                location,
                locationRw,
                type,
                icon,
                description,
                descriptionRw,
                requirements: requirements || [],
                requirementsRw: requirementsRw || [],
                benefits: benefits || [],
                benefitsRw: benefitsRw || [],
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        next(error);
    }
};

// 💼 PUT /api/careers/:id (admin)
export const updateJobListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            title, titleRw, 
            department, departmentRw, 
            location, locationRw, 
            type, icon, 
            description, descriptionRw, 
            requirements, requirementsRw, 
            benefits, benefitsRw, 
            isActive 
        } = req.body;

        const updatedJob = await prisma.jobListing.update({
            where: { id },
            data: {
                title,
                titleRw,
                department,
                departmentRw,
                location,
                locationRw,
                type,
                icon,
                description,
                descriptionRw,
                requirements,
                requirementsRw,
                benefits,
                benefitsRw,
                isActive
            }
        });

        res.json({ success: true, data: updatedJob });
    } catch (error) {
        next(error);
    }
};

// 💼 DELETE /api/careers/:id (admin)
export const deleteJobListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.jobListing.delete({
            where: { id }
        });
        res.json({ success: true, message: "Job listing deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// 💼 GET /api/careers/applications (admin)
export const getAllJobApplications = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const where = {};
        if (status) where.status = status;

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                jobListing: {
                    select: { title: true, department: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });

        const total = await prisma.jobApplication.count({ where });

        res.json({
            success: true,
            data: applications,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// 💼 PUT /api/careers/applications/:id (admin)
export const updateJobApplicationStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        const updatedApplication = await prisma.jobApplication.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true, data: updatedApplication });
    } catch (error) {
        next(error);
    }
};
