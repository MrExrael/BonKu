"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { APP_VERSION, CHANGELOG } from "@/lib/changelog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SEEN_KEY = "bonku-last-seen-version";

/** Event global untuk membuka changelog secara manual dari mana saja. */
export const OPEN_CHANGELOG_EVENT = "bonku:open-changelog";

/**
 * Popup "Apa yang baru?". Muncul otomatis sekali ketika versi aplikasi berubah
 * (dibanding versi terakhir yang dilihat user), dan bisa dibuka manual via
 * event `bonku:open-changelog` (mis. dari tombol versi di sidebar/settings).
 */
export function WhatsNew() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(SEEN_KEY);
      if (seen !== APP_VERSION) setOpen(true);
    } catch {
      /* localStorage tidak tersedia */
    }

    const handler = () => setOpen(true);
    window.addEventListener(OPEN_CHANGELOG_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHANGELOG_EVENT, handler);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      try {
        localStorage.setItem(SEEN_KEY, APP_VERSION);
      } catch {
        /* abaikan */
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Apa yang baru?
          </DialogTitle>
          <DialogDescription>
            BonKu versi {APP_VERSION} — daftar pembaruan aplikasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {CHANGELOG.map((release, index) => (
            <div key={release.version} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">v{release.version}</span>
                {index === 0 && (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Terbaru
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {release.date}
                </span>
              </div>
              <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                {release.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WhatsNew;
