const { executeGuacamoleOnBufferRange, executeGuacamoleOnEmbeddedScripts } = require('./executeGuacamole');
const {
  isFormatOnSaveEnabled,
  getCurrentFilePath,
  isCurrentScopeEmbeddedScope,
  isFilePathExcluded,
  isInScope,
  isFilePathWhitelisted,
  isWhitelistProvided,
} = require('./helpers');

const formatOnSaveIfAppropriate = (editor) => {
  if (!isFormatOnSaveEnabled()) return;

  const filePath = getCurrentFilePath(editor);

  if (!filePath) return;

  if (filePath && isWhitelistProvided() && !isFilePathWhitelisted(filePath)) {
    return;
  }

  if (filePath && !isFilePathWhitelisted(filePath)) {
    if (!isInScope(editor)) return;
    if (filePath && isFilePathExcluded(filePath)) return;
  }

  if (isCurrentScopeEmbeddedScope(editor)) {
    executeGuacamoleOnEmbeddedScripts(editor);
  } else {
    executeGuacamoleOnBufferRange(editor, editor.getBuffer().getRange());
  }
};

module.exports = formatOnSaveIfAppropriate;
