import { Team, Employee } from "../types/types";

export function buildTeamTree(teams: Team[]) {
  const map = new Map<number, Team & { children: Team[] }>();
  const roots: (Team & { children: Team[] })[] = [];

  teams.forEach((team) => {
    map.set(team.id, { ...team, children: [] });
  });

  teams.forEach((team) => {
    if (team.parent_team_id && map.has(team.parent_team_id)) {
      map.get(team.parent_team_id)!.children.push(map.get(team.id)!);
    } else {
      roots.push(map.get(team.id)!);
    }
  });

  return roots;
}

export function gatherEmployeesWithTeamName(
  team: Team & { children: Team[] }
): (Employee & { teamName: string })[] {
  let result = team.employees.map((emp) => ({
    ...emp, // spread employee properties directly here
    teamName: team.name,
  }));
  team.children.forEach((child) => {
    result = result.concat(gatherEmployeesWithTeamName(child));
  });
  return result;
}
