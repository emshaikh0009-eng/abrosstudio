import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicCardRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const sanitizedSlug = typeof slug === "string" ? slug.trim().toLowerCase().slice(0, 100) : "";

  if (!sanitizedSlug) {
    notFound();
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Call the public card RPC to verify profile exists, is active, and read chosen card design
  const { data, error } = await supabase.rpc("get_public_card", {
    p_slug: sanitizedSlug,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    notFound();
  }

  const card = data[0];
  const isEvergreen = card.card_design === "Evergreen";
  const targetTemplate = isEvergreen ? "design-2" : "design-1";

  // Redirect to the appropriate mobile card design template with the customer's slug
  redirect(`/cards/${targetTemplate}/index.html?slug=${encodeURIComponent(sanitizedSlug)}`);
}
