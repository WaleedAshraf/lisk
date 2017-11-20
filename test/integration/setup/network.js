'use strict';

var async = require('async');
var Promise = require('bluebird');
var waitUntilBlockchainReady = require('../../common/globalBefore').waitUntilBlockchainReady;
var utils = require('../utils');

module.exports = {

	waitForAllNodesToBeReady: function (configurations, cb) {
		async.forEachOf(configurations, function (configuration, index, eachCb) {
			waitUntilBlockchainReady(eachCb, 20, 2000, 'http://' + configuration.ip + ':' + configuration.port);
		}, cb);
	},

	enableForgingOnDelegates: function (configurations, cb) {
		var enableForgingPromises = [];
		configurations.forEach(function (configuration) {
			configuration.secrets.map(function (secret) {
				var enableForgingPromise = utils.http.enableForging(secret, configuration.port);
				enableForgingPromises.push(enableForgingPromise);
			});
		});
		Promise.all(enableForgingPromises).then(function () {
			cb();
		}).catch(cb);
	}
};
