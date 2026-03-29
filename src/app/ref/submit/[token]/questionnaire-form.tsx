"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { DEFAULT_QUESTIONS } from "@/lib/constants";

export function RefereeQuestionnaireForm({
  token,
  refereeName,
  candidateName,
  positionApplied,
}: {
  token: string;
  refereeName: string;
  candidateName: string;
  positionApplied: string;
}) {
  const questions = DEFAULT_QUESTIONS.map((q) => ({
    ...q,
    text: q.text.replace("{candidate}", candidateName),
  }));

  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(key: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check required questions
    const requiredMissing = questions
      .filter((q) => q.required)
      .some((q) => !answers[q.key] || (typeof answers[q.key] === "string" && !(answers[q.key] as string).trim()));

    if (requiredMissing) {
      setError("Please answer all required questions.");
      setLoading(false);
      return;
    }

    const formattedAnswers = questions
      .filter((q) => answers[q.key])
      .map((q) => ({
        question_key: q.key,
        question_text: q.text,
        answer_text: q.type === "text" || q.type === "yes_no" ? String(answers[q.key]) : null,
        answer_rating: q.type === "rating" ? Number(answers[q.key]) : null,
      }));

    const res = await fetch("/api/references/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers: formattedAnswers }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit reference");
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
          Your reference for {candidateName} has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Reference for {candidateName}</h2>
        <p className="text-muted-foreground mt-1">
          Hi {refereeName}, please share your experience working with {candidateName} for the{" "}
          <strong>{positionApplied}</strong> position. This should take about 5-10 minutes.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.key}>
            <CardContent className="pt-4">
              <Label className="text-sm font-medium">
                {q.text}
                {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {q.type === "text" && (
                <Textarea
                  className="mt-2"
                  placeholder="Your answer..."
                  value={(answers[q.key] as string) || ""}
                  onChange={(e) => updateAnswer(q.key, e.target.value)}
                  rows={3}
                />
              )}

              {q.type === "rating" && (
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateAnswer(q.key, star)}
                      className={`text-2xl transition-colors ${
                        star <= (answers[q.key] as number || 0)
                          ? "text-yellow-500"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {answers[q.key] ? `${answers[q.key]}/5` : "Select rating"}
                  </span>
                </div>
              )}

              {q.type === "yes_no" && (
                <div className="flex gap-3 mt-2">
                  {["Yes", "No"].map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={answers[q.key] === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateAnswer(q.key, option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="submit" className="mt-6 w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Reference"}
      </Button>
    </form>
  );
}
