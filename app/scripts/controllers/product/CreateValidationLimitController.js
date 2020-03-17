(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateValidationLimitController: function (scope, resourceFactory, location, dateFilter, translate) {
            scope.template = [];
            scope.formData = {};

            resourceFactory.validationLimitTemplateResource.get(function (data) {
                scope.template = data;
            });


            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                resourceFactory.validationLimitResource.save(this.formData, function (data) {
                    location.path('/validationlimit');
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateValidationLimitController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$translate', mifosX.controllers.CreateValidationLimitController]).run(function ($log) {
        $log.info("CreateValidationLimitController initialized");
    });
}(mifosX.controllers || {}));
