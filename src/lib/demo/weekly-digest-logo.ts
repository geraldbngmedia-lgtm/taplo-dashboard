import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WEEKLY_DIGEST_LOGO_CID } from "./weekly-digest";

export function weeklyDigestLogoAttachment() {
  const file = join(process.cwd(), "src/assets/taplo-wordmark.png");
  return {
    filename: "taplo-wordmark.png",
    content: readFileSync(file).toString("base64"),
    content_id: WEEKLY_DIGEST_LOGO_CID,
    content_type: "image/png",
  };
}
