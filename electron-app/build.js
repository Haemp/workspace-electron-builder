const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
    targets: Platform.MAC.createTarget(),
    config: {
        mac: {
            target: 'dir'
        },
        asar: false
    }
})
    .then(_ => console.log('Successfully built!'))
    .catch(console.error)
