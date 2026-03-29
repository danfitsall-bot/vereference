import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { REFEREE_STATUSES } from "@/lib/constants";
import Link from "next/link";

export default async function ReferencesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: referees } = await supabase
    .from("referees")
    .select("*, candidates!inner(full_name, position_applied)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">References</h1>
        <p className="text-muted-foreground mt-1">All reference checks across candidates</p>
      </div>

      {referees && referees.length > 0 ? (
        <div className="grid gap-3">
          {referees.map((referee: any) => {
            const statusConfig = REFEREE_STATUSES[referee.status as keyof typeof REFEREE_STATUSES] || REFEREE_STATUSES.pending;
            return (
              <Link key={referee.id} href={`/candidates/${referee.candidate_id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{referee.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {referee.relationship} at {referee.company} &middot;
                        Reference for <span className="font-medium">{referee.candidates?.full_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
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
            <p className="text-muted-foreground">No references yet. Add candidates to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
