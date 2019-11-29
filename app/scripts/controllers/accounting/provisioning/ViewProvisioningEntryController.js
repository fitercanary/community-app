(function (module) {
	mifosX.controllers = _.extend(module, {
		ViewProvisioningEntryController: function (scope, routeParams, paginatorService, resourceFactory, location, $uibModal) {
			scope.charge = [];
			scope.choice = 0;
			var i = 0;
			var temp = 0;
			scope.totalReservedAmount;
			scope.formData = {};
			scope.transactions = [];

			resourceFactory.officeResource.getAllOffices(function (data) {
				scope.offices = data;
			});
			resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
				scope.loanProducts = data;
				resourceFactory.savingProductResource.getAllSavingProducts(function (data) {
					scope.savingProducts = data;
					scope.products = scope.loanProducts.map(function (x) {
						return { id: "L" + x.id, name: x.name };
					}).concat(scope.savingProducts.map(function (x) {
						return { id: "S" + x.id, name: x.name };
					}));
					scope.products.sort(function (a, b) {
						if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
						if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
						return 0;
					});
				});
			});

			resourceFactory.provisioningcategory.getAll(function (data) {
				scope.provisioningcategories = data;
			});


			resourceFactory.provisioningentries.get({entryId: routeParams.entryId}, function (data) {
				scope.data = data;
				scope.createdby = data.createdUser;
				scope.createdDate = data.createdDate;
				scope.totalReservedAmount = data.reservedAmount;
				scope.isjournalEntriesCreated = !data.journalEntry;
			});

			scope.searchTransaction = function () {
				scope.transactions = paginatorService.paginate(fetchFunction, 10);
			};

			var fetchFunction = function (offset, limit, callback) {
				var params = {};
				params.entryId = routeParams.entryId;
				params.offset = offset;
				params.limit = limit;
				if (scope.formData.officeId) {
					params.officeId = scope.formData.officeId;
				}

				if (scope.formData.productId) {
					params.productId = scope.formData.productId;
				}

				if (scope.formData.categoryId) {
					params.categoryId = scope.formData.categoryId;
				}
				scope.saveSC();
				resourceFactory.provisioningentriesSearch.get(params, callback);
			};

			paginatorService.currentOffset = 0;
			scope.transactions = paginatorService.paginate(fetchFunction, 10);

			scope.submit = function () {
				resourceFactory.provisioningentries.createJournals({entryId: routeParams.entryId}, this.formData, function (data) {
					location.path('/viewprovisioningentries/');
				});
			};
		}
	});
	mifosX.ng.application.controller('ViewProvisioningEntryController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$uibModal', mifosX.controllers.ViewProvisioningEntryController]).run(function ($log) {
		$log.info("ViewProvisioningEntryController initialized");
	});
}(mifosX.controllers || {}));
