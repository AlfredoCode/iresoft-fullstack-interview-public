import { Employee } from "@/types/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import React from "react";

type Team = {
  id: string;
  name: string;
};

type Props = {
  editEmployeeOpen: boolean;
  setEditEmployeeOpen: (open: boolean) => void;
  employeeForm: Employee | null;
  handleEmployeeFormChange: (field: keyof Employee, value: any) => void;
  teams: Team[];
  submitEmployeeUpdate: () => void;
};

function EmployeeEditModal({
  editEmployeeOpen,
  setEditEmployeeOpen,
  employeeForm,
  handleEmployeeFormChange,
  teams,
  submitEmployeeUpdate,
}: Props) {
  return (
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
              onChange={(e) => handleEmployeeFormChange("name", e.target.value)}
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
                employeeForm.end_date ? employeeForm.end_date.split("T")[0] : ""
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
  );
}

export default EmployeeEditModal;
