(function (module) {
	mifosX.controllers = _.extend(module, {
		CreateProvisioningCriteriaController: function (scope, resourceFactory, location, dateFilter, translate) {
			scope.available = [];
			scope.selected = [];
			scope.selectedProducts = [];
			scope.template = [];
			scope.formData = {};
			scope.translate = translate;
			scope.isRequired = false;
			scope.provisioningType = "loan";

			resourceFactory.provisioningcriteria.template({criteriaId: 'template'}, function (data) {
				scope.template = data;
				scope.definitions = data.definitions;
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
				scope.allProducts = data.loanProducts.concat(data.savingsProducts);
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
				this.isRequired = true;
				this.formData.locale = scope.optlang.code;
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
				resourceFactory.provisioningcriteria.post(this.formData, function (data) {
					location.path('/viewprovisioningcriteria/' + data.resourceId);
				});
			};

			scope.doFocus = function (index) {
				if (index > 0 && !scope.definitions[index].minAge) {
					scope.definitions[index].minAge = parseInt(scope.definitions[index - 1].maxAge) + 1;
				}
			};

			scope.doBlur = function (index) {
				//console.log("Blur") ;
			};
		}
	});
	mifosX.ng.application.controller('CreateProvisioningCriteriaController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$translate', mifosX.controllers.CreateProvisioningCriteriaController]).run(function ($log) {
		$log.info("CreateProvisioningCriteriaController initialized");
	});
}(mifosX.controllers || {}));
