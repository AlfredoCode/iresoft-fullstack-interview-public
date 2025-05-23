// types.ts
export type Employee = {
  id?: string | null;
  name: string;
  surname: string;
  position: string;
  end_date?: string | null;
  start_date?: string | null;
  team_id?: string | null;
};

export type Team = {
  id: string;
  name: string;
  employees: Employee[];
  children: Team[];
  parent_team_id?: number | null;
};
