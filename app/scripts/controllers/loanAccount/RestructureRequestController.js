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
            scope.formData.modifyLoanTerm = false;
            //fetch loan details
            resourceFactory.LoanAccountResource.getLoanAccountDetails({
                loanId: routeParams.loanId,
            }, function (data) {
                console.log("loan data \n\n: " + JSON.stringify(data))

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
                scope.formData.paidInstallments = totalInstallments - pendingInstallments;
                scope.formData.pendingInstallments = pendingInstallments;
                scope.formData.totalInstallments = totalInstallments;

                scope.formData.startDate = restructureDetails.rescheduleFromDate ? new Date(restructureDetails.rescheduleFromDate) : new Date();
                scope.formData.transactionDate = transactionDate;
                scope.formData.expectedMaturityDate = restructureDetails.rescheduleToDate ? new Date(restructureDetails.rescheduleToDate) :
                    new Date(scope.loandetails.timeline.expectedMaturityDate)
                scope.minMaturityDate = scope.formatMinMaxDate(scope.loandetails.timeline.expectedMaturityDate);
                let requestId = restructureDetails.restructureRequestId;
                scope.requestId = requestId;
                if (requestId) {
                    scope.getLoanRestructureDetails(resourceFactory, requestId)
                    scope.buttons = {
                        singlebuttons: [
                            {
                                name: "button.approve",
                                icon: "fa fa-check",
                                taskPermissionName: 'APPROVE_RESTRUCTURELOAN'
                            },
                            {
                                name: "button.modifyapplication",
                                icon: "fa fa-pincel-square-o",
                                taskPermissionName: 'CREATE_RESTRUCTURELOAN'
                            },
                            {
                                name: "button.reject",
                                icon: "fa fa-times",
                                taskPermissionName: 'REJECT_RESTRUCTURELOAN'
                            }
                        ],
                    }
                }
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

            /**
             * retrieve difference between loan term periods
             * @returns {number|number}
             */
            scope.monthDiff = function () {
                let expectedMaturityDate = scope.formData.expectedMaturityDate;
                let currentDate = scope.formData.startDate;
                if (expectedMaturityDate && scope.loandetails && scope.loandetails.repaymentFrequencyType.value == 'Months') {
                    let monthDifference = expectedMaturityDate.getMonth() - currentDate.getMonth();
                    let Difference_In_Months = monthDifference +
                        (12 * (expectedMaturityDate.getFullYear() - currentDate.getFullYear()));
                    return expectedMaturityDate && currentDate ? (Difference_In_Months / (+scope.loandetails.repaymentEvery)) : 0
                } else if (expectedMaturityDate && scope.loandetails && scope.loandetails.repaymentFrequencyType.value == 'Days') {
                    let Difference_In_Time = expectedMaturityDate.getTime() - currentDate.getTime();
                    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
                    return Difference_In_Days ? (Difference_In_Days / (+scope.loandetails.repaymentEvery)) : 0
                } else if (expectedMaturityDate && scope.loandetails && scope.loandetails.repaymentFrequencyType.value == 'Years') {
                    let Difference_In_Years = expectedMaturityDate.getFullYear() - currentDate.getFullYear();
                    return Difference_In_Years ? (Difference_In_Years / (+scope.loandetails.repaymentEvery)) : 0
                } else if (expectedMaturityDate && scope.loandetails && scope.loandetails.repaymentFrequencyType.value == 'Weeks') {
                    const msInWeek = 1000 * 60 * 60 * 24 * 7;

                    let Difference_in_weeks = Math.round(Math.abs(expectedMaturityDate - currentDate) / msInWeek);


                    return Difference_in_weeks ? (Difference_in_weeks / (+scope.loandetails.repaymentEvery)) : 0
                } else return 0;

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

                resourceFactory.loanRestructureResource.put(requestData, function (data) {
                    scope.requestId = data.resourceId;
                    location.path('/viewloanaccount/' + scope.loanId);
                });
            };
        }
    });
    mifosX.ng.application.controller('RestructureRequestController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', mifosX.controllers.RestructureRequestController]).run(function ($log) {
        $log.info("RestructureRequestController initialized");
    });
}(mifosX.controllers || {}));
