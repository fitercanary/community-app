(function (module) {
    mifosX.controllers = _.extend(module, {
        ApproveLoanRestructureRequestController: function (scope, resourceFactory, routeParams, location, dateFilter) {
            scope.formData = {};
            scope.loanId = routeParams.loanId;
            scope.requestId = routeParams.requestId;

            scope.cancel = function () {
                location.path('/loans/' + scope.loanId + '/approverestructurerequest/'+scope.requestId);
            };
            scope.approve = function(){
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.approvedOnDate = dateFilter(this.formData.approvedOnDate, scope.df);

                resourceFactory.loanRestructureResource.approve(
                    {loanId: scope.loanId, requestId:scope.requestId},
                    this.formData,
                    function (data) {
                    location.path('/viewloanaccount/' + scope.loanId);
                });
            };
        }
    });
    mifosX.ng.application.controller('ApproveLoanRestructureRequestController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', mifosX.controllers.ApproveLoanRestructureRequestController]).run(function ($log) {
        $log.info("ApproveLoanRestructureRequestController initialized");
    });
}(mifosX.controllers || {}));
