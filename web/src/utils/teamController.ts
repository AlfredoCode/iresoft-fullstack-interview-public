import type { Team } from "../types/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STATIC_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "";

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE_URL}/teams`, {
    headers: { Authorization: `Bearer ${STATIC_TOKEN}` },
  });

  if (!res.ok) throw new Error("Failed to fetch teams");

  const teams: Team[] = await res.json();

  return teams;
}
