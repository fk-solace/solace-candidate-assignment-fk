import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  serial,
  timestamp,
  bigint,
  primaryKey,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Advocates table - stores basic information about healthcare advocates
 */
export const advocates = pgTable("advocates", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  // Moved city to locations table
  degree: varchar("degree", { length: 50 }).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Specialties table - stores all available specialties
 */
export const specialties = pgTable("specialties", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Junction table for many-to-many relationship between advocates and specialties
 */
export const advocateSpecialties = pgTable(
  "advocate_specialties",
  {
    advocateId: uuid("advocate_id")
      .notNull()
      .references(() => advocates.id, { onDelete: "cascade" }),
    specialtyId: uuid("specialty_id")
      .notNull()
      .references(() => specialties.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.advocateId, t.specialtyId] }),
  })
);

/**
 * Locations table - stores advocate locations
 */
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  advocateId: uuid("advocate_id")
    .notNull()
    .references(() => advocates.id, { onDelete: "cascade" }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 100 }).default("United States").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Export all tables
export { advocateSpecialties as advocateToSpecialty };

