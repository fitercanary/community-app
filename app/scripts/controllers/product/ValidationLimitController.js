(function (module) {
    mifosX.controllers = _.extend(module, {
        ValidationLimitController: function (scope, resourceFactory, location) {
            scope.validationLimits = [];

            scope.routeTo = function (id) {
               location.path('/viewvalidationlimit/' + id);
            };

            resourceFactory.validationLimitResource.getAllValidationLimit(function (data) {
                scope.validationLimits = data;
                console.log(scope.validationLimits);
            });
        }
    });
    mifosX.ng.application.controller('ValidationLimitController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.ValidationLimitController]).run(function ($log) {
        $log.info("ValidationLimitController initialized");
    });
}(mifosX.controllers || {}));