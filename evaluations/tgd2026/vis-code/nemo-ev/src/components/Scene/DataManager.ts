import { RuleNodeData, TableNodeData, TreeNodeData } from "../../data/TreeNodeData";
import { EXTENDED_HEIGHT, EXTENDED_WIDTH, NORMAL_HEIGHT } from "../../types/constants";
import type { Rule, TableEntriesForTreeNodesQuery, TableEntriesForTreeNodesResponse, TableEntryResponse, TreeForTableResponse, UndoRedoState } from "../../types/types";

export class DataManager {
    private readonly undoList: TreeForTableResponse[] = [];
    private readonly redoList: TreeForTableResponse[] = [];
    private searchedEntry: string = "";

    //to update state if tree changes
    public updateTreeDataStructure(node: TableNodeData, ownId: number[] = []) {
        node.updateId(ownId); //update the id of the node

        node.isLeafNode = node.getChildren().length === 0; //if there are no children, this is a leaf node
        node.isRootNode = ownId.length === 0; //if the id is empty, this is the root node

        if (!node.isLeafNode) {
            const ruleNode = node.getChildren()[0]; //get the first child, which is the ruleNode
            ruleNode.updateId(ownId); //update the id of the ruleNode

            let childrenId = 0;
            for (const child of ruleNode.getChildren()) {
                const childId = [...ownId];
                childId.push(childrenId);
                child.updateId(childId);
                this.updateTreeDataStructure(child as TableNodeData, childId); //update the children recursively
                childrenId++;
            }
        }
    }

    public createType1Query(entrie: TableEntryResponse, predicate: string) {
        return { queryType: "treeForTable", payload: { "predicate": predicate, "tableEntries": { "queries": [entrie.entryId] } } }
    }

    public createType2Query(payload: TableEntriesForTreeNodesQuery) {
        return { queryType: "tableEntriesForTreeNodes", payload: payload }
    }

    public pushNewElementToUndoList(json: TreeForTableResponse) {
        this.undoList.push(json); //add to last trees for undo/redo
        console.log("Undo", this.undoList);
        this.redoList.length = 0; //clear the redoList, because we have a new action
    }

    public handleType1Response(json: TreeForTableResponse, ruleParameters: string[] = [], ownId: number[] = []): TableNodeData {
        let parameters = ruleParameters;
        if (ruleParameters.length === 0) parameters = json.childInformation?.rule.relevantHeadPredicate.parameters!
        const tableNode = new TableNodeData(json, parameters, ownId);
        if (tableNode.isValueInsideTable(this.searchedEntry)) tableNode.gotSearched = true; //if the searched entry is inside the table, set the isSearchedEntry flag to true
        if (json.childInformation?.children) { //check for childs
            if (json.childInformation?.rule !== undefined) { //if there is a rule (bc, maybe there are cases without a rule, idk)
                const ruleNode = new RuleNodeData(json.childInformation.rule, ownId); //create the ruleNode
                tableNode.addChild(ruleNode);
                let childrenId = 0;
                for (let i = 0; i < json.childInformation.children.length; i++) {
                    const childJson = json.childInformation.children[i];
                    parameters = json.childInformation.rule.bodyPredicates[i].parameters!;
                    const childId = [...ownId];
                    childId.push(childrenId);
                    ruleNode.addChild(this.handleType1Response(childJson, parameters, childId)); //add "actual" childs to childs of ruleNode
                    childrenId++;
                }

                return tableNode;
            }
        }
        tableNode.isLeafNode = true; //if there are no children, this is a leaf node
        return tableNode;
    }

    public loadUndoEntry(json: UndoRedoState, ruleParameters: string[] = [], ownId: number[] = []): TableNodeData {
        let parameters = ruleParameters;
        if (ruleParameters.length === 0) parameters = json.childInformation?.rule.relevantHeadPredicate.parameters!
        const tableNode = new TableNodeData(json, parameters, ownId);
        if (json.isCollapsed !== undefined) tableNode.isCollapsed = json.isCollapsed
        if (json.isGreyed !== undefined) tableNode.isGreyed = json.isGreyed
        if (json.searchedEntry !== undefined) this.searchedEntry = json.searchedEntry; //set the searched entry, if it exists
        if (tableNode.isValueInsideTable(this.searchedEntry)) tableNode.gotSearched = true; //if the searched entry is inside the table, set the isSearchedEntry flag to true
        if (json.childInformation?.children) { //check for childs
            if (json.childInformation?.rule !== undefined) { //if there is a rule (bc, maybe there are cases without a rule, idk)
                const ruleNode = new RuleNodeData(json.childInformation.rule, ownId); //create the ruleNode
                if (json.childInformation.isCollapsed !== undefined) ruleNode.isCollapsed = json.childInformation.isCollapsed
                if (json.childInformation.isGreyed !== undefined) ruleNode.isGreyed = json.childInformation.isGreyed
                tableNode.addChild(ruleNode);
                let childrenId = 0;
                for (let i = 0; i < json.childInformation.children.length; i++) {
                    const childJson = json.childInformation.children[i];
                    parameters = json.childInformation.rule.bodyPredicates[i].parameters!;
                    const childId = [...ownId];
                    childId.push(childrenId);
                    ruleNode.addChild(this.handleType1Response(childJson, parameters, childId)); //add "actual" childs to childs of ruleNode
                    childrenId++;
                }

                return tableNode;
            }
        }
        tableNode.isLeafNode = true; //if there are no children, this is a leaf node
        return tableNode;
    }

    public handleType2Response(rootNode: TableNodeData, json: TableEntriesForTreeNodesResponse) {
        for (const entrie of json) {
            const currentNode = this.getNodeById(rootNode, entrie.addressInTree);
            if (currentNode === null) {
                console.error("Node with id " + entrie.addressInTree.join(",") + " not found.");
                continue;
            }
            currentNode.updateType2Query(entrie);
            if (currentNode.isValueInsideTable(this.searchedEntry)) currentNode.gotSearched = true;
        }

        if (json.length === 0) {
            rootNode.clearTableEntriesInSubTree();
        }
    }

    public addRuleForTableEntriesForTreeNodesQuery(rootNode: TableNodeData, node: TableNodeData, ruleId: Rule, index: number): TableNodeData | null {

        if (node.isRootNode) {
            const newRootNode = this.addRuleAboveRoot(rootNode, ruleId, index);
            return newRootNode;
        }
        if (node.isLeafNode) {
            this.addRuleAtLeaf(node, ruleId);
        }
        return rootNode;
    }

    public addRuleAtLeaf(
        leafNode: TableNodeData,
        ruleId: Rule,
    ) {
        const newRuleNode = new RuleNodeData(ruleId);
        const amountOfChildren = ruleId.bodyPredicates.length
        for (let i = 0; i < amountOfChildren; i++) {
            const newChildNode = new TableNodeData({
                "predicate": ruleId.bodyPredicates[i].name,
                "tableEntries": {
                    "entries": [
                        {
                            "entryId": 0,
                            "termTuple": []
                        }
                    ],
                    "pagination": {
                        "start": 0,
                        "moreEntriesExist": false
                    }
                },
                "possibleRulesAbove": [],
                "possibleRulesBelow": [],
            }, ruleId.bodyPredicates[i].parameters, []);
            newRuleNode.addChild(newChildNode);
        }
        leafNode.addChild(newRuleNode);
    }

    public addRuleAboveRoot(
        rootNode: TableNodeData,
        ruleId: Rule,
        indexOfOldRootNode: number
    ) {
        if (!rootNode.isRootNode) {
            console.error("Cannot add rule above non-root node.");
            return null;
        }
        const newRuleNode = new RuleNodeData(ruleId);
        const amountOfChildren = ruleId.bodyPredicates.length

        for (let i = 0; i < amountOfChildren; i++) {
            if (indexOfOldRootNode === i) {
                rootNode.parameterPredicate = ruleId.bodyPredicates[i].parameters;
                newRuleNode.addChild(rootNode)
                continue
            }
            const newChildNode = new TableNodeData({
                "predicate": ruleId.bodyPredicates[i].name,
                "tableEntries": {
                    "entries": [
                        {
                            "entryId": 0,
                            "termTuple": []
                        }
                    ],
                    "pagination": {
                        "start": 0,
                        "moreEntriesExist": false
                    }
                },
                "possibleRulesAbove": [],
                "possibleRulesBelow": [],
            }, ruleId.bodyPredicates[i].parameters, []);
            newRuleNode.addChild(newChildNode);
        }
        const newRootNode = new TableNodeData({
            "predicate": ruleId.relevantHeadPredicate.name,
            "tableEntries": {
                "entries": [

                ],
                "pagination": {
                    "start": 0,
                    "moreEntriesExist": false
                }
            },
            "possibleRulesAbove": [],
            "possibleRulesBelow": [],
        }, ruleId.relevantHeadPredicate.parameters, []);
        newRootNode.addChild(newRuleNode);
        return newRootNode;
    }

    //to set Node as new root node
    public removeRuleAbove(rootNode: TableNodeData, node: TreeNodeData) {
        if (node instanceof TableNodeData) {
            rootNode = node; //set the current tree node to the node
            return node;
        }
        const parent = this.findeParentOfNode(rootNode, node);
        if (parent === undefined) {
            console.error("No parent found for the node.");
            return;
        }
        if (parent instanceof RuleNodeData) {
            console.error("Cannot remove rule node as root node.");
            return;
        }
        rootNode = parent as TableNodeData; //set the parent as root node
        return parent as TableNodeData;
    }

    //to delete an edge
    public removeNode(source: TreeNodeData, target: TreeNodeData) {
        source.removeChild(target);
    }

    //for highlighting of nodes, if they have specific values
    public searchForEntry(rootNode: TableNodeData, entry: string) {
        this.searchedEntry = entry;
        let foundSomething = false;
        const parents: TreeNodeData[] = [rootNode];
        rootNode.gotSearched = false; //reset the searched flag on the root node

        if (rootNode.isValueInsideTable(entry)) {
            rootNode.gotSearched = true;
            foundSomething = true;
        }
        for (const parent of parents) {
            for (const child of parent.getChildren()) {
                if (child instanceof TableNodeData) {
                    const match = child.isValueInsideTable(entry); 
                    child.gotSearched = match;
                    if (match) foundSomething = true;
                    parents.push(child);
                } else {
                    parents.push(child);
                }
            }
        }
        return foundSomething;
    }

    //to collapse/expand the subtree of a node
    public collapseNode(node: TreeNodeData, bool: boolean) {
        node.setCollapsed(bool);
    }

    //increase sice of the node, if expanded
    public changeNodeLayout(node: TreeNodeData, expanded: boolean) {
        if (expanded) {
            node.height = EXTENDED_HEIGHT;
            if (node.width < EXTENDED_WIDTH) node.width = EXTENDED_WIDTH;
        } else {
            node.height = NORMAL_HEIGHT;
            node.width = node.initialWidth
        }
    }

    //to get the direkt Parent of a node (used for focusing on a rule node)
    public findeParentOfNode(rootNode: TableNodeData, node: TreeNodeData) {
        const parents: TreeNodeData[] = [rootNode];
        for (const parent of parents) {
            for (const child of parent.getChildren()) {
                if (child === node) {
                    return parent;
                }
                parents.push(child);
            }
        }
    }

    //to focus on a rule node
    public focusOnRuleNode(rootNode: TableNodeData, node: RuleNodeData) {
        //remove all children of the rules children
        for (const child of node.getChildren()) {
            for (const grandChild of child.getChildren()) {
                child.removeChild(grandChild);
            }
        }

        const parent = this.findeParentOfNode(rootNode, node);
        if (parent === undefined) {
            console.error("No parent found for the node.");
            return;
        }
        if (parent instanceof RuleNodeData) {
            console.error("Cannot remove rule node as root node.");
            return;
        }
        rootNode = parent as TableNodeData; //set the parent as root node
        return parent;
    }

    public loadMoreEntries(node: TableNodeData, pagination: { start: number, count: number }) {
        node.setPagination(pagination.start, pagination.count); //set the pagination of the node
    }

    //undo to the last tree state
    public undo(rootNode: TableNodeData) {
        if (this.undoList.length === 0) {
            console.error("No more undos available.");
            return null;
        }
        const undo = this.undoList.pop(); //remove the last element from the undoList
        if (undo !== undefined) {
            this.redoList.push(rootNode.toUndoRedoState()); //add the last element to the redoList
            console.log("Redo", this.redoList);
            rootNode = this.loadUndoEntry(undo);
            return rootNode;
        }

    }

    //redo to the last tree state
    public redo(rootNode: TableNodeData) {
        if (this.redoList.length === 0) {
            console.error("No more redos available.");
            return null;
        }
        const redo = this.redoList.pop();
        if (redo !== undefined) {
            this.undoList.push(rootNode.toUndoRedoState());
            console.log("Undo", this.undoList);
            rootNode = this.loadUndoEntry(redo);
            return rootNode;
        }
    }

    public resetFlagOnAllNodes(rootNode: TableNodeData, flag: "isBlurred" | "isGreyed") {
        let returnValue = false;
        const parents: TreeNodeData[] = [rootNode];
        for (const parent of parents) {
            if (parent[flag]) returnValue = true; //if at least one node was blurred, return true
            parent[flag] = false;
            for (const child of parent.getChildren()) {
                parents.push(child);
            }
        }
        return returnValue; //return true if at least one node was blurred, otherwise false
    }

    //blurr delete Above
    public setFlagUntilThisNode(rootNode: TableNodeData, node: TreeNodeData, flag: "isBlurred" | "isGreyed") {
        const parents: TreeNodeData[] = [rootNode];
        for (const parent of parents) {
            if (parent === node) {
                parent[flag] = false; // do not set flag on this node
                continue;
            } else {
                parent[flag] = true; // set flag on this node
            }
            for (const child of parent.getChildren()) {
                parents.push(child);
            }
        }
    }

    public setFlagFocusOnNode(rootNode: TableNodeData, node: TreeNodeData, flag: "isBlurred" | "isGreyed") {
        for (const child of node.getChildren()) {
            this.setFlagNodesBelowThis(rootNode, child, flag); //blur all grandchildren of the rule node
        }

        const parent = this.findeParentOfNode(rootNode, node);
        if (parent === undefined) {
            console.error("No parent found for the node.");
            return;
        }
        this.setFlagUntilThisNode(rootNode, parent, flag); //blur all nodes until the parent of the rule node
        if (parent.getChildren().length > 1) {
            for (const sibling of parent.getChildren()) {
                if (sibling !== node) {
                    this.setFlagNodesBelowThis(rootNode, sibling, flag, true)
                }
            }
        }
    }

    //blur deleted edge
    public setFlagNodesBelowThis(rootNode: TableNodeData, node: TreeNodeData, flag: "isBlurred" | "isGreyed", bool: boolean = false) {
        const parents: TreeNodeData[] = bool ? [node] : [...node.getChildren()];
        for (const parent of parents) {
            parent[flag] = true;
            for (const child of parent.getChildren()) {
                parents.push(child);
            }
        }
    }

    public getSearchedValue() {
        return this.searchedEntry;
    }

    public getNodeById(rootNode: TableNodeData, idArray: number[]): TableNodeData | null {
        let currentNode: TableNodeData = rootNode;

        for (const id of idArray) {
            const children = currentNode.getChildren(); //= RuleNode
            if (children.length === 0) {
                console.error("Node with id " + idArray.join(",") + " not found.");
                return null;
            }
            const ruleChildren = children[0].getChildren();
            currentNode = ruleChildren[id] as TableNodeData;

            if (currentNode === undefined) {
                console.error("Node with id " + idArray.join(",") + " not found.");
                return null;
            }
            if (currentNode.id === idArray) {
                return currentNode;
            }
        }
        return currentNode;
    }

    public hasUndos(): boolean {
        return this.undoList.length > 0;
    }

    public hasRedos(): boolean {
        return this.redoList.length > 0;
    }
}