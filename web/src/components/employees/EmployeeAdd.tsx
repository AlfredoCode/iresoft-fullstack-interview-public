import { Controller, useForm } from "react-hook-form";
import { Employee, Team } from "@/types/types";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  Stack,
  TextField,
  Typography,
  Button,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormFieldError } from "../forms/FormFieldError";
import { FormError } from "../forms/FormError";
import { FormSuccess } from "../forms/FormSuccess";
import { createEmployee } from "@/utils/employeeController";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  team: yup.string(),
  position: yup.string(),
  start_date: yup.date(),
  end_date: yup
    .date()
    .min(yup.ref("start_date"), "End date can't be before start date"),
});
interface EmployeeAddProps {
  teams: Team[];
  onSuccess?: () => void;
}
export const EmployeeAdd = ({ teams, onSuccess }: EmployeeAddProps) => {
  const [formError, setFormError] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = handleSubmit(async (formData) => {
    setFormError(false);
    setSuccess(false);

    const employeePayload: Employee = {
      id: null,
      name: formData.name,
      surname: formData.surname,
      position: formData.position || "",
      team_id: formData.team || null,
      start_date: formData.start_date
        ? formData.start_date.toISOString()
        : null,
      end_date: formData.end_date ? formData.end_date.toISOString() : null,
    };

    try {
      await createEmployee(employeePayload);
      setSuccess(true);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(true);
    }
  });

  return (
    <Box>
      <form onSubmit={onSubmit}>
        <Stack direction="row" gap={3}>
          <Box sx={{ flex: { xs: "0 0 100%", md: "0 1 50%" } }}>
            <Controller
              name="name"
              defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField fullWidth {...field} label="Jméno" />
              )}
            />

            {errors.name && <FormFieldError text={errors.name.message} />}
          </Box>
          <Box sx={{ flex: { xs: "0 0 100%", md: "0 1 50%" } }}>
            <FormControl fullWidth>
              <Controller
                name="surname"
                defaultValue=""
                control={control}
                render={({ field }) => (
                  <TextField fullWidth {...field} label="Příjmení" />
                )}
              />
            </FormControl>

            {errors.surname && <FormFieldError text={errors.surname.message} />}
          </Box>
        </Stack>
        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>Tým</InputLabel>
          <Controller
            name="team"
            defaultValue={teams.length > 0 ? teams[0].id : ""}
            control={control}
            render={({ field }) => (
              <Select {...field} label="Tým">
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        {errors.team && <FormFieldError text={errors.team.message} />}

        <Stack
          direction="row"
          gap={3}
          mt={3}
          flexWrap={{ xs: "wrap", md: "nowrap" }}
        >
          <Box sx={{ flex: { xs: "0 0 100%", md: "0 1 50%" } }}>
            <InputLabel>Nástup</InputLabel>
            <Controller
              defaultValue={undefined}
              name="start_date"
              control={control}
              render={({ field }) => (
                <TextField fullWidth type="date" {...field} />
              )}
            />

            {errors.start_date && (
              <FormFieldError text={errors.start_date.message} />
            )}
          </Box>
          <Box sx={{ flex: { xs: "0 0 100%", md: "0 1 50%" } }}>
            <InputLabel>Konec</InputLabel>
            <Controller
              defaultValue={undefined}
              name="end_date"
              control={control}
              render={({ field }) => (
                <TextField fullWidth type="date" {...field} />
              )}
            />
            {errors.end_date && (
              <FormFieldError text={errors.end_date.message} />
            )}
          </Box>
        </Stack>
        <Box mt={3}>
          <Controller
            defaultValue=""
            name="position"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField fullWidth {...field} label="Pozice" />
            )}
          />
          {errors.position && <FormFieldError text={errors.position.message} />}
        </Box>

        <Button type="submit" variant="contained" sx={{ my: 3 }}>
          Vytvořit
        </Button>
        {formError && <FormError text="Please fill out the form correctly" />}
        {success && <FormSuccess text="Employee Added" />}
      </form>
    </Box>
  );
};
