(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanForeclosureController: function (scope, routeParams, resourceFactory, location, route, http, $uibModal, dateFilter, $filter) {
            scope.accountId = routeParams.id;
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.formData.loanId = scope.accountId;
            scope.taskTypeName = 'Foreclosure';
            scope.subTaskTypeName = 'Foreclosure';
            scope.formData.transactionDate = new Date();
            scope.restrictDate = new Date();
            scope.clientAccounts = [];
            //scope.loandetails = [];

            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'all'}, function (data) {
                scope.loandetails = data;
                scope.formData.savingsAccountId = scope.loandetails.linkedAccount != undefined ? scope.loandetails.linkedAccount.id
                : 0;
                console.log(scope.loandetails);
            });
            resourceFactory.clientAccountResource.get({clientId: scope.clientId}, function (data) {
                       angular.forEach(data.savingsAccounts, function(value){
                             if(value.status.active){
                              scope.clientAccounts.push(value);
                             }
                       });
            });

            scope.$watch('formData.transactionDate',function(){
                scope.retrieveLoanForeclosureTemplate();
            });

            scope.retrieveLoanForeclosureTemplate = function() {
                resourceFactory.loanTrxnsTemplateResource.get({
                    loanId: routeParams.id,
                    command: 'foreclosure',
                    transactionDate: dateFilter(this.formData.transactionDate, scope.df),
                    dateFormat: scope.df,
                    locale: scope.optlang.code
                }, function (data) {
                    scope.foreclosuredata = data;
                    scope.formData.outstandingPrincipalPortion = scope.foreclosuredata.principalPortion;
                    scope.formData.outstandingInterestPortion = scope.foreclosuredata.interestPortion;
                    if (scope.foreclosuredata.unrecognizedIncomePortion) {
                        scope.formData.interestAccruedAfterDeath = scope.foreclosuredata.unrecognizedIncomePortion;
                    }

                    scope.formData.outstandingFeeChargesPortion = scope.foreclosuredata.feeChargesPortion;
                    scope.formData.outstandingPenaltyChargesPortion = scope.foreclosuredata.penaltyChargesPortion;
                    scope.formData.foreClosureChargesPortion = scope.foreclosuredata.foreClosureChargesPortion;
                    scope.calculateTransactionAmount();
                    scope.paymentTypes = scope.foreclosuredata.paymentTypeOptions;

                });
            }

            scope.calculateTransactionAmount = function(){
                var transactionAmount = 0;
                transactionAmount += parseFloat(scope.foreclosuredata.principalPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.interestPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.feeChargesPortion);
                transactionAmount += parseFloat(scope.foreclosuredata.penaltyChargesPortion);
                scope.formData.transactionAmount = $filter('number')(transactionAmount, 2);
                scope.formData.transactionAmount =  scope.formData.transactionAmount.replace(/,/g,"");
            };

            scope.reCalculateTransactionAmount = function(){
                scope.calculateTransactionAmount();
                var transactionAmount = 0;
                transactionAmount += parseFloat(scope.formData.transactionAmount);
                transactionAmount -= parseFloat(scope.formData.totalWaivedAmount);
                scope.formData.transactionAmount = $filter('number')(transactionAmount, 2);
                scope.formData.transactionAmount =  scope.formData.transactionAmount.replace(/,/g,"");
            };

            scope.submit = function () {

                var fundTransferData = {
                     dateFormat: scope.df,
                     fromAccountId: this.formData.savingsAccountId,
                     fromAccountType: 2,
                     fromClientId: scope.loandetails.clientId,
                     fromOfficeId: scope.loandetails.clientOfficeId,
                     locale: scope.optlang.code,
                     toAccountId: scope.loandetails.id,
                     toAccountType: 1,
                     toClientId: scope.loandetails.clientId,
                     toOfficeId: scope.loandetails.clientOfficeId,
                     transferAmount: this.formData.transactionAmount,
                     transferDate: dateFilter(this.formData.transactionDate, scope.df),
                     transferDescription: "Foreclosure"
                   };
                resourceFactory.accountTransferResource.save(fundTransferData, function (accData) {
                 console.log(accData);
                 location.path('/viewloanaccount/' + scope.accountId);
//                    scope.foreclosureFormData = {
//                                     transactionDate: dateFilter(transactionDateChanges, scope.df),
//                                     locale:  scope.optlang.code,
//                                     dateFormat: scope.df,
//                                     note: note
//                                 };
//                                 resourceFactory.loanTrxnsResource.save({loanId: routeParams.id, command: 'foreclosure'}, scope.foreclosureFormData, function(data) {
//                                     location.path('/viewloanaccount/' + scope.accountId);
//                    });
                });

            };

            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.accountId);
            };
        }
    });
    mifosX.ng.application.controller('LoanForeclosureController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$uibModal', 'dateFilter','$filter', mifosX.controllers.LoanForeclosureController]).run(function ($log) {
        $log.info("LoanForeclosureController initialized");
    });
}(mifosX.controllers || {}));