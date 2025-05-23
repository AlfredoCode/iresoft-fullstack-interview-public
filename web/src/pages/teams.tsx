import React, { useEffect, useState } from "react";
import { Team, Employee } from "../types/types";

import { fetchTeams, deleteTeam, updateTeam } from "../utils/teamController";
import { Box, Typography, TextField, Button } from "@mui/material";

import TeamNode from "@/components/teams/TeamNode";
import SearchResults from "@/components/search/SearchResult";
import {
  buildTeamTree,
  gatherEmployeesWithTeamName,
} from "@/utils/treeHelpers";
import AddIcon from "@mui/icons-material/Add";
import {
  handleDeleteEmployee,
  handleUpdateEmployee,
} from "@/utils/employeeController";
import RightDockedDrawer from "@/components/drawers/RightDockedDrawer";
import EmployeeDeleteConfirmation from "@/components/forms/EmployeeDeleteConfirmation";
import EmployeeEditModal from "@/components/forms/EmployeeEditModal";
import TeamDeleteConfirmation from "@/components/forms/TeamDeleteConfirmation";
import AddNewTeamEmployee from "@/components/forms/AddNewTeamEmployee";

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

  const isPastEmployee = (emp: Employee) => {
    if (!emp.end_date) return false;

    const today = new Date();
    const endDate = new Date(emp.end_date);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endDateOnly = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

    return endDateOnly < todayDate;
  };

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

  return (
    <Box
      sx={{
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        backgroundColor: "white",
        color: "black",
        maxWidth: "100%",
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
      <AddNewTeamEmployee
        addTeamOpen={addTeamOpen}
        setAddTeamOpen={setAddTeamOpen}
        addTabIndex={addTabIndex}
        setAddTabIndex={setAddTabIndex}
        teams={teams}
        loadTeams={loadTeams}
      />

      <TeamDeleteConfirmation
        deleteConfirmOpen={deleteConfirmOpen}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        teamsToDelete={teamsToDelete}
      />

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
      <EmployeeEditModal
        editEmployeeOpen={editEmployeeOpen}
        setEditEmployeeOpen={setEditEmployeeOpen}
        employeeForm={employeeForm}
        handleEmployeeFormChange={handleEmployeeFormChange}
        teams={teams}
        submitEmployeeUpdate={submitEmployeeUpdate}
      />

      <EmployeeDeleteConfirmation
        deleteEmployeeConfirmOpen={deleteEmployeeConfirmOpen}
        setDeleteEmployeeConfirmOpen={setDeleteEmployeeConfirmOpen}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        handleDeleteEmployee={handleDeleteEmployee}
        setDrawerOpen={setDrawerOpen}
        loadTeams={loadTeams}
      />

      <RightDockedDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        employeesGroupedByTeam={employeesGroupedByTeam}
        selectedEmployeeIds={selectedEmployeeIds}
        setSelectedEmployeeIds={setSelectedEmployeeIds}
        openEditEmployeeModal={openEditEmployeeModal}
        setDeleteEmployeeConfirmOpen={setDeleteEmployeeConfirmOpen}
        isPastEmployee={isPastEmployee}
        handleDeleteSelectedEmployees={handleDeleteSelectedEmployees}
      />
    </Box>
  );
}
