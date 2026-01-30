// storing state
export type UndoRedoState = UndoRedoStateTable & {
  childInformation?: UndoRedoStateRule;
};

export type UndoRedoStateRule = {
  rule: Rule;
  isCollapsed?: boolean;
  isGreyed?: boolean,
  children: UndoRedoState[];
};

export type UndoRedoStateTable = {
  predicate: string;
  tableEntries: {
    entries: TableEntryResponse[];
    pagination: {
      start: number;
      moreEntriesExist: boolean;
    };
  };
  possibleRulesAbove: Rule[];
  possibleRulesBelow: Rule[];
  isCollapsed?: boolean;
  isGreyed?: boolean,
  //following should be moved to a "global UndoRedoState" in the future
  searchedEntry?: string; 
};


// Type 0: Basis-Typen, TableEntry, TableResponseBase, ...

export interface Predicate {
  name: string;
  parameters: string[];
}

export type RuleId = number;

export interface Rule {
  id: RuleId;
  relevantHeadPredicate: Predicate;
  relevantHeadPredicateIndex: number;
  bodyPredicates: Predicate[];
  stringRepresentation: string;
}

export type TableEntryId = number;
export type TableEntryQueryString = string;
export type TableEntryQuery = TableEntryQueryString | TableEntryId;

export type Pagination = {
  start: number;
  count?: number;
  moreEntriesExist?: boolean;
};

export type TableEntryResponse = {
  entryId: TableEntryId;
  termTuple: string[];
};

export type TableEntries = {
  entries: TableEntryResponse[];
  pagination: Pagination;
};

export type TableResponseBase = {
  predicate: string;
  tableEntries: {
    entries: TableEntryResponse[];
    pagination: {
      start: number;
      moreEntriesExist: boolean;
    };
  };
  possibleRulesAbove: Rule[];
  possibleRulesBelow: Rule[];
  isCollapsed?: boolean;
  isGreyed?: boolean,
  searchedEntry?: string;
};


// Type 1: TreeForTableQuery / TreeForTableResponse

export type TreeForTableResponseChildInformation = {
  rule: Rule;
  isCollapsed?: boolean;
  isGreyed?: boolean,
  children: TreeForTableResponse[];
};

export type TreeForTableResponse = TableResponseBase & {
  childInformation?: TreeForTableResponseChildInformation;
};

export type TreeForTableQuery = {
  predicate: string;
  tableEntries?: {
    queries?: TableEntryQuery[];
    pagination?: {
      start: number;
      count: number;
    };
  };
};

// Type 2: TableEntriesForTreeNodesQuery / TableEntriesForTreeNodesResponse

export type InnerTableQueryChildInformation = {
  rule: RuleId; 
  headIndex: number;
  children: InnerTableQuery[];
};

export type InnerTableQuery = {
  tableEntries?: {
    queries?: TableEntryQuery[];
    pagination?: {
      start: number;
      count: number;
    };
  };
  childInformation?: InnerTableQueryChildInformation;
};

export type TableEntriesForTreeNodesQuery = InnerTableQuery & {
  predicate: string;
};

export type TableEntriesForTreeNodesResponse = (TableResponseBase & {
  addressInTree: number[];
})[];