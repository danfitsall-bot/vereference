"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, FileText } from "lucide-react";
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
      setError("Please answer all required questions before submitting.");
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
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Reference Submitted</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Thank you for completing the reference for <strong className="text-foreground">{candidateName}</strong>. Your feedback has been received.
        </p>
      </div>
    );
  }

  const answeredRequired = questions.filter((q) => q.required && answers[q.key]);
  const totalRequired = questions.filter((q) => q.required).length;
  const progress = Math.round((answeredRequired.length / totalRequired) * 100);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Reference Form</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Reference for {candidateName}</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Hi <strong className="text-foreground">{refereeName}</strong>, please share your experience working with{" "}
          <strong className="text-foreground">{candidateName}</strong> for the{" "}
          <strong className="text-foreground">{positionApplied}</strong> position. This takes about 5–10 minutes.
        </p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/35">Progress</span>
            <span className="text-xs text-white/35">{answeredRequired.length}/{totalRequired} required</span>
          </div>
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.key} className="rounded-xl border border-white/8 p-5" style={{ background: "var(--card)" }}>
            <div className="flex items-start gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-xs text-white/40 font-medium flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {q.text}
                  {q.required && <span className="text-primary ml-1">*</span>}
                </p>
                {!q.required && <span className="text-xs text-white/30">Optional</span>}
              </div>
            </div>

            {q.type === "text" && (
              <Textarea
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 resize-none ml-9"
                placeholder="Your answer..."
                value={(answers[q.key] as string) || ""}
                onChange={(e) => updateAnswer(q.key, e.target.value)}
                rows={3}
              />
            )}

            {q.type === "rating" && (
              <div className="flex items-center gap-1.5 ml-9">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateAnswer(q.key, star)}
                    className={`text-2xl transition-colors leading-none ${
                      star <= (answers[q.key] as number || 0)
                        ? "text-primary"
                        : "text-white/15 hover:text-white/40"
                    }`}
                  >
                    ★
                  </button>
                ))}
                {answers[q.key] && (
                  <span className="text-xs text-white/40 ml-2">{answers[q.key]}/5</span>
                )}
              </div>
            )}

            {q.type === "yes_no" && (
              <div className="flex gap-2 ml-9">
                {["Yes", "No"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateAnswer(q.key, option)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                      answers[q.key] === option
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80 bg-transparent"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="mt-6 w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Reference"}
      </Button>
    </form>
  );
}
