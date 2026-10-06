"use client";

import { useState, type ReactNode } from "react";
import {
  Button,
  ErrorNote,
  Field,
  PageShell,
  formPanel,
  inputClass,
} from "@/components/ui";

/**
 * Hosts-only gate. Client-side obfuscation, not real security: the password
 * and the data are visible in the page source. Fine for keeping casual
 * visitors out; do not put anything sensitive behind this.
 */
const PASSWORD = "Ravirogi";
const SESSION_KEY = "arbor-admin-unlocked";

export default function AdminGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [value, setValue] = useState("");
  const [failed, setFailed] = useState(false);

  if (unlocked) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }

  return (
    <PageShell
      title="Hosts Only"
      tagline="Venue hunt and gimmicks. If you are reading this and you are not Quinn, Jason, or Alex, this page is not for you."
    >
      <form onSubmit={submit} className={`${formPanel} max-w-sm`}>
        <Field label="Password">
          <input
            type="password"
            className={inputClass}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setFailed(false);
            }}
            autoComplete="off"
            aria-label="Admin password"
          />
        </Field>
        {failed && <ErrorNote>Wrong password.</ErrorNote>}
        <Button type="submit">Unlock</Button>
      </form>
    </PageShell>
  );
}
