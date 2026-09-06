const JOBS = [
  {
    title: "Senior C# / .NET",
    place: "Stockholm",
    href: "https://www.linkedin.com/jobs/view/taplo-senior-csharp-stockholm",
  },
  {
    title: "Fullstack Developer",
    place: "Växjö",
    href: "https://www.linkedin.com/jobs/view/taplo-fullstack-vaxjo",
  },
  {
    title: "Backend Engineer (.NET)",
    place: "Malmö",
    href: "https://www.linkedin.com/jobs/view/taplo-backend-dotnet-malmo",
  },
] as const;

const LINKEDIN_SPOKEN = [
  {
    name: "Erik Nyman",
    note: ".NET / C# backend, Stockholm. Asked you to get back later.",
    href: "https://www.linkedin.com/in/erik-nyman-taplo",
  },
  {
    name: "Sara Holmgren",
    note: "C# · Azure, Malmö. Last note 3 weeks ago.",
    href: "https://www.linkedin.com/in/sara-holmgren-taplo",
  },
  {
    name: "Patrik Lund",
    note: "Senior C# developer, Göteborg. Follow up — timing was off.",
    href: "https://www.linkedin.com/in/patrik-lund-taplo",
  },
] as const;

const LINKEDIN_PICK = {
  name: "Sara Holmgren",
  note: "Strongest C# / Azure match for the Malmö backend role.",
  href: "https://www.linkedin.com/in/sara-holmgren-taplo",
};

const INTERVIEW_PICK = {
  name: "Lina Bergström",
  note: "Taplo interview, 3 weeks ago. Fit Moderate — C# and SQL held up.",
  href: "https://app.taplo.ai/analysis",
};

export const WEEKLY_DIGEST_SUBJECT = "Taplo weekly — 3 LinkedIn roles and who you already know";

export const WEEKLY_DIGEST_LOGO_CID = "taplo-logo";

function link(href: string, label: string) {
  return `<a href="${href}" style="color:#C45C4A;text-decoration:none;font-weight:600;">${label}</a>`;
}

export function weeklyDigestHtml() {
  const jobs = JOBS.map(
    (job) =>
      `<li style="margin:0 0 10px;">${link(job.href, job.title)} — ${job.place}</li>`,
  ).join("");
  const spoken = LINKEDIN_SPOKEN.map(
    (person) =>
      `<li style="margin:0 0 10px;">${link(person.href, person.name)} — ${person.note}</li>`,
  ).join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FFFcf7;border:1px solid #E8E0D4;border-radius:16px;padding:32px 36px;">
          <tr>
            <td>
              <img src="cid:taplo-logo" alt="Taplo" width="132" height="36" style="display:block;border:0;height:36px;width:auto;margin:0 0 8px;" />
              <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8178;font-family:Arial,sans-serif;">Weekly digest</p>
              <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#2D2926;">Hey,</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#3F3A36;">
                These are the jobs Taplo has seen on LinkedIn right now — and people you already know who could fit.
              </p>

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8178;font-family:Arial,sans-serif;">Jobs on LinkedIn right now</p>
              <ul style="margin:0 0 22px;padding-left:18px;font-size:15px;line-height:1.55;color:#3F3A36;font-family:Arial,sans-serif;">
                ${jobs}
              </ul>

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8178;font-family:Arial,sans-serif;">You’ve already spoken to them on LinkedIn</p>
              <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#5C564F;font-family:Arial,sans-serif;">
                They weren’t ready last time, but asked you to come back later — worth a follow-up on these roles.
              </p>
              <ul style="margin:0 0 22px;padding-left:18px;font-size:15px;line-height:1.55;color:#3F3A36;font-family:Arial,sans-serif;">
                ${spoken}
              </ul>

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8A8178;font-family:Arial,sans-serif;">One from LinkedIn + one from an interview</p>
              <ul style="margin:0 0 22px;padding-left:18px;font-size:15px;line-height:1.55;color:#3F3A36;font-family:Arial,sans-serif;">
                <li style="margin:0 0 10px;">${link(LINKEDIN_PICK.href, LINKEDIN_PICK.name)} — ${LINKEDIN_PICK.note}</li>
                <li style="margin:0 0 10px;">${link(INTERVIEW_PICK.href, INTERVIEW_PICK.name)} — ${INTERVIEW_PICK.note}</li>
              </ul>

              <p style="margin:0;font-size:12px;line-height:1.5;color:#8A8178;font-family:Arial,sans-serif;">
                Grounded in LinkedIn, Teamtailor, and Taplo interviews. Demo data — not a live search.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function weeklyDigestText() {
  const jobs = JOBS.map((job) => `- ${job.title} — ${job.place}\n  ${job.href}`).join("\n");
  const spoken = LINKEDIN_SPOKEN.map((person) => `- ${person.name} — ${person.note}\n  ${person.href}`).join(
    "\n",
  );
  return [
    "Hey,",
    "",
    "These are the jobs Taplo has seen on LinkedIn right now — and people you already know who could fit.",
    "",
    "JOBS ON LINKEDIN RIGHT NOW",
    jobs,
    "",
    "YOU’VE ALREADY SPOKEN TO THEM ON LINKEDIN",
    "They weren’t ready last time, but asked you to come back later — worth a follow-up on these roles.",
    spoken,
    "",
    "ONE FROM LINKEDIN + ONE FROM AN INTERVIEW",
    `- ${LINKEDIN_PICK.name} — ${LINKEDIN_PICK.note}\n  ${LINKEDIN_PICK.href}`,
    `- ${INTERVIEW_PICK.name} — ${INTERVIEW_PICK.note}\n  ${INTERVIEW_PICK.href}`,
    "",
    "Grounded in LinkedIn, Teamtailor, and Taplo interviews. Demo data — not a live search.",
  ].join("\n");
}
