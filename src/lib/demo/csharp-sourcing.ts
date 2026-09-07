export const CSHARP_SOURCING_WRITEUP = [
  "Using **@LinkedIn**, **@Teamtailor** plus your interview notes.",
  "",
  "**LinkedIn — C# conversations last month**",
  "",
  "You messaged three people with C# competence. They weren’t interested right now, but asked you to get back to them later — worth following up.",
  "",
  `- [Erik Nyman](https://www.linkedin.com/in/erik-nyman-taplo) — .NET / C# backend, Stockholm. Last note 12 days ago.`,
  `- [Sara Holmgren](https://www.linkedin.com/in/sara-holmgren-taplo) — C# · Azure, Malmö. Last note 3 weeks ago.`,
  `- [Patrik Lund](https://www.linkedin.com/in/patrik-lund-taplo) — Senior C# developer, Göteborg. Last note 6 days ago.`,
  "",
  "**Teamtailor — Fullstack developer project**",
  "",
  "Two candidates from that project who didn’t get the last role you hired for. They might still be interested in a similar role.",
  "",
  "- [Moa Ekström](https://app.teamtailor.com/candidates/moa-ekstrom-taplo) — Fullstack. Rejected after final; still on the project.",
  "- [Andreas Vukovic](https://app.teamtailor.com/candidates/andreas-vukovic-taplo) — Fullstack. Hired someone else; last note “open to similar roles”.",
  "",
  "**Taplo interview database**",
  "",
  "One person already in your interview notes:",
  "",
  "- [Lina Bergström](/analysis) — Backend Engineer (.NET). Interviewed 3 weeks ago · 44 min. Fit: **Moderate**. C# and SQL held up; system-design depth was thin.",
  "",
  "Source: LinkedIn outreach, Teamtailor (Fullstack developer), and Taplo interviews.",
].join("\n");

export const CSHARP_SOURCING_WRITEUP_SV = [
  "Använder **@LinkedIn**, **@Teamtailor** plus dina intervjunoter.",
  "",
  "**LinkedIn — C#-samtal senaste månaden**",
  "",
  "Du har skrivit till tre personer med C#-kompetens. De var inte intresserade just nu, men bad dig återkomma senare — värt att följa upp.",
  "",
  `- [Erik Nyman](https://www.linkedin.com/in/erik-nyman-taplo) — .NET / C# backend, Stockholm. Senaste notering för 12 dagar sedan.`,
  `- [Sara Holmgren](https://www.linkedin.com/in/sara-holmgren-taplo) — C# · Azure, Malmö. Senaste notering för 3 veckor sedan.`,
  `- [Patrik Lund](https://www.linkedin.com/in/patrik-lund-taplo) — Senior C#-utvecklare, Göteborg. Senaste notering för 6 dagar sedan.`,
  "",
  "**Teamtailor — Fullstack developer-projekt**",
  "",
  "Två kandidater från det projektet som inte fick den senaste rollen du tillsatte. De kan fortfarande vara intresserade av en liknande roll.",
  "",
  "- [Moa Ekström](https://app.teamtailor.com/candidates/moa-ekstrom-taplo) — Fullstack. Nekad efter final; kvar på projektet.",
  "- [Andreas Vukovic](https://app.teamtailor.com/candidates/andreas-vukovic-taplo) — Fullstack. Ni anställde någon annan; senaste notering “öppen för liknande roller”.",
  "",
  "**Taplos intervjudatabas**",
  "",
  "En person finns redan i dina intervjunoter:",
  "",
  "- [Lina Bergström](/analysis) — Backend Engineer (.NET). Intervjuad för 3 veckor sedan · 44 min. Fit: **Måttlig**. C# och SQL höll; systemdesignen var tunn.",
  "",
  "Källa: LinkedIn-outreach, Teamtailor (Fullstack developer) och Taplo-intervjuer.",
].join("\n");

export function csharpSourcingWriteup(locale: "en" | "sv") {
  return locale === "sv" ? CSHARP_SOURCING_WRITEUP_SV : CSHARP_SOURCING_WRITEUP;
}

export function isCsharpSourcingWriteup(answer: string) {
  return answer === CSHARP_SOURCING_WRITEUP || answer === CSHARP_SOURCING_WRITEUP_SV;
}
