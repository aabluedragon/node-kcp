const kcp = require('../index');
const Kcp = kcp.KCP;
const dgram = require('dgram');
const { log } = require('./common');

const kcpObj = new Kcp(255, { address: '127.0.0.1', port: 22333 });
const client = dgram.createSocket('udp4');

kcpObj.output((data, size, context) => {
    client.send(data, 0, size, context.port, context.address);
});

client.on('error', (err) => {
    log(`cleint error:${err.stack}`);
    client.close();
});

client.on('message', (msg, rinfo) => {
    kcpObj.input(msg, true, false);
});

setInterval(() => {
    const now = Date.now();
    kcpObj.update(now);
    const size = kcpObj.peeksize();
    if (size > 0) {
        const buffer = kcpObj.recv();
        log(`recv: ${buffer}`);
    }
}, 100);

setInterval(() => {
    const msg = Buffer.from(new Date().toISOString());
    log(`send: ${msg}`);
    kcpObj.send(msg);
}, 1000);
