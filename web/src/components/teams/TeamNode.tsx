import React, { useState, MouseEvent, ChangeEvent } from "react";
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
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Team } from "../../types/types";

type Props = {
  team: Team & { children: Team[] };
  onSelect: (team: Team & { children: Team[] }) => void;
  onModify: (teamId: string, newName: string) => void;
  selectedTeamIds?: Set<string>;
  toggleTeamSelection?: (teamIds: string[]) => void;
  level?: number;
};

export default function TeamNode({
  team,
  onSelect,
  onModify,
  selectedTeamIds = new Set(),
  toggleTeamSelection,
  level = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
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

  // Open edit mode when clicking "Upravit tým"
  const handleEditClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setEditing(true);
    setAnchorEl(null);
  };

  const handleEditChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditName(event.target.value);
  };

  // Commit change on blur or Enter key
  const commitEdit = () => {
    if (editName.trim() && editName !== team.name) {
      onModify(team.id, editName.trim());
    }
    setEditing(false);
  };

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      commitEdit();
    } else if (event.key === "Escape") {
      setEditName(team.name);
      setEditing(false);
    }
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

        {editing ? (
          <TextField
            value={editName}
            onChange={handleEditChange}
            onBlur={commitEdit}
            onKeyDown={handleEditKeyDown}
            size="small"
            autoFocus
            sx={{ flexGrow: 1 }}
            inputProps={{ maxLength: 50 }}
          />
        ) : (
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
        )}

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
              selectedTeamIds={selectedTeamIds}
              toggleTeamSelection={toggleTeamSelection}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}
