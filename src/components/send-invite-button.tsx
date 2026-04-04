"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send } from "lucide-react";

export function SendInviteButton({ candidateId }: { candidateId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
        <CheckCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-primary">Invite sent!</span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSendInvite}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {loading ? "Sending..." : "Send Invite Email"}
      </button>
      {error && <p className="text-xs text-red-400 mt-2 max-w-[200px]">{error}</p>}
    </div>
  );
}
