import db from "../../../db";
import { advocates, specialties, advocateSpecialties, locations } from "../../../db/schema";
import { eq, sql, desc, asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { 
  getPaginationParams, 
  getLinkHeader,
  DEFAULT_PAGE_SIZE,
  decodeCursor,
  encodeCursor
} from "../../../utils/pagination";
import {
  getSortParams,
  getSortExpressionsWithCaseInsensitive,
  ALLOWED_ADVOCATE_SORT_FIELDS
} from "../../../utils/sorting";

/**
 * GET /api/advocates
 * Retrieves a list of advocates with their specialties and location information
 * 
 * Supports pagination with the following query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, allowed values: 10, 25, 50)
 * - cursor: Cursor for cursor-based pagination
 * - cursorField: Field to use for cursor-based pagination (default: id)
 * 
 * Supports sorting with the following query parameters:
 * - sort: Field to sort by (default: createdAt)
 *   Allowed values: firstName, lastName, degree, yearsOfExperience, createdAt, updatedAt
 * - order: Sort direction (default: desc)
 *   Allowed values: asc, desc
 * - secondarySort: Secondary field to sort by (optional)
 * - secondaryOrder: Secondary sort direction (default: asc)
 * 
 * Example usage:
 * - /api/advocates?page=1&limit=10 (Get first page with 10 items)
 * - /api/advocates?page=2&limit=25 (Get second page with 25 items)
 * - /api/advocates?cursor=<cursor_value> (Get next page using cursor)
 * - /api/advocates?sort=lastName&order=asc (Sort by last name ascending)
 * - /api/advocates?sort=yearsOfExperience&order=desc&secondarySort=lastName&secondaryOrder=asc 
 *   (Sort by years of experience descending, then by last name ascending)
 */
export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from request
    const paginationParams = getPaginationParams(request);
    // Ensure we're using the limit from the request parameters
    const { page = 1, limit = DEFAULT_PAGE_SIZE, cursor } = paginationParams;
    
    // Log pagination parameters for debugging

    
    // Get sort parameters from request
    const sortParams = getSortParams(request);
    
    // Get the text fields that should use case-insensitive sorting
    const textFields = ['firstName', 'lastName', 'degree'];
    
    // Generate sort expressions with case-insensitive sorting for text fields
    const sortExpressions = getSortExpressionsWithCaseInsensitive(
      advocates, 
      sortParams,
      textFields
    );
    
    // For simplicity, we'll fetch all advocates and apply pagination in memory
    // In a production environment, we would apply pagination at the database level
    const query = db.select().from(advocates);
    
    // Apply sorting if we have sort expressions
    const sortedQuery = sortExpressions.length > 0
      ? query.orderBy(...sortExpressions)
      : query;
    
    const allAdvocates = await sortedQuery;
    
    // Get total count from the fetched data
    const totalCount = allAdvocates.length;
    
    let advocatesList;
    
    if (cursor) {
      // Cursor-based pagination
      const cursorData = decodeCursor(cursor);

      
      if (cursorData) {
        // Find the index of the item with the cursor ID
        const cursorItemIndex = allAdvocates.findIndex((advocate: any) => 
          advocate.id === cursorData.value);
        

        
        if (cursorItemIndex !== -1) {
          // If cursor direction is forward, get items after the cursor
          // If cursor direction is backward, get items before the cursor
          if (cursorData.direction === 'forward') {
            advocatesList = allAdvocates.slice(cursorItemIndex + 1, cursorItemIndex + 1 + limit);

          } else {
            // For backward pagination, get the previous page
            const startIndex = Math.max(0, cursorItemIndex - limit);
            advocatesList = allAdvocates.slice(startIndex, cursorItemIndex);

          }
        } else {
          // Cursor item not found, fall back to first page
          advocatesList = allAdvocates.slice(0, limit);

        }
      } else {
        // Invalid cursor, fall back to first page
        advocatesList = allAdvocates.slice(0, limit);

      }
    } else {
      // Offset-based pagination
      const offset = (page - 1) * limit;
      const end = offset + limit;

      advocatesList = allAdvocates.slice(offset, end);
    }
    
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
    
    // 3. Get all advocate-specialty relationships with specialties
    // We'll use a simpler approach to avoid TypeScript errors
    const advocateSpecialtiesRaw = await db.select().from(advocateSpecialties);
    const specialtiesList = await db.select().from(specialties);
    
    // Create a map of specialties by ID for easy lookup
    const specialtiesMap = new Map();
    for (const specialty of specialtiesList) {
      specialtiesMap.set(specialty.id, specialty);
    }
    
    // Combine the data manually
    const advocateSpecialtiesList = advocateSpecialtiesRaw.map(relation => ({
      advocate_specialties: relation,
      specialties: specialtiesMap.get(relation.specialtyId)
    }));
    
    // Add specialty data to advocates
    for (const relation of advocateSpecialtiesList) {
      if (!relation.advocate_specialties || !relation.specialties) continue;
      
      const advocateId = relation.advocate_specialties.advocateId;
      const advocate = advocatesMap.get(advocateId);
      if (advocate && relation.specialties.name) {
        advocate.specialties.push(relation.specialties.name);
      }
    }
    
    // Convert map to array for response
    const data = Array.from(advocatesMap.values());
    
    // If no data is returned from the database (likely because DATABASE_URL is not set),
    // If no data is returned from the database, return an empty array
    if (data.length === 0) {
      console.warn("No data returned from database");
      
      return Response.json({ 
        success: true,
        data: [],
        pagination: {
          totalCount: 0,
          pageSize: paginationParams.limit || DEFAULT_PAGE_SIZE,
          currentPage: paginationParams.page || 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },

      });
    }
    
    // Generate pagination metadata
    // For offset-based pagination, calculate if there are more pages
    const hasNextPage = advocatesList.length < totalCount && 
      (cursor ? true : (page - 1) * limit + advocatesList.length < totalCount);
    const hasPreviousPage = cursor ? true : page > 1;
    
    // Generate cursors for next/prev pages
    let nextCursor, prevCursor;
    
    if (advocatesList.length > 0) {
      // For next cursor, use the last item's ID
      if (hasNextPage) {
        const lastItem = advocatesList[advocatesList.length - 1];
        nextCursor = encodeCursor('id', lastItem.id, 'forward');
      }
      
      // For previous cursor, use the first item's ID
      if (hasPreviousPage) {
        const firstItem = advocatesList[0];
        prevCursor = encodeCursor('id', firstItem.id, 'backward');
      }
    }
    
    const paginationMeta = {
      totalCount,
      pageSize: limit,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage,
      hasPreviousPage,
      nextCursor,
      prevCursor,
      cursorField: 'id'
    };
    
    // Create response with pagination headers
    const response = Response.json({
      success: true,
      data,
      pagination: paginationMeta,
    });
    
    // Add Link header for navigation (RFC 5988)
    const linkHeader = getLinkHeader(request, paginationMeta);
    response.headers.set('Link', linkHeader);
    
    // Add ETag for caching
    const etag = `W/"${totalCount}-${page}-${limit}-${sortParams.field}-${sortParams.direction}"`;
    response.headers.set('ETag', etag);
    
    return response;
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
