(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCheckerinboxController: function (scope, resourceFactory, routeParams, location, $uibModal) {
            scope.details = {};
            scope.creditsArray = [];
            scope.debitsArray = [];
            scope.glOperation = false;
            scope.jsondata = [];

            resourceFactory.auditResource.get({templateResource: routeParams.id}, function (data) {
                scope.details = data;
                scope.commandAsJson = data.commandAsJson;
                var obj = JSON.parse(scope.commandAsJson);

                _.each(obj, function (value, key) {
                    scope.jsondata.push({name: key, property: value});
                });

                switch (data.entityName) {
                    case 'SAVINGSACCOUNT':
                        scope.handleSavingsEntityName(scope, data);
                        break;
                    case 'RECURRINGDEPOSITACCOUNT':
                        scope.handleRecurringDepositEntityName(scope, data);
                        break;
                    case 'FIXEDDEPOSITACCOUNT':
                        scope.handleFixedDepositEntityName(scope, data);
                        break;

                    default:
                        scope.entityName = 'Unknown';
                }

               
            });



            let getGlAccountData = function(data,isCreditsArray) {
                resourceFactory.accountCoaResource.get({glAccountId: data.glAccountId}, function (glAccount) {
                    let glData = {};
                    glData['approval.accountName'] = glAccount.name;
                    glData['approval.glCode'] = glAccount.glCode;                    
                    glData['approval.glType'] = glAccount.type.value;
                    glData['approval.accountType'] = 'GL Account';
                    glData['approval.amount'] = data.amount;

                    if(glAccount.description){
                        glData['approval.description'] = glAccount.description;
                    }

                    isCreditsArray ? scope.creditsArray.push(glData) : scope.debitsArray.push(glData);

                });
            }

            let savingsAccountData = function (data,isCreditsArray) {
                resourceFactory.savingsOverdraftResource.get({accountId: data.savingsAccountId}, function (savingsAccount) {
                    let savingsData = {};

                    savingsData['approval.accountName'] = savingsAccount.clientName;
                    savingsData['approval.accountNo'] = savingsAccount.accountNo;
                    savingsData['approval.productName'] = savingsAccount.savingsProductName;
                    savingsData['approval.accountType'] = savingsAccount.depositType.value;
                    savingsData['approval.amount'] = data.amount;


                    isCreditsArray ? scope.creditsArray.push(savingsData) : scope.debitsArray.push(savingsData);

                   }
                );
            }

            let savingsApprovalData = function (data) {

                let commandAsJson = JSON.parse(data.commandAsJson);

                scope.jsondata = []
                if (commandAsJson.approvedOnDate) {
                    scope.jsondata.push({ 'name': 'approval.transactionDate', 'property': commandAsJson.approvedOnDate });
                }

                if (commandAsJson.createdOnDate) {
                    scope.jsondata.push({ 'name': 'approval.transactionDate', 'property': commandAsJson.createdOnDate });
                }

                scope.jsondata.push({ 'name': 'approval.accountName', 'property': data.clientName });

                if (data.savingsAccountNo) {
                    scope.jsondata.push({ 'name': 'approval.accountNo', 'property': data.savingsAccountNo });
                }
                scope.jsondata.push({ 'name': 'approval.officeName', 'property': data.officeName });

            }

            let savingsCreationData = function (data) {

                let commandAsJson = JSON.parse(data.commandAsJson);
                savingsApprovalData(data);
                
                Object.keys(commandAsJson).forEach(element => {
                    scope.jsondata.push({ 'name': element, 'property': commandAsJson[element] });
                });

            }

            let handleSavingsTransactionData = function (data,commandAsJson) {

                    scope.jsondata =[]
                    scope.jsondata.push({'name': 'approval.transactionDate', 'property': commandAsJson.transactionDate});
                    scope.jsondata.push({'name': 'approval.accountName',  'property': data.clientName});
                    scope.jsondata.push({'name': 'approval.accountNo', 'property':data.savingsAccountNo});
                    scope.jsondata.push({'name': 'approval.officeName', 'property': data.officeName});
                    scope.jsondata.push({'name': 'approval.amount', 'property': commandAsJson.transactionAmount});

            }

            scope.handleSavingsEntityName = function (scope, data) {
                let commandAsJson = JSON.parse(data.commandAsJson);
                let credits;
                let savingsCredits;
                let debits;
                let savingsDebits;

                switch (data.actionName) {
                    case 'MULTIPLEPOSTINGS':

                        credits = commandAsJson.credits;
                        savingsCredits = commandAsJson.savingsCredits;
                        debits = commandAsJson.debits;
                        savingsDebits = commandAsJson.savingsDebits;

                        _.each(credits, function (credit) {
                            getGlAccountData(credit, true);

                        });

                        _.each(debits, function (debit) {
                            getGlAccountData(debit, false);
                        });

                        _.each(savingsCredits, function (savingsCredit) {
                            savingsAccountData(savingsCredit, true);
                        });

                        _.each(savingsDebits, function (savingsDebit) {
                            savingsAccountData(savingsDebit, false);
                        });

                        scope.glOperation = true;

                        break;
                    case 'DEPOSIT':
                    case 'WITHDRAWAL':

                        handleSavingsTransactionData(data, commandAsJson);
                        break;
                    case 'APPROVE':
                        savingsApprovalData(data);
                        break;
                    case 'CREATE':
                        savingsCreationData(data);
                        break;
                    default:
                        scope.entityName = 'Unknown';

                }
            };

            scope.handleRecurringDepositEntityName = function (scope, data) {

                switch (data.actionName) {
                    case 'APPROVE':
                        savingsApprovalData(data);
                    case 'CREATE':
                        savingsCreationData(data);
                        break;
                    default:
                        scope.entityName = 'Unknown';

                }

            }

            scope.handleFixedDepositEntityName = function (scope, data) {

                switch (data.actionName) {
                    case 'APPROVE':
                        savingsApprovalData(data);
                        break;
                    case 'CREATE':
                        savingsCreationData(data);
                        break;
                    default:
                        scope.entityName = 'Unknown';

                }

            }



            scope.checkerApprove = function (action) {
                $uibModal.open({
                    templateUrl: 'approve.html',
                    controller: ApproveCtrl,
                    resolve: {
                        action: function () {
                            return action;
                        }
                    }
                });
            };
            var ApproveCtrl = function ($scope, $uibModalInstance, action) {
                $scope.approve = function () {
                    resourceFactory.checkerInboxResource.save({templateResource: routeParams.id, command: action}, {}, function (data) {
                        $uibModalInstance.close('approve');
                        location.path('/checkeractionperformed');
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

			scope.checkerReject = function (action) {
                $uibModal.open({
                    templateUrl: 'reject.html',
                    controller: RejectCtrl,
                    resolve: {
                        action: function () {
                            return action;
                        }
                    }
                });
            };
			var RejectCtrl = function ($scope, $uibModalInstance, action) {
                $scope.reject = function () {
                    resourceFactory.checkerInboxResource.save({templateResource: routeParams.id, command: action}, {}, function (data) {
                        $uibModalInstance.close('reject');
                        location.path('/checkeractionperformed');
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };
            scope.checkerDelete = function () {
                $uibModal.open({
                    templateUrl: 'delete.html',
                    controller: DeleteCtrl
                });
            };
            var DeleteCtrl = function ($scope, $uibModalInstance) {
                $scope.delete = function () {
                    resourceFactory.checkerInboxResource.delete({templateResource: routeParams.id}, {}, function (data) {
                        $uibModalInstance.close('delete');
                        location.path('/checkeractionperformed');
                    });
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('ViewCheckerinboxController', ['$scope', 'ResourceFactory', '$routeParams', '$location', '$uibModal', mifosX.controllers.ViewCheckerinboxController]).run(function ($log) {
        $log.info("ViewCheckerinboxController initialized");
    });
}(mifosX.controllers || {}));