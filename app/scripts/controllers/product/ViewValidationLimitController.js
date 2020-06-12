(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewValidationLimitController: function (scope, routeParams, resourceFactory, location, $uibModal) {
            scope.validationLimit = [];
            scope.choice = 0;
            resourceFactory.validationLimitResource.getValidationLimit({validationLimitId: routeParams.id}, function (data) {
                scope.validationLimit = data;
            });
        }
    });
    mifosX.ng.application.controller('ViewValidationLimitController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$uibModal', mifosX.controllers.ViewValidationLimitController]).run(function ($log) {
        $log.info("ViewValidationLimitController initialized");
    });
}(mifosX.controllers || {}));
