"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SendInviteButton({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSendInvite() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/candidates/${candidateId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send invite");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSendInvite}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Invite Email"}
      </button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
