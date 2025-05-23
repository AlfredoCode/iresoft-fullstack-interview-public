import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import EmployeeList from "../employees/EmployeeList";
import { Employee, Team } from "@/types/types";
import { stringAvatar } from "@/utils/stringAvatar";
type Props = {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
  employeesGroupedByTeam: Record<string, Employee[]>;
  selectedEmployeeIds: Set<string>;
  setSelectedEmployeeIds: (ids: Set<string>) => void;
  openEditEmployeeModal: (employee: Employee) => void;
  setDeleteEmployeeConfirmOpen: (open: boolean) => void;
  isPastEmployee: (emp: Employee) => boolean;
  handleDeleteSelectedEmployees: () => void;
};

function RightDockedDrawer({
  drawerOpen,
  setDrawerOpen,
  selectedEmployee,
  setSelectedEmployee,
  selectedTeam,
  setSelectedTeam,
  employeesGroupedByTeam,
  selectedEmployeeIds,
  setSelectedEmployeeIds,
  openEditEmployeeModal,
  setDeleteEmployeeConfirmOpen,
  isPastEmployee,
  handleDeleteSelectedEmployees,
}: Props) {
  return (
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
  );
}

export default RightDockedDrawer;
