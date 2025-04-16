# Solace Advocate Matching System - Database Schema

## Entity Relationship Diagram (ERD)

```
+---------------+       +---------------------+       +---------------+
|   advocates   |       | advocate_specialties|       |  specialties  |
+---------------+       +---------------------+       +---------------+
| id (PK)       |       | advocateId (PK,FK1) |       | id (PK)       |
| firstName     |       | specialtyId (PK,FK2)|       | name          |
| lastName      |<----->+---------------------+<----->| description   |
| degree        |       |                     |       | createdAt     |
| yearsOfExp    |       |                     |       |               |
| phoneNumber   |       |                     |       |               |
| createdAt     |       |                     |       |               |
| updatedAt     |       |                     |       |               |
+---------------+       |                     |       +---------------+
        ^               |                     |
        |               |                     |
        |               |                     |
        |               |                     |
+---------------+       |                     |
|   locations   |       |                     |
+---------------+       |                     |
| id (PK)       |       |                     |
| advocateId(FK)|-------+                     |
| city          |                             |
| state         |                             |
| country       |                             |
| createdAt     |                             |
+---------------+                             |
                                              |
```

## Schema Details

### Advocates Table
Stores the core information about healthcare advocates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for each advocate |
| firstName | VARCHAR(100) | NOT NULL | Advocate's first name |
| lastName | VARCHAR(100) | NOT NULL | Advocate's last name |
| degree | VARCHAR(50) | NOT NULL | Advocate's professional degree (MD, PhD, etc.) |
| yearsOfExperience | INTEGER | NOT NULL | Years of professional experience |
| phoneNumber | BIGINT | NOT NULL | Contact phone number |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | DEFAULT NOW() | Record update timestamp |

### Specialties Table
Stores all available specialties that advocates can have.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for each specialty |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Name of the specialty |
| description | TEXT | | Optional description of the specialty |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |

### Advocate Specialties Table (Junction Table)
Manages the many-to-many relationship between advocates and specialties.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| advocateId | UUID | PK, FK, NOT NULL | Reference to advocates table |
| specialtyId | UUID | PK, FK, NOT NULL | Reference to specialties table |

The primary key is a composite of both columns, ensuring each advocate-specialty pair is unique.

### Locations Table
Stores location information for each advocate.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for each location |
| advocateId | UUID | FK, NOT NULL | Reference to advocates table |
| city | VARCHAR(100) | NOT NULL | City name |
| state | VARCHAR(50) | | State or province (optional) |
| country | VARCHAR(100) | NOT NULL, DEFAULT 'United States' | Country name |
| createdAt | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
