import { redirect } from "@sveltejs/kit";
import { getDB } from "$lib/dbkit";

export const load = async ({ locals, url }) => {
  if (!locals.did || !locals.handle) {
    redirect(302, `/?redirect=${encodeURIComponent(url.pathname)}`);
  }

  const db = await getDB();

  // Get member info for inviter details
  const member = await db
    .selectFrom("members")
    .select(["did", "invited_by"])
    .where("did", "=", locals.did)
    .executeTakeFirst();

  // Get inviter info if user was invited
  let inviter = null;
  if (member?.invited_by) {
    const inviterData = await db
      .selectFrom("members")
      .select(["name", "handle", "did"])
      .where("did", "=", member.invited_by)
      .executeTakeFirst();

    if (inviterData) {
      inviter = {
        name: inviterData.name,
        handle: inviterData.handle,
        did: inviterData.did,
      };
    }
  }

  return {
    handle: locals.handle,
    inviter,
  };
};
