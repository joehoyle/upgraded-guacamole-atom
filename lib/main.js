'use babel';

const config = require('./config-schema.json');
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
const { CompositeDisposable } = require('atom');

// local helpers
let format = null;
let formatOnSave = null;
let displayDebugInfo = null;
let subscriptions = null;

// HACK: lazy load most of the code we need for performance
const lazyFormat = () => {
	if (!format) format = require('./format'); // eslint-disable-line global-require

	const editor = atom.workspace.getActiveTextEditor();
	if (editor) format(editor);
};

// HACK: lazy load most of the code we need for performance
const lazyFormatOnSave = () => {
	if (!formatOnSave) formatOnSave = require('./formatOnSave'); // eslint-disable-line global-require

	const editor = atom.workspace.getActiveTextEditor();
	if (editor) formatOnSave(editor);
};

// HACK: lazy load most of the code we need for performance
const lazyDisplayDebugInfo = () => {
	if (!displayDebugInfo) {
		// eslint-disable-next-line global-require
		displayDebugInfo = require('./displayDebugInfo');
	}
	displayDebugInfo();
};

// public API
const activate = () => {
	subscriptions = new CompositeDisposable();

	subscriptions.add(
		atom.commands.add('atom-workspace', 'guacamole:format', lazyFormat)
	);
	subscriptions.add(
		atom.commands.add('atom-workspace', 'guacamole:debug', lazyDisplayDebugInfo)
	);
	subscriptions.add(
		atom.workspace.observeTextEditors(editor =>
			subscriptions.add(
				editor.getBuffer().onWillSave(() => lazyFormatOnSave(editor))
			)
		)
	);

	// HACK: an Atom bug seems to be causing old configuration settings to linger for some users
	//       https://github.com/jlongster/guacamole-atom/issues/72
	atom.config.unset('guacamole-atom.singleQuote');
	atom.config.unset('guacamole-atom.trailingComma');
};

const deactivate = () => {
	subscriptions.dispose();
};

module.exports = {
	activate,
	deactivate,
	config,
	subscriptions,
};
