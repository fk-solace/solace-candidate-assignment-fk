import db from "../../../db";
import { advocates, specialties, advocateSpecialties, locations } from "../../../db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/advocates
 * Retrieves a list of advocates with their specialties and location information
 */
export async function GET() {
  try {
    // 1. Get all advocates
    const advocatesList = await db.select().from(advocates);
    
    // Create a map to store the complete advocate data
    const advocatesMap = new Map();
    
    // Initialize the map with advocate data
    for (const advocate of advocatesList) {
      advocatesMap.set(advocate.id, {
        ...advocate,
        specialties: [],
        city: "",
        state: "",
        country: "",
      });
    }
    
    // 2. Get all locations
    const locationsList = await db
      .select()
      .from(locations);
    
    // Add location data to advocates
    for (const location of locationsList) {
      const advocate = advocatesMap.get(location.advocateId);
      if (advocate) {
        advocate.city = location.city;
        advocate.state = location.state || "";
        advocate.country = location.country;
      }
    }
    
    // 3. Get all advocate-specialty relationships
    const advocateSpecialtiesList = await db
      .select()
      .from(advocateSpecialties)
      .leftJoin(specialties, eq(advocateSpecialties.specialtyId, specialties.id));
    
    // Add specialty data to advocates
    for (const relation of advocateSpecialtiesList) {
      const advocate = advocatesMap.get(relation.advocate_specialties.advocateId);
      if (advocate && relation.specialties) {
        advocate.specialties.push(relation.specialties.name);
      }
    }
    
    // Convert map to array for response
    const data = Array.from(advocatesMap.values());
    
    // If no data is returned from the database (likely because DATABASE_URL is not set),
    // return mock data for development purposes
    if (data.length === 0) {
      console.warn("No data returned from database, using mock data");
      return Response.json({ 
        success: true,
        data: [
          {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            city: "New York",
            degree: "MD",
            specialties: ["Bipolar", "LGBTQ"],
            yearsOfExperience: 10,
            phoneNumber: 5551234567,
          },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            city: "Los Angeles",
            degree: "PhD",
            specialties: ["Trauma & PTSD", "Women's issues"],
            yearsOfExperience: 8,
            phoneNumber: 5559876543,
          },
        ],
        count: 2,
        isMockData: true
      });
    }
    
    return Response.json({ 
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch advocates",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
