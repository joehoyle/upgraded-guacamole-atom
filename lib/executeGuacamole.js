const { allowUnsafeNewFunction } = require('loophole');

const {
  getGuacamoleOptions,
  getCurrentFilePath,
  getGuacamole,
  shouldDisplayErrors,
  shouldUseEslint,
  runLinter,
} = require('./helpers');

const EMBEDDED_JS_REGEX = /<script\b[^>]*>([\s\S]*?)(?=<\/script>)/gi;

const displayError = (error) => {
  atom.notifications.addError('guacamole-atom failed!', {
    detail: error,
    stack: error.stack,
    dismissable: true,
  });
};

const handleError = (error) => {
  if (shouldDisplayErrors()) displayError(error);
  return false;
};

const executeGuacamole = (editor, text) => {
    // const guacamole = getGuacamole(getCurrentFilePath(editor));
    // const guacamoleOptions = getGuacamoleOptions(editor);
	//
    // return guacamole.format(text, guacamoleOptions);
    console.log('formatting ' + text)
};

const executeGuacamoleOnBufferRange = (editor, bufferRange) => {
  const cursorPositionPriorToFormat = editor.getCursorScreenPosition();
  const textToTransform = editor.getTextInBufferRange(bufferRange);
  const transformed = executeGuacamole(editor, textToTransform);

  const isTextUnchanged = transformed === textToTransform;
  if (!transformed || isTextUnchanged) return;

  editor.setTextInBufferRange(bufferRange, transformed);
  editor.setCursorScreenPosition(cursorPositionPriorToFormat);
  runLinter(editor);
};

module.exports = {
  executeGuacamoleOnBufferRange,
};
