mimport express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db.js";
import { signToken } from "../utils/jwt.js";

const router = express.Router();

const bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be 80 characters or less")
  .regex(
    /^[A-Za-z][A-Za-z\s'.-]*$/,
    "Name can only contain letters, spaces, apostrophes, periods, and hyphens",
  );
const locationSchema = z
  .string()
  .trim()
  .min(2, "Location must be at least 2 characters")
  .max(120, "Location must be 120 characters or less")
  .regex(/^[A-Za-z0-9\s,.'-]+$/, "Location contains unsupported characters");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or less")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

const registerSchema = z
  .object({
    name: nameSchema,
    email: z.string().trim().email().max(120),
    password: passwordSchema,
    role: z.enum(["donor", "requester"]),
    bloodType: z.enum(bloodTypes).optional(),
    location: locationSchema.optional(),
    availability: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "donor") {
      if (!data.bloodType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bloodType"],
          message: "Blood type is required for donor accounts",
        });
      }
      if (!data.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "Location is required for donor accounts",
        });
      }
    }
  });

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { name, email, password, role, bloodType, location, availability } =
    parsed.data;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rowCount)
    return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const userResult = await pool.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role",
    [name, email, passwordHash, role],
  );

  const user = userResult.rows[0];

  if (role === "donor") {
    await pool.query(
      "INSERT INTO donors (user_id, blood_type, location, availability) VALUES ($1, $2, $3, $4)",
      [user.id, bloodType ?? "O+", location ?? "Unknown", availability ?? true],
    );
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return res.status(201).json({ token, user });
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

// Admin secret access key is no longer required.
// Kept schema name for compatibility, but accessKey is optional.
const adminLoginSchema = loginSchema.extend({
  accessKey: z.string().trim().min(1).optional(),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { email, password } = parsed.data;

  const result = await pool.query(
    "SELECT id, email, role, password_hash FROM users WHERE email = $1",
    [email],
  );
  if (!result.rowCount)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = result.rows[0];

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

router.post("/admin/login", async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const { email, password } = parsed.data;

  const result = await pool.query(
    "SELECT id, email, role, password_hash FROM users WHERE email = $1",
    [email],
  );

  let user = result.rows[0];

  if (user && user.role !== "admin") {
    return res.status(409).json({
      message: "This email is already registered for a non-admin account",
    });
  }

  if (user) {
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ message: "Invalid admin credentials" });
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id, email, role",
      ["Admin", email, passwordHash],
    );
    user = created.rows[0];
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

export default router;
