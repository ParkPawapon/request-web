"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Stack spacing={2} sx={{ maxWidth: 520 }}>
        <Typography component="h1" variant="h4">
          Something went wrong
        </Typography>
        <Typography color="text.secondary" variant="body1">
          The page could not be loaded. Please try again.
        </Typography>
        {process.env.NODE_ENV === "development" ? (
          <Typography color="text.secondary" variant="caption">
            {error.message}
          </Typography>
        ) : null}
        <Button onClick={reset} variant="contained">
          Retry
        </Button>
      </Stack>
    </main>
  );
}
