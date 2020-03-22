'use strict';

const SftpWatcher = require('sftp-watcher');

module.exports = (RED) => {
    function SftpWatcherNode(config) {
        const node = this;

        RED.nodes.createNode(node, config);
        RED.nodes.getNode(config.device);

        node.status({});
        node.status({
            fill: 'yellow',
            shape: 'dot',
            text: 'connecting...'
        });

        const {
            host,
            port,
            user,
            password,
            path
        } = config;

        const regex = new RegExp(config.regex || '');

        const sftp = new SftpWatcher({
            host,
            port,
            user,
            password,
            path
        });

        sftp.on('close', (data) => {
            node.status({
                color: 'red',
                shape: 'dot',
                text: 'disconnected'
            });

            node.warn('disconnected', data);
        });

        sftp.on('connected', (data) => {
            node.status({
                color: 'green',
                shape: 'dot',
                text: 'connected'
            });

            node.log('connected', data);
        });

        sftp.on('error', (err) => {
            node.status({
                color: 'red',
                shape: 'dot',
                text: `error: ${err}`
            });

            node.error('errored', err);
        });

        sftp.on('upload', (data) => {
            node.log('file uploaded', data.filename);

            if (regex && !regex.test(data.filename)) {
                node.log('file does not match regex', data.filename);
                return;
            }

            node.send({
                payload: {
                    file
                }
            });
        });

    };

    RED.nodes.registerType('sftp-watcher', SftpWatcherNode, {
        host: 'string',
        port: 'integer',
        user: 'text',
        password: 'password',
        path: 'string',
        regex: 'string',
        path: 'string'
    });
};
