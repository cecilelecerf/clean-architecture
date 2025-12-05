import type { NextConfig } from 'next';
import 'dotenv/config';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
};

export default nextConfig;
