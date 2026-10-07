import * as React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Status = "loading" | "error" | "empty";

const MOCK_MESSAGES: { id: string; from: string; subject: string }[] = [];

function fetchInbox(shouldFail: boolean): Promise<typeof MOCK_MESSAGES> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Failed to load"));
      else resolve(MOCK_MESSAGES);
    }, 1500);
  });
}

export default function InboxScreen() {
  const [status, setStatus] = React.useState<Status>("loading");
  const [attempt, setAttempt] = React.useState(0);

  const load = React.useCallback(() => {
    setStatus("loading");
    // First attempt fails to demo the error state; retry succeeds.
    fetchInbox(attempt === 0)
      .then(() => setStatus("empty"))
      .catch(() => setStatus("error"));
  }, [attempt]);

  React.useEffect(() => {
    load();
  }, [load]);

  const retry = () => setAttempt((a) => a + 1);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-6">
      {status === "loading" && (
        <div className="w-full space-y-3" role="status" aria-label="Loading inbox">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {status === "error" && (
        <div
          role="alert"
          className="w-full rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
        >
          <p className="font-medium">Something went wrong</p>
          <Button variant="link" className="h-auto p-0 text-destructive" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {status === "empty" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Mail className="size-24 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-xl font-semibold">No messages yet</h2>
          <Button>Compose</Button>
        </div>
      )}
    </main>
  );
}
