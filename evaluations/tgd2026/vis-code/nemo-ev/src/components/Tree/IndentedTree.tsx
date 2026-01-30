import { Tooltip } from '@mui/material'
import { TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import StringFormatter from '../../util/StringFormatter'

type FlatRow = {
  node: TreeNodeData
  level: number
  isLast: boolean
  branches: boolean[]
}

function flattenTree(
  node: TreeNodeData,
  level = 0,
  isLast = true,
  branches: boolean[] = [],
  result: FlatRow[] = []
) {
  result.push({ node, level, isLast, branches: [...branches] });

  if ((node as any).isCollapsed) {
    return result;
  }
  const children = node.getChildren()
  children.forEach((child, idx) => {
    flattenTree(
      child,
      level + 1,
      idx === children.length - 1,
      [...branches, idx !== children.length - 1],
      result
    )
  })
  return result
}

type IndentedTreeProps = {
  node: TreeNodeData
  onNodeClick: (node: TreeNodeData, bool: boolean) => void
  hoveredNode: TreeNodeData | null
  setHoveredNode: (node: TreeNodeData | null) => void
}

export default function IndentedTree({ node, onNodeClick, hoveredNode, setHoveredNode }: IndentedTreeProps) {
  const rows = flattenTree(node)

  return (
    <div style={{ fontSize: 15, lineHeight: 1.2 }}>
      {rows.map((row, idx) => (
        <IndentedTreeRow
          key={idx}
          row={row}
          onNodeClicked={onNodeClick}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
      ))}
      <div style={{ height: 18, userSelect: "none" }} />
    </div>
  )
}

function IndentedTreeRow({
  row,
  onNodeClicked,
  hoveredNode,
  setHoveredNode
}: Readonly<{
  row: FlatRow
  onNodeClicked: (node: TreeNodeData, bool: boolean) => void
  hoveredNode: TreeNodeData | null
  setHoveredNode: (node: TreeNodeData | null) => void
}>) {
  let color = '#217dbb'
  if (row.node instanceof TableNodeData) color = '#43a047'

  let caret = '';
  if (!row.node.isLeafNode) {
    caret = row.node.isCollapsed ? '>' : 'v';
  }

  let prefix = '';
  for (let i = 0; i < row.level - 1; i++) {
    prefix += '│';
  }
  if (row.level > 0) {
    prefix += '│';
  }


  let background: string;
  if ((row.node as any).gotSearched) {
    background = '#fff7b2';
  } else if (row.node.isCollapsed && !row.node.isLeafNode) {
    background = '#f0f0f0';
  } else if (hoveredNode === row.node) {
    background = '#eaf6fb';
  } else {
    background = 'inherit';
  }

  const content = (
    <div
      onMouseOver={() => setHoveredNode(row.node)}
      onMouseOut={() => setHoveredNode(null)}
      style={{
        cursor: 'pointer',
        background,
        color,
        whiteSpace: 'pre',
      }}
      onClick={e => {
      if (e.ctrlKey) {onNodeClicked(row.node, true)}
        onNodeClicked(row.node, false);
      }}
    >
      {prefix}
      {(caret ? caret : ' ') + ' '}

      {(row.node instanceof TableNodeData) ? StringFormatter.formatPredicate(row.node.getName(), row.node.parameterPredicate): StringFormatter.formatRuleName(row.node.getName())}
    </div>
  );

  return (
    <Tooltip title={"Jump to Node!"} placement="left" enterDelay={500}>
      {content}
    </Tooltip>
  );
}