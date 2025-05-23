import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React from "react";

type Props = {
  deleteConfirmOpen: boolean;
  cancelDelete: () => void;
  confirmDelete: () => void;
  teamsToDelete: Set<any>;
};

function TeamDeleteConfirmation({
  deleteConfirmOpen,
  cancelDelete,
  confirmDelete,
  teamsToDelete,
}: Props) {
  return (
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
  );
}

export default TeamDeleteConfirmation;
