import { error } from "@sveltejs/kit";
import { resolveIdentifier } from "$lib/atproto";

export const load = async ({ params, locals }) => {
  const resolved = await resolveIdentifier(params.handle);
  if (!resolved) {
    error(404, `Cannot resolve profile for ${params.handle}`);
  }

  return {
    did: locals.did,
    handle: locals.handle,
    profile: {
      did: resolved.did,
      handle: resolved.handle,
    },
  };
};
