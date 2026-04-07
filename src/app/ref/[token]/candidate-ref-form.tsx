"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle, Users } from "lucide-react";

interface RefereeEntry {
  full_name: string;
  email: string;
  phone: string;
  relationship: string;
  company: string;
  job_title: string;
}

const emptyReferee: RefereeEntry = {
  full_name: "",
  email: "",
  phone: "",
  relationship: "manager",
  company: "",
  job_title: "",
};

export function CandidateRefForm({
  token,
  candidateName,
  positionApplied,
  minReferees,
}: {
  token: string;
  candidateName: string;
  positionApplied: string;
  minReferees: number;
}) {
  const [referees, setReferees] = useState<RefereeEntry[]>([
    { ...emptyReferee },
    { ...emptyReferee },
  ]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateReferee(index: number, field: keyof RefereeEntry, value: string) {
    setReferees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addReferee() {
    if (referees.length < 5) {
      setReferees((prev) => [...prev, { ...emptyReferee }]);
    }
  }

  function removeReferee(index: number) {
    if (referees.length > minReferees) {
      setReferees((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please provide your consent to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/ref/submit-referees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, referees }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit referees");
      setLoading(false);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Details Submitted</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your referee details have been received. We&apos;ll contact them shortly to complete the reference check.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Reference Request</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Submit Your Referees</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Hi <strong className="text-foreground">{candidateName}</strong>, please provide {minReferees}–5 professional
          references for the <strong className="text-foreground">{positionApplied}</strong> position.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {referees.map((referee, index) => (
          <div key={index} className="rounded-xl border border-border p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {index + 1}
                </div>
                <span className="text-sm font-semibold text-foreground">Referee {index + 1}</span>
              </div>
              {referees.length > minReferees && (
                <button
                  type="button"
                  onClick={() => removeReferee(index)}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full Name *</Label>
                <Input
                  placeholder="Jane Smith"
                  value={referee.full_name}
                  onChange={(e) => updateReferee(index, "full_name", e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email *</Label>
                <Input
                  type="email"
                  placeholder="jane@company.com"
                  value={referee.email}
                  onChange={(e) => updateReferee(index, "email", e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Company *</Label>
                <Input
                  placeholder="Acme Inc."
                  value={referee.company}
                  onChange={(e) => updateReferee(index, "company", e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Relationship *</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  value={referee.relationship}
                  onChange={(e) => updateReferee(index, "relationship", e.target.value)}
                  required
                >
                  <option value="manager">Manager</option>
                  <option value="colleague">Colleague</option>
                  <option value="direct_report">Direct Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Job Title <span className="text-muted-foreground/50">(optional)</span></Label>
                <Input
                  placeholder="Engineering Manager"
                  value={referee.job_title}
                  onChange={(e) => updateReferee(index, "job_title", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone <span className="text-muted-foreground/50">(optional)</span></Label>
                <Input
                  type="tel"
                  placeholder="+44 7700 900000"
                  value={referee.phone}
                  onChange={(e) => updateReferee(index, "phone", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {referees.length < 5 && (
        <button
          type="button"
          onClick={addReferee}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Another Referee
        </button>
      )}

      <div className="mt-6 p-4 rounded-xl border border-border bg-muted/30">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-4 h-4 rounded border border-border bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
              {consent && (
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground leading-relaxed">
            I consent to VeReference contacting my referees on behalf of the hiring company to
            collect professional reference feedback. I confirm that these are genuine professional
            contacts and that I have their permission to share their details.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        className="mt-4 w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        disabled={loading || !consent}
      >
        {loading ? "Submitting..." : "Submit Referees"}
      </Button>
    </form>
  );
}
