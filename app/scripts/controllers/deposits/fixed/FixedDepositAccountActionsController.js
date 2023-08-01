(function (module) {
    mifosX.controllers = _.extend(module, {
        FixedDepositAccountActionsController: function (scope, rootScope, resourceFactory, location, routeParams, dateFilter, $sce, API_VERSION) {

            scope.action = routeParams.action || "";
            scope.accountId = routeParams.id;
            scope.savingAccountId = routeParams.id;
            scope.formData = {};
            scope.restrictDate = new Date();
            // Transaction UI Related
            scope.isAccountClose = false;
            scope.showPaymentDetails = false;
            scope.paymentTypes = [];
            scope.activationChargeAmount = 0;
            scope.totalAmountIncludingActivationCharge = 0;
            scope.depositAmount = 0;
            scope.paramValue = 0;
            scope.showBlock = false;
            scope.report = false;
            if(scope.action=='activate'){
                resourceFactory.fixedDepositAccountResource.get({accountId: scope.savingAccountId, associations:'charges'}, function (data) {
                        scope.totalAmountIncludingActivationCharge = data.depositAmount+parseFloat(data.activationCharge);
                        scope.depositAmount = data.depositAmount;
                        scope.activationChargeAmount = data.activationCharge;
                 });
            }

            switch (scope.action) {
                case "postAccrualInterestAsOn":
                    scope.labelName = 'label.input.transactiondate';
                    scope.modelName = 'transactionDate';
                    scope.showDateField = true;
                    scope.showAccountNumber=true;
                    break;
                case "approve":
                    scope.title = 'label.heading.approvefixeddepositaccount';
                    scope.labelName = 'label.input.savingaccountapprovedOnDate';
                    scope.modelName = 'approvedOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = true;
                    scope.actionName = 'Approve application';
                    break;
                case "reject":
                    scope.title = 'label.heading.rejectfixeddepositaccount';
                    scope.labelName = 'label.input.rejectedon';
                    scope.modelName = 'rejectedOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = true;
                    scope.actionName = 'Reject application';
                    break;
                case "withdrawnByApplicant":
                    scope.title = 'label.heading.withdrawnfixeddepositaccount';
                    scope.labelName = 'label.input.withdrawnon';
                    scope.modelName = 'withdrawnOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = true;
                    scope.actionName = 'Withdrawn by applicant';
                    break;
                case "undoapproval":
                    scope.title = 'label.heading.undoapprovefixeddepositaccount';
                    scope.showDateField = false;
                    scope.showNoteField = true;
                    scope.actionName = 'Undo Approve application';
                    break;
                case "activate":
                    scope.title = 'label.heading.activatefixeddepositaccount';
                    scope.labelName = 'label.input.activatedon';
                    scope.modelName = 'activatedOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = false;
                    scope.actionName = 'Approve application';
                    break;
                case "close":
                    resourceFactory.fixedDepositAccountResource.get({accountId: routeParams.id, resourceType: 'template', command: 'close'},
                        function (data) {
                            scope.maturityAmount = data.maturityAmount;
                            scope.onAccountClosureOptions = data.onAccountClosureOptions;
                            scope.savingsAccounts = data.savingsAccounts;
                            scope.paymentTypes = data.paymentTypeOptions;
                            scope.currency = data.currency;
                        });
                    scope.title = 'label.heading.closefixeddepositaccount';
                    scope.labelName = 'label.input.closedon';
                    scope.modelName = 'closedOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = true;
                    scope.isAccountClose = true;
                    break;
                case "prematureClose":
                    scope.title = 'label.heading.prematureclosefixeddepositaccount';
                    scope.labelName = 'label.input.preMatureCloseOnDate';
                    scope.modelName = 'closedOnDate';
                    scope.showDateField = true;
                    scope.showNoteField = false;
                    scope.retrievePreMatureAmount = true;
                    break;
                case "modifytransaction":
                    resourceFactory.fixedDepositTrxnsResource.get({savingsId: scope.accountId, transactionId: routeParams.transactionId, template: 'true'},
                        function (data) {
                            scope.title = 'label.heading.editfixeddepositaccounttransaction';
                            scope.labelName = 'label.input.transactiondate';
                            scope.modelName = 'transactionDate';
                            scope.formData[scope.modelName] = new Date(data.date) || new Date();
                            scope.paymentTypes = data.paymentTypeOptions;
                            scope.formData.transactionAmount = data.amount;
                            if (data.paymentDetailData) {
                                if (data.paymentDetailData.paymentType) {
                                    scope.formData.paymentTypeId = data.paymentDetailData.paymentType.id;
                                }
                                scope.formData.accountNumber = data.paymentDetailData.accountNumber;
                                scope.formData.checkNumber = data.paymentDetailData.checkNumber;
                                scope.formData.routingCode = data.paymentDetailData.routingCode;
                                scope.formData.receiptNumber = data.paymentDetailData.receiptNumber;
                                scope.formData.bankNumber = data.paymentDetailData.bankNumber;
                            }
                        });
                    scope.showDateField = true;
                    scope.showNoteField = false;
                    scope.isTransaction = true;
                    scope.showPaymentDetails = false;
                    scope.showPaymentType = true;
                    scope.showAmount = true;
                    break;
                case "editsavingcharge":
                    resourceFactory.savingsResource.get({accountId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId},
                        function (data) {
                            scope.formData.amount = data.amount;
                            if (data.feeOnMonthDay) {
                                scope.dateArray = [];
                                scope.dateArray.push(2013)
                                for (var i in data.feeOnMonthDay) {
                                    scope.dateArray.push(data.feeOnMonthDay[i]);
                                }
                                var feeOnMonthDay = dateFilter(scope.dateArray, scope.df);
                                scope.formData.feeOnMonthDayFullDate = new Date(feeOnMonthDay);
                                scope.labelName = 'label.heading.savingaccounttransactionDate';
                                scope.modelName = 'feeOnMonthDayFullDate';
                                scope.showDateField = true;
                                scope.showAnnualAmountField = true;
                                scope.showAmountField = false;
                            } else {
                                scope.labelName = 'label.amount';
                                scope.modelName = 'amount';
                                scope.showDateField = false;
                                scope.showAnnualAmountField = false;
                                scope.showAmountField = true;
                            }
                        });
                    break;
                case "deletesavingcharge":
                    scope.showDelete = true;
                    break;
                case "paycharge":
                    scope.formData.dueDate = new Date();
                    resourceFactory.savingsResource.get({accountId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId,
                        command: 'paycharge'}, function (data) {
                        scope.formData.amount = data.amountOutstanding;
                    });
                    scope.labelName = 'label.amount';
                    scope.showAmountField = true;
                    scope.paymentDatefield = true;
                    scope.modelName = 'dueDate';
                    break;
                case "waive":
                    scope.waiveCharge = true;
                    break;
                case "downloadInvestmentLetter":
                    scope.title = 'label.heading.downloadinvestmentletter';

                    resourceFactory.savingsResource.get({accountId: routeParams.id, associations: 'all'
                    }, function (data) {
                        scope.report = true;
                        scope.reportName = 'Savings Investment Contract';
        
                        scope.baseURL = rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent(scope.reportName);
                        scope.baseURL += "?output-type=" + encodeURIComponent('PDF') + "&tenantIdentifier=" + rootScope.tenantIdentifier+"&locale="+scope.optlang.code + "&dateFormat=" + scope.df;
                        scope.reportParams = encodeURIComponent("R_accountno") + "=" + encodeURIComponent(data.accountNo);

                        if (scope.reportParams > "") {
                            scope.baseURL += "&" + scope.reportParams;
                        }
        
                        // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                        scope.viewReportResult = $sce.trustAsResourceUrl(scope.baseURL+"&output=embed");
                    })
                    break;
                case "freeze":
                    scope.showBlock = true;
                    console.log(scope.showBlock);
                    resourceFactory.savingsResource.get({accountId: routeParams.id, associations: 'all'
                                           }, function (data) {
                    scope.savingsDetails = data;
                    scope.blockNarrationTypes = data.blockNarrationOptions;
                    scope.blockNarration = data.blockNarration;
                    console.log(data);
                        if(!data.subStatus.block){
                         if(data.subStatus.blockDebit ){
                          if(rootScope.hasPermission("UNBLOCKDEBIT_SAVINGSACCOUNT")){
                          scope.debitStatus = true;
                           scope.buttonTextDebit = "label.button.unblockDebit";
                           scope.taskPermissionNameDebit = 'UNBLOCKDEBIT_SAVINGSACCOUNT';
                          }
                         }else{
                          if(rootScope.hasPermission("BLOCKDEBIT_SAVINGSACCOUNT")){
                           scope.debitStatus = true;
                           scope.buttonTextDebit = "label.button.blockDebit";
                           scope.taskPermissionNameDebit = 'BLOCKDEBIT_SAVINGSACCOUNT';
                           }
                          }
                         if(data.subStatus.blockCredit){
                         if(rootScope.hasPermission("UNBLOCKCREDIT_SAVINGSACCOUNT")){
                          scope.creditStatus = true;
                           scope.buttonTextCredit = "label.button.unblockCredit";
                          scope.taskPermissionNameCredit = 'UNBLOCKCREDIT_SAVINGSACCOUNT';}
                         }else{
                         if(rootScope.hasPermission("BLOCKCREDIT_SAVINGSACCOUNT")){
                         scope.creditStatus = true;
                            scope.buttonTextCredit = "label.button.blockCredit";
                            scope.taskPermissionNameCredit = 'BLOCKCREDIT_SAVINGSACCOUNT';
                            }
                         }}
                         else{
                         if(rootScope.hasPermission("UNBLOCKDEBIT_SAVINGSACCOUNT")){
                              scope.debitStatus = true;
                               scope.buttonTextDebit = "label.button.unblockDebit";
                               scope.taskPermissionNameDebit = 'UNBLOCKDEBIT_SAVINGSACCOUNT';
                           }
                         if(rootScope.hasPermission("UNBLOCKCREDIT_SAVINGSACCOUNT")){
                               scope.creditStatus = true;
                               scope.buttonTextCredit = "label.button.unblockCredit";
                               scope.taskPermissionNameCredit = 'UNBLOCKCREDIT_SAVINGSACCOUNT';
                         }
                       }

                    });
                break;
            }

            scope.cancel = function () {
                location.path('/viewfixeddepositaccount/' + routeParams.id);
            };

            scope.submit = function () {
                var params = {command: scope.action};
                if (scope.action != "undoapproval") {
                    this.formData.locale = scope.optlang.code;
                    this.formData.dateFormat = scope.df;
                }
                if(scope.action=="postAccrualInterestAsOn"){
                    if (this.formData.transactionDate) {
                        this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                    }
                    this.formData.isPostInterestAsOn=true;
                }
                if (scope.action == "deposit" || scope.action == "withdrawal" || scope.action == "modifytransaction") {
                    if (scope.action == "withdrawal") {
                        if (this.formData.transactionDate) {
                            this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                        }
                    } else if (scope.action == "deposit") {
                        if (this.formData.transactionDate) {
                            this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                        }
                    }
                    if (scope.action == "modifytransaction") {
                        params.command = 'modify';
                        if (this.formData.transactionDate) {
                            this.formData.transactionDate = dateFilter(this.formData.transactionDate, scope.df);
                        }
                        params.transactionId = routeParams.transactionId;
                    }
                    params.savingsId = scope.accountId;
                    resourceFactory.fixedDepositTrxnsResource.save(params, this.formData, function (data) {
                        location.path('/viewfixeddepositaccount/' + data.savingsId);
                    });
                } else if (scope.action == "editsavingcharge") {
                    if (this.formData.feeOnMonthDayFullDate) {
                        this.formData.feeOnMonthDay = dateFilter(this.formData.feeOnMonthDayFullDate, scope.df);
                        this.formData.monthDayFormat = "dd MMM";
                        this.formData.feeOnMonthDay = this.formData.feeOnMonthDay.substring(0, this.formData.feeOnMonthDay.length - 5);
                        delete this.formData.feeOnMonthDayFullDate;
                    }
                    resourceFactory.savingsResource.update({accountId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, this.formData,
                        function (data) {
                            location.path('/viewfixeddepositaccount/' + data.savingsId);
                        });
                } else if (scope.action == "deletesavingcharge") {
                    resourceFactory.savingsResource.delete({accountId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId}, this.formData,
                        function (data) {
                            location.path('/viewfixeddepositaccount/' + data.savingsId);
                        });
                } else if (scope.action == "paycharge" || scope.action == "waive") {
                    params = {accountId: routeParams.id, resourceType: 'charges', chargeId: routeParams.chargeId, command: scope.action};
                    if (this.formData.dueDate) {
                        this.formData.dueDate = dateFilter(this.formData.dueDate, scope.df);
                    }
                    resourceFactory.savingsResource.save(params, this.formData, function (data) {
                        location.path('/viewfixeddepositaccount/' + data.savingsId);
                    });
                } else {
                    params.accountId = scope.accountId;
                    if (scope.action == "approve") {
                        if (this.formData.approvedOnDate) {
                            this.formData.approvedOnDate = dateFilter(this.formData.approvedOnDate, scope.df);
                        }
                    } else if (scope.action == "withdrawnByApplicant") {
                        if (this.formData.withdrawnOnDate) {
                            this.formData.withdrawnOnDate = dateFilter(this.formData.withdrawnOnDate, scope.df);
                        }
                    } else if (scope.action == "reject") {
                        if (this.formData.rejectedOnDate) {
                            this.formData.rejectedOnDate = dateFilter(this.formData.rejectedOnDate, scope.df);
                        }
                    } else if (scope.action == "activate") {
                        if (this.formData.activatedOnDate) {
                            this.formData.activatedOnDate = dateFilter(this.formData.activatedOnDate, scope.df);
                        }
                        /*} else if (scope.action == "applyAnnualFees" || scope.action == "paycharge" || scope.action == "waivecharge") {
                         params = {accountId : routeParams.id, resourceType : 'charges', chargeId : routeParams.chargeId, command : 'paycharge'};
                         if (this.formData.dueDate) {
                         this.formData.dueDate = dateFilter(this.formData.dueDate,scope.df);
                         }*/
                    } else if (scope.action === "close") {
                        if (this.formData.closedOnDate) {
                            this.formData.closedOnDate = dateFilter(this.formData.closedOnDate, scope.df);
                        }
                    } else if (scope.action === "prematureClose") {

                        if (this.formData.closedOnDate) {
                            this.formData.closedOnDate = dateFilter(this.formData.closedOnDate, scope.df);
                        }
                        if (scope.retrievePreMatureAmount) {
                            params = {accountId: routeParams.id, command: 'calculatePrematureAmount'};
                            resourceFactory.fixedDepositAccountResource.save(params, this.formData, function (data) {
                                scope.maturityAmount = data.maturityAmount;
                                scope.onAccountClosureOptions = data.onAccountClosureOptions;
                                scope.savingsAccounts = data.savingsAccounts;
                                scope.paymentTypes = data.paymentTypeOptions;
                                scope.currency = data.currency;
                            });
                            scope.isAccountClose = true;
                            scope.showNoteField = true;
                            scope.retrievePreMatureAmount = false;
                            return;
                        }
                    }

                    resourceFactory.fixedDepositAccountResource.save(params, this.formData, function (data) {
                        location.path('/viewfixeddepositaccount/' + data.savingsId);
                    });
                }
            };
                scope.blockUnblockDebit = function(permission){
                    console.log(permission);
                    if(scope.action == "freeze"){
                         if (permission == "BLOCKDEBIT_SAVINGSACCOUNT") {
                                    console.log(permission, "1");
                                      this.formData = {
                                        narrationId: this.formData.narrationId
                                      }
                                      scope.action = "blockDebit";
                           }
                         if (permission == "UNBLOCKDEBIT_SAVINGSACCOUNT"){
                          console.log(permission, "2");
                                          this.formData = {
                                            narrationId: this.formData.narrationId
                                          }
                                          scope.action = "unblockDebit";
                         }
                         if (permission == "BLOCKCREDIT_SAVINGSACCOUNT") {
                          console.log(permission, "3");
                                                           this.formData = {
                                                            narrationId: this.formData.narrationId
                                                           }
                                                           scope.action = "blockCredit";
                                                }
                         if (permission == "UNBLOCKCREDIT_SAVINGSACCOUNT"){
                          console.log(permission, "4");
                                                               this.formData = {
                                                                narrationId: this.formData.narrationId
                                                               }
                                                               scope.action = "unblockCredit";
                         }


                    }
                    var params = {command: scope.action, accountId : scope.accountId};

                     resourceFactory.savingsResource.save(params, this.formData, function (data) {
                        location.path('/viewfixeddepositaccount/' + data.savingsId);
                        console.log(data);
                     });
               }

        }
    });
    mifosX.ng.application.controller('FixedDepositAccountActionsController', ['$scope', '$rootScope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$sce', 'API_VERSION', mifosX.controllers.FixedDepositAccountActionsController]).run(function ($log) {
        $log.info("FixedDepositAccountActionsController initialized");
    });
}(mifosX.controllers || {}));
