## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The Solace Advocate Matching System helps users find healthcare advocates based on specialties, location, and other criteria. It features a normalized database schema with proper relations for improved scalability and performance.

## Getting Started

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database set up

The app is configured to return a default list of advocates. This will allow you to get the app up and running without needing to configure a database. If you’d like to configure a database, you’re encouraged to do so. You can uncomment the url in `.env` and the line in `src/app/api/advocates/route.ts` to test retrieving advocates from the database.

1. Start the PostgreSQL database using Docker:

```bash
docker compose up -d
```

2. Make sure the `solaceassignment` database exists.

3. Uncomment the `DATABASE_URL` in the `.env` file to enable database connectivity.

4. Push the database schema:

```bash
npm run db:push
```

5. Seed the database with sample data:

```bash
npm run db:seed
```

### Database Management Commands

The following commands are available for managing the database:

- `npm run db:push` - Push schema changes to the database
- `npm run db:studio` - Open Drizzle Studio to view and manage database data
- `npm run db:seed` - Seed the database with sample advocates and specialties

### Database Schema

The database uses a normalized schema with the following tables:

- `advocates` - Stores advocate information (name, degree, experience, etc.)
- `specialties` - Stores available specialties
- `advocate_specialties` - Junction table for the many-to-many relationship
- `locations` - Stores location information for each advocate

For detailed schema information, see [src/db/SCHEMA.md](src/db/SCHEMA.md).
