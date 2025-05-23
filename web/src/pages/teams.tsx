import React, { useEffect, useState } from "react";
import { Team, Employee } from "../types/types";
import { fetchTeams } from "../utils/teamController";
import {
  Box,
  Typography,
  TextField,
  Drawer,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TeamNode from "@/components/teams/TeamNode";
import EmployeeList from "@/components/employees/EmployeeList";
import SearchResults from "@/components/search/SearchResult";
import {
  buildTeamTree,
  gatherEmployeesWithTeamName,
} from "@/utils/treeHelpers";

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tree, setTree] = useState<(Team & { children: Team[] })[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<
    (Team & { children: Team[] }) | null
  >(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadTeams() {
      const data = await fetchTeams();
      setTeams(data);
    }
    loadTeams();
  }, []);

  useEffect(() => {
    setTree(buildTeamTree(teams));
  }, [teams]);

  const isPastEmployee = (emp: Employee) => emp.end_date !== null;

  const handleSelectTeam = (team: Team & { children: Team[] }) => {
    setSelectedTeam(team);
    setDrawerOpen(true);
  };

  const allEmployeesWithTeamName = tree.flatMap((root) =>
    gatherEmployeesWithTeamName(root)
  );

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmployees = allEmployeesWithTeamName.filter(
    ({ name, surname }) =>
      `${name} ${surname}`.toLowerCase().includes(search.toLowerCase())
  );

  // Group employees by team name for drawer
  const employeesGroupedByTeam: Record<string, Employee[]> = {};
  if (selectedTeam) {
    const allEmps = gatherEmployeesWithTeamName(selectedTeam);
    allEmps.forEach(({ teamName, ...employee }) => {
      if (!employeesGroupedByTeam[teamName])
        employeesGroupedByTeam[teamName] = [];
      employeesGroupedByTeam[teamName].push(employee);
    });
  }

  return (
    <Box
      sx={{
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "white",
        color: "black",
        maxWidth: 800,
        margin: "auto",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Týmy
      </Typography>

      <TextField
        placeholder="Vyhledat tým nebo zaměstnance"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {search ? (
        <SearchResults
          search={search}
          filteredTeams={filteredTeams}
          filteredEmployees={filteredEmployees}
          onSelect={handleSelectTeam}
          isPastEmployee={isPastEmployee}
        />
      ) : (
        tree.map((root) => (
          <TeamNode key={root.id} team={root} onSelect={handleSelectTeam} />
        ))
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 400, px: 2, py: 3 },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Detail týmu
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>

        {selectedTeam && (
          <>
            <EmployeeList
              employeesGroupedByTeam={employeesGroupedByTeam}
              isPastEmployee={isPastEmployee}
              teamName={selectedTeam.name}
            />
          </>
        )}
      </Drawer>
    </Box>
  );
}
