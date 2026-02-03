import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Project-level rule overrides to reduce noisy build-blocking errors
    rules: {
      // Allow explicit any in many migration/debugging utilities for now
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unescaped entities in JSX (many admin strings contain quotes/apostrophes)
      'react/no-unescaped-entities': 'off',
      // Permit using <img> in admin/back-office areas where Next Image is impractical
      '@next/next/no-img-element': 'off',
      // Make exhaustive-deps a warning to avoid many false positives during refactor
      'react-hooks/exhaustive-deps': 'warn',
      // Prefer-const to warning (non-critical)
      'prefer-const': 'warn',
      // Unused vars: warn rather than error
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }]
    }
  }
];

export default eslintConfig;
