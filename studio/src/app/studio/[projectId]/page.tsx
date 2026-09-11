import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudioWorkspace } from "@/components/StudioWorkspace";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, slug, github_repo_name, github_repo_owner")
    .eq("id", projectId)
    .eq("owner_id", user.id)
    .single();

  if (error || !project) notFound();

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("credit_balance, rollover_credits")
    .eq("user_id", user.id)
    .single();

  return (
    <StudioWorkspace
      project={project}
      initialBalance={
        (subscription?.credit_balance ?? 0) + (subscription?.rollover_credits ?? 0)
      }
    />
  );
}
