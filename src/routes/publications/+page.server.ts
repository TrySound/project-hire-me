import { resolveIdentifier } from "$lib/atproto.js";

export const load = async ({ locals, url }) => {
  const author = url.searchParams.get("author");
  let resolved;
  if (author) {
    resolved = await resolveIdentifier(author);
  }
  return {
    did: locals.did,
    handle: locals.handle,
    author: resolved,
  };
};
