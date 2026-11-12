import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { i18n } = require("./next-i18next.config.js");

// security headers on every page: no other site may put CarZip in a frame (click-jacking), browsers never guess
// file types, other sites get only our origin as the referrer, and the browser features the site never uses
// (camera, microphone, location) are switched off for it
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // hides the Next.js developer button (the "N" in the corner) while running `npm run dev`;
  // build errors still show as an overlay
  devIndicators: false,
  // the languages of the site (see next-i18next.config.js)
  i18n,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
