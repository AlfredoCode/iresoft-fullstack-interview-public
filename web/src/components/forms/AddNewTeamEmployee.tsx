import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from "@mui/material";
import React from "react";
import { TeamAdd } from "../teams/TeamAdd";
import { EmployeeAdd } from "../employees/EmployeeAdd";
import { Team } from "@/types/types";

type Props = {
  addTeamOpen: boolean;
  setAddTeamOpen: (open: boolean) => void;
  addTabIndex: number;
  setAddTabIndex: (index: number) => void;
  teams: Team[];
  loadTeams: () => Promise<void>;
};

function AddNewTeamEmployee({
  addTeamOpen,
  setAddTeamOpen,
  addTabIndex,
  setAddTabIndex,
  teams,
  loadTeams,
}: Props) {
  return (
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
  );
}

export default AddNewTeamEmployee;
