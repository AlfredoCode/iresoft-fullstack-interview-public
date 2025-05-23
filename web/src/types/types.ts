// types.ts
export type Employee = {
  id: string;
  name: string;
  surname: string;
  position: string;
  end_date?: string | null;
};

export type Team = {
  id: number;
  name: string;
  employees: Employee[];
  children: Team[];
  parent_team_id?: number | null;
};
