import db from "..";
import { advocates, specialties, advocateSpecialties, locations } from "../schema";

/**
 * List of all available specialties
 */
const specialtiesList = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health (anxiety, depression, stress, grief, life transitions)",
  "Men's issues",
  "Relationship Issues (family, friends, couple, etc)",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues (post-partum, infertility, family planning)",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching (leadership, career, academic and wellness)",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations & testing (ADHD testing)",
  "Attention and Hyperactivity (ADHD)",
  "Sleep issues",
  "Schizophrenia and psychotic disorders",
  "Learning disorders",
  "Domestic abuse",
];

/**
 * Helper function to get random specialties for each advocate
 * @returns Array of specialty indices
 */
const getRandomSpecialtyIndices = () => {
  const random1 = Math.floor(Math.random() * 24);
  const random2 = Math.floor(Math.random() * (24 - random1)) + random1 + 1;

  return [random1, random2];
};

/**
 * Base advocate data without specialties
 */
const advocateBaseData = [
  {
    firstName: "John",
    lastName: "Doe",
    degree: "MD",
    yearsOfExperience: 10,
    phoneNumber: 5551234567,
    city: "New York",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    degree: "PhD",
    yearsOfExperience: 8,
    phoneNumber: 5559876543,
    city: "Los Angeles",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Alice",
    lastName: "Johnson",
    degree: "MSW",
    yearsOfExperience: 5,
    phoneNumber: 5554567890,
    city: "Chicago",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Michael",
    lastName: "Brown",
    degree: "MD",
    yearsOfExperience: 12,
    phoneNumber: 5556543210,
    city: "Houston",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Emily",
    lastName: "Davis",
    degree: "PhD",
    yearsOfExperience: 7,
    phoneNumber: 5553210987,
    city: "Phoenix",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Chris",
    lastName: "Martinez",
    degree: "MSW",
    yearsOfExperience: 9,
    phoneNumber: 5557890123,
    city: "Philadelphia",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Jessica",
    lastName: "Taylor",
    degree: "MD",
    yearsOfExperience: 11,
    phoneNumber: 5554561234,
    city: "San Antonio",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "David",
    lastName: "Harris",
    degree: "PhD",
    yearsOfExperience: 6,
    phoneNumber: 5557896543,
    city: "San Diego",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Laura",
    lastName: "Clark",
    degree: "MSW",
    yearsOfExperience: 4,
    phoneNumber: 5550123456,
    city: "Dallas",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Daniel",
    lastName: "Lewis",
    degree: "MD",
    yearsOfExperience: 13,
    phoneNumber: 5553217654,
    city: "San Jose",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Sarah",
    lastName: "Lee",
    degree: "PhD",
    yearsOfExperience: 10,
    phoneNumber: 5551238765,
    city: "Austin",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "James",
    lastName: "King",
    degree: "MSW",
    yearsOfExperience: 5,
    phoneNumber: 5556540987,
    city: "Jacksonville",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Megan",
    lastName: "Green",
    degree: "MD",
    yearsOfExperience: 14,
    phoneNumber: 5559873456,
    city: "San Francisco",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Joshua",
    lastName: "Walker",
    degree: "PhD",
    yearsOfExperience: 9,
    phoneNumber: 5556781234,
    city: "Columbus",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
  {
    firstName: "Amanda",
    lastName: "Hall",
    degree: "MSW",
    yearsOfExperience: 3,
    phoneNumber: 5559872345,
    city: "Fort Worth",
    specialties: specialtiesList.slice(...getRandomSpecialtyIndices()),
  },
];

/**
 * Function to seed the database with normalized data
 */
async function seedDatabase() {
  try {
    // 1. Insert specialties
    const insertedSpecialties = await db
      .insert(specialties)
      .values(specialtiesList.map(name => ({ name })))
      .returning();
    
    console.log(`Inserted ${insertedSpecialties.length} specialties`);
    
    // Create a map of specialty names to their IDs for easy lookup
    const specialtyMap = new Map();
    insertedSpecialties.forEach(specialty => {
      specialtyMap.set(specialty.name, specialty.id);
    });
    
    // 2. Insert advocates
    const advocateValues = advocateBaseData.map(advocate => ({
      firstName: advocate.firstName,
      lastName: advocate.lastName,
      degree: advocate.degree,
      yearsOfExperience: advocate.yearsOfExperience,
      phoneNumber: advocate.phoneNumber,
    }));
    
    const insertedAdvocates = await db
      .insert(advocates)
      .values(advocateValues)
      .returning();
    
    console.log(`Inserted ${insertedAdvocates.length} advocates`);
    
    // 3. Insert locations
    const locationsData = advocateBaseData.map((advocate, index) => ({
      advocateId: insertedAdvocates[index].id,
      city: advocate.city,
      state: "",  // Could be expanded with real state data
      country: "United States",
    }));
    
    const insertedLocations = await db
      .insert(locations)
      .values(locationsData)
      .returning();
    
    console.log(`Inserted ${insertedLocations.length} locations`);
    
    // 4. Create advocate-specialty relationships using the original specialties
    const advocateSpecialtiesData = [];
    
    // For each advocate, use their assigned specialties from the data
    for (let i = 0; i < advocateBaseData.length; i++) {
      const advocate = advocateBaseData[i];
      const advocateId = insertedAdvocates[i].id;
      
      // For each specialty in the advocate's specialties array, create a relationship
      for (const specialtyName of advocate.specialties) {
        // Find the specialty ID from our map
        const specialtyId = specialtyMap.get(specialtyName);
        
        if (specialtyId) {
          advocateSpecialtiesData.push({
            advocateId,
            specialtyId,
          });
        } else {
          console.warn(`Specialty "${specialtyName}" not found in database`);
        }
      }
    }
    
    const insertedAdvocateSpecialties = await db
      .insert(advocateSpecialties)
      .values(advocateSpecialtiesData)
      .returning();
    
    console.log(`Created ${insertedAdvocateSpecialties.length} advocate-specialty relationships`);
    
    return {
      advocates: insertedAdvocates,
      specialties: insertedSpecialties,
      locations: insertedLocations,
      advocateSpecialties: insertedAdvocateSpecialties,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };
