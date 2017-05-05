const { getDebugInfo } = require('./helpers');

const displayDebugInfo = () => {
  const info = getDebugInfo();
  const details = [
    `Atom version: ${info.atomVersion}`,
    `guacamole-atom version: ${info.guacamoleAtomVersion}`,
    `guacamole version: ${info.guacamoleVersion}`,
    `guacamole-atom configuration: ${JSON.stringify(info.guacamoleAtomConfig, null, 2)}`,
  ].join('\n');
  atom.notifications.addInfo('guacamole-atom: details on current install', {
    detail: details,
    dismissable: true,
  });
};

module.exports = displayDebugInfo;
