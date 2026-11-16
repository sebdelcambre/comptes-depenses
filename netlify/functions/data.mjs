import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("comptes");
  const headers = { "content-type": "application/json", "cache-control": "no-store" };

  if (req.method === "GET") {
    const cur = await store.get("state", { type: "json" });
    return new Response(JSON.stringify(cur || { rev: 0, data: null }), { headers });
  }

  if (req.method === "PUT" || req.method === "POST") {
    let body;
    try { body = await req.json(); } catch (e) { body = null; }
    if (!body || typeof body.data !== "object" || body.data === null)
      return new Response(JSON.stringify({ error: "bad request" }), { status: 400, headers });
    const cur = await store.get("state", { type: "json" });
    const rev = ((cur && cur.rev) || 0) + 1;
    await store.setJSON("state", { rev, data: body.data, updatedAt: Date.now() });
    return new Response(JSON.stringify({ rev }), { headers });
  }

  return new Response("Method Not Allowed", { status: 405 });
};

export const config = { path: "/api/data" };
