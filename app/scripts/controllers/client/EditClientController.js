(function (module) {
    mifosX.controllers = _.extend(module, {
        EditClientController: function (scope, routeParams, resourceFactory, location, http, dateFilter, API_VERSION, Upload, $rootScope, $q) {
            scope.offices = [];
            scope.clientLevelOptions = [];
            scope.date = {};
            scope.restrictDate = new Date();
            scope.savingproducts = [];
            scope.clientId = routeParams.id;
            scope.showSavingOptions = 'false';
            scope.opensavingsproduct = 'false';
            scope.showNonPersonOptions = false;
            scope.clientPersonId = 1;
            resourceFactory.clientResource.get({clientId: routeParams.id, template:'true', staffInSelectedOfficeOnly:true}, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.clientLevelOptions = data.clientLevelOptions;
                scope.savingproducts = data.savingProductOptions;
                scope.genderOptions = data.genderOptions;
                scope.clienttypeOptions = data.clientTypeOptions;
                scope.clientClassificationOptions = data.clientClassificationOptions;
                scope.clientNonPersonConstitutionOptions = data.clientNonPersonConstitutionOptions;
                scope.clientNonPersonMainBusinessLineOptions = data.clientNonPersonMainBusinessLineOptions;
                scope.clientLegalFormOptions = data.clientLegalFormOptions;
                scope.officeId = data.officeId;
                scope.formData = {
                    firstname: data.firstname,
                    lastname: data.lastname,
                    middlename: data.middlename,
                    active: data.active,
                    accountNo: data.accountNo,
                    staffId: data.staffId,
                    externalId: parseInt(data.externalId),
                    referralClientId: data.referredById,
                    isStaff:data.isStaff,
                    mobileNo: data.mobileNo,
                    savingsProductId: data.savingsProductId,
                    genderId: data.gender.id,
                    fullname: data.fullname,
                    mothersMaidenName:data.mothersMaidenName,
                    clientNonPersonDetails : {
                        incorpNumber: data.clientNonPersonDetails.incorpNumber,
                        remarks: data.clientNonPersonDetails.remarks
                    },
                    dailyWithdrawLimit : data.dailyWithdrawLimit,
                    singleWithdrawLimit: data.singleWithdrawLimit,
                    requireAuthorizationToView: data.requireAuthorizationToView
                };

                if (data.referredById != null) {
                    resourceFactory.clientResource.get({clientId: data.referredById}, function (data) {
                        scope.formData.referralClientId = data.displayName;
                    });
                }

                if(data.gender){
                    scope.formData.genderId = data.gender.id;
                }

                if(data.clientType){
                    scope.formData.clientTypeId = data.clientType.id;
                }

                if(data.clientClassification){
                    scope.formData.clientClassificationId = data.clientClassification.id;
                }

                if(data.legalForm){
                    scope.displayPersonOrNonPersonOptions(data.legalForm.id);
                    scope.formData.legalFormId = data.legalForm.id;
                }
                if(data.clientLevel){
                 scope.formData.clientLevelId = data.clientLevel.id;
                }

                if(data.clientNonPersonDetails.constitution){
                    scope.formData.clientNonPersonDetails.constitutionId = data.clientNonPersonDetails.constitution.id;
                }

                if(data.clientNonPersonDetails.mainBusinessLine){
                    scope.formData.clientNonPersonDetails.mainBusinessLineId = data.clientNonPersonDetails.mainBusinessLine.id;
                }

                if (data.savingsProductId != null) {
                    scope.opensavingsproduct = 'true';
                    scope.showSavingOptions = 'true';
                } else if (data.savingProductOptions.length > 0) {
                    scope.showSavingOptions = 'true';
                }

                if (data.dateOfBirth) {
                    var dobDate = dateFilter(data.dateOfBirth, scope.df);
                    scope.date.dateOfBirth = new Date(dobDate);
                }

                if (data.clientNonPersonDetails.incorpValidityTillDate) {
                    var incorpValidityTillDate = dateFilter(data.clientNonPersonDetails.incorpValidityTillDate, scope.df);
                    scope.date.incorpValidityTillDate = new Date(incorpValidityTillDate);
                }

                var actDate = dateFilter(data.activationDate, scope.df);
                scope.date.activationDate = new Date(actDate);
                if (data.active) {
                    scope.choice = 1;
                    scope.showSavingOptions = 'false';
                    scope.opensavingsproduct = 'false';
                } else {
                    scope.choice = 0;
                }

                if (data.timeline.submittedOnDate) {
                    var submittedOnDate = dateFilter(data.timeline.submittedOnDate, scope.df);
                    scope.date.submittedOnDate = new Date(submittedOnDate);
                }

            });

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientSearchSummaryResource.get({displayName: value, orderBy : 'displayName', officeId : scope.formData.toOfficeId,
                    sortOrder : 'ASC', orphansOnly : true}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            scope.displayPersonOrNonPersonOptions = function (legalFormId) {
                if(legalFormId == scope.clientPersonId || legalFormId == null) {
                    scope.showNonPersonOptions = false;
                }else {
                    scope.showNonPersonOptions = true;
                }
            };

            scope.viewClient = function($item, $model, $label) {
                scope.referralClient = $item;
            }

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;

                if (scope.formData.referralClientId && scope.referralClient) {
                    scope.formData.referralClientId = scope.referralClient.id;
                } else {
                    delete scope.formData.referralClientId;
                }

                if (scope.choice === 1) {
                    if (scope.date.activationDate) {
                        this.formData.activationDate = dateFilter(scope.date.activationDate, scope.df);
                    }
                }
                if(scope.date.dateOfBirth){
                    this.formData.dateOfBirth = dateFilter(scope.date.dateOfBirth,  scope.df);
                }

                if(scope.date.submittedOnDate){
                    this.formData.submittedOnDate = dateFilter(scope.date.submittedOnDate,  scope.df);
                }

                if(scope.date.incorpValidityTillDate){
                    this.formData.clientNonPersonDetails.locale = scope.optlang.code;
                    this.formData.clientNonPersonDetails.dateFormat = scope.df;
                    this.formData.clientNonPersonDetails.incorpValidityTillDate = dateFilter(scope.date.incorpValidityTillDate,  scope.df);
                }

                if(this.formData.legalFormId == scope.clientPersonId || this.formData.legalFormId == null) {
                    delete this.formData.fullname;
                }else {
                    delete this.formData.firstname;
                    delete this.formData.middlename;
                    delete this.formData.lastname;
                }

                resourceFactory.clientResource.update({'clientId': routeParams.id}, this.formData, function (data) {
                    location.path('/viewclient/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditClientController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', 'Upload', '$rootScope', '$q', mifosX.controllers.EditClientController]).run(function ($log) {
        $log.info("EditClientController initialized");
    });
}(mifosX.controllers || {}));
