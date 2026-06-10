import express from "express";
import { z } from "zod";
import { pool } from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { getCompatibleDonors } from "../utils/bloodCompat.js";
import { notifyDashboard } from "../realtime.js";

const router = express.Router();
const DONOR_SEARCH_CITY = "Valencia";
const DONOR_SEARCH_PROVINCE = "Bukidnon";

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
const textField = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(max, `${label} must be ${max} characters or less`)
    .regex(
      /^[A-Za-z0-9\s,.'@+()#-]+$/,
      `${label} contains unsupported characters`,
    );

const createSchema = z.object({
  bloodType: z.enum(bloodTypes),
  units: z.number().int().min(1).max(20),
  urgency: z.enum(["normal", "urgent", "critical"]),
  location: textField("Location"),
  hospital: textField("Hospital"),
  contact: textField("Contact", 160),
});

router.post(
  "/donors/:donorId/request",
  authRequired,
  requireRole(["requester"]),
  async (req, res) => {
    const donorId = Number(req.params.donorId);
    if (Number.isNaN(donorId))
      return res.status(400).json({ message: "Invalid donor id" });

    const schema = z.object({
      units: z.number().int().min(1).max(10),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      note: z.string().max(500).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { units, date, time, note } = parsed.data;

  // Get donor blood type to match request display format
  const donorResult = await pool.query(
    `SELECT blood_type FROM donors WHERE user_id = $1`,
    [donorId]
  );

  const bloodType = donorResult.rows[0]?.blood_type || "O+";

  const result = await pool.query(
    `INSERT INTO direct_requests (requester_id, donor_id, units, request_date, request_time, note, status, blood_type, urgency)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, 'normal') RETURNING *`,
    [req.user!.id, donorId, units, date, time, note || "", bloodType]
  );

    const request = result.rows[0];

    notifyDashboard(`user:${donorId}`, {
      title: "New direct blood request",
      message: `You received a request for ${units} units of blood`,
      type: "request",
      requestId: request.id,
    });

    return res.status(201).json(request);
  },
);

router.post(
  "/",
  authRequired,
  requireRole(["requester", "admin"]),
  async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error.flatten());

    const { bloodType, units, urgency, location, hospital, contact } =
      parsed.data;
    const status = req.user!.role === "admin" ? "approved" : "pending";

    const result = await pool.query(
      `INSERT INTO requests (requester_id, blood_type, units, urgency, status, location, hospital, contact)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user!.id,
        bloodType,
        units,
        urgency,
        status,
        location,
        hospital,
        contact,
      ],
    );

    const request = result.rows[0];
    notifyDashboard(["role:admin", "role:donor"], {
      title: "New blood request",
      message: `${request.blood_type} needed at ${request.hospital} in ${request.location}.`,
      type: "request",
      requestId: request.id,
    });
    notifyDashboard(`user:${req.user!.id}`, {
      title: "Request submitted",
      message: `Your ${request.blood_type} request was created with ${request.status} status.`,
      type: "request",
      requestId: request.id,
    });

    return res.status(201).json(request);
  },
);

router.get("/", authRequired, async (req, res) => {
  const { bloodType, location, urgency, search } = req.query;
  const filters: string[] = [];
  const values: unknown[] = [];

  if (bloodType) {
    values.push(bloodType);
    filters.push(`blood_type = $${values.length}`);
  }
  if (location) {
    values.push(location);
    filters.push(`location ILIKE $${values.length}`);
    values[values.length - 1] = `%${location}%`;
  }
  if (urgency) {
    values.push(urgency);
    filters.push(`urgency = $${values.length}`);
  }
  if (search) {
    values.push(`%${String(search)}%`);
    filters.push(
      `(hospital ILIKE $${values.length} OR location ILIKE $${values.length} OR contact ILIKE $${values.length} OR blood_type ILIKE $${values.length})`,
    );
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const query = `SELECT * FROM requests ${where} ORDER BY created_at DESC`;
  const result = await pool.query(query, values);
  return res.json(result.rows);
});

router.get(
  "/donors/search",
  authRequired,
  requireRole(["requester"]),
  async (req, res) => {
    const { bloodType, search, availableOnly = "true" } = req.query;
    const filters: string[] = [];
    const values: unknown[] = [];

    if (bloodType) {
      values.push(String(bloodType));
      filters.push(`d.blood_type = $${values.length}`);
    }

    values.push(`%${DONOR_SEARCH_CITY}%`);
    filters.push(`d.location ILIKE $${values.length}`);
    values.push(`%${DONOR_SEARCH_PROVINCE}%`);
    filters.push(`d.location ILIKE $${values.length}`);

    if (search) {
      values.push(`%${String(search)}%`);
      filters.push(
        `(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR d.location ILIKE $${values.length} OR d.blood_type ILIKE $${values.length})`,
      );
    }

    if (availableOnly !== "false") {
      filters.push("d.availability = true");
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const donors = await pool.query(
      `SELECT u.id, u.name, u.email, d.blood_type, d.location, d.availability
     FROM donors d
     JOIN users u ON u.id = d.user_id
     ${where}
     ORDER BY d.availability DESC, d.location ASC, u.name ASC
     LIMIT 25`,
      values,
    );

    return res.json(donors.rows);
  },
);

router.get(
  "/donors/requests",
  authRequired,
  requireRole(["donor"]),
  async (req, res) => {
    const result = await pool.query(
      `
    SELECT dr.*, u.name as requester_name, u.email as requester_email
    FROM direct_requests dr
    JOIN users u ON u.id = dr.requester_id
    WHERE dr.donor_id = $1
    ORDER BY dr.created_at DESC
  `,
      [req.user!.id],
    );

    return res.json(result.rows);
  },
);

router.get(
  "/:id/matches",
  authRequired,
  requireRole(["admin", "requester"]),
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "Invalid request id" });

    const requestResult = await pool.query(
      "SELECT * FROM requests WHERE id = $1",
      [id],
    );
    if (!requestResult.rowCount)
      return res.status(404).json({ message: "Request not found" });

    const request = requestResult.rows[0];
    const compatibleTypes = getCompatibleDonors(request.blood_type);

    const donors = await pool.query(
      `SELECT u.id, u.name, u.email, d.blood_type, d.location, d.availability
     FROM donors d JOIN users u ON u.id = d.user_id
     WHERE d.availability = true
     AND d.blood_type = ANY($1)
     AND d.location ILIKE $2`,
      [compatibleTypes, `%${request.location}%`],
    );

    return res.json({ request, compatibleTypes, donors: donors.rows });
  },
);

export default router;
