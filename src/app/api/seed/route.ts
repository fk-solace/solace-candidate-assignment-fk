import db from "../../../db";
import { seedDatabase } from "../../../db/seed/advocates";

export async function POST() {
  try {
    const result = await seedDatabase();
    
    return Response.json({
      success: true,
      data: {
        advocates: result.advocates.length,
        specialties: result.specialties.length,
        locations: result.locations.length,
        relationships: result.advocateSpecialties.length,
      },
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Error in seed API route:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to seed database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
