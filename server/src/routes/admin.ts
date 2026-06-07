import express from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { notifyDashboard } from "../realtime.js";

const router = express.Router();
router.use(authRequired, requireRole(["admin"]));

const activeStatuses = ["pending", "approved", "in_progress"] as const;
const requestStatusSchema = z.enum(["pending", "approved", "in_progress", "completed"]);
const transitionMap: Record<string, string[]> = {
  pending: ["approved"],
  approved: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
};

router.get("/dashboard", async (_req, res) => {
  const [
    donors,
    availableDonors,
    activeRequests,
    urgentCases,
    completedRequests,
    byUrgency,
    byStatus,
    topLocations,
  ] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM donors"),
    pool.query("SELECT COUNT(*)::int AS count FROM donors WHERE availability = true"),
    pool.query("SELECT COUNT(*)::int AS count FROM requests WHERE status = ANY($1)", [activeStatuses]),
    pool.query("SELECT COUNT(*)::int AS count FROM requests WHERE urgency IN ('urgent', 'critical') AND status != 'completed'"),
    pool.query("SELECT COUNT(*)::int AS count FROM requests WHERE status = 'completed'"),
    pool.query("SELECT urgency, COUNT(*)::int AS count FROM requests GROUP BY urgency ORDER BY urgency"),
    pool.query("SELECT status, COUNT(*)::int AS count FROM requests GROUP BY status ORDER BY status"),
    pool.query(
      `SELECT location, COUNT(*)::int AS count
       FROM requests
       GROUP BY location
       ORDER BY count DESC, location ASC
       LIMIT 5`
    ),
  ]);

  return res.json({
    totalDonors: donors.rows[0].count,
    availableDonors: availableDonors.rows[0].count,
    activeRequests: activeRequests.rows[0].count,
    urgentCases: urgentCases.rows[0].count,
    completedRequests: completedRequests.rows[0].count,
    requestsByUrgency: byUrgency.rows,
    requestsByStatus: byStatus.rows,
    topLocations: topLocations.rows,
  });
});

const updateSchema = z.object({
  status: requestStatusSchema.optional(),
  urgency: z.enum(["normal", "urgent", "critical"]).optional(),
  assignedDonorId: z.number().int().positive().nullable().optional(),
});

router.patch("/requests/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid request id" });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { status, urgency, assignedDonorId } = parsed.data;

  const existingResult = await pool.query("SELECT * FROM requests WHERE id = $1", [id]);
  if (!existingResult.rowCount) return res.status(404).json({ message: "Request not found" });

  const current = existingResult.rows[0];
  if (status && status !== current.status) {
    const allowedNext = transitionMap[current.status] ?? [];
    if (!allowedNext.includes(status)) {
      return res.status(409).json({
        message: `Invalid status transition from ${current.status} to ${status}.`,
      });
    }
  }

  const updated = await pool.query(
    `UPDATE requests
     SET status = COALESCE($1, status),
         urgency = COALESCE($2, urgency),
         assigned_donor_id = COALESCE($3, assigned_donor_id)
     WHERE id = $4
     RETURNING *`,
    [status ?? null, urgency ?? null, assignedDonorId ?? null, id]
  );
  const request = updated.rows[0];
  notifyDashboard(
    ["role:admin", `user:${request.requester_id}`],
    {
      title: "Request updated",
      message: `Request #${request.id} is now ${request.status}.`,
      type: "status",
      requestId: request.id,
    }
  );
  if (request.assigned_donor_id) {
    notifyDashboard(`user:${request.assigned_donor_id}`, {
      title: "You were assigned",
      message: `You were assigned to request #${request.id}.`,
      type: "status",
      requestId: request.id,
    });
  }
  return res.json(updated.rows[0]);
});

export default router;
