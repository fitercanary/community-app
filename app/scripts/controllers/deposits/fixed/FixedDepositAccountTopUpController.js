(function (module) {
    mifosX.controllers = _.extend(module, {
        FixedDepositAccountTopUpController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.data = {};
            scope.accountId = routeParams.id;
            scope.savingAccountId = routeParams.id;
            scope.formData = {depositAmount: 0, depositPeriodFrequencyId: 0, interestRate: 0};
            scope.restrictDate = new Date();
            scope.changeTenure = false;
            scope.topUpAmount = 0;
            scope.origTenure = null;
            scope.date = {submittedOnDate: new Date()};
            scope.changeInterestRate = false;

            resourceFactory.fixedDepositAccountResource.get({
                accountId: scope.accountId,
                template: 'true'
            }, function (data) {
                scope.data = data;
                scope.chart = data.accountChart;
                scope.chartSlabs = scope.chart.chartSlabs;
                scope.calculateRemainingTenure();
                scope.calculateNewDepositAmount();
            });

            scope.calculateNewDepositAmount = () => {
                scope.formData.depositAmount = parseFloat(scope.data.depositAmount) + parseFloat(scope.topUpAmount);
                scope.calculateRemainingTenure();
            };

            scope.calculateRemainingTenure = () => {
                if (!scope.changeTenure && scope.date.submittedOnDate) {
          
                    scope.formData.depositPeriod = scope.data.depositPeriod;
                    if (scope.origTenure === null) scope.origTenure = scope.formData.depositPeriod;
                }
                scope.calculateInterestRate();
            };

            scope.validatePeriod = () => {
                if (scope.origTenure && scope.origTenure > scope.formData.depositPeriod) {
                    scope.formData.depositPeriod = scope.origTenure;
                    scope.calculateRemainingTenure();
                }
            };

            scope.calculateInterestRate = () => {
                let amount = parseFloat(scope.formData.depositAmount);
                let depositPeriod = parseFloat(scope.formData.depositPeriod);
                let periodFrequency = scope.formData.depositPeriodFrequencyId;
                let filteredSlabs = scope.chartSlabs.filter(function (x) {
                    return amount >= x.amountRangeFrom && (amount <= x.amountRangeTo || !x.amountRangeTo)
                });
                filteredSlabs.map(x => {
                    let period = scope.computePeriod(depositPeriod, periodFrequency, x.periodType.id);
                    if (period && x.fromPeriod <= period && x.toPeriod >= period) {
                        scope.formData.interestRate = x.annualInterestRate;
                    }
                });
            };

            scope.cancel = function () {
                location.path('/viewfixeddepositaccount/' + routeParams.id);
            };

            scope.submit = function () {
                const params = {command: "topUp", accountId: scope.accountId};
                if (scope.date) {
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate, scope.df);
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.changeTenure = scope.changeTenure;
                resourceFactory.fixedDepositAccountResource.save(params, this.formData, () => location.path('/viewclient/' + scope.data.clientId));
            };

            scope.computePeriod = function (depositPeriod, depositPeriodFrequency, filteredPeriod) {
                if (depositPeriodFrequency === filteredPeriod) {
                    return depositPeriod;
                }
                if (filteredPeriod === 1) {
                    return depositPeriod / 7;
                } else if (filteredPeriod === 2) {
                    return depositPeriod / 30;
                } else if (filteredPeriod === 3) {
                    return depositPeriod / 365;
                }
            };
        }
    });
    mifosX.ng.application.controller('FixedDepositAccountTopUpController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.FixedDepositAccountTopUpController]).run(function ($log) {
        $log.info("FixedDepositAccountTopUpController initialized");
    });
}(mifosX.controllers || {}));
