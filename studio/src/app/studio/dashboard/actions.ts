"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `project-${Date.now()}`
  );
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data, error } = await supabase
    .from("projects")
    .insert({ owner_id: user.id, name, slug: slugify(name) })
    .select("id")
    .single();

  if (error || !data) {
    // Slug collision or similar — fall back to a suffixed slug once.
    const retry = await supabase
      .from("projects")
      .insert({ owner_id: user.id, name, slug: `${slugify(name)}-${Date.now().toString(36)}` })
      .select("id")
      .single();
    if (retry.error || !retry.data) return;
    redirect(`/studio/${retry.data.id}`);
  }

  redirect(`/studio/${data.id}`);
}
