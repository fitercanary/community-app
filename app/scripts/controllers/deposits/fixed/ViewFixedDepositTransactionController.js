(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFixedDepositTransactionController: function (scope, resourceFactory, location, routeParams, dateFilter, $uibModal) {
            scope.flag = false;
            resourceFactory.fixedDepositTrxnsResource.get({savingsId: routeParams.accountId, transactionId: routeParams.transactionId}, function (data) {
                scope.transaction = data;
                if (scope.transaction.transactionType.value == 'Transfer' || scope.transaction.reversed == 'true') {
                    scope.flag = true;
                }
            });

			scope.undo = function (accountId, transactionId) {
				$uibModal.open({
					templateUrl: 'undotransaction.html',
					controller: UndoTransactionModel,
					resolve: {
						accountId: function () {
							return accountId;
						},
						transactionId: function () {
							return transactionId;
						}
					}
				});
			};

			var UndoTransactionModel = function ($scope, $uibModalInstance, accountId, transactionId) {
				$scope.undoTransaction = function () {
					var params = {savingsId: accountId, transactionId: transactionId, command: 'undo'};
					var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
					formData.transactionDate = dateFilter(new Date(), scope.df);
					resourceFactory.fixedDepositTrxnsResource.save(params, formData, function (data) {
						location.path('/viewfixeddepositaccount/' + data.savingsId);
					});
				};
//				$scope.undoTransaction = function () {
//					var params = {savingsId: accountId, transactionId: transactionId, command: 'undo'};
//					var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
//					formData.transactionDate = dateFilter(new Date(), scope.df);
//					resourceFactory.savingsTrxnsResource.save(params, formData, function (data) {
//						$uibModalInstance.close('delete');
//						location.path('/viewsavingaccount/' + data.savingsId);
//					});
//				};
				$scope.cancel = function () {
					$uibModalInstance.dismiss('cancel');
				};
			};

//            scope.undoTransaction = function (accountId, transactionId) {
//                var params = {savingsId: accountId, transactionId: transactionId, command: 'undo'};
//                var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
//                formData.transactionDate = dateFilter(new Date(), scope.df);
//                resourceFactory.fixedDepositTrxnsResource.save(params, formData, function (data) {
//                    location.path('/viewfixeddepositaccount/' + data.savingsId);
//                });
//            };
        }
    });
    mifosX.ng.application.controller('ViewFixedDepositTransactionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$uibModal', mifosX.controllers.ViewFixedDepositTransactionController]).run(function ($log) {
        $log.info("ViewFixedDepositTransactionController initialized");
    });
}(mifosX.controllers || {}));
