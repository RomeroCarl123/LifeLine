import express from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { notifyDashboard } from "../realtime.js";
import { getCompatibleRecipients } from "../utils/bloodCompat.js";

const router = express.Router();
const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
const locationSchema = z
  .string()
  .trim()
  .min(2, "Location must be at least 2 characters")
  .max(120, "Location must be 120 characters or less")
  .regex(/^[A-Za-z0-9\s,.'-]+$/, "Location contains unsupported characters");

router.use(authRequired, requireRole(["donor"]));

router.get("/me", async (req, res) => {
  const result = await pool.query(
    "SELECT d.user_id, u.name, u.email, d.blood_type, d.location, d.availability FROM donors d JOIN users u ON u.id = d.user_id WHERE d.user_id = $1",
    [req.user!.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Donor profile not found" });
  return res.json(result.rows[0]);
});

const updateSchema = z.object({
  bloodType: z.enum(bloodTypes).optional(),
  location: locationSchema.optional(),
  availability: z.boolean().optional(),
});

router.patch("/me", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { bloodType, location, availability } = parsed.data;
  await pool.query(
    "UPDATE donors SET blood_type = COALESCE($1, blood_type), location = COALESCE($2, location), availability = COALESCE($3, availability) WHERE user_id = $4",
    [bloodType ?? null, location ?? null, availability ?? null, req.user!.id]
  );

  notifyDashboard("role:admin", {
    title: "Donor profile updated",
    message: `${req.user!.email} updated donor availability or location.`,
    type: "donor",
  });

  return res.json({ message: "Donor profile updated" });
});

router.get("/requests/matches", async (req, res) => {
  const { bloodType, location, urgency, search } = req.query;
  const profile = await pool.query(
    "SELECT blood_type, location, availability FROM donors WHERE user_id = $1",
    [req.user!.id]
  );
  if (!profile.rowCount) return res.status(404).json({ message: "Donor profile not found" });

  const donor = profile.rows[0];
  const compatibleRequests = getCompatibleRecipients(donor.blood_type);
  const requestTypes =
    bloodType && compatibleRequests.includes(String(bloodType))
      ? [String(bloodType)]
      : compatibleRequests;
  const filters: string[] = [
    "r.status = 'approved'",
    "r.assigned_donor_id IS NULL",
    `r.blood_type = ANY($1)`,
    `r.location ILIKE $2`,
  ];
  const values: unknown[] = [
    requestTypes,
    `%${location ? String(location) : donor.location}%`,
  ];

  if (urgency) {
    values.push(String(urgency));
    filters.push(`r.urgency = $${values.length}`);
  }

  if (search) {
    values.push(`%${String(search)}%`);
    filters.push(
      `(r.hospital ILIKE $${values.length} OR r.location ILIKE $${values.length} OR r.contact ILIKE $${values.length})`
    );
  }

  const result = await pool.query(
    `SELECT r.*
     FROM requests r
     WHERE ${filters.join(" AND ")}
     ORDER BY
       CASE r.urgency
         WHEN 'critical' THEN 1
         WHEN 'urgent' THEN 2
         ELSE 3
       END,
       r.created_at DESC
     LIMIT 20`,
    values
  );

  return res.json({
    donor,
    compatibleRequestTypes: compatibleRequests,
    requests: result.rows,
  });
});

router.post("/requests/:id/respond", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid request id" });

  const profile = await pool.query(
    "SELECT blood_type, location, availability FROM donors WHERE user_id = $1",
    [req.user!.id]
  );
  if (!profile.rowCount) return res.status(404).json({ message: "Donor profile not found" });

  const donor = profile.rows[0];
  if (!donor.availability) {
    return res.status(409).json({ message: "Mark yourself available before accepting requests" });
  }

  const compatibleRequests = getCompatibleRecipients(donor.blood_type);
  const updated = await pool.query(
    `UPDATE requests
     SET assigned_donor_id = $1,
         status = 'in_progress'
     WHERE id = $2
       AND assigned_donor_id IS NULL
       AND status = 'approved'
       AND blood_type = ANY($3)
       AND location ILIKE $4
     RETURNING *`,
    [req.user!.id, id, compatibleRequests, `%${donor.location}%`]
  );

  if (!updated.rowCount) {
    return res.status(404).json({
      message: "No matching open request found, or the request was already assigned",
    });
  }

  const request = updated.rows[0];
  notifyDashboard(["role:admin", `user:${request.requester_id}`], {
    title: "Donor responded",
    message: `${req.user!.email} accepted request #${request.id}.`,
    type: "donor",
    requestId: request.id,
  });
  notifyDashboard(`user:${req.user!.id}`, {
    title: "Request accepted",
    message: `You accepted request #${request.id} and it is now in progress.`,
    type: "status",
    requestId: request.id,
  });

  return res.json(request);
});

export default router;
