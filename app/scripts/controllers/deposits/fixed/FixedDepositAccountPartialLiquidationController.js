(function (module) {
    mifosX.controllers = _.extend(module, {
        FixedDepositAccountPartialLiquidationController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.data = {};
            scope.accountId = routeParams.id;
            scope.savingAccountId = routeParams.id;
            scope.formData = {liquidationAmount: 0, depositPeriodFrequencyId: 0};
            scope.restrictDate = new Date();
            scope.changeTenure = false;
            scope.date = {submittedOnDate: new Date()};

            resourceFactory.fixedDepositAccountResource.get({
                accountId: scope.accountId,
                template: 'true'
            }, function (data) {
                scope.data = data;
                scope.chart = data.accountChart;
                scope.chartSlabs = scope.chart.chartSlabs;
                scope.calculateRemainingTenure();
                scope.fetchMaturityAmount();
            });

            scope.fetchMaturityAmount = () => {
                let formData = {
                    locale: scope.optlang.code,
                    dateFormat: scope.df,
                    closedOnDate: dateFilter(scope.date.submittedOnDate, scope.df)
                };
                resourceFactory.fixedDepositAccountResource.save({accountId: routeParams.id, command: 'calculatePrematureAmount'}, formData, function (data) {
                    scope.data.maturityAmount = data.maturityAmount;
                    scope.calculateOutstanding();
                });
            };

            scope.calculateRemainingTenure = () => {
                if (!scope.changeTenure && scope.date.submittedOnDate) {
                    let today = Array.isArray(scope.date.submittedOnDate) ? dateFilter(scope.date.submittedOnDate, scope.df) : scope.date.submittedOnDate;
                    let maturityDate = new Date(dateFilter(scope.data.maturityDate, scope.df));
                    scope.formData.depositPeriod = Math.floor((maturityDate - today) / (1000 * 60 * 60 * 24));
                }
                scope.fetchMaturityAmount();
                scope.calculateInterestRate();
                scope.calculateInterest();
            };

            scope.calculateOutstanding = () => {
                scope.balanceAfterLqdn = scope.data.maturityAmount - scope.formData.liquidationAmount;
                scope.calculateRemainingTenure();
            };

            scope.calculateInterestRate = () => {
                let amount = parseFloat(scope.balanceAfterLqdn);
                let depositPeriod = parseFloat(scope.formData.depositPeriod);
                let periodFrequency = scope.formData.depositPeriodFrequencyId;
                let filteredSlabs = scope.chartSlabs.filter(function (x) {
                    return amount >= x.amountRangeFrom && (amount <= x.amountRangeTo || !x.amountRangeTo)
                });
                filteredSlabs.map(x => {
                    let period = scope.computePeriod(depositPeriod, periodFrequency, x.periodType.id);
                    if (period && x.fromPeriod <= period && x.toPeriod >= period) {
                        scope.interestRate = x.annualInterestRate;
                    }
                });
            };

            scope.calculateInterest = function () {
                let dailyRate = (scope.interestRate / 100) / 365;
                scope.interestToBeEarned = scope.balanceAfterLqdn * dailyRate * scope.formData.depositPeriod;
                scope.maturityAmount = scope.balanceAfterLqdn + scope.interestToBeEarned;
            };

            scope.cancel = function () {
                location.path('/viewfixeddepositaccount/' + routeParams.id);
            };

            scope.submit = function () {
                const params = {command: "partialLiquidation", accountId: scope.accountId};
                if (scope.date) {
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate, scope.df);
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
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
    mifosX.ng.application.controller('FixedDepositAccountPartialLiquidationController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.FixedDepositAccountPartialLiquidationController]).run(function ($log) {
        $log.info("FixedDepositAccountPartialLiquidationController initialized");
    });
}(mifosX.controllers || {}));
