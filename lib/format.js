const { executeGuacamoleOnBufferRange } = require('./executeGuacamole');
const { isCurrentScopeEmbeddedScope } = require('./helpers');

const formatSelectedBufferRanges = (editor) =>
  editor.getSelectedBufferRanges().forEach(bufferRange => executeGuacamoleOnBufferRange(editor, bufferRange));

const format = (editor) => {
  if (editor.getSelectedText()) {
    formatSelectedBufferRanges(editor);
  } else {
    executeGuacamoleOnBufferRange(editor, editor.getBuffer().getRange());
  }
};

module.exports = format;
