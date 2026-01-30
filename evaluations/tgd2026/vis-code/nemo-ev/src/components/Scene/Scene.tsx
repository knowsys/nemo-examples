import { useEffect, useState } from "react";
import Tree from "../Tree/Tree";
import { IconButton, Snackbar, Tooltip, Button } from "@mui/material";
import { DataManager } from "./DataManager";
import { RuleNodeData, TableNodeData, TreeNodeData } from "../../data/TreeNodeData";
import './../../assets/index.css'
import SidePanel from "./SidePanel";
import TableDialog from "./TableDialog";
import type { Rule, TableEntriesForTreeNodesQuery, TableEntriesForTreeNodesResponse, TableEntryResponse, TreeForTableQuery, TreeForTableResponse } from "../../types/types";
import { FaRedo, FaUndo } from "react-icons/fa";
import TableDialogPanel from "./TableDialogPanel";
import SettingsMenu from "./SettingsMenu";
import SearchDialog from "./SearchDialog";
import { IoMenu } from "react-icons/io5";
import { HIGHLIGHTING_COLORS } from "../../types/constants";
import EditQueryDialog from "./EditQueryDialog";

type SceneProps = {
  sendMessage: (msg: { queryType: string, payload: TableEntriesForTreeNodesQuery | TreeForTableQuery }) => void;
  message: { responseType: string, payload: TableEntriesForTreeNodesResponse | TreeForTableResponse } | null;
  codingButtonClicked: (node: TreeNodeData) => void; // Optional prop for coding button click handler
};

// ...imports...

function Scene({ sendMessage, message, codingButtonClicked }: SceneProps) {
  // State for window dimensions
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Data manager instance (it might not have been a good idea to do it this way)
  const [dataManager] = useState(() => new DataManager());

  // State for side panel visibility
  const [showSidePanel, setShowSidePanel] = useState(true);

  // State to trigger tree re-render
  const [treeVersion, setTreeVersion] = useState(0);

  // State for currently hovered node in the tree
  const [hoveredNode, setHoveredNode] = useState<TreeNodeData | null>(null);

  // State / Node for maximized table dialog
  const [maximizedTable, setMaximizedTable] = useState<TableNodeData | null>(null);

  // State / Nodes for all open table dialogs in the panel
  const [tableDialogNodes, setTableDialogNodes] = useState<TableNodeData[]>([]);

  // State to trigger TableDialogPanel re-render
  const [tableDialogVersion, setTableDialogVersion] = useState(0);

  // State for search dialog visibility and value
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // State for focused node in the tree
  const [focusClicked, setFocusClicked] = useState<TreeNodeData | null>(null);

  const [queries, setQueries] = useState<string[] | []>([]);

  // State for the root node of the tree
  const [rootNode, setRootNode] = useState<TableNodeData>(new TableNodeData({
    "predicate": "predicate",
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
  }, [""], [])); // Initialize with a default node

  // State for settings menu and mode
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState<"explore" | "query">("query");

  // State for snackbar notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);

  const [editQueryOpen, setEditQueryOpen] = useState(false);

  useEffect(() => {
    if (snackbarError && snackbarOpen) {
      const timer = setTimeout(() => setSnackbarError(false), 3000); //to not always set the error state when showing a snackbar
      return () => clearTimeout(timer);
    }
  }, [snackbarError]);

  // State for panning to a specific node in the tree
  const [panToNodeId, setPanToNodeId] = useState<{ node: TreeNodeData, center?: boolean } | null>(null);

  // Handle window resize to update dimensions
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle keyboard shortcuts for undo/redo and mode switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        if (dataManager.hasUndos()) handleUndo();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "y") {
        if (dataManager.hasRedos()) handleRedo();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        setMode("query");
        setFocusClicked(null);
        handleResetEffect("isGreyed");
        setSnackbarMsg("Switched to Query Mode");
        setSnackbarOpen(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        setMode("explore");
        setSnackbarMsg("Switched to Explore Mode");
        setSnackbarOpen(true);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        setMode(prev => {
          const newMode = prev === "explore" ? "query" : "explore";
          setSnackbarMsg(`Switched to ${newMode.charAt(0).toUpperCase() + newMode.slice(1)} Mode`);
          setSnackbarOpen(true);
          if (newMode !== "explore") {
            setFocusClicked(null);
            handleResetEffect("isGreyed");
          }
          return newMode;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, focusClicked]);

  // Handle incoming messages and update tree/table data accordingly
  useEffect(() => {
    if (!message) return;
    
    if (message && message.responseType === "treeForTable") {
      const tftr = message.payload as TreeForTableResponse;
      const node = dataManager.handleType1Response(tftr);
      node.isRootNode = true;
      setRootNode(node);
      setQueries(tftr.tableEntries.entries.map(e => e.termTuple.join(",")));
    }
    if (message && message.responseType === "tableEntriesForTreeNodes") {
      dataManager.handleType2Response(rootNode, message.payload as TableEntriesForTreeNodesResponse);
      if ((message.payload as TableEntriesForTreeNodesResponse).length === 0) {
        setSnackbarError(true);
        setSnackbarMsg("Proof tree of that form does not exist!");
        setSnackbarOpen(true);
      }
      setTableDialogVersion(v => v + 1);
      setTreeVersion(v => v + 1);

      if (rootNode.getTableEntries().length > 1) setSnackbarMsg("Restriction of the tree has been lifted");
    }
    
  }, [message]);

  // Send a type 2 query
  const sendType2Message = (node: TableNodeData) => {
    queries.length = 0;
    sendMessage(dataManager.createType2Query(node.toTableEntriesForTreeNodesQueryJSON(true, true, queries)));
    setTreeVersion(v => v + 1);
  }

  // Send a type 1 query
  const sendType1Message = (row: TableEntryResponse, predicate: string) => {
    setQueries([row.termTuple.join(',')])
    sendMessage(dataManager.createType1Query(row, predicate));
    const params = new URLSearchParams(window.location.search);
    params.set("predicate", predicate);
    params.set("query", `[${row.entryId}]`);

    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  // Handle removing a rule above a node
  const handleRemoveAboveButtonClick = (node: TreeNodeData) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    const newRoot = dataManager.removeRuleAbove(rootNode, node)!;
    dataManager.updateTreeDataStructure(newRoot)
    setRootNode(newRoot);
    sendType2Message(newRoot);

    setPanToNodeId({ node: node });
  };

  // Handle removing an edge 
  const handleRemoveButtonClick = (source: TreeNodeData, target: TreeNodeData) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    dataManager.removeNode(source, target);
    dataManager.updateTreeDataStructure(rootNode)
    sendType2Message(rootNode);
  };

  // Handle adding a rule to a node
  const handleAddRuleButtonClick = (node: TableNodeData, id: Rule, index: number) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    const newRoot = dataManager.addRuleForTableEntriesForTreeNodesQuery(rootNode, node, id, index);
    if (newRoot !== null) {
      dataManager.updateTreeDataStructure(newRoot)
      setRootNode(newRoot);
      sendType2Message(newRoot);
    }
  };

  // Handle focusing on a rule node
  const handleRuleFocusButtonClick = (node: TreeNodeData) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    if (node instanceof RuleNodeData) {
      const newRoot = dataManager.focusOnRuleNode(rootNode, node)!;
      if (newRoot instanceof TableNodeData) {
        dataManager.updateTreeDataStructure(newRoot)
        setRootNode(newRoot);
        sendType2Message(newRoot);
      }
    }
    setPanToNodeId({ node: node, center: true });
  };

  // Handle focusing on a node (for greyed effect)
  const handleFocusNode = (node: TreeNodeData, bool?: boolean) => {
    dataManager.resetFlagOnAllNodes(rootNode, "isGreyed")
    if (!bool) dataManager.setFlagFocusOnNode(rootNode, node, "isGreyed");
    setTreeVersion(v => v + 1);
  }

  // Handle focusing on a fact in a table
  const handleFocusOnRow = (row: TableEntryResponse, predicate: string) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    sendType1Message(row, predicate);
  };

  // Handle clicking a node in the tree (isExpanded)
  const handleNodeClick = (node: TreeNodeData) => {
    dataManager.changeNodeLayout(node, node.isExpanded);
    setTreeVersion(v => v + 1);
  };

  // Handle collapsing/expanding a subtree
  const handleCollapseButtonClick = (node: TreeNodeData, bool: boolean) => {
    dataManager.collapseNode(node, bool);
    setTreeVersion(v => v + 1);
  };

  // Handle showing a table dialog for a node in the table panel
  const handleShowTable = (node: TableNodeData) => {
    setTableDialogNodes(prev => {
      if (prev.includes(node)) return prev;

      let newPrev = prev;
      if (prev.length >= HIGHLIGHTING_COLORS.length) {
        prev[0].isHighlighted = -1;
        newPrev = prev.slice(1);
      }

      const used = newPrev.map(n => n.isHighlighted);
      const free = HIGHLIGHTING_COLORS.findIndex((_, idx) => !used.includes(idx));
      node.isHighlighted = free !== -1 ? free : 0;

      return [...newPrev, node];
    });
  };

  const moveTableLeft = (node: TableNodeData) => {
    setTableDialogNodes(prev => {
      const idx = prev.indexOf(node);
      if (idx > 0) {
        const newArr = [...prev];
        [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
        return newArr;
      }
      return prev;
    });
  };

  const moveTableRight = (node: TableNodeData) => {
    setTableDialogNodes(prev => {
      const idx = prev.indexOf(node);
      if (idx < prev.length - 1 && idx !== -1) {
        const newArr = [...prev];
        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
        return newArr;
      }
      return prev;
    });
  };

  // Handle closing a table dialog (removes only the given node)
  const handleCloseTableDialog = (node?: TableNodeData) => {
    setTableDialogNodes(prev => {
      if (!node) return [];
      node.isHighlighted = -1;
      return prev.filter(n => n !== node);
    });
  };

  // Handle loading more entries for a table node
  const handleLoadMoreClicked = (node: TableNodeData, pagination: { start: number, count: number }) => {
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    dataManager.loadMoreEntries(node, pagination);
    sendType2Message(rootNode);
  }

  // Handle opening the search dialog
  const handleSearchClick = () => {
    setSearchDialogOpen(true);
  };

  // Handle confirming a search
  const handleSearchConfirm = () => {
    setSearchDialogOpen(false);
    if (dataManager.searchForEntry(rootNode, searchValue)) {
      //dataManager.pushNewElementToUndoList(json);
      setTreeVersion(v => v + 1);
    }
  };

  // Handle undo action
  const handleUndo = () => {
    const undoResult = dataManager.undo(rootNode);
    if (undoResult) {
      undoResult.isRootNode = true;
      setRootNode(undoResult);
      //setPanToNodeId({ node: undoResult }) 
      setTreeVersion(v => v + 1);
    }
  };

  // Handle redo action
  const handleRedo = () => {
    const redoResult = dataManager.redo(rootNode);
    if (redoResult) {
      redoResult.isRootNode = true;
      setRootNode(redoResult);
      //setPanToNodeId({ node: redoResult })
      setTreeVersion(v => v + 1);
    }
  };

  // Handle removing restriction from the tree
  const handleRestriction = (pqueries: string[]) => {
    console.log(pqueries)
    if (pqueries.length === 0) {
      queries.length = 0;
    } 
    setQueries(pqueries);
    dataManager.pushNewElementToUndoList(rootNode.toUndoRedoState());
    sendMessage(dataManager.createType2Query(rootNode.toTableEntriesForTreeNodesQueryJSON(pqueries.length === 0, true, pqueries)));
    setTreeVersion(v => v + 1); //since sendType2 would not have the new restriction value
  }

  // Handle resetting visual effects (blurred/greyed)
  const handleResetEffect = (type: "isBlurred" | "isGreyed") => {
    dataManager.resetFlagOnAllNodes(rootNode, type);
    setTreeVersion(v => v + 1);
  }

  // Handle preview for removing above a node
  const handleRemoveAbovePreview = (node: TreeNodeData) => {
    dataManager.setFlagUntilThisNode(rootNode, node, "isBlurred");
    setTreeVersion(v => v + 1);
  }

  // Handle preview for removing an edge
  const handleRemoveEdgePreview = (source: TreeNodeData) => {
    dataManager.setFlagNodesBelowThis(rootNode, source, "isBlurred");
    setTreeVersion(v => v + 1);
  }

  // Handle preview for focusing a node 
  const handleFocusPreview = (node: TreeNodeData) => {
    dataManager.setFlagFocusOnNode(rootNode, node, "isBlurred");
    setTreeVersion(v => v + 1);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Settings menu button */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
        <IconButton onClick={() => setSettingsOpen(true)}>
          <IoMenu />
        </IconButton>
      </div>
      {/* Settings menu */}
      <SettingsMenu
        open={settingsOpen}
        mode={mode}
        setFocusedClicked={() => setFocusClicked(null)}
        setMode={setMode}
        onClose={() => setSettingsOpen(false)}
        resetExplore={() => handleResetEffect("isGreyed")}
      />

      {/* Top right action buttons */}
      <div style={{ position: "absolute", top: 72, right: 16, zIndex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Tooltip title="Search for specific table entries!" placement="left" enterDelay={500}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
          >
            Find in Tree
          </Button>
        </Tooltip>
        <Tooltip title="Undo the last action taken!" placement="left" enterDelay={500}>
          <Button
            variant="outlined"
            startIcon={<FaUndo />}
            disabled={!dataManager.hasUndos()}
            onClick={handleUndo}
          >
            Undo
          </Button>
        </Tooltip>
        <Tooltip title="Redo the last undone action!" placement="left" enterDelay={500}>
          <Button
            variant="outlined"
            startIcon={<FaRedo />}
            disabled={!dataManager.hasRedos()}
            onClick={handleRedo}
          >
            Redo
          </Button>
        </Tooltip>
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: "#f5f7fa",
            borderRadius: 10,
            border: "1px solid #b3c2e6",
            maxWidth: "200px",
            minWidth: "200px",
            overflowX: "auto",
            fontSize: "0.97em",
            boxShadow: "0 1px 4px rgba(180, 194, 230, 0.12)"
          }}
        >
          <div>
            <b>Current Predicate:</b>
            <div style={{ whiteSpace: "nowrap" }}>
              {rootNode.getName() || "—"}
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <b>Current Query Restriction:</b>
            <div style={{ whiteSpace: "nowrap" }}>
              {queries.length > 0 ? queries.map(q => <div>{q}</div>) : <div> [ ] </div>}
            </div>
          </div>
        </div>
        <Button
          variant="outlined"
          size="small"
          style={{ marginTop: 8 }}
          onClick={() => {
            setEditQueryOpen(true);
          }}
        >
          Edit current query
        </Button>

      </div>

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        onClose={() => setSearchDialogOpen(false)}
        onConfirm={handleSearchConfirm}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          content: {
            sx: {
              background: snackbarError ? "#d32f2f" : undefined,
              color: "#fff"
            }
          }
        }}
      />

      {/* Table dialog panel (multiple tables) */}
      <TableDialogPanel
        nodes={tableDialogNodes}
        onMoveLeft={moveTableLeft}
        onMoveRight={moveTableRight}
        mode={mode}
        open={true}
        onClose={(node: TableNodeData) => handleCloseTableDialog(node)}
        onRowClicked={handleFocusOnRow}
        onLoadMoreClicked={handleLoadMoreClicked}
        version={tableDialogVersion}
        onMaximizeTable={setMaximizedTable}
      />

      {/* Fullscreen table dialog */}
      {maximizedTable && (
        <TableDialog
          node={maximizedTable}
          mode={mode}
          open={true}
          onClose={() => setMaximizedTable(null)}
          onRowClicked={handleFocusOnRow}
          onLoadMoreClicked={handleLoadMoreClicked}
          version={tableDialogVersion}
          onTogglePanel={() => setMaximizedTable(null)}
        />
      )}

      {/* Main tree visualization */}
      <Tree
        data={rootNode}
        mode={mode}
        giveRemoveAbovePreview={handleRemoveAbovePreview}
        panToNodeId={panToNodeId}
        hoveredNode={hoveredNode}
        treeVersion={treeVersion}
        width={dimensions.width}
        height={dimensions.height}
        codingButtonClicked={codingButtonClicked}
        onRemoveButtonClick={handleRemoveAboveButtonClick}
        onAddButtonClick={handleAddRuleButtonClick}
        onEdgeRemoveButtonClick={handleRemoveButtonClick}
        onCollapseButtonClick={handleCollapseButtonClick}
        onMouseLeftButton={() => handleResetEffect("isBlurred")}
        giveFocusPreview={handleFocusPreview}
        handleRemoveEdgePreview={handleRemoveEdgePreview}
        onNodeClicked={handleNodeClick}
        onFocusButtonClick={handleRuleFocusButtonClick}
        onFocusNode={handleFocusNode}
        onRowClicked={handleFocusOnRow}
        onPopOutClicked={handleShowTable}
        setPanToNodeId={setPanToNodeId}
        setFocusClicked={setFocusClicked}
        focusClicked={focusClicked}
      />

      {/* Side panel with indented tree */}
      <SidePanel
        open={showSidePanel}
        onClose={() => setShowSidePanel(!showSidePanel)}
        rootNode={rootNode}
        hoveredNode={hoveredNode}
        setHoveredNode={setHoveredNode}
        onNodeClick={(node, bool) => {
          setPanToNodeId({ node: node, center: true });

          if (mode === "explore") {
            setFocusClicked(node);
            handleFocusNode(node, false);
          }
          if (mode === "query") {
            if (bool) {
              setFocusClicked(node);
              handleFocusNode(node, false);
            }
          }
        }}
      />

      <EditQueryDialog
        open={editQueryOpen}
        predicate={rootNode.getName()}
        query={queries}
        entries={rootNode.getTableEntries()}
        onClose={() => setEditQueryOpen(false)}
        onApply={handleRestriction}
      />
    </div>
  );  
}

export default Scene;