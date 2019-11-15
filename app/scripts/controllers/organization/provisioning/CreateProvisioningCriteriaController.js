(function (module) {
	mifosX.controllers = _.extend(module, {
		CreateProvisioningCriteriaController: function (scope, resourceFactory, location, dateFilter, translate) {
			scope.available = [];
			scope.selected = [];
			scope.selectedloanproducts = [];
			scope.selectedsavingsproducts = [];
			scope.template = [];
			scope.formData = {};
			scope.translate = translate;
			scope.isRequired = false;
			scope.provisioningType = "loan";

			resourceFactory.provisioningcriteria.template({criteriaId: 'template'}, function (data) {
				scope.template = data;
				scope.allloanproducts = data.loanProducts;
				scope.allsavingsproducts = data.savingsProducts;
				scope.definitions = data.definitions;
				scope.liabilityaccounts = data.glAccounts;
				scope.expenseaccounts = data.glAccounts;
			});

			scope.selectProvisioningType = function() {
				if (this.provisioningType == 'loan') {
					scope.selectedsavingsproducts = [];
					scope.allsavingsproducts = scope.template.savingsProducts;
				} else {
					scope.selectedloanproducts = [];
					scope.allloanproducts = scope.template.loanProducts;
				}
			};

			scope.addLoanProduct = function () {
				for (var i in this.available) {
					for (var j in scope.allloanproducts) {
						if (scope.allloanproducts[j].id == this.available[i]) {
							var temp = {};
							temp.id = this.available[i];
							temp.name = scope.allloanproducts[j].name;
							temp.includeInBorrowerCycle = scope.allloanproducts[j].includeInBorrowerCycle;
							scope.selectedloanproducts.push(temp);
							scope.allloanproducts.splice(j, 1);
						}
					}
				}
			};
			scope.removeLoanProduct = function () {
				for (var i in this.selected) {
					for (var j in scope.selectedloanproducts) {
						if (scope.selectedloanproducts[j].id == this.selected[i]) {
							var temp = {};
							temp.id = this.selected[i];
							temp.name = scope.selectedloanproducts[j].name;
							temp.includeInBorrowerCycle = scope.selectedloanproducts[j].includeInBorrowerCycle;
							scope.allloanproducts.push(temp);
							scope.selectedloanproducts.splice(j, 1);
						}
					}
				}
			};

			scope.addSavingsProduct = function () {
				for (var i in this.available) {
					for (var j in scope.allsavingsproducts) {
						if (scope.allsavingsproducts[j].id == this.available[i]) {
							var temp = {};
							temp.id = this.available[i];
							temp.name = scope.allsavingsproducts[j].name;
							temp.includeInBorrowerCycle = scope.allsavingsproducts[j].includeInBorrowerCycle;
							scope.selectedsavingsproducts.push(temp);
							scope.allsavingsproducts.splice(j, 1);
						}
					}
				}
			};
			scope.removeSavingsProduct = function () {
				for (var i in this.selected) {
					for (var j in scope.selectedsavingsproducts) {
						if (scope.selectedsavingsproducts[j].id == this.selected[i]) {
							var temp = {};
							temp.id = this.selected[i];
							temp.name = scope.selectedsavingsproducts[j].name;
							temp.includeInBorrowerCycle = scope.allsavingsproducts[j].includeInBorrowerCycle;
							scope.allsavingsproducts.push(temp);
							scope.selectedsavingsproducts.splice(j, 1);
						}
					}
				}
			};

			scope.submit = function () {
				this.isRequired = true;
				this.formData.locale = scope.optlang.code;
				if (scope.provisioningType == "loan") {
					this.formData.loanProducts = scope.selectedloanproducts.length > 0 ? scope.selectedloanproducts : scope.allloanproducts;
					this.formData.savingsProducts = [];
				} else {
					this.formData.savingsProducts = scope.selectedsavingsproducts.length > 0 ? scope.selectedsavingsproducts : scope.allsavingsproducts;
					this.formData.loanProducts = [];
				}
				this.formData.loanProducts = scope.selectedloanproducts;
				this.formData.savingsProducts = scope.selectedsavingsproducts;
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
