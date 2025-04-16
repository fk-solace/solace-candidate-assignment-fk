import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { advocates, specialties, advocateSpecialties, locations } from "./schema";

/**
 * Setup database connection or return a mock DB object if DATABASE_URL is not set
 * The mock object implements all necessary methods to prevent runtime errors
 */
const setup = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Using mock database implementation.");
    // Return a mock DB object that implements all necessary methods
    return {
      select: () => ({
        from: () => [],
        leftJoin: () => [],
      }),
      insert: (table: any) => ({
        values: (data: any) => ({
          returning: () => Promise.resolve([]),
        }),
      }),
      update: (table: any) => ({
        set: (data: any) => ({
          where: () => Promise.resolve([]),
        }),
      }),
      delete: (table: any) => ({
        where: () => Promise.resolve([]),
      }),
      query: {  
        // Add any other query methods you might need
      },
    };
  }

  // For query purposes with real database connection
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);
  return db;
};

export default setup();
