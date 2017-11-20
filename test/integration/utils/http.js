'use strict';

var popsicle = require('popsicle');

var headers = {
	'Accept': 'application/json',
	'Content-Type': 'application/json'
};

var endpoints = {
	versions: {
		'0.9.*': {
			getBlocks: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/blocks';
			},
			getHeight: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/blocks/getHeight';
			},
			getTransactions: function (ip, port) {
				return 'http://' + ip + ':' + port + '/peer/blocks';
			},
			postTransaction: function (ip, port) {
				return 'http://' + ip + ':' + port + '/peer/transactions';
			},
			enableForging: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/delegates/forging/enable';
			}
		},
		'1.0.0': {
			getBlocks: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/blocks';
			},
			getHeight: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/node/status';
			},
			postTransaction: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/transactions';
			},
			enableForging: function (ip, port) {
				return 'http://' + ip + ':' + port + '/api/delegates/forging';
			}
		}
	}
};

var currentVersion = '0.9.*';

module.exports = {

	getVersion: function () {
		return currentVersion;
	},

	setVersion: function (version) {
		currentVersion = version;
	},

	getBlocks: function (port, ip) {
		return popsicle.get({
			url: endpoints.versions[currentVersion].getBlocks(ip || '127.0.0.1', port || 4000),
			headers: headers
		}).then(function (res) {
			return res.body.blocks;
		});
	},

	getHeight: function (port, ip) {
		return popsicle.get({
			url: endpoints.versions[currentVersion].getHeight(ip || '127.0.0.1', port || 4000),
			headers: headers
		}).then(function (res) {
			return res.body.height;
		});
	},

	getTransactions: function (port, ip) {
		return popsicle.get({
			url: endpoints.versions[currentVersion].getTransactions(ip || '127.0.0.1', port || 4000),
			headers: headers
		}).then(function (res) {
			return res.body.blocks;
		});
	},

	postTransaction: function (transaction, port, ip) {
		return popsicle.post({
			url: endpoints.versions[currentVersion].postTransaction(ip || '127.0.0.1', port || 4000),
			headers: headers,
			data: {
				transaction: transaction
			}
		}).then(function (res) {
			return res.body.blocks;
		});
	},

	enableForging: function (secret, port, ip) {
		return popsicle.post({
			url: endpoints.versions[currentVersion].enableForging(ip || '127.0.0.1', port || 4000),
			headers: headers,
			data: {
				secret: secret
			}
		}).then(function (res) {
			if (!res.body.success) {
				throw new Error('Unable to enable forging for delagate with secret: ' + secret);
			}
			return res.body.success;
		});
	}
};
