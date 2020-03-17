(function (module) {
    mifosX.controllers = _.extend(module, {
        EditValidationLimitController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.template = [];


            resourceFactory.validationLimitResource.getValidationLimit({validationLimitId: routeParams.id, template :true}, function (data) {
                scope.template = data;

                scope.formData = {
                    clientLevelId  : data.clientLevelId,
                    maximumSingleDepositAmount : data.maximumSingleDepositAmount,
                    maximumCumulativeBalance : data.maximumCumulativeBalance,
                    maximumTransactionLimit : data.maximumTransactionLimit,
                    maximumDailyTransactionAmountLimit : data.maximumDailyTransactionAmountLimit
                };
            });
            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                resourceFactory.validationLimitResource.update({validationLimitId: routeParams.id}, this.formData, function (data) {
                    location.path('/validationlimit');
                });
            };
        }
    });
    mifosX.ng.application.controller('EditValidationLimitController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditValidationLimitController]).run(function ($log) {
        $log.info("EditValidationLimitController initialized");
    });
}(mifosX.controllers || {}));
