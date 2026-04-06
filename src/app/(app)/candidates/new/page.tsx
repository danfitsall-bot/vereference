"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCandidatePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email,
        phone: phone || null,
        position_applied: position,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create candidate");
      setLoading(false);
      return;
    }

    const { candidate } = await res.json();
    router.push(`/candidates/${candidate.id}`);
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/candidates" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Candidates
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1B2D] tracking-tight">Add New Candidate</h1>
        <p className="text-gray-500 text-sm mt-0.5">They'll receive an email to submit their referee details.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm text-gray-600">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-gray-600">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-sm text-gray-600">Position Applied For *</Label>
              <Input
                id="position"
                placeholder="Senior Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm text-gray-600">Phone <span className="text-gray-300">(optional)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+44 7700 900000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white border-gray-200 text-[#0F1B2D] placeholder:text-gray-300 focus:border-[#0A6E6E] h-10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0A6E6E] text-white hover:bg-[#085959] font-semibold"
            >
              {loading ? "Creating..." : "Create & Send Invite"}
            </Button>
            <Link href="/candidates">
              <Button type="button" variant="ghost" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
