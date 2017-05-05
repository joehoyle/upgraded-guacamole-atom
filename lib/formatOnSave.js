'use babel';

const { executeGuacamoleOnBufferRange, executeGuacamoleOnEmbeddedScripts } = require('./executeGuacamole');
const {
  isFormatOnSaveEnabled,
  getCurrentFilePath,
  isFilePathExcluded,
  isInScope,
  isFilePathWhitelisted,
  isWhitelistProvided,
} = require('./helpers');

const formatOnSaveIfAppropriate = (editor) => {
	console.log(isFormatOnSaveEnabled());
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

  executeGuacamoleOnBufferRange(editor, editor.getBuffer().getRange());
};

module.exports = formatOnSaveIfAppropriate;
