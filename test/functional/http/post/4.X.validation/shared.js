'use strict';

var node = require('../../../../node');
var shared = require('../../../shared');

var sendTransactionPromise = require('../../../../common/apiHelpers').sendTransactionPromise;
var waitForConfirmations = require('../../../../common/apiHelpers').waitForConfirmations;

function beforeValidationPhase (scenarios) {

	var transactionsToWaitFor = [];

	before(function () {
		//Crediting accounts
		return node.Promise.all(Object.keys(scenarios).map(function (type) {
			if (type === 'no_funds') {
				return;
			}

			var transaction = node.lisk.transaction.createTransaction(scenarios[type].account.address, scenarios[type].amount, node.gAccount.password);

			return sendTransactionPromise(transaction).then(function (res) {
				node.expect(res).to.have.property('status').to.equal(200);
				transactionsToWaitFor.push(transaction.id);
			});
		})).then(function () {
			return waitForConfirmations(transactionsToWaitFor);
		});
	});
};

module.exports = {
	beforeValidationPhase: beforeValidationPhase
};
