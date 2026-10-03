import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { i18n } = require("./next-i18next.config.js");

const nextConfig: NextConfig = {
  // hides the Next.js developer button (the "N" in the corner) while running `npm run dev`;
  // build errors still show as an overlay
  devIndicators: false,
  // the languages of the site (see next-i18next.config.js)
  i18n,
};

export default nextConfig;
