import React, { useEffect, useState } from "react";
import { Team, Employee } from "../types/types";
import {
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { EmployeeAdd } from "@/components/employees/EmployeeAdd";
import { fetchTeams, deleteTeam, updateTeam } from "../utils/teamController";
import {
  Box,
  Typography,
  TextField,
  Drawer,
  IconButton,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TeamNode from "@/components/teams/TeamNode";
import EmployeeList from "@/components/employees/EmployeeList";
import SearchResults from "@/components/search/SearchResult";
import {
  buildTeamTree,
  gatherEmployeesWithTeamName,
} from "@/utils/treeHelpers";
import { TeamAdd } from "@/components/teams/TeamAdd";
import AddIcon from "@mui/icons-material/Add";
import { stringAvatar } from "@/utils/stringAvatar";
import {
  handleDeleteEmployee,
  handleUpdateEmployee,
} from "@/utils/employeeController";

export default function Teams() {
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [addTabIndex, setAddTabIndex] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tree, setTree] = useState<(Team & { children: Team[] })[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<
    (Team & { children: Team[] }) | null
  >(null);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<Employee | null>(null);

  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(
    new Set()
  );

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(
    new Set()
  );

  const [deleteEmployeeConfirmOpen, setDeleteEmployeeConfirmOpen] =
    useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [teamsToDelete, setTeamsToDelete] = useState<Set<string>>(new Set());
  const handleSelect = (
    item:
      | (Team & { children: Team[]; type: "team" })
      | (Employee & { teamName: string; type: "employee" })
  ) => {
    if (item.type === "team") {
      handleSelectTeam(item);
    } else {
      setSelectedEmployee(item);
      setDrawerOpen(true);
      console.log("Selected employee:", item.name, item.surname);
    }
  };

  const modifyTeam = async (
    teamId: string,
    newName: string,
    newParentId: string | null
  ) => {
    try {
      await updateTeam(teamId, {
        name: newName,
        parent_team_id: newParentId,
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
        teamIds.forEach((id) => newSet.delete(id));
      } else {
        teamIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedTeamIds.size === 0) return;
    setTeamsToDelete(new Set(selectedTeamIds));
    setDeleteConfirmOpen(true);
  };
  const handleDeleteSelectedEmployees = async () => {
    const idsToDelete = Array.from(selectedEmployeeIds);
    await Promise.all(idsToDelete.map((id) => handleDeleteEmployee(id)));
    setSelectedEmployeeIds(new Set());
    await loadTeams();
    setDrawerOpen(false);
    setSelectedTeam(null);
  };

  const confirmDelete = async () => {
    await Promise.all(Array.from(teamsToDelete).map((id) => deleteTeam(id)));
    setSelectedTeamIds(new Set());
    setTeamsToDelete(new Set());
    setDeleteConfirmOpen(false);
    await loadTeams();
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setTeamsToDelete(new Set());
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    setTree(buildTeamTree(teams));
  }, [teams]);

  const isPastEmployee = (emp: Employee) => emp.end_date !== null;
  const submitEmployeeUpdate = async () => {
    if (!employeeForm || !employeeForm.id) return;

    const { id, ...payload } = employeeForm;

    if (!payload.team_id && selectedEmployee?.team_id) {
      payload.team_id = selectedEmployee.team_id;
    }

    if (payload.start_date && payload.start_date.length === 10) {
      payload.start_date = new Date(payload.start_date).toISOString();
    }
    if (payload.end_date && payload.end_date.length === 10) {
      payload.end_date = new Date(payload.end_date).toISOString();
    }

    try {
      await handleUpdateEmployee(id, payload);
      setEditEmployeeOpen(false);
      setSelectedEmployee(employeeForm);
      await loadTeams();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEmployeeForm(employee);
    setEditEmployeeOpen(true);
  };

  const handleSelectTeam = (team: Team & { children: Team[] }) => {
    setSelectedTeam(team);
    setDrawerOpen(true);
    setSelectedEmployeeIds(new Set());
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
  const handleEmployeeFormChange = (field: keyof Employee, value: any) => {
    if (!employeeForm) return;
    setEmployeeForm({ ...employeeForm, [field]: value });
  };

  const employeesGroupedByTeam: Record<string, Employee[]> = {};
  if (selectedTeam) {
    const allEmps = gatherEmployeesWithTeamName(selectedTeam);
    allEmps.forEach(({ teamName, ...employee }) => {
      if (!employeesGroupedByTeam[teamName])
        employeesGroupedByTeam[teamName] = [];
      employeesGroupedByTeam[teamName].push(employee);
    });
  }

  // Employee selection toggle handler
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployeeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

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
              borderColor: "primary",
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
        <DialogTitle>
          <Tabs
            value={addTabIndex}
            onChange={(_, newIndex) => setAddTabIndex(newIndex)}
            aria-label="Add tabs"
            variant="fullWidth"
          >
            <Tab label="Přidat tým" />
            <Tab label="Přidat zaměstnance" />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers>
          {addTabIndex === 0 && (
            <TeamAdd
              teams={teams}
              onAddSuccess={() => {
                setAddTeamOpen(false);
                loadTeams();
              }}
            />
          )}
          {addTabIndex === 1 && (
            <EmployeeAdd
              onSuccess={() => {
                setAddTeamOpen(false);
                loadTeams();
              }}
              teams={teams}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddTeamOpen(false)}>Zavřít</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          Potvrzení smazání
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-confirm-dialog-description">
            Opravdu chcete smazat {teamsToDelete.size} tým
            {teamsToDelete.size > 1 ? "ů" : "?"} ? Tuto akci nelze vrátit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Zrušit</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Smazat
          </Button>
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
          onSelect={handleSelect}
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
      <Dialog
        open={editEmployeeOpen}
        onClose={() => setEditEmployeeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upravit zaměstnance</DialogTitle>
        <DialogContent dividers>
          {employeeForm && (
            <Stack spacing={2}>
              <TextField
                label="Jméno"
                value={employeeForm.name}
                onChange={(e) =>
                  handleEmployeeFormChange("name", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Příjmení"
                value={employeeForm.surname}
                onChange={(e) =>
                  handleEmployeeFormChange("surname", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Pozice"
                value={employeeForm.position}
                onChange={(e) =>
                  handleEmployeeFormChange("position", e.target.value)
                }
                fullWidth
              />
              <TextField
                label="Datum nástupu"
                type="date"
                value={
                  employeeForm.start_date
                    ? employeeForm.start_date.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleEmployeeFormChange("start_date", e.target.value)
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Datum ukončení"
                type="date"
                value={
                  employeeForm.end_date
                    ? employeeForm.end_date.split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleEmployeeFormChange("end_date", e.target.value)
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel id="team-select-label">Tým</InputLabel>
                <Select
                  labelId="team-select-label"
                  value={employeeForm.team_id || ""}
                  label="Tým"
                  onChange={(e) =>
                    handleEmployeeFormChange("team_id", e.target.value)
                  }
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEmployeeOpen(false)}>Zrušit</Button>
          <Button variant="contained" onClick={submitEmployeeUpdate}>
            Uložit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteEmployeeConfirmOpen}
        onClose={() => setDeleteEmployeeConfirmOpen(false)}
      >
        <DialogTitle>Potvrzení smazání zaměstnance</DialogTitle>
        <DialogContent>
          <Typography>
            Opravdu chcete smazat zaměstnance{" "}
            <strong>
              {selectedEmployee?.name} {selectedEmployee?.surname}
            </strong>
            ? Tuto akci nelze vrátit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEmployeeConfirmOpen(false)}>
            Zrušit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (selectedEmployee?.id) {
                await handleDeleteEmployee(selectedEmployee.id);
                setDeleteEmployeeConfirmOpen(false);
                setDrawerOpen(false);
                setSelectedEmployee(null);
                await loadTeams();
              }
            }}
          >
            Smazat
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setTimeout(() => {
            setSelectedEmployee(null);
            setSelectedTeam(null);
          }, 200);
        }}
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
          {selectedEmployee && selectedTeam && (
            <Box>
              <IconButton
                onClick={() => setSelectedEmployee(null)}
                aria-label="Zpět"
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>
          )}

          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {selectedEmployee ? "Detail zaměstnance" : "Detail týmu"}
          </Typography>
          <IconButton
            onClick={() => {
              setDrawerOpen(false);
              setTimeout(() => {
                setSelectedEmployee(null);
                setSelectedTeam(null);
              }, 200);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        {selectedEmployee ? (
          <Box sx={{ height: "100%" }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Avatar
                {...stringAvatar(
                  `${selectedEmployee.name} ${selectedEmployee.surname}`
                )}
                sx={{ width: 56, height: 56 }}
              />
              <Box>
                <Typography variant="h6">
                  {selectedEmployee.name} {selectedEmployee.surname}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedEmployee.position}
                </Typography>
                {isPastEmployee(selectedEmployee) && (
                  <Typography variant="body2" color="error">
                    Již není zaměstnán
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Zaměstnán od:</strong>{" "}
                {selectedEmployee.start_date
                  ? new Date(selectedEmployee.start_date).toLocaleDateString(
                      "cs-CZ"
                    )
                  : "Neuvedeno"}
              </Typography>
              <Typography variant="body2">
                <strong>Konec zaměstnání:</strong>{" "}
                {selectedEmployee.end_date
                  ? new Date(selectedEmployee.end_date).toLocaleDateString(
                      "cs-CZ"
                    )
                  : "-"}
              </Typography>
              {selectedEmployee && (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ position: "fixed", bottom: 20, right: 10 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => openEditEmployeeModal(selectedEmployee!)}
                  >
                    Upravit
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setDeleteEmployeeConfirmOpen(true)}
                  >
                    Smazat
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        ) : selectedTeam ? (
          <>
            <EmployeeList
              employeesGroupedByTeam={employeesGroupedByTeam}
              isPastEmployee={isPastEmployee}
              teamName={selectedTeam?.name ?? ""}
              selectedEmployeeIds={selectedEmployeeIds}
              onSelectEmployees={setSelectedEmployeeIds}
              onEmployeeClick={(emp) => {
                setSelectedEmployee(emp);
                setDrawerOpen(true);
              }}
              onBackToTeam={() => setSelectedEmployee(null)}
            />
            {selectedTeam && selectedEmployeeIds.size > 0 && (
              <Box
                sx={{
                  mt: 2,
                  textAlign: "right",
                  position: "fixed",
                  bottom: 10,
                  right: 10,
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelectedEmployees}
                >
                  Smazat vybrané zaměstnance ({selectedEmployeeIds.size})
                </Button>
              </Box>
            )}
          </>
        ) : null}
      </Drawer>
    </Box>
  );
}
