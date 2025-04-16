"use client";

import { AdvocatePage } from "../components/advocates";

/**
 * Main home page component that renders the AdvocatePage
 * @returns Home page with advocate listing
 */
export default function Home() {
  return (
    <main style={{ margin: "24px" }}>
      <AdvocatePage />
    </main>
  );
}
