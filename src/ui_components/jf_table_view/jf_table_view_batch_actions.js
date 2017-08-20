class jfTableViewBatchActionsController {
    /* @ngInject */

	constructor($element, $scope, $timeout) {
		this.$element = $element;
		this.$timeout = $timeout;

		this.MORE_ACTIONS = {'@@MORE_ACTIONS@@': '@@MORE_ACTIONS@@'};

		$scope.$on("ui-layout.resize", () => {
			$timeout(()=>this.calcActionsVisibility());
		});
		$(window).on('resize', () => {
			$timeout(()=>this.calcActionsVisibility());
		});

		$scope.$watch('jfTableViewBatchActions.actions',()=>$timeout(()=>this.calcActionsVisibility()));
		$scope.$watch('jfTableViewBatchActions.tableOptions',()=> {
			this.tableOptions.on('selection.change', () => {
				$timeout(()=>this.updateMoreActions());
			});
		});
		$timeout(()=>this.calcActionsVisibility());
	}
	perform(action) {
		if (this.anySelected() && (!action.disabledWhen || !action.disabledWhen())) {
			action.callback && action.callback(this.tableOptions.getSelectedRows());
		}
	}
	anySelected() {
		return this.tableOptions && this.tableOptions.getSelectedRows().length > 0;
	}

	isDisabled(action) {
		return !this.anySelected() || (action.disabledWhen && action.disabledWhen());
	}

	calcActionsVisibility() {

		if (!this.actions) return;

		let visible = [];
		let inDropDown = [];

		let moreDropdownWidth = 125;

		let elems = $(this.$element).find('.grid-batch-action-wrapper:not(.more-actions)');

		let containerWidth = $(this.$element).children().width();

		let totalWidth = 0;

		let addTo = visible;

		let moreActionsNewIndex = -1;
		let moreActionsOldIndex = this.actions.indexOf(this.MORE_ACTIONS);


		for (let i = 0; i<elems.length; i++) {
			let el = $(elems[i]);
			totalWidth += el.width();
			let id = el.attr('data-action-id');
			let act = _.find(this.actions, {name: id});
			let index = this.actions.indexOf(act);

			if (((totalWidth > containerWidth) || (this.moreActions && this.moreActions.length && totalWidth - el.width() + moreDropdownWidth > containerWidth)) && addTo === visible) {
				addTo = inDropDown;
				moreActionsNewIndex = index;
				if (visible.length && totalWidth - el.width() + moreDropdownWidth > containerWidth) {
					let last = visible.pop();
					inDropDown.push(last);
					moreActionsNewIndex = this.actions.indexOf(last);
				}
			}

			if (act) addTo.push(act);
		}

		if (totalWidth < containerWidth) {
			inDropDown = [];
			visible = _.filter(this.actions,act=>act !== this.MORE_ACTIONS);
			moreActionsNewIndex = -1;
		}

		let temp = {TEMP:'TEMP'};
		if (moreActionsOldIndex !== -1) {
			this.actions.splice(moreActionsOldIndex,1,temp);
		}
		if (moreActionsNewIndex !== -1) {
			this.actions.splice(moreActionsNewIndex,0,this.MORE_ACTIONS);
		}
		let tempIndex = this.actions.indexOf(temp);
		if (tempIndex !== -1) {
			this.actions.splice(tempIndex,1);
		}

		this.visibleActions = visible;
		this.moreActions = inDropDown;
		this.$timeout(()=>this.updateMoreActions());

	}

	initActions(actionsController) {
		this.moreActionsController = actionsController;
		if (this.gridOptions) this.gridOptions.moreActionsController = actionsController;
		this.updateMoreActions();
	}
	updateMoreActions() {

		if (!this.moreActionsController) return;

		let actionsCount = _.filter(this.actions,act=>act !== this.MORE_ACTIONS).length;

		if (this.moreActions.length < actionsCount) {
			this.moreActionsController.label = 'More Actions'
		}
		else if (this.moreActions.length === actionsCount) {
			this.moreActionsController.label = 'Actions'
		}


		let dict = {};
		this.moreActions.forEach(action=>{
			dict[action.name] = {
				title: action.name,
				icon: 'icon-' + action.icon,
				disabled: this.isDisabled(action)
			}
		})

		this.moreActionsController.setActionsDictionary(dict);
		this.moreActionsController.setActions(_.map(this.moreActions, (action) => {
			return {
				name: action.name,
				visibleWhen: action.visibleWhen,
				action: () => this.perform(action)
			}
		}))
	}
}
export function jfTableViewBatchActions() {
	return {
		scope: {
			actions: '=',
			tableOptions: '='
		},
		templateUrl: 'ui_components/jf_table_view/jf_table_view_batch_actions.html',
		controller: jfTableViewBatchActionsController,
		controllerAs: 'jfTableViewBatchActions',
		bindToController: true
	}
}
