import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { publicEnv } from "@/shared/config/env";

const foundationChecks = [
  "Next.js App Router",
  "TypeScript strict mode",
  "MUI theme foundation",
  "Tailwind layout utilities",
  "Central API client boundary",
  "Vitest and RTL smoke coverage",
] as const;

export default function Home() {
  return (
    <main className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-8 lg:px-12">
      <Box className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography component="h1" variant="h3">
              {publicEnv.NEXT_PUBLIC_APP_NAME}
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Production frontend foundation for the request platform.
            </Typography>
          </Box>
          <Chip
            color="primary"
            label={publicEnv.NEXT_PUBLIC_APP_ENV}
            variant="outlined"
          />
        </Stack>

        <Paper component="section" elevation={0} variant="outlined">
          <Box className="grid gap-0 md:grid-cols-[1fr_360px]">
            <Box className="p-6 sm:p-8">
              <Typography component="h2" variant="h5">
                Migration-ready shell
              </Typography>
              <Typography
                className="mt-2 max-w-2xl"
                color="text.secondary"
                variant="body2"
              >
                This route is intentionally minimal until legacy routes,
                components, and workflows are mapped into feature-owned modules.
              </Typography>
              <List dense sx={{ mt: 3 }}>
                {foundationChecks.map((item) => (
                  <ListItem disableGutters key={item}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box className="border-t border-solid border-[var(--border)] p-6 sm:p-8 md:border-l md:border-t-0">
              <Typography component="h2" variant="h6">
                API boundary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography color="text.secondary" variant="body2">
                {publicEnv.NEXT_PUBLIC_API_BASE_URL
                  ? "Configured from NEXT_PUBLIC_API_BASE_URL."
                  : "Awaiting NEXT_PUBLIC_API_BASE_URL."}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </main>
  );
}
