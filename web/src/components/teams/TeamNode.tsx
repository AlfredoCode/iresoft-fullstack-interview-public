import React, { useState, MouseEvent, ChangeEvent, useEffect } from "react";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Collapse,
  Menu,
  MenuItem,
  Checkbox,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem as SelectItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Team } from "../../types/types";

type Props = {
  team: Team & { children: Team[] };
  onSelect: (team: Team & { children: Team[] }) => void;
  onModify: (
    teamId: string,
    newName: string,
    newParentId: string | null
  ) => void;
  teams: Team[];
  selectedTeamIds?: Set<string>;
  toggleTeamSelection?: (teamIds: string[]) => void;
  level?: number;
};

export default function TeamNode({
  team,
  onSelect,
  onModify,
  teams,
  selectedTeamIds = new Set(),
  toggleTeamSelection,
  level = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editParentId, setEditParentId] = useState<string | null>(
    team.parent_team_id != null ? String(team.parent_team_id) : null
  );

  const hasChildren = team.children.length > 0;

  // Helper: get all IDs in this team subtree (including self)
  function getAllTeamIds(team: Team & { children: Team[] }): string[] {
    let ids = [team.id];
    team.children.forEach((child) => {
      ids = ids.concat(getAllTeamIds(child));
    });
    return ids;
  }

  // Determine if all subtree teams are selected
  const allIds = getAllTeamIds(team);
  const isSelected = allIds.every((id) => selectedTeamIds.has(id));
  const isIndeterminate =
    !isSelected && allIds.some((id) => selectedTeamIds.has(id));

  const handleCheckboxClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (!toggleTeamSelection) return;

    toggleTeamSelection(allIds);
  };

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open edit modal
  const handleEditClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setEditName(team.name);
    setEditParentId(
      team.parent_team_id != null ? String(team.parent_team_id) : null
    );

    setEditing(true);
    setAnchorEl(null);
  };

  // Prevent selecting the team itself or its descendants as parent to avoid cycles
  const forbiddenParentIds = new Set(getAllTeamIds(team));
  forbiddenParentIds.add(team.id);

  // Filter teams for select options (exclude current and descendants)
  const possibleParents = teams
    ? teams.filter((t) => !forbiddenParentIds.has(t.id))
    : [];

  const handleSave = () => {
    if (
      editName.trim() &&
      (editName !== team.name || editParentId !== team.parent_team_id)
    ) {
      onModify(team.id, editName.trim(), editParentId);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Box sx={{ pl: level * 3, position: "relative", pt: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ cursor: "pointer" }}
      >
        <Checkbox
          checked={isSelected}
          indeterminate={isIndeterminate}
          onChange={handleCheckboxClick}
          onClick={(e) => e.stopPropagation()}
          size="small"
        />

        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            sx={{ p: 0.5 }}
          >
            {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        ) : (
          <Box sx={{ width: 32 }} />
        )}

        <Badge
          badgeContent={
            team.employees.length >= 50 ? "50+" : team.employees.length
          }
          overlap="circular"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#202020",
              color: "white",
              fontSize: "12px",
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#3461eb",
              width: 30,
              height: 30,
            }}
            onClick={() => onSelect(team)}
          >
            <PersonIcon fontSize="small" />
          </Avatar>
        </Badge>

        <Typography
          noWrap
          onClick={() => onSelect(team)}
          sx={{
            userSelect: "none",
            flexGrow: 1,
            fontWeight: "normal",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {team.name}
        </Typography>

        {/* 3 dots menu button */}
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ ml: 1 }}
          aria-controls={anchorEl ? "team-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? "true" : undefined}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        {/* Context menu */}
        <Menu
          id="team-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
        >
          <MenuItem onClick={handleEditClick}>Upravit tým</MenuItem>
        </Menu>
      </Stack>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {team.children.map((child) => (
            <TeamNode
              key={child.id}
              team={child}
              onSelect={onSelect}
              onModify={onModify}
              teams={teams} // Pass down the teams here too
              selectedTeamIds={selectedTeamIds}
              toggleTeamSelection={toggleTeamSelection}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}

      {/* Edit modal */}
      <Dialog open={editing} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Upravit tým</DialogTitle>
        <DialogContent>
          <TextField
            label="Název týmu"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 50 }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="parent-team-select-label">Nadřazený tým</InputLabel>
            <Select
              labelId="parent-team-select-label"
              value={editParentId || ""}
              label="Nadřazený tým"
              onChange={(e) =>
                setEditParentId(e.target.value === "" ? null : e.target.value)
              }
            >
              <SelectItem value="">(žádný)</SelectItem>
              {possibleParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.name}
                </SelectItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Zrušit</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!editName.trim()}
          >
            Uložit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
