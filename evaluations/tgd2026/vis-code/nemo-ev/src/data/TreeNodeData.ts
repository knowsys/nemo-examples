import { measureTextWidth } from "../util/measureTextWidth";
import type { InnerTableQueryChildInformation, Rule, TableEntries, TableEntriesForTreeNodesQuery, TableEntryResponse, TableResponseBase, TreeForTableResponse, TreeForTableResponseChildInformation } from "../types/types";
import { EXTENDED_WIDTH, NORMAL_HEIGHT } from "../types/constants";
import StringFormatter from "../util/StringFormatter";
export abstract class TreeNodeData {
	public name: string = "error";
	private readonly children: TreeNodeData[] = [];

	public isLeafNode = false;

	public isCollapsed = false;
	public isExpanded = false; //needed for Intended tree to get expand State
	public isBlurred = false; //needed for blur effect in TreeNodeBox
	public isGreyed = false; //needed for grey effect in TreeNodeBox

	public id: number[] = [];

	public width: number;
	public initialWidth: number;
	public height: number;


	constructor(name: string, parameter: string[] = []) {
		this.name = name;
		this.initialWidth = (measureTextWidth(StringFormatter.formatRuleName(name)));
		if (this instanceof TableNodeData) {
			this.initialWidth = (measureTextWidth(StringFormatter.formatPredicate(name, parameter)));
		}
		
		this.width = this.initialWidth;
		this.height = NORMAL_HEIGHT
	}

	public getName() {
		return this.name;
	}

	public updateId(id: number[]) {
		this.id = id;
	}

	public addChild(child: TreeNodeData) {
		this.children.push(child);
	}

	public removeChild(toDelete: TreeNodeData) {
		for (const child of this.children) {
			if (child === toDelete) {
				const index = this.children.indexOf(child);
				if (index > -1) {
					this.children.splice(index, 1);
				}
				return;
			}
		}
	}

	public setCollapsed(collapsed: boolean) {
		this.isCollapsed = collapsed;
	}

	public getChildren() {
		return this.children;
	}

	public abstract toTableEntriesForTreeNodesQueryJSON(mode: boolean): any

	public abstract toUndoRedoState(): any

	public abstract clearTableEntriesInSubTree(): void

}

export class TableNodeData extends TreeNodeData {
	private entries: TableEntryResponse[] = [];

	private readonly tableEntries: TableEntryResponse[] = [];
	private rulesAbove: Rule[] = [];
	private rulesBelow: Rule[] = [];
	public moreEntriesExist: boolean;
	public gotSearched = false;

	public parameterPredicate: string[] = [];

	public isHighlighted: number = -1

	private readonly pagination: { start: number; count: number } = { start: -1, count: -1 };

	public isRootNode = false;

	constructor(json: TreeForTableResponse, parameterPredicate: string[], id: number[]) {
		super(json.predicate, parameterPredicate);

		this.id = id

		this.parameterPredicate = parameterPredicate === undefined ? [] : parameterPredicate;

		this.pagination.start = json.tableEntries?.pagination.start ?? -1;
		const count = json.tableEntries?.entries.length ?? -1;
		this.pagination.count = count >= 20 ? count : 20;

		this.moreEntriesExist = json.tableEntries?.pagination.moreEntriesExist ?? false;
		if (json.tableEntries !== undefined) {
			this.setTableEntries(json.tableEntries);
		}

		if (json.possibleRulesAbove !== undefined) {
			this.setRulesAbove(json.possibleRulesAbove);
		}

		if (json.possibleRulesBelow !== undefined) {
			this.setRulesBelow(json.possibleRulesBelow);
		}
	}

	//create Type 2 Query
	public toTableEntriesForTreeNodesQueryJSON(createEmptyQuery: boolean, bool: boolean = false, queries: string[] = []): TableEntriesForTreeNodesQuery {
		const children = (this as any).children as TreeNodeData[] | undefined;
		const base: any = {
			tableEntries: {}
		};
		if (children && children.length > 0) {
			base.childInformation = children[0].toTableEntriesForTreeNodesQueryJSON(createEmptyQuery);
		}
		if (bool) {
			base.predicate = this.name;
			base.tableEntries.queries = createEmptyQuery ? [] : queries;
			return base;
		}
		base.tableEntries.pagination = { start: this.pagination.start, count: this.pagination.count };
		return base;
	}

	//to safe the current state of the table node
	public toUndoRedoState(): TreeForTableResponse {
		const children = this.getChildren() as TreeNodeData[] | undefined;
		const base: any = {
			predicate: this.name,
			tableEntries: {
				entries: this.entries.map((entry) => ({
					entryId: entry.entryId,
					termTuple: entry.termTuple
				})),
				pagination: { start: this.pagination.start, moreEntriesExist: this.moreEntriesExist }
			},
			possibleRulesAbove: this.rulesAbove,
			possibleRulesBelow: this.rulesBelow,
			isCollapsed: this.isCollapsed,
			isGreyed: this.isGreyed,
			gotSearched: this.gotSearched,
		};
		if (children && children.length > 0) {
			base.childInformation = children[0].toUndoRedoState();
		}
		return base;
	}

	//update node according to a Type 2 Query
	public updateType2Query(query: TableResponseBase & {
		addressInTree: number[];
	}) {
		this.name = query.predicate;
		this.pagination.start = query.tableEntries.pagination.start;
		const count = query.tableEntries.entries.length ?? -1;
		this.pagination.count = count >= 20 ? count : 20; // min count = 20
		this.moreEntriesExist = query.tableEntries.pagination.moreEntriesExist;
		this.setTableEntries(query.tableEntries);
		this.setRulesAbove(query.possibleRulesAbove);
		this.setRulesBelow(query.possibleRulesBelow);
		this.initialWidth = (measureTextWidth(StringFormatter.formatPredicate(this.name, this.parameterPredicate)));
		this.width = (this.isExpanded && this.initialWidth < EXTENDED_WIDTH) ? EXTENDED_WIDTH : this.initialWidth;
	}

	public clearTableEntriesInSubTree() {
		this.setTableEntries({ entries: [], pagination: { start: 0, count: 0, moreEntriesExist: false } }); //clear the entries
		for (const child of this.getChildren()) {
			child.clearTableEntriesInSubTree(); // Clear entries in all children
		}
	}

	//is the value inside the table?
	public isValueInsideTable(value: string): boolean {
		if (!value || value.trim() === "") return false;
		const searchValues = value.split(",").map(s => s.trim()).filter(Boolean);
		return this.getTableEntries().map(d => d.termTuple).some((entries: string[]) =>
			searchValues.every(val =>
				entries.some(cell => cell.replace(/\s+/g, "") === val.replace(/\s+/g, ""))
			)
		);
	}

	public setCount(count: number) {
		this.pagination.count = count;
	}

	//increase the count for load more
	public increaseCount(increase: number) {
		this.pagination.count += increase;
	}

	public setTableEntries(json: TableEntries) {
		this.tableEntries.length = 0; // Clear existing entries
		this.entries = json.entries
		for (const entry of json.entries) {
			this.tableEntries.push(entry);
		}
	}

	//get the entries without their entryId 
	public getTableEntries(): TableEntryResponse[] {
		return this.tableEntries;
	}

	public setRulesAbove(rules: Rule[]) {
		this.rulesAbove = rules;
	}

	public setRulesBelow(rules: Rule[]) {
		this.rulesBelow = rules;
	}

	public setPagination(start: number, count: number) {
		this.pagination.start = start;
		this.pagination.count = count;
	}

	public getPagination() {
		return this.pagination;
	}

	public override getName() {
		return this.name;
	}

	public hasRulseAbove() {
		return this.rulesAbove.length > 0;
	}

	public hasRulsesBelow() {
		return this.rulesBelow.length > 0;
	}

	public getRulesAbove() {
		return this.rulesAbove;
	}

	public getRulesBelow() {
		return this.rulesBelow;
	}
}

export class RuleNodeData extends TreeNodeData {
	private readonly ruleId: Rule;

	constructor(ruleId: Rule, id: number[] = []) {
		super(ruleId.stringRepresentation);
		this.ruleId = ruleId;
		this.id = id;
	}

	public override getName() {
		return this.ruleId.stringRepresentation;
	}

	public toTableEntriesForTreeNodesQueryJSON(createEmptyQuery: boolean): InnerTableQueryChildInformation {
		return {
			rule: this.ruleId.id,
			headIndex: this.ruleId.relevantHeadPredicateIndex,
			children: (this as any).children
				? (this as any).children.map((child: TreeNodeData) =>
					child.toTableEntriesForTreeNodesQueryJSON(createEmptyQuery)
				)
				: []
		};
	}

	public toUndoRedoState(): TreeForTableResponseChildInformation {
		return {
			rule: this.ruleId,
			isCollapsed: this.isCollapsed,
			isGreyed: this.isGreyed,
			children: (this as any).children
				? (this as any).children.map((child: TreeNodeData) =>
					child.toUndoRedoState()
				)
				: []
		};
	}

	public clearTableEntriesInSubTree() {
		for (const child of this.getChildren()) {
			child.clearTableEntriesInSubTree(); // Clear entries in all children
		}
	}
}
