'use strict';

var expect = require('chai').expect;
var Promise = require('bluebird');
var devConfig = require('../../config.json');
var utils = require('./utils');
var setup = require('./setup');

describe('given configurations for nodes A, B, C running on ip "0.0.0.0" on ports 4000, 4001, 4002', function () {

	var configurations;

	before(function () {
		configurations = {
			nodeA: devConfig,
			nodeB: devConfig,
			nodeC: devConfig
		};
		configurations.nodeA.port = 4000;
		configurations.nodeB.port = 4001;
		configurations.nodeC.port = 4002;
		utils.http.setVersion('0.9.*');
	});

	describe('node A is forging with all delegates, blacklists B and is unable to broadcast transactions', function () {

		before(function () {
			configurations.nodeA.peers.access.blackList = [configurations.nodeB.ip + ':' + configurations.nodeB.port];
			configurations.nodeA.broadcasts.broadcastLimit = 0;
		});

		describe('node B is forging with all delegates, blacklists A and is unable to broadcast transactions', function () {

			before(function () {
				configurations.nodeB.peers.access.blackList = [configurations.nodeA.ip + ':' + configurations.nodeA.port];
				configurations.nodeB.broadcasts.broadcastLimit = 0;
			});

			describe('node C is not forging, has connections with nodes A and B', function () {

				before(function () {
					configurations.nodeC.forging.secret = [];
				});

				describe('when network is set up', function () {

					before(function (done) {
						setup.setupNetwork([
							configurations.nodeA,
							configurations.nodeB,
							configurations.nodeC
						], done);
					});

					describe('public client is sending different transactions every second to nodes A and B to cause different id blocks generation', function () {

						before(function () {
							var sendPeriodically = function sendPeriodically (interval) {
								Promise.all([
									utils.http.postTransaction(utils.transactions.generateValidTransaction(), configurations.nodeA.port),
									utils.http.postTransaction(utils.transactions.generateValidTransaction(), configurations.nodeB.port)
								]).then(function () {
									setTimeout(sendPeriodically, interval);
								}).catch(function (error) {
									console.error('Failed to post transaction to local node', error);
									setup.exit();
								});
							};
							sendPeriodically(1000);
						});

						describe('when network runs for 3 minutes', function () {

							before(function (done) {
								setTimeout(done, 3 * 60 * 1000);
							});
							
							it('nodes A, B, C should have same height', function () {
								return Promise.all([
									utils.http.getHeight(configurations.nodeA.port),
									utils.http.getHeight(configurations.nodeB.port),
									utils.http.getHeight(configurations.nodeC.port)
								]).then(function (heights) {
									expect(heights[0]).eql(heights[1]);
									expect(heights[0]).eql(heights[2]);
								});
							});

							it('nodes A, B, C should have the same blocks', function () {
								return Promise.all([
									utils.http.getBlocks(configurations.nodeA.port),
									utils.http.getBlocks(configurations.nodeB.port),
									utils.http.getBlocks(configurations.nodeC.port)
								]).then(function (blocksResponses) {
									expect(blocksResponses[0]).eql(blocksResponses[1]);
									expect(blocksResponses[0]).eql(blocksResponses[2]);
								});
							});

							it('nodes A, B, C should have the same transactions', function () {
								return Promise.all([
									utils.http.getTransactions(configurations.nodeA.port),
									utils.http.getTransactions(configurations.nodeB.port),
									utils.http.getTransactions(configurations.nodeC.port)
								]).then(function (transactionResponses) {
									expect(transactionResponses[0]).eql(transactionResponses[1]);
									expect(transactionResponses[0]).eql(transactionResponses[2]);
								});
							});
						});
					});
				});
			});
		});
	});
});
