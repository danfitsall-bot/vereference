"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle } from "lucide-react";

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
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-muted-foreground">
          Your referee details have been submitted successfully. We'll contact them shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Submit Your Referees</h2>
        <p className="text-muted-foreground mt-1">
          Hi {candidateName}, please provide {minReferees}-5 professional references for the{" "}
          <strong>{positionApplied}</strong> position.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {referees.map((referee, index) => (
          <Card key={index}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Referee {index + 1}</CardTitle>
                {referees.length > minReferees && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReferee(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input
                    placeholder="Jane Smith"
                    value={referee.full_name}
                    onChange={(e) => updateReferee(index, "full_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    placeholder="jane@company.com"
                    value={referee.email}
                    onChange={(e) => updateReferee(index, "email", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Company *</Label>
                  <Input
                    placeholder="Acme Inc."
                    value={referee.company}
                    onChange={(e) => updateReferee(index, "company", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Relationship *</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Job Title</Label>
                  <Input
                    placeholder="Engineering Manager"
                    value={referee.job_title}
                    onChange={(e) => updateReferee(index, "job_title", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={referee.phone}
                    onChange={(e) => updateReferee(index, "phone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {referees.length < 5 && (
        <Button type="button" variant="outline" className="mt-4 w-full" onClick={addReferee}>
          <Plus className="h-4 w-4 mr-2" /> Add Another Referee
        </Button>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-muted-foreground">
            I consent to VeReference contacting my referees on behalf of the hiring company to
            collect professional reference feedback. I confirm that these are genuine professional
            contacts and that I have their permission to share their details.
          </span>
        </label>
      </div>

      <Button type="submit" className="mt-4 w-full" disabled={loading || !consent}>
        {loading ? "Submitting..." : "Submit Referees"}
      </Button>
    </form>
  );
}
