export const load = async ({ locals }) => {
  return {
    did: locals.did,
    handle: locals.handle,
  };
};
