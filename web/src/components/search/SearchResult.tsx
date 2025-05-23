import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Team, Employee } from "@/types/types";
import { stringAvatar } from "@/utils/stringAvatar";

type Props = {
  search: string;
  filteredTeams: Team[];
  filteredEmployees: (Employee & { teamName: string })[];
  onSelect: (team: Team & { children: Team[] }) => void;
  isPastEmployee: (emp: Employee) => boolean;
};

export default function SearchResults({
  search,
  filteredTeams,
  filteredEmployees,
  onSelect,
  isPastEmployee,
}: Props) {
  return (
    <Box
      sx={{
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      {filteredTeams.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            Týmy obsahující "{search}"
          </Typography>
          {filteredTeams.map((team) => (
            <Box
              key={team.id}
              onClick={() => onSelect({ ...team, children: [] })}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.2,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: "background.paper",
                mb: 1,
                transition: "background-color 0.3s, transform 0.2s",
                "&:hover": {
                  bgcolor: "#eeeeee",
                },
                userSelect: "none",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#3461eb",
                  width: 36,
                  height: 36,
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {team.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                {team.name}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {filteredTeams.length === 0 && filteredEmployees.length === 0 && (
        <Typography>No matching teams or employees.</Typography>
      )}

      {filteredTeams.length === 0 && filteredEmployees.length > 0 && (
        <Box>
          {filteredEmployees.map((emp) => {
            const past = isPastEmployee(emp);
            return (
              <Stack
                key={emp.id}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: past ? "grey.100" : "background.paper",
                  opacity: past ? 0.6 : 1,
                  userSelect: "text",
                  "&:hover": { bgcolor: "grey.200" },
                  mb: 1,
                }}
              >
                <Avatar {...stringAvatar(`${emp.name} ${emp.surname}`)} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 600 }}
                  >
                    {emp.name} {emp.surname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {emp.position} — {emp.teamName}{" "}
                    {past && "— Již není zaměstnán"}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Box>
      )}

      {filteredTeams.length > 0 && filteredEmployees.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
            Zaměstnanci obsahující "{search}"
          </Typography>
          {filteredEmployees.map((emp) => {
            const past = isPastEmployee(emp);
            return (
              <Stack
                key={emp.id}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: past ? "grey.100" : "background.paper",
                  opacity: past ? 0.6 : 1,
                  userSelect: "text",
                  "&:hover": { bgcolor: "grey.200" },
                  mb: 1,
                }}
              >
                <Avatar {...stringAvatar(`${emp.name} ${emp.surname}`)} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: 600 }}
                  >
                    {emp.name} {emp.surname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {emp.position} — {emp.teamName}{" "}
                    {past && "— Již není zaměstnán"}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </>
      )}
    </Box>
  );
}
