'use babel';

const fs = require('fs');
const ignore = require('ignore');
const path = require('path');

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
  return null;
};

const getGuacamole = (filePath) => {
  return '/Users/joe/php/upgraded-guacamole/format.php';
};

const getLinesFromFilePath = (filePath) =>
  fs.readFileSync(filePath, 'utf8').split(LINE_SEPERATOR_REGEX);

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
const getConfigOption = (key) => atom.config.get(`upgraded-guacamole-atom.${key}`);

const shouldDisplayErrors = () => !getConfigOption('silenceErrors');

const getGuacamoleOption = (key) => getConfigOption(`GuacamoleOptions.${key}`);

const getCurrentFilePath = (editor) => (editor.buffer.file ? editor.buffer.file.path : undefined);

const isInScope = (editor) =>
  getConfigOption('formatOnSaveOptions.scopes').includes(getCurrentScope(editor));

const isCurrentScopeEmbeddedScope = (editor) => EMBEDDED_SCOPES.includes(getCurrentScope(editor));

const isFormatOnSaveEnabled = () => getConfigOption('formatOnSaveOptions.enabled');

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

const runLinter = (editor) =>
  (isLinterLintCommandDefined(editor)
    ? atom.commands.dispatch(atom.views.getView(editor), LINTER_LINT_COMMAND)
    : undefined);

module.exports = {
  getConfigOption,
  shouldDisplayErrors,
  getGuacamoleOption,
  getCurrentFilePath,
  getGuacamole,
  isInScope,
  isCurrentScopeEmbeddedScope,
  isFilePathExcluded,
  isFilePathWhitelisted,
  isWhitelistProvided,
  isFormatOnSaveEnabled,
  getGuacamoleOptions,
  runLinter,
};
