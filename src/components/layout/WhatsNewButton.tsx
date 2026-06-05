"use client";

import { Sparkles } from "lucide-react";

import { APP_VERSION } from "@/lib/changelog";
import { OPEN_CHANGELOG_EVENT } from "@/components/layout/WhatsNew";
import { Button } from "@/components/ui/button";

/** Tombol untuk membuka changelog "Apa yang baru?" secara manual. */
export function WhatsNewButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.dispatchEvent(new Event(OPEN_CHANGELOG_EVENT))}
    >
      <Sparkles className="size-4" />
      Apa yang baru? (v{APP_VERSION})
    </Button>
  );
}

export default WhatsNewButton;
