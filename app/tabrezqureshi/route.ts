import { renderCardHtml } from "@/utils/card-renderer";
import { AUTHORITATIVE_RAFTCON_CUSTOMER, resolveCardDesign } from "@/utils/card-designs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const designParam = requestUrl.searchParams.get("design");
  const activeDesignId = designParam
    ? resolveCardDesign(designParam).id
    : "raftcon-luxury";

  const html = renderCardHtml({
    ...AUTHORITATIVE_RAFTCON_CUSTOMER,
    profileSlug: "tabrezqureshi",
    cardDesign: activeDesignId,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
