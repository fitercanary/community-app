(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskController: function (scope, resourceFactory, route, dateFilter, $uibModal, location, $rootScope) {
            scope.clients = [];
            scope.loans = [];
            scope.offices = [];
            var idToNodeMap = {};
            scope.formData = {};
            scope.loanTemplate = {};
            scope.loanDisbursalTemplate = {};
            scope.date = {};
            scope.checkData = [];
            scope.isCollapsed = true;
            scope.approveData = {};
            scope.restrictDate = new Date();
            //this value will be changed within each specific tab
            scope.requestIdentifier = "loanId";

            scope.authorizationRequestData = [];
            scope.authorizationRequestTemplate = {};

            scope.itemsPerPage = 15;

            scope.loanRescheduleData = [];
            scope.checkForBulkLoanRescheduleApprovalData = [];
            scope.rescheduleData = function(){
              resourceFactory.loanRescheduleResource.getAll({command:'pending'}, function (data) {
                scope.loanRescheduleData = data;
              });
            };
            scope.rescheduleData();

            resourceFactory.checkerInboxResource.get({templateResource: 'searchtemplate'}, function (data) {
                scope.checkerTemplate = data;
            });
            resourceFactory.checkerInboxResource.search({includeJson: true},function (data) {
                scope.searchData = data;
                var i;
                for (i=0;i<scope.searchData.length;i++){
                    scope.json = scope.searchData[i].commandAsJson;
                    var obj = JSON.parse(scope.json);
                    _.each(obj, function (value, key) {
                        if(key === 'transactionAmount' || key === 'amount' || key === 'principal') {
                            scope.searchData[i].transactionAmount = value;
                        }
                        else if(key === 'credits'){
                            var j;
                            var journalAmount = 0.00;
                            for(j=0;j<obj.credits.length;j++){
                                journalAmount = journalAmount + Number(obj.credits[j].amount);
                            }
                            scope.searchData[i].transactionAmount = journalAmount;
                        }
                    });
                }
                });
            scope.viewUser = function (item) {
                scope.userTypeahead = true;
                scope.formData.user = item.id;
            };
            scope.checkerInboxAllCheckBoxesClicked = function() {
                var newValue = !scope.checkerInboxAllCheckBoxesMet();
                if(!angular.isUndefined(scope.searchData)) {
                    for (var i = scope.searchData.length - 1; i >= 0; i--) {
                        scope.checkData[scope.searchData[i].id] = newValue;
                    };
                }
            }
            scope.checkerInboxAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.searchData)) {
                    _.each(scope.searchData, function(data) {
                        if(_.has(scope.checkData, data.id)) {
                            if(scope.checkData[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.searchData.length);
                }
            }
            scope.clientApprovalAllCheckBoxesClicked = function(officeName) {
                var newValue = !scope.clientApprovalAllCheckBoxesMet(officeName);
                if(!angular.isUndefined(scope.groupedClients[officeName])) {
                    for (var i = scope.groupedClients[officeName].length - 1; i >= 0; i--) {
                        scope.approveData[scope.groupedClients[officeName][i].id] = newValue;
                    };
                }
            }
            scope.clientApprovalAllCheckBoxesMet = function(officeName) {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.groupedClients[officeName])) {
                    _.each(scope.groupedClients[officeName], function(data) {
                        if(_.has(scope.approveData, data.id)) {
                            if(scope.approveData[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.groupedClients[officeName].length);
                }
            }
            scope.loanApprovalAllCheckBoxesClicked = function(office) {
                var newValue = !scope.loanApprovalAllCheckBoxesMet(office);
                if(!angular.isUndefined(scope.offices)) {
                    for (var i = office.loans.length - 1; i >= 0; i--) {
                        scope.loanTemplate[office.loans[i].id] = newValue;
                    };
                }
            }
            scope.loanApprovalAllCheckBoxesMet = function(office) {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.offices)) {
                    _.each(office.loans, function(data) {
                        if(_.has(scope.loanTemplate, data.id)) {
                            if(scope.loanTemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===office.loans.length);
                }
            }
            scope.loanDisbursalAllCheckBoxesClicked = function() {
                var newValue = !scope.loanDisbursalAllCheckBoxesMet();
                if(!angular.isUndefined(scope.loans)) {
                    for (var i = scope.loans.length - 1; i >= 0; i--) {
                        scope.loanDisbursalTemplate[scope.loans[i].id] = newValue;
                    };
                }
            }
            scope.loanDisbursalAllCheckBoxesMet = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.loans)) {
                    _.each(scope.loans, function(data) {
                        if(_.has(scope.loanDisbursalTemplate, data.id)) {
                            if(scope.loanDisbursalTemplate[data.id] == true) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return (checkBoxesMet===scope.loans.length);
                }
            }
            scope.approveOrRejectChecker = function (action) {
                if (scope.checkData) {
                    $uibModal.open({
                        templateUrl: 'approvechecker.html',
                        controller: CheckerApproveCtrl,
                        resolve: {
                            action: function () {
                                return action;
                            }
                        }
                    });
                }
            };
            var CheckerApproveCtrl = function ($scope, $uibModalInstance, action) {
                $scope.approve = function () {
                    var totalApprove = 0;
                    var approveCount = 0;
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {
                            totalApprove++;
                        }
                    });
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {

                            resourceFactory.checkerInboxResource.save({templateResource: key, command: action}, {}, function (data) {
                                approveCount++;
                                if (approveCount == totalApprove) {
                                    scope.search();
                                }
                            }, function (data) {
                                approveCount++;
                                if (approveCount == totalApprove) {
                                    scope.search();
                                }
                            });
                        }
                    });
                    scope.checkData = {};
                    $uibModalInstance.close('approve');

                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.deleteChecker = function () {
                if (scope.checkData) {
                    $uibModal.open({
                        templateUrl: 'deletechecker.html',
                        controller: CheckerDeleteCtrl
                    });
                }
            };
            var CheckerDeleteCtrl = function ($scope, $uibModalInstance) {
                $scope.delete = function () {
                    var totalDelete = 0;
                    var deleteCount = 0
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {
                            totalDelete++;
                        }
                    });
                    _.each(scope.checkData, function (value, key) {
                        if (value == true) {

                            resourceFactory.checkerInboxResource.delete({templateResource: key}, {}, function (data) {
                                deleteCount++;
                                if (deleteCount == totalDelete) {
                                    scope.search();
                                }
                            }, function (data) {
                                deleteCount++;
                                if (deleteCount == totalDelete) {
                                    scope.search();
                                }
                            });
                        }
                    });
                    scope.checkData = {};
                    $uibModalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.approveClient = function () {
                if (scope.approveData) {
                    $uibModal.open({
                        templateUrl: 'approveclient.html',
                        controller: ApproveClientCtrl,
                        resolve: {
                            items: function () {
                                return scope.approveData;
                            }
                        }
                    });
                }
            };

            $('#mifos-reskin-ui-container').on('scroll',function () {
                if ($(this).scrollTop() > 100) {
                    $('.head-affix').css({
                        position: "fixed",
                        top: "50px",
                        width: "80%"
                    });

                } else {
                    $('.head-affix').css({
                        position: 'static',
                        width: "100%"
                    });
                }
            });

            var ApproveClientCtrl = function ($scope, $uibModalInstance, items) {
                $scope.restrictDate = new Date();
                $scope.date = {};
                $scope.date.actDate = new Date();
                $scope.approve = function (act) {
                    var activate = {}
                    activate.activationDate = dateFilter(act, scope.df);
                    activate.dateFormat = scope.df;
                    activate.locale = scope.optlang.code;
                    var totalClient = 0;
                    var clientCount = 0
                    _.each(items, function (value, key) {
                        if (value == true) {
                            totalClient++;
                        }
                    });

                    scope.batchRequests = [];
                    scope.requestIdentifier = "clientId";

                    var reqId = 1;
                    _.each(items, function (value, key) {
                        if (value == true) {
                            scope.batchRequests.push({requestId: reqId++, relativeUrl: "clients/"+key+"?command=activate",
                            method: "POST", body: JSON.stringify(activate)});
                        }
                    });

                    resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                        for(var i = 0; i < data.length; i++) {
                            if(data[i].statusCode = '200') {
                                clientCount++;
                                if (clientCount == totalClient) {
                                    route.reload();
                                }
                            }

                        }
                    });

                    scope.approveData = {};
                    $uibModalInstance.close('delete');
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            };

            scope.routeTo = function (id) {
                location.path('viewcheckerinbox/' + id);
            };

            scope.routeToClient = function (id) {
                location.path('viewclient/' + id);
            };

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                for (var i in data) {
                    data[i].loans = [];
                    idToNodeMap[data[i].id] = data[i];
                }
                scope.loanResource = function () {
                    resourceFactory.loanResource.getAllLoans({limit: '1000', sqlSearch: 'l.loan_status_id in (100,200)'}, function (loanData) {
                        scope.loans = loanData.pageItems;
                        for (var i in scope.loans) {
                            if (scope.loans[i].status.pendingApproval) {
                                var tempOffice = undefined;
                                if (scope.loans[i].clientOfficeId) {
                                    tempOffice = idToNodeMap[scope.loans[i].clientOfficeId];
                                    tempOffice.loans.push(scope.loans[i]);
                                } else {
                                    if (scope.loans[i].group) {
                                        tempOffice = idToNodeMap[scope.loans[i].group.officeId];
                                        tempOffice.loans.push(scope.loans[i]);
                                    }
                                }
                            }
                        }

                        var finalArray = [];
                        for (var i in scope.offices) {
                            if (scope.offices[i].loans && scope.offices[i].loans.length > 0) {
                                finalArray.push(scope.offices[i]);
                            }
                        }
                        scope.offices = finalArray;
                    });
                };
                scope.loanResource();
            });


            resourceFactory.clientResource.getAllClients({sqlSearch: 'c.status_enum=100'}, function (data) {
                scope.groupedClients = _.groupBy(data.pageItems, "officeName");
            });

            scope.search = function () {
                scope.isCollapsed = true;
                var reqFromDate = dateFilter(scope.date.from, 'yyyy-MM-dd');
                var reqToDate = dateFilter(scope.date.to, 'yyyy-MM-dd');
                var params = {};
                if (scope.formData.action) {
                    params.actionName = scope.formData.action;
                }
                ;

                if (scope.formData.entity) {
                    params.entityName = scope.formData.entity;
                }
                ;

                if (scope.formData.resourceId) {
                    params.resourceId = scope.formData.resourceId;
                }
                ;

                if (scope.formData.user) {
                    params.makerId = scope.formData.user;
                }
                ;

                if (scope.date.from) {
                    params.makerDateTimeFrom = reqFromDate;
                }
                ;

                if (scope.date.to) {
                    params.makerDateTimeto = reqToDate;
                }
                ;
                resourceFactory.checkerInboxResource.search(params, function (data) {
                    scope.searchData = data;
                    if (scope.userTypeahead) {
                        scope.formData.user = '';
                        scope.userTypeahead = false;
                        scope.user = '';
                    }
                });
            };

            scope.approveLoan = function () {
                if (scope.loanTemplate) {
                    $uibModal.open({
                        templateUrl: 'approveloan.html',
                        controller: ApproveLoanCtrl
                    });
                }
            };

            var ApproveLoanCtrl = function ($scope, $uibModalInstance) {
                $scope.approve = function () {
                    scope.bulkApproval();
                    route.reload();
                    $uibModalInstance.close('approve');
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }

            scope.bulkApproval = function () {
                scope.formData.approvedOnDate = dateFilter(new Date(), scope.df);
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.loanTemplate, function (value, key) {
                    if (value == true) {
                        selectedAccounts++;
                    }
                });

                scope.batchRequests = [];
                scope.requestIdentifier = "loanId";

                var reqId = 1;
                _.each(scope.loanTemplate, function (value, key) {
                    if (value == true) {
                        scope.batchRequests.push({requestId: reqId++, relativeUrl: "loans/"+key+"?command=approve",
                        method: "POST", body: JSON.stringify(scope.formData)});
                    }
                });

                resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].statusCode = '200') {
                            approvedAccounts++;
                            data[i].body = JSON.parse(data[i].body);
                            scope.loanTemplate[data[i].body.loanId] = false;
                            if (selectedAccounts == approvedAccounts) {
                                scope.loanResource();
                            }
                        }

                    }
                });
            };

            scope.disburseLoan = function () {
                if (scope.loanDisbursalTemplate) {
                    $uibModal.open({
                        templateUrl: 'disburseloan.html',
                        controller: DisburseLoanCtrl
                    });
                }
            };

            var DisburseLoanCtrl = function ($scope, $uibModalInstance) {
                $scope.disburse = function () {
                    scope.bulkDisbursal();
                    route.reload();
                    $uibModalInstance.close('disburse');
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }

            scope.bulkDisbursal = function () {
                scope.formData.actualDisbursementDate = dateFilter(new Date(), scope.df);
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;

                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.loanDisbursalTemplate, function (value, key) {
                    if (value == true) {
                        selectedAccounts++;
                    }
                });

                scope.batchRequests = [];
                scope.requestIdentifier = "loanId";

                var reqId = 1;
                _.each(scope.loanDisbursalTemplate, function (value, key) {
                    if (value == true) {
                        scope.batchRequests.push({requestId: reqId++, relativeUrl: "loans/"+key+"?command=disburse",
                        method: "POST", body: JSON.stringify(scope.formData)});
                    }
                });

                resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                    for(var i = 0; i < data.length; i++) {
                        if(data[i].statusCode = '200') {
                            approvedAccounts++;
                            data[i].body = JSON.parse(data[i].body);
                            scope.loanDisbursalTemplate[data[i].body.loanId] = false;
                            if (selectedAccounts == approvedAccounts) {
                                scope.loanResource();
                            }
                        }

                    }
                });
            };
            scope.approveBulkLoanReschedule = function () {
              if (scope.checkForBulkLoanRescheduleApprovalData) {
                $uibModal.open({
                  templateUrl: 'loanreschedule.html',
                  controller: ApproveBulkLoanRescheduleCtrl
                });
              }
            };

              var ApproveBulkLoanRescheduleCtrl = function ($scope, $uibModalInstance) {
                $scope.approveLoanReschedule = function () {
                  scope.bulkLoanRescheduleApproval();
                  route.reload();
                  $uibModalInstance.close('approveLoanReschedule');
                };
                $scope.cancel = function () {
                  $uibmodalInstance.dismiss('cancel');
                };
              }
              scope.checkerInboxAllCheckBoxesClickedForBulkLoanRescheduleApproval = function() {                var newValue = !scope.checkerInboxAllCheckBoxesMetForBulkLoanRescheduleApproval();
                scope.checkForBulkLoanRescheduleApprovalData = [];
                if(!angular.isUndefined(scope.loanRescheduleData)) {
                  for (var i = scope.loanRescheduleData.length - 1; i >= 0; i--) {        scope.checkForBulkLoanRescheduleApprovalData[scope.loanRescheduleData[i].id] = newValue;
                  };
                }
              }
              scope.checkerInboxAllCheckBoxesMetForBulkLoanRescheduleApproval = function() {
                var checkBoxesMet = 0;
                if(!angular.isUndefined(scope.loanRescheduleData)) {
                  _.each(scope.loanRescheduleData, function(data) {
                    if(_.has(scope.checkForBulkLoanRescheduleApprovalData, data.id)) {
                      if(scope.checkForBulkLoanRescheduleApprovalData[data.id] == true) {
                        checkBoxesMet++;
                      }
                    }
                  });
                  return (checkBoxesMet===scope.loanRescheduleData.length);
                }
              }
              scope.bulkLoanRescheduleApproval = function () {
                scope.formData.approvedOnDate = dateFilter(new Date(), scope.df);
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.checkForBulkLoanRescheduleApprovalData, function (value, key) {
                  if (value == true) {
                    selectedAccounts++;
                  }
                });
                scope.batchRequests = [];
                scope.requestIdentifier = "RESCHEDULELOAN";
                var reqId = 1;
                _.each(scope.checkForBulkLoanRescheduleApprovalData, function (value, key) {
                  if (value == true) {
                    var url =  "rescheduleloans/"+key+"?command=approve";
                    var bodyData = JSON.stringify(scope.formData);
                    var batchData = {requestId: reqId++, relativeUrl: url, method: "POST", body: bodyData};
                    scope.batchRequests.push(batchData);
                    }
                  });
                  resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                    for(var i = 0; i < data.length; i++) {
                      if(data[i].statusCode = '200') {
                        approvedAccounts++;
                        data[i].body = JSON.parse(data[i].body);      scope.checkForBulkLoanRescheduleApprovalData[data[i].body.resourceId] = false;
                      }
                    }
                  });
                };
            // Request Authorization
            scope.approveAuthorizationRequestToViewClient = function () {
                if (scope.authorizationRequestTemplate) {
                    $uibModal.open({
                        templateUrl: 'authorizationrequesttoviewclient.html',
                        controller: ApproveAuthorizationRequestToViewClientCtrl
                    });
                }
            };

            var ApproveAuthorizationRequestToViewClientCtrl = function ($scope, $uibModalInstance) {
                $scope.durationTypes = [{id: 1, name: 'Hours'}, {id: 2, name: 'Days'}, {id: 3, name: 'Weeks'},
                    {id: 4, name: 'Months'}, {id: 5, name: 'Years'}];

                $scope.formData = {};

                $scope.approve = function (durationType, duration, comment) {
                    scope.bulkRequestToViewClientApproval(durationType, duration, comment);
                    scope.loadAuthorizationRequestToViewClientData();
                    $uibModalInstance.close('approve');
                };
                $scope.reject = function () {
                    scope.bulkRequestToViewClientReject();
                    scope.loadAuthorizationRequestToViewClientData();
                    $uibModalInstance.close('reject');
                };
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
            }

            scope.bulkRequestToViewClientApproval = function (durationType, duration, comment) {
                scope.params = {};
                scope.params.locale = scope.optlang.code;
                scope.params.durationType = durationType;
                scope.params.duration = duration;
                scope.params.comment = comment;
                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.authorizationRequestTemplate, function (value) {
                    if (value) {
                        selectedAccounts++;
                    }
                });

                scope.batchRequests = [];
                scope.requestIdentifier = "authorizationRequestId";

                var reqId = 1;
                _.each(scope.authorizationRequestTemplate, function (value, key) {
                    if (value) {
                        scope.batchRequests.push({
                            requestId: reqId++, relativeUrl: "users/requestauthorization/" + key + "?command=approve",
                            method: "POST", body: JSON.stringify(scope.params)
                        });
                    }
                });

                resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].statusCode === 200) {
                            approvedAccounts++;
                            data[i].body = JSON.parse(data[i].body);
                            scope.authorizationRequestTemplate[data[i].body.id] = false;
                            if (selectedAccounts === approvedAccounts) {
                                scope.loadAuthorizationRequestToViewClientData();
                            }
                        }

                    }
                });
            };

            // reject
            scope.bulkRequestToViewClientReject = function () {
                var selectedAccounts = 0;
                var approvedAccounts = 0;
                _.each(scope.authorizationRequestTemplate, function (value) {
                    if (value) {
                        selectedAccounts++;
                    }
                });

                scope.batchRequests = [];
                scope.requestIdentifier = "authorizationRequestId";

                var reqId = 1;
                _.each(scope.authorizationRequestTemplate, function (value, key) {
                    if (value) {
                        scope.batchRequests.push({
                            requestId: reqId++, relativeUrl: "users/requestauthorization/" + key + "?command=reject",
                            method: "POST", body: JSON.stringify(scope.formData)
                        });
                    }
                });

                resourceFactory.batchResource.post(scope.batchRequests, function (data) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].statusCode === 200) {
                            approvedAccounts++;
                            data[i].body = JSON.parse(data[i].body);
                            scope.authorizationRequestTemplate[data[i].body.id] = false;
                            if (selectedAccounts === approvedAccounts) {
                                scope.loadAuthorizationRequestToViewClientData();
                            }
                        }

                    }
                });
            };

            scope.authorizationRequestApprovalAllCheckBoxesClicked = function () {
                let newValue = !scope.authorizationRequestApprovalAllCheckBoxesMet();
                if (!angular.isUndefined(scope.authorizationRequestData)) {
                    for (let i = scope.authorizationRequestData.length - 1; i >= 0; i--) {
                        scope.authorizationRequestTemplate[scope.authorizationRequestData[i].id] = newValue;
                    }
                }
            }
            scope.authorizationRequestApprovalAllCheckBoxesMet = function () {
                let checkBoxesMet = 0;
                if (!angular.isUndefined(scope.authorizationRequestData)) {
                    _.each(scope.authorizationRequestData, function (data) {
                        if (_.has(scope.authorizationRequestTemplate, data.id)) {
                            if (scope.authorizationRequestTemplate[data.id]) {
                                checkBoxesMet++;
                            }
                        }
                    });
                    return checkBoxesMet === scope.authorizationRequestData.length;
                }
            }

            // authorization request
            scope.loadAuthorizationRequestToViewClientData = function () {
                resourceFactory.userAuthorizationListResource.getPending({}, function (data) {
                    scope.authorizationRequestData = data;
                });
            };
            
            if($rootScope.hasPermission("APPROVEREQUESTTOVIEWCLIENT_AUTHORIZATIONREQUEST")){
                scope.loadAuthorizationRequestToViewClientData();
            }
        }
    });
    mifosX.ng.application.controller('TaskController', ['$scope', 'ResourceFactory', '$route', 'dateFilter', '$uibModal', '$location', '$rootScope', mifosX.controllers.TaskController]).run(function ($log) {
        $log.info("TaskController initialized");
    });
}(mifosX.controllers || {}));
