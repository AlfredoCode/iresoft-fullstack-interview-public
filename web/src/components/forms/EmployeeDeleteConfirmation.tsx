import { Employee } from "@/types/types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
} from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

type Props = {
  deleteEmployeeConfirmOpen: boolean;
  setDeleteEmployeeConfirmOpen: Dispatch<SetStateAction<boolean>>;
  selectedEmployee: Employee | null;
  setSelectedEmployee: Dispatch<SetStateAction<Employee | null>>;
  handleDeleteEmployee: (id: string) => Promise<void>;
  setDrawerOpen: (open: boolean) => void;
  loadTeams: () => Promise<void>;
};

function EmployeeDeleteConfirmation({
  deleteEmployeeConfirmOpen,
  setDeleteEmployeeConfirmOpen,
  selectedEmployee,
  setSelectedEmployee,
  handleDeleteEmployee,
  setDrawerOpen,
  loadTeams,
}: Props) {
  return (
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
  );
}

export default EmployeeDeleteConfirmation;
