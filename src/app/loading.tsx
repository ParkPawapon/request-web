import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Loading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <CircularProgress aria-label="Loading page" size={28} />
        <Typography color="text.secondary" variant="body2">
          Loading
        </Typography>
      </Stack>
    </main>
  );
}
