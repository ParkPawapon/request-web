import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Typography component="h1" variant="h4">
          Page not found
        </Typography>
        <Typography color="text.secondary" variant="body1">
          The route does not exist or has not been migrated yet.
        </Typography>
        <Button href="/" variant="contained">
          Back to home
        </Button>
      </Stack>
    </main>
  );
}
