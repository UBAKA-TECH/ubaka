import express from "express";
import {
    getAllJobListings,
    getJobListingById,
    submitJobApplication,
    createJobListing,
    updateJobListing,
    deleteJobListing,
    getAllJobApplications,
    updateJobApplicationStatus
} from "../controllers/careerController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 💼 Public routes
router.get("/", getAllJobListings);
router.get("/:id", getJobListingById);
router.post("/:id/apply", submitJobApplication);

// 💼 Admin protected routes
router.post("/", verifyAdmin, createJobListing);
router.put("/:id", verifyAdmin, updateJobListing);
router.delete("/:id", verifyAdmin, deleteJobListing);
router.get("/applications/all", verifyAdmin, getAllJobApplications);
router.put("/applications/:id", verifyAdmin, updateJobApplicationStatus);

export default router;
