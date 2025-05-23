import React, { useEffect, useState } from "react";
import { Team, Employee } from "../types/types";
import { fetchTeams, deleteTeam, updateTeam } from "../utils/teamController";
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
import { TeamAdd } from "@/components/teams/TeamAdd";
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

  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    new Set()
  );
  const modifyTeam = async (
    teamId: string,
    newName: string,
    newParentId: string | null
  ) => {
    try {
      await updateTeam(teamId, {
        name: newName,
        parent_team_id: newParentId, // send null explicitly if needed
      });

      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                name: newName,
                parent_team_id:
                  newParentId === null ? null : Number(newParentId),
              }
            : team
        )
      );

      if (selectedTeam?.id === teamId) {
        setSelectedTeam((prev) =>
          prev
            ? {
                ...prev,
                name: newName,
                parent_team_id:
                  newParentId === null ? null : Number(newParentId),
              }
            : prev
        );
      }
      await loadTeams();
    } catch (error) {
      console.error("Failed to update team", error);
    }
  };

  const loadTeams = async () => {
    const data = await fetchTeams();
    setTeams(data);
  };

  const handleDeleteTeam = async (teamId: string) => {
    await deleteTeam(teamId);
    await loadTeams();
    setSelectedTeamIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(teamId);
      return newSet;
    });
  };

  const toggleTeamSelection = (teamIds: string[]) => {
    setSelectedTeamIds((prev) => {
      const newSet = new Set(prev);
      const allSelected = teamIds.every((id) => newSet.has(id));
      if (allSelected) {
        // Unselect all
        teamIds.forEach((id) => newSet.delete(id));
      } else {
        // Select all
        teamIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedTeamIds.size === 0) return;

    if (
      !confirm(
        `Opravdu chcete smazat ${selectedTeamIds.size} týmů? Tuto akci nelze vrátit.`
      )
    )
      return;

    // Delete all selected teams in parallel for speed
    await Promise.all(Array.from(selectedTeamIds).map((id) => deleteTeam(id)));

    setSelectedTeamIds(new Set());
    await loadTeams();
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4">Týmy</Typography>

        <Box>
          <Button
            variant="outlined"
            color="error"
            disabled={selectedTeamIds.size === 0}
            onClick={handleDeleteSelected}
            sx={{ mr: 2 }}
          >
            Smazat vybrané ({selectedTeamIds.size})
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddTeamOpen(true)}
            sx={{
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
          <TeamNode
            key={root.id}
            team={root}
            onSelect={handleSelectTeam}
            selectedTeamIds={selectedTeamIds}
            toggleTeamSelection={toggleTeamSelection}
            onModify={modifyTeam}
            teams={teams}
          />
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
