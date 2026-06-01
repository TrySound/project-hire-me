import * as v from "valibot";
import { error } from "@sveltejs/kit";
import { query, command, form, getRequestEvent } from "$app/server";
import type { DidString } from "@atproto/lex";
import { ResumeSchema } from "./jsonresume";
import {
  loadResumeBasicsData,
  loadResumeSkillsData,
  LanguageOperationSchema,
  SkillOperationSchema,
  updateResumeBasicsData,
  updateResumeLanguagesData,
  updateResumeSkillsData,
} from "./resume.server";
import { loadSifaResume, updateSifaResume } from "./sifa.server";
import {
  loadProfile,
  loadProfileContacts,
  updateProfileContacts,
  updateProfileData,
} from "./profile.server";
import { loadLegacyResume } from "./legacy-resume.server";

const ContactOperationSchema = v.variant("op", [
  // value is new contact url
  v.object({ op: v.literal("add"), value: v.string() }),
  // value is RecordKeyString
  v.object({ op: v.literal("delete"), value: v.string() }),
]);

export const getProfile = query(
  v.object({ did: v.string() }),
  async ({ did }) => {
    const event = getRequestEvent();
    const isProfileOwner = event.locals.did === did;
    const profile = await loadProfile(did as DidString, isProfileOwner);
    return profile;
  },
);

export const getResumeBasics = query(
  v.object({ did: v.string() }),
  async ({ did }) => {
    const event = getRequestEvent();
    const isProfileOwner = event.locals.did === did;
    const basics = await loadResumeBasicsData(did as DidString, isProfileOwner);
    return basics;
  },
);

export const getProfileContacts = query(
  v.object({ did: v.string() }),
  async ({ did }) => {
    const contacts = await loadProfileContacts(did as DidString);
    return {
      contacts,
    };
  },
);

export const getResumeSkills = query(
  v.object({ did: v.string() }),
  async ({ did }) => {
    const skills = await loadResumeSkillsData(did as DidString);
    return {
      skills,
    };
  },
);

const ProfileSchema = v.object({
  name: v.optional(v.string()),
  title: v.optional(v.string()),
  introduction: v.optional(v.string()),
  countryCode: v.optional(v.string()),
  email: v.optional(v.string()),
  status: v.optional(
    v.union([
      v.literal("open_to_work"),
      v.literal("open_to_connect"),
      v.literal("hidden"),
    ]),
  ),
  contactOperations: v.optional(v.array(ContactOperationSchema)),
});

export const updateProfile = form(
  ProfileSchema,
  async ({
    name,
    title,
    introduction,
    countryCode,
    email,
    status,
    contactOperations,
  }) => {
    const event = getRequestEvent();
    const did = event.locals.did as undefined | DidString;
    const handle = event.locals.handle;

    if (!did || !handle) {
      error(401, "Unauthorized");
    }

    // Update profile data in database and AT Protocol
    await updateProfileData(did, {
      name,
      title,
      introduction,
      countryCode,
      email,
      status,
    });

    // Update contacts in SIFA external accounts using atomic operations
    await updateProfileContacts(did, contactOperations ?? []);

    getProfile({ did }).set({
      name,
      title,
      introduction,
      countryCode,
      email,
      status,
    });
    getProfileContacts({ did }).refresh();
  },
);

const ResumeBasicsSchema = v.object({
  name: v.optional(v.string()),
  title: v.optional(v.string()),
  email: v.optional(v.string()),
  countryCode: v.optional(v.string()),
  summary: v.optional(v.string()),
  preferredWorkplaces: v.optional(
    v.array(
      v.union([v.literal("onsite"), v.literal("remote"), v.literal("hybrid")]),
    ),
  ),
  contactOperations: v.optional(v.array(ContactOperationSchema)),
  languageOperations: v.optional(v.array(LanguageOperationSchema)),
});

export const updateResumeBasics = form(
  ResumeBasicsSchema,
  async ({
    name,
    title,
    email,
    countryCode,
    summary,
    preferredWorkplaces,
    contactOperations,
    languageOperations,
  }) => {
    const event = getRequestEvent();
    const did = event.locals.did as DidString;
    const handle = event.locals.handle;
    if (!did || !handle) {
      error(401, "Unauthorized");
    }

    await updateResumeBasicsData(did as DidString, {
      name,
      title,
      email,
      countryCode,
      summary,
      preferredWorkplaces,
    });
    await updateProfileContacts(did, contactOperations ?? []);
    await updateResumeLanguagesData(did, languageOperations ?? []);

    // cannot use set because languages should be refreshed
    getResumeBasics({ did }).refresh();
    getProfileContacts({ did }).refresh();
  },
);

const SkillsUpdateSchema = v.object({
  skillOperations: v.array(SkillOperationSchema),
});

export const updateResumeSkills = form(
  SkillsUpdateSchema,
  async ({ skillOperations }) => {
    const event = getRequestEvent();
    const did = event.locals.did as DidString;
    if (!did ) {
      error(401, "Unauthorized");
    }

    await updateResumeSkillsData(did, skillOperations);

    getResumeSkills({ did }).refresh();
  },
);

// Legacy functions for resume page
export const getMemberProfile = query(
  v.object({ did: v.string() }),
  async ({ did }) => {
    const event = getRequestEvent();
    // show local resume and fallback to sifa resume
    const isProfileOwner = event.locals.did === did;
    return (
      (await loadLegacyResume(did as DidString)) ??
      (await loadSifaResume(did as DidString, isProfileOwner))
    );
  },
);

export const updateMemberProfile = command(ResumeSchema, async (resume) => {
  const { locals } = getRequestEvent();
  const did = locals.did;
  if (!did) {
    error(401, "Unauthorized");
  }

  // update atproto + private data (only work, education, projects, skills, languages)
  await updateSifaResume(did, resume);

  // Refresh the profile query to reflect changes
  getMemberProfile({ did }).refresh();
});
