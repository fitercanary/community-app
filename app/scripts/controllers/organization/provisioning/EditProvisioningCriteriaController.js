(function (module) {
	mifosX.controllers = _.extend(module, {
		EditProvisioningCriteriaController: function (scope, resourceFactory, routeParams, location, dateFilter, translate) {
			scope.available = [];
			scope.selected = [];
			scope.template = [];
			scope.formData = {};
			scope.translate = translate;

			resourceFactory.provisioningcriteria.get({criteriaId: routeParams.criteriaId, template: 'true'}, function (data) {
				scope.definitions = data.definitions;
				scope.criteriaName = data.criteriaName;
				scope.criteriaId = data.criteriaId;
				scope.liabilityaccounts = data.glAccounts;
				scope.expenseaccounts = data.glAccounts;
				scope.allLoanProducts = data.loanProducts.slice();
				scope.allSavingsProducts = data.savingsProducts.slice();
				data.loanProducts.map(function (x) {
					x.id = "L" + x.id;
					x.isLoan = true;
				});
				data.savingsProducts.map(function (x) {
					x.id = "S" + x.id;
				});
				data.selectedLoanProducts.map(function (x) {
					x.id = "L" + x.id;
					x.isLoan = true;
				});
				data.selectedSavingsProducts.map(function (x) {
					x.id = "S" + x.id;
				});
				scope.allProducts = data.loanProducts.concat(data.savingsProducts);
				scope.selectedProducts = data.selectedLoanProducts.concat(data.selectedSavingsProducts);
			});

			scope.addProduct = function () {
				for (var i in this.available) {
					for (var j in scope.allProducts) {
						if (scope.allProducts[j].id == this.available[i]) {
							var temp = {};
							temp.id = this.available[i];
							temp.name = scope.allProducts[j].name;
							temp.isLoan = scope.allProducts[j].isLoan;
							if (scope.allProducts[j].isLoan) {
								temp.includeInBorrowerCycle = scope.allProducts[j].includeInBorrowerCycle;
							}
							scope.selectedProducts.push(temp);
							scope.allProducts.splice(j, 1);
						}
					}
				}
			};
			scope.removeProduct = function () {
				for (var i in this.selected) {
					for (var j in scope.selectedProducts) {
						if (scope.selectedProducts[j].id == this.selected[i]) {
							var temp = {};
							temp.id = this.selected[i];
							temp.name = scope.selectedloanproducts[j].name;
							if (scope.selectedProducts[j].isLoan) {
								temp.includeInBorrowerCycle = scope.selectedProducts[j].includeInBorrowerCycle;
							}
							scope.allProducts.push(temp);
							scope.selectedProducts.splice(j, 1);
						}
					}
				}
			};

			scope.submit = function () {
				this.formData.locale = scope.optlang.code;
				this.formData.criteriaId = scope.criteriaId;
				this.formData.criteriaName = scope.criteriaName;
				this.formData.loanProducts = [];
				this.formData.savingsProducts = [];
				if (scope.selectedProducts.length > 0) {
					scope.selectedProducts.map(function (x) {
						if (isNaN(x.id)) {
							x.id = parseInt(x.id.substring(1));
						}
						if (x.isLoan) {
							this.formData.loanProducts.push(x);
						} else {
							this.formData.savingsProducts.push(x);
						}
					}, this)
				} else {
					this.formData.loanProducts = scope.allLoanProducts;
					this.formData.savingsProducts = scope.allSavingsProducts;
				}
				this.formData.definitions = scope.definitions;
				resourceFactory.provisioningcriteria.put({criteriaId: routeParams.criteriaId}, this.formData, function (data) {
					location.path('/viewprovisioningcriteria/' + data.resourceId);
				});
			};
		}
	});
	mifosX.ng.application.controller('EditProvisioningCriteriaController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', '$translate', mifosX.controllers.EditProvisioningCriteriaController]).run(function ($log) {
		$log.info("EditProvisioningCriteriaController initialized");
	});
}(mifosX.controllers || {}));
