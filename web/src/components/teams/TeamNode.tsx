import React, { useState } from "react";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  Badge,
  Avatar,
  Collapse,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Team } from "../../types/types";

type Props = {
  team: Team & { children: Team[] };
  onSelect: (team: Team & { children: Team[] }) => void;
  level?: number;
};

export default function TeamNode({ team, onSelect, level = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const hasChildren = team.children.length > 0;

  return (
    <Box sx={{ pl: level * 3, position: "relative", pt: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ cursor: "pointer" }}
      >
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
      </Stack>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {team.children.map((child) => (
            <TeamNode
              key={child.id}
              team={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}
