import { Controller, useForm } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormFieldError } from "../forms/FormFieldError";
import { FormSuccess } from "../forms/FormSuccess";
import { FormError } from "../forms/FormError";
import { Team } from "@/types/types";
import { createTeam } from "@/utils/teamController";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  parentTeam: yup.string(),
});
type TeamAddProps = {
  teams: Team[];
  onAddSuccess?: () => void;
};

export const TeamAdd = ({ teams, onAddSuccess }: TeamAddProps) => {
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
    try {
      const payload = {
        name: formData.name,
        parent_team_id: formData.parentTeam || null,
      };

      await createTeam(payload); // CALL your API helper here

      setSuccess(true);
      reset();
      if (onAddSuccess) onAddSuccess();

      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      setFormError(true);
      console.error(error);
    }
  });

  return (
    <Box>
      <form onSubmit={onSubmit}>
        <Controller
          name="name"
          defaultValue=""
          control={control}
          render={({ field }) => (
            <TextField fullWidth {...field} label="Název týmu" />
          )}
        />

        {errors.name && <FormFieldError text={errors.name.message} />}

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel>Nadřazený tým</InputLabel>
          <Controller
            name="parentTeam"
            defaultValue=""
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Nadřazený tým"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // max height in px
                      overflowY: "auto", // enable vertical scrolling
                    },
                  },
                }}
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        {errors.parentTeam && (
          <FormFieldError text={errors.parentTeam.message} />
        )}

        <Button type="submit" variant="contained" sx={{ my: 3 }}>
          Vytvořit
        </Button>
        {formError && <FormError text="Please fill out the form correctly" />}
        {success && <FormSuccess text="Team Added" />}
      </form>
    </Box>
  );
};
