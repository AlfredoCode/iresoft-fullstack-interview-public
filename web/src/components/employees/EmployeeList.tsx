import React from "react";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import { Employee } from "@/types/types";
import { stringAvatar } from "@/utils/stringAvatar";

type Props = {
  employeesGroupedByTeam: Record<string, Employee[]>;
  isPastEmployee: (emp: Employee) => boolean;
  teamName: string;
};

export default function EmployeeList({
  employeesGroupedByTeam,
  isPastEmployee,
  teamName,
}: Props) {
  return (
    <>
      {Object.entries(employeesGroupedByTeam).every(
        ([_, employees]) => employees.length === 0
      ) ? (
        <Typography
          color="text.secondary"
          fontStyle="italic"
          align="center"
          sx={{ py: 4 }}
        >
          Do týmu <strong>'{teamName}'</strong> nebyl přiřazen žádný
          zaměstnanec.
        </Typography>
      ) : (
        Object.entries(employeesGroupedByTeam).map(([teamName, emps]) => {
          if (emps.length === 0) return null;

          return (
            <Box key={teamName} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {teamName}
              </Typography>
              <Stack spacing={1}>
                {emps
                  .sort((a, b) => {
                    const aPast = isPastEmployee(a);
                    const bPast = isPastEmployee(b);
                    if (aPast && !bPast) return 1;
                    if (!aPast && bPast) return -1;
                    return `${a.name} ${a.surname}`
                      .toLowerCase()
                      .localeCompare(`${b.name} ${b.surname}`.toLowerCase());
                  })
                  .map((emp) => {
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
                          transition: "background-color 0.3s",
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                      >
                        <Avatar
                          {...stringAvatar(`${emp.name} ${emp.surname}`)}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{ fontWeight: 600 }}
                          >
                            {emp.name} {emp.surname}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.position} {past && "— Již není zaměstnán"}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
              </Stack>
              <Divider sx={{ mt: 2 }} />
            </Box>
          );
        })
      )}
    </>
  );
}
