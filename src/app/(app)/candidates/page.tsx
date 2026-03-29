import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CANDIDATE_STATUSES } from "@/lib/constants";

export default async function CandidatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground mt-1">Manage your reference checks</p>
        </div>
        <Link href="/candidates/new">
          <Button>Add Candidate</Button>
        </Link>
      </div>

      {candidates && candidates.length > 0 ? (
        <div className="grid gap-4">
          {candidates.map((candidate) => {
            const statusConfig = CANDIDATE_STATUSES[candidate.status as keyof typeof CANDIDATE_STATUSES] || CANDIDATE_STATUSES.pending;
            return (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold">{candidate.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.position_applied} &middot; {candidate.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(candidate.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No candidates yet. Add your first candidate to get started.</p>
            <Link href="/candidates/new">
              <Button>Add Candidate</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
