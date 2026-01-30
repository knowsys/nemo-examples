import { RuleNodeData, TableNodeData, TreeNodeData } from "../../data/TreeNodeData";
import type { Rule, TableEntryResponse } from "../../types/types";
import RuleNode from "./Node/RuleNode";
import TableNode from "./Node/TableNode";

type TreeNodeRendererProps = {
  node: any;
  mode: "explore" | "query";
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  onAddButtonClick: (node: TableNodeData, ruleId: Rule, index: number) => void;
  onRemoveButtonClick: (node: TreeNodeData) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  onNodeClicked: (node: TreeNodeData) => void;
  onMouseLeftButton: () => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  giveRemoveAbovePreview: (node: TreeNodeData) => void;
  onFocusButtonClick: (node: TreeNodeData) => void;
  onFocusNode: (node: TreeNodeData, bool?: boolean) => void;
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  hoveredNode?: TreeNodeData | null; 
  onPopOutClicked: (node: TableNodeData) => void;
  codingButtonClicked: (node:TreeNodeData) => void;
};

export default function TreeNodeRenderer({
  node,
  mode,
  focusClicked,
  setFocusClicked,
  onRowClicked,
  codingButtonClicked,
  onAddButtonClick,
  onRemoveButtonClick,
  onCollapseButtonClick,
  onMouseLeftButton,
  giveFocusPreview,
  giveRemoveAbovePreview,
  onNodeClicked,
  onFocusButtonClick,
  onFocusNode,
  hoveredNode,
  onPopOutClicked  
}: Readonly<TreeNodeRendererProps>) {

  if (node.data instanceof TableNodeData) {
    return (
      <foreignObject
        x={node.x - node.data.width / 2}
        y={node.y}
        width={node.data.width}
        height={node.data.height}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            width: node.data.width,
            height: node.data.height,
          }}
        >
          <TableNode
            node={node.data}
            mode={mode}
            setFocusClicked={setFocusClicked}
            focusClicked={focusClicked}
            onRowClicked={onRowClicked}
            codingButtonClicked={codingButtonClicked}
            onRemoveButtonClick={onRemoveButtonClick}
            giveRemoveAbovePreview= {giveRemoveAbovePreview}
            onMouseLeftButton={onMouseLeftButton}
            onNodeClicked={onNodeClicked}
            onAddButtonClick={onAddButtonClick}
            onCollapseButtonClick={onCollapseButtonClick}
            onFocusButtonClick={onFocusNode}
            isHovered={hoveredNode === node.data} 
            onPopOutClicked={onPopOutClicked}
          />
        </div>
      </foreignObject>
    )
  }
  if (node.data instanceof RuleNodeData) {
    return (
      <foreignObject
        x={node.x - node.data.width / 2}
        y={node.y}
        width={node.data.width}
        height={node.data.height}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            width: node.data.width,
            height: node.data.height,
          }}
        >
          <RuleNode
            node={node.data}
            mode={mode}
            onMouseLeftButton={onMouseLeftButton}
            giveFocusPreview={giveFocusPreview}
            focusClicked={focusClicked}
            codingButtonClicked={codingButtonClicked}
            setFocusClicked={setFocusClicked}
            onCollapseButtonClick={onCollapseButtonClick}
            onFocusButtonClick={onFocusButtonClick}
            onFocusNode={onFocusNode}
            isHovered={hoveredNode === node.data} 
          />
        </div>
      </foreignObject>
    )
  }
  return null
}