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

export async function createTeam(data: {
  name: string;
  parent_team_id?: string | null;
}): Promise<Team> {
  const res = await fetch(`${BASE_URL}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STATIC_TOKEN}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create team");
  }

  const team: Team = await res.json();
  return team;
}

export async function deleteTeam(teamId: string): Promise<void> {
  console.log("Removing", teamId);
  const res = await fetch(`${BASE_URL}/teams/${teamId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STATIC_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete team");
  }
}

export async function updateTeam(
  teamId: string,
  data: { name?: string; parent_team_id?: string | null }
) {
  try {
    const response = await fetch(`${BASE_URL}/teams/${teamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STATIC_TOKEN}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update team: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("updateTeam error:", error);
    throw error;
  }
}
