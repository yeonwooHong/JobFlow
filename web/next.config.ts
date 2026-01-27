import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Connect next-intl config file
const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {

};

export default withNextIntl(nextConfig);