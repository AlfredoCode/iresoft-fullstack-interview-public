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
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TeamNode from "@/components/teams/TeamNode";
import EmployeeList from "@/components/employees/EmployeeList";
import SearchResults from "@/components/search/SearchResult";
import {
  buildTeamTree,
  gatherEmployeesWithTeamName,
} from "@/utils/treeHelpers";
import { TeamAdd } from "@/components/teams/TeamAdd"; // Make sure path is correct
import AddIcon from "@mui/icons-material/Add";

export default function Teams() {
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [tree, setTree] = useState<(Team & { children: Team[] })[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<
    (Team & { children: Team[] }) | null
  >(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadTeams = async () => {
    const data = await fetchTeams();
    setTeams(data);
  };

  useEffect(() => {
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
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Týmy
        </Typography>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddTeamOpen(true)}
          sx={{
            mb: 2,
            color: "#3461eb",
            borderColor: "rgb(52, 97, 235)",
            "&:hover": {
              backgroundColor: "rgba(52, 97, 235, 0.14)",
              borderColor: "#3461eb",
            },
          }}
        >
          Vytvořit
        </Button>
      </Box>

      <Dialog
        open={addTeamOpen}
        onClose={() => setAddTeamOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Přidat tým</DialogTitle>
        <DialogContent dividers>
          <TeamAdd
            teams={teams}
            onAddSuccess={() => {
              setAddTeamOpen(false);
              loadTeams();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeamOpen(false)}>Zavřít</Button>
        </DialogActions>
      </Dialog>

      <TextField
        placeholder="Vyhledat tým nebo zaměstnance"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "grey.400",
            },
            "&:hover fieldset": {
              borderColor: "grey.500",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3461eb",
              borderWidth: 1,
            },
          },
        }}
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
          <EmployeeList
            employeesGroupedByTeam={employeesGroupedByTeam}
            isPastEmployee={isPastEmployee}
            teamName={selectedTeam.name}
          />
        )}
      </Drawer>
    </Box>
  );
}
