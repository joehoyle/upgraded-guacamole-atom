'use babel';

const { allowUnsafeNewFunction } = require('loophole');
const { spawn } = require('child_process');

const {
	getGuacamoleOptions,
	getCurrentFilePath,
	getGuacamole,
	shouldDisplayErrors,
	runLinter,
} = require('./helpers');

const EMBEDDED_JS_REGEX = /<script\b[^>]*>([\s\S]*?)(?=<\/script>)/gi;

const displayError = error => {
	atom.notifications.addError('guacamole-atom failed!', {
		detail: error,
		stack: error.stack,
		dismissable: true,
	});
};

const handleError = error => {
	if (shouldDisplayErrors()) displayError(error);
	return false;
};

const executeGuacamole = (editor, text, callback) => {
	// const guacamole = getGuacamole(getCurrentFilePath(editor));
	// const guacamoleOptions = getGuacamoleOptions(editor);
	//
	// return guacamole.format(text, guacamoleOptions);
	const path = getGuacamole();
	const opts = {
		stdio: 'pipe',
	};
	const child = spawn(`php`, [`${path}`]);
	//const child = spawn(`whoami`);
	child.stdin.write(text);
	child.stdin.end();
	var response = '';
	child.stdout.on('data', data => (response += data));
	child.stdout.on('error', error => console.log());
	child.on('close', () => callback(response));
	//callback('formatting ' + text);
};

const executeGuacamoleOnBufferRange = (editor, bufferRange) => {
	const cursorPositionPriorToFormat = editor.getCursorScreenPosition();
	const textToTransform = editor.getTextInBufferRange(bufferRange);
	executeGuacamole(editor, textToTransform, transformed => {
		const isTextUnchanged = transformed === textToTransform;
		if (!transformed || isTextUnchanged) return;

		editor.setTextInBufferRange(bufferRange, transformed);
		editor.setCursorScreenPosition(cursorPositionPriorToFormat);
	});
};

module.exports = {
	executeGuacamoleOnBufferRange,
};
