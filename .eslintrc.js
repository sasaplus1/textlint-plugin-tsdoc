const typescriptExtends = [
  'eslint:recommended',
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:node/recommended-module',
  'prettier'
];

const typescriptPlugins = ['eslint-plugin-tsdoc'];

const tsdocRules = {
  'tsdoc/syntax': 'warn'
};

const tryExtensions = ['.d.ts', '.tsx', '.ts', '.jsx', '.js', '.json'];

const config = {};
const overrides = [];

overrides.push({
  extends: typescriptExtends,
  excludedFiles: '*.test.ts',
  files: ['./**/*.{ts,tsx}'],
  plugins: [...typescriptPlugins],
  rules: {
    ...tsdocRules
  },
  settings: {
    node: {
      allowModules: ['@textlint/ast-node-types', '@textlint/types'],
      tryExtensions
    }
  }
});

overrides.push({
  extends: typescriptExtends,
  files: ['./**/*.test.ts'],
  plugins: [...typescriptPlugins],
  rules: {
    ...tsdocRules
  },
  settings: {
    node: {
      allowModules: ['@textlint/ast-tester'],
      tryExtensions
    }
  }
});

config.env = {
  node: true
};
config.extends = ['eslint:recommended', 'plugin:node/recommended', 'prettier'];
config.overrides = overrides;
config.parserOptions = {
  sourceType: 'module'
};
config.root = true;

module.exports = config;
