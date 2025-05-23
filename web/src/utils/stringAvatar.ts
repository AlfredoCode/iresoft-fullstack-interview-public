export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: "#202020",
      width: 36,
      height: 36,
      fontSize: 14,
      fontWeight: 700,
    },
    children: name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase(),
  };
}
