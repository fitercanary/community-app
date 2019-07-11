(function (module) {
    mifosX.controllers = _.extend(module, {
        OverdraftSavingsController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.cancelRoute = routeParams.id;
            scope.formDetails = {};


            resourceFactory.savingsOverdraftResource.get({accountId: routeParams.id}, function (data) {
                scope.formData = data;
                console.log("formData ", scope.formData);
            });

            scope.submit = function () {
            this.formData.locale = scope.optlang.code;
            if(this.formData.allowOverdraft === false){
             var obj = {
                        'overdraftLimit' : '',
                        'allowOverdraft' : this.formData.allowOverdraft,
                        'nominalAnnualInterestRateOverdraft': '',
                        'minOverdraftForInterestCalculation' : '',
                        'locale' : scope.optlang.code,
                        'overdraftStartedOnDate' :  '',
                        'overdraftClosedOnDate' :  ''
                        }
            }else{
             var obj = {
                        'overdraftLimit' : this.formData.overdraftLimit,
                        'allowOverdraft' : this.formData.allowOverdraft,
                        'nominalAnnualInterestRateOverdraft': this.formData.nominalAnnualInterestRateOverdraft,
                        'minOverdraftForInterestCalculation' : this.formData.minOverdraftForInterestCalculation,
                        'locale' : scope.optlang.code,
                        'overdraftStartedOnDate' :  dateFilter(this.formData.start , scope.df),
                        'overdraftClosedOnDate' :  dateFilter(this.formData.end , scope.df)
                        }
                         obj.dateFormat = scope.df;
            }


             console.log("OverdraftSavingsController initialized ", this.formData.overdraftLimit, obj);
               resourceFactory.savingsOverdraftResource.save({accountId: routeParams.id, command: 'applyOverdraft'}, obj, function (data) {
                    console.log("data " , data);
                    location.path('/viewsavingaccount/' + routeParams.id);
               });
            };
        }
    });
    mifosX.ng.application.controller('OverdraftSavingsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter',
    mifosX.controllers.OverdraftSavingsController]).run(function ($log) {
        $log.info("OverdraftSavingsController initialized");
    });
}(mifosX.controllers || {}));
