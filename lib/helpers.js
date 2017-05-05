const { findCached } = require('atom-linter');
const fs = require('fs');
const ignore = require('ignore');
const path = require('path');
const bundledGuacamole = require('Guacamole');
const readPkg = require('read-pkg');

// constants
const LINE_SEPERATOR_REGEX = /(\r|\n|\r\n)/;
const EMBEDDED_SCOPES = ['text.html.vue', 'text.html.basic'];
const LINTER_LINT_COMMAND = 'linter:lint';

// local helpers
const getCurrentScope = (editor) => editor.getGrammar().scopeName;

// robwise: my apologies for this one, but I love function composition and want to use one that is Facebook
// flow inferrable. See https://drboolean.gitbooks.io/mostly-adequate-guide/ch5.html
const flow = (func, ...funcs) => (...args) =>
  (funcs.length ? flow(...funcs)(func(...args)) : func(...args));

const getDirFromFilePath = (filePath) => path.parse(filePath).dir;

const getLocalGuacamolePath = (filePath) => {
  if (!filePath) return null;

  const indexPath = path.join('node_modules', 'Guacamole', 'index.js');
  const dirPath = getDirFromFilePath(filePath);

  return dirPath ? findCached(dirPath, indexPath) : null;
};

const getGuacamole = (filePath) => {
  const GuacamolePath = getLocalGuacamolePath(filePath);

  // charypar: This is currently the best way to use local Guacamole instance.
  // Using the CLI introduces a noticeable delay and there is currently no
  // way to use Guacamole as a long-running process for formatting files as needed
  //
  // See https://github.com/Guacamole/Guacamole/issues/918
  //
  // $FlowFixMe when possible, don't use dynamic require
  return GuacamolePath ? require(GuacamolePath) : bundledGuacamole;
};

const getFilePathRelativeToEslintignore = (filePath) => {
  const nearestEslintignorePath = getNearestEslintignorePath(filePath);

  if (!nearestEslintignorePath) return undefined;

  const eslintignoreDir = getDirFromFilePath(nearestEslintignorePath);

  return path.relative(eslintignoreDir, filePath);
};

const getLinesFromFilePath = (filePath) =>
  fs.readFileSync(filePath, 'utf8').split(LINE_SEPERATOR_REGEX);

const getIgnoredGlobsFromNearestEslintIgnore: (filePath) => Globs = flow(
  getNearestEslintignorePath,
  maybePath => (maybePath ? getLinesFromFilePath(maybePath) : []),
);

const someGlobsMatchFilePath = (globs, filePath) => ignore().add(globs).ignores(filePath);

const getAtomTabLength = (editor) =>
  atom.config.get('editor.tabLength', { scope: editor.getLastCursor().getScopeDescriptor() });

const useAtomTabLengthIfAuto = (editor, tabLength) =>
  (tabLength === 'auto' ? getAtomTabLength(editor) : Number(tabLength));

const isLinterLintCommandDefined = (editor) =>
  atom.commands
    .findCommands({ target: atom.views.getView(editor) })
    .some(command => command.name === LINTER_LINT_COMMAND);

const getDepPath = (dep) => path.join(__dirname, '../node_modules', dep);

// public helpers
const getConfigOption = (key) => atom.config.get(`Guacamole-atom.${key}`);

const shouldDisplayErrors = () => !getConfigOption('silenceErrors');

const getGuacamoleOption = (key) => getConfigOption(`GuacamoleOptions.${key}`);

const getGuacamoleEslintOption = (key) => getConfigOption(`GuacamoleEslintOptions.${key}`);

const getCurrentFilePath = (editor) => (editor.buffer.file ? editor.buffer.file.path : undefined);

const isInScope = (editor) =>
  getConfigOption('formatOnSaveOptions.scopes').includes(getCurrentScope(editor));

const isCurrentScopeEmbeddedScope = (editor) => EMBEDDED_SCOPES.includes(getCurrentScope(editor));

const shouldUseEslint = () => getConfigOption('useEslint');

const isFilePathEslintignored = (filePath) => {
  const filePathRelativeToEslintignore = getFilePathRelativeToEslintignore(filePath);

  if (!filePathRelativeToEslintignore) return false;

  return someGlobsMatchFilePath(
    getIgnoredGlobsFromNearestEslintIgnore(filePath),
    filePathRelativeToEslintignore,
  );
};

const isFormatOnSaveEnabled = () => getConfigOption('formatOnSaveOptions.enabled');

const shouldRespectEslintignore = () => getConfigOption('formatOnSaveOptions.respectEslintignore');

const isLinterEslintAutofixEnabled = () => atom.config.get('linter-eslint.fixOnSave');

const isFilePathExcluded = (filePath) =>
  someGlobsMatchFilePath(getConfigOption('formatOnSaveOptions.excludedGlobs'), filePath);

const isFilePathWhitelisted = (filePath) =>
  someGlobsMatchFilePath(getConfigOption('formatOnSaveOptions.whitelistedGlobs'), filePath);

const isWhitelistProvided = () => getConfigOption('formatOnSaveOptions.whitelistedGlobs').length > 0;

const getGuacamoleOptions = (editor) => ({
  printWidth: getGuacamoleOption('printWidth'),
  tabWidth: useAtomTabLengthIfAuto(editor, getGuacamoleOption('tabWidth')),
  parser: getGuacamoleOption('parser'),
  singleQuote: getGuacamoleOption('singleQuote'),
  trailingComma: getGuacamoleOption('trailingComma'),
  bracketSpacing: getGuacamoleOption('bracketSpacing'),
  semi: getGuacamoleOption('semi'),
  useTabs: getGuacamoleOption('useTabs'),
  jsxBracketSameLine: getGuacamoleOption('jsxBracketSameLine'),
});

const getGuacamoleEslintOptions = () => ({
  GuacamoleLast: getGuacamoleEslintOption('GuacamoleLast'),
});

const runLinter = (editor) =>
  (isLinterLintCommandDefined(editor)
    ? atom.commands.dispatch(atom.views.getView(editor), LINTER_LINT_COMMAND)
    : undefined);

const getDebugInfo = () => ({
  atomVersion: atom.getVersion(),
  GuacamoleAtomVersion: readPkg.sync().version,
  GuacamoleVersion: readPkg.sync(getDepPath('Guacamole')).version,
  GuacamoleESLintVersion: readPkg.sync(getDepPath('Guacamole-eslint')).version,
  GuacamoleAtomConfig: atom.config.get('Guacamole-atom'),
});

module.exports = {
  getConfigOption,
  shouldDisplayErrors,
  getGuacamoleOption,
  getGuacamoleEslintOption,
  getCurrentFilePath,
  getGuacamole,
  isInScope,
  isCurrentScopeEmbeddedScope,
  isFilePathEslintignored,
  isFilePathExcluded,
  isFilePathWhitelisted,
  isWhitelistProvided,
  isFormatOnSaveEnabled,
  isLinterEslintAutofixEnabled,
  shouldUseEslint,
  shouldRespectEslintignore,
  getGuacamoleOptions,
  getGuacamoleEslintOptions,
  runLinter,
  getDebugInfo,
};
