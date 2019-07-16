(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientIdentifierController: function (scope, routeParams, location, resourceFactory,dateFilter) {
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.documenttypes = [];
            scope.statusTypes = [{
                id: 1,
                label: 'Active'
            }, {
                id: 2,
                label: 'Inactive',
            }];



            resourceFactory.clientIdenfierTemplateResource.get({clientId: routeParams.clientId}, function (data) {
                scope.documenttypes = data.allowedDocumentTypes;
                scope.formData.documentTypeId = data.allowedDocumentTypes[0].id;
            });

            scope.submit = function () {
            var obj = {
                     'documentTypeId' : this.formData.documentTypeId,
                      'documentKey': this.formData.documentKey,
                       'description':this.formData.description,
                        'status':this.formData.status,
                         'issueDate' : dateFilter(this.formData.issueDate , 'dd MMMM yyyy'),
                         'expiryDate' :  dateFilter(this.formData.expiryDate , 'dd MMMM yyyy'),
                          'locale' : scope.optlang.code
                      }
                obj.dateFormat = scope.df;
                resourceFactory.clientIdenfierResource.save({clientId: scope.clientId}, obj, function (data) {
                    location.path('/viewclient/' + data.clientId);
                });
            };

        }
    });
    mifosX.ng.application.controller('ClientIdentifierController', ['$scope', '$routeParams', '$location', 'ResourceFactory','dateFilter', mifosX.controllers.ClientIdentifierController]).run(function ($log) {
        $log.info("ClientIdentifierController initialized");
    });
}(mifosX.controllers || {}));

