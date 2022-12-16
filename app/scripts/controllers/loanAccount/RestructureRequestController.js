(function (module) {
    mifosX.controllers = _.extend(module, {
        RestructureRequestController: function (scope, resourceFactory, routeParams, location, dateFilter) {
            scope.loanId = routeParams.loanId;
            scope.requestId = routeParams.requestId;
            scope.editRequest = false;
            scope.loanRestructureRequestData = {};
            scope.formData = {};
            scope.rejectData = {};
            scope.minMaturityDate = null;
            scope.codes = [];
            scope.formData.submittedOnDate = new Date();
            scope.formData.modifyLoanTerm = true;
            scope.isPreview = false;
            //fetch loan details
            resourceFactory.LoanAccountResource.getLoanAccountDetails({
                loanId: routeParams.loanId,
            }, function (data) {
                scope.loandetails = data;
            });

            //fetch resources to use in requesting new schedule
            resourceFactory.loanRestructureResourceTemplate.get({
                loanId: routeParams.loanId,
            }, function (data) {
                let rescheduleReasons = data.rescheduleReasons;
                if (rescheduleReasons && rescheduleReasons.length > 0) {
                    scope.formData.rescheduleReasonId = rescheduleReasons[0].id;
                }
                scope.codes = rescheduleReasons;
                let transactionDate = new Date(data.loanTransactionData.date) || new Date();

                //existing loan restructure details
                let restructureDetails = data.restructureScheduleDetails;
                let pendingInstallments = restructureDetails.pendingInstallments;
                let totalInstallments = restructureDetails.totalInstallments;
                // scope.formData.paidInstallments = totalInstallments - pendingInstallments;
                scope.formData.pendingInstallments = pendingInstallments;
                scope.formData.totalInstallments = totalInstallments;
                scope.formData.transactionAmount = data.loanTransactionData.interestPortion
                scope.formData.interestPortion = data.loanTransactionData.interestPortion
                scope.formData.principalPortion = data.loanTransactionData.principalPortion

                let rescheduleFromDate = restructureDetails.rescheduleFromDate;


                if (rescheduleFromDate) {
                    if (new Date(rescheduleFromDate) > new Date()){
                        scope.formData.startDate = new Date();
                    }else{
                        scope.formData.startDate = new Date(rescheduleFromDate);
                    }
                } else {
                    scope.formData.startDate = new Date();
                }
                scope.formData.transactionDate = transactionDate;
                scope.formData.rescheduleFromDate = transactionDate;
                scope.transactionDate = transactionDate;

                if (data.loanTransactionData.nextDate) {
                    scope.formData.expectedMaturityDate = new Date(data.loanTransactionData.nextDate)
                    scope.minMaturityDate = new Date(data.loanTransactionData.nextDate)
                } else {
                    scope.formData.expectedMaturityDate = new Date()
                }
                // scope.minMaturityDate = scope.formatMinMaxDate(scope.loandetails.timeline.expectedMaturityDate);
                let requestId = data.restructureScheduleDetails.restructureRequestId;
                scope.requestId = requestId;
                // if (requestId && Number(requestId) > 0) {
                //     scope.getLoanRestructureDetails(resourceFactory, requestId)
                //     scope.buttons = {
                //         singlebuttons: [
                //             {
                //                 name: "button.approve",
                //                 icon: "fa fa-check",
                //                 taskPermissionName: 'APPROVE_RESTRUCTURELOAN'
                //             },
                //             {
                //                 name: "button.modifyapplication",
                //                 icon: "fa fa-pincel-square-o",
                //                 taskPermissionName: 'CREATE_RESTRUCTURELOAN'
                //             },
                //             {
                //                 name: "button.reject",
                //                 icon: "fa fa-times",
                //                 taskPermissionName: 'REJECT_RESTRUCTURELOAN'
                //             }
                //         ],
                //     }
                // }
            });

            scope.getLoanRestructureDetails = function (resourceFactory, requestId) {
                resourceFactory.loanRestructureResourceIdTemplate.get({
                    loanId: routeParams.loanId,
                    requestId: requestId,
                }, function (data) {
                    scope.loanRestructureRequestData = data
                });
            }

            //button click events
            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
                switch (eventName) {
                    case "approve":
                        location.path('/loans/' + scope.loanId + '/approverestructurerequest/' + scope.requestId);
                        break;
                    case "modifyapplication":
                        scope.editRequest = !scope.editRequest
                        break;
                }
            }

            /**
             * to be used to get minimum date format
             * @param date
             * @returns {string}
             */
            scope.formatMinMaxDate = function (date) {
                if (date) return "'" + date[0] + '-' + date[1] + '-' + date[2] + "'";
            }


            //BUTTON PROCESSING FUNCTIONS
            scope.cancel = function () {
                if (scope.editRequest) {
                    scope.editRequest = !scope.editRequest;
                    return;
                } else {
                    location.path('/viewloanaccount/' + scope.loanId);
                }
            };

            //SUBMIT FINAL REQUEST TO SERVER
            scope.submit = function () {
                let requestData = {...this.formData};
                requestData.dateFormat = scope.df;
                requestData.locale = scope.optlang.code;
                requestData.loanId = scope.loanId;
                requestData.expectedMaturityDate = dateFilter(this.formData.expectedMaturityDate, scope.df);
                requestData.startDate = dateFilter(this.formData.startDate, scope.df);
                requestData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                requestData.rescheduleFromDate = dateFilter(this.formData.rescheduleFromDate, scope.df);


                resourceFactory.loanRestructureResource.partLiquidate(requestData, function (data) {
                    location.path('/viewloanaccount/' + scope.loanId);
                });
            };

            scope.previewPartLiquidation = function (){
                let requestData = {...this.formData};
                requestData.dateFormat = scope.df;
                requestData.locale = scope.optlang.code;
                requestData.loanId = scope.loanId;
                requestData.expectedMaturityDate = dateFilter(this.formData.expectedMaturityDate, scope.df);
                requestData.startDate = dateFilter(this.formData.startDate, scope.df);
                requestData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                requestData.rescheduleFromDate = dateFilter(this.formData.rescheduleFromDate, scope.df);

                resourceFactory.loanRestructurePreviewResource.preview({
                    ...requestData,
                }, function (data) {
                    console.log("preview data \n\n"+ JSON.stringify(data))
                    scope.loanRestructureRequestData = data
                    scope.isPreview = true

                    // scope.requestId = data.resourceId;
                    // location.path('/viewloanaccount/' + scope.loanId);
                });
            }
        }
    });
    mifosX.ng.application.controller('RestructureRequestController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', mifosX.controllers.RestructureRequestController]).run(function ($log) {
        $log.info("RestructureRequestController initialized");
    });
}(mifosX.controllers || {}));
