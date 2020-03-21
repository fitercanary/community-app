(function (module) {
    mifosX.controllers = _.extend(module, {
        TransactionClassificationController: function (scope, resourceFactory, location,WizardHandler,$route) {
                scope.transactionClassifications = [];
                resourceFactory.transactionClassificationResource.getAllTransactionClassifications(function(data){
                    scope.transactionClassifications = data;
                });
            scope.deletetransactionClassification = function(id){
                scope.formData = {"transactionClassificationId":id};
                resourceFactory.transactionClassificationResource.delete(scope.formData,function(){
                    $route.reload();
                });
            };
            scope.createTransactionClassification = function(){
              resourceFactory.transactionClassificationResource.save(scope.formData,function(){
                  location.path('/transactionclassification');
              });
            };
        }
    });

    mifosX.ng.application.controller('TransactionClassificationController', ['$scope', 'ResourceFactory', '$location','WizardHandler', '$route', mifosX.controllers.TransactionClassificationController]).run(function ($log) {
        $log.info("TransactionClassificationController initialized");
    });
}(mifosX.controllers || {}));