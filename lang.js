const os = require('os');

function getUILanguage() {
    return os.locale();
}

module.exports = (scratch) => {
    scratch.extensions.register(function () {
        scratch.extensions.importIcon('https://raw.githubusercontent.com/scratch-ext/locale/master/icon.png');
        scratch.extensions.registerReporter(function () {
            return getUILanguage();
        }, 'uiLanguage');
    }, {
        blocks: [
            {
                opcode: 'uiLanguage',
                blockType: 'reporter',
                text: 'lingua del sistema operativo'
            }
        ]
    });
};
