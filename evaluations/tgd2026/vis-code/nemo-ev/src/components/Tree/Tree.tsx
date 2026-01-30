import { useMemo, useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { TableNodeData, type TreeNodeData } from '../../data/TreeNodeData'
import CustomLink from './CustomLink'
import TreeNodeRenderer from './TreeNodeRenderer'
import { flextree } from 'd3-flextree'
import { TOP_PADDING } from '../../types/constants'
import type { Rule, TableEntryResponse } from '../../types/types'

// Neuer Typ für flexibles Panning
type PanToNode = { node: TreeNodeData, center?: boolean } | null;

type TreeProps = {
  data: TableNodeData;
  mode: "explore" | "query";
  treeVersion: number;
  panToNodeId?: PanToNode;
  setPanToNodeId?: (id: PanToNode) => void;
  width?: number;
  height?: number;
  focusClicked: TreeNodeData | null;
  setFocusClicked: (node: TreeNodeData | null) => void;
  onAddButtonClick: (node: TableNodeData, ruleId: Rule, index: number) => void;
  onRemoveButtonClick: (node: TreeNodeData) => void;
  onEdgeRemoveButtonClick: (source: TreeNodeData, target: TreeNodeData) => void;
  onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
  onNodeClicked: (node: TreeNodeData) => void;
  onMouseLeftButton: () => void;
  codingButtonClicked: (node: TreeNodeData) => void;
  giveFocusPreview: (node: TreeNodeData) => void;
  handleRemoveEdgePreview: (source: TreeNodeData) => void;
  giveRemoveAbovePreview: (node: TreeNodeData) => void;
  onFocusButtonClick: (node: TreeNodeData) => void;
  onFocusNode: (node: TreeNodeData, bool?: boolean) => void;
  onRowClicked: (row: TableEntryResponse, predicate: string) => void;
  hoveredNode?: TreeNodeData | null;
  onPopOutClicked: (node: TableNodeData) => void;
};

export default function Tree({
  data,
  mode,
  width,
  height,
  panToNodeId,
  focusClicked,
  codingButtonClicked,
  setFocusClicked,
  onAddButtonClick,
  onRemoveButtonClick,
  onEdgeRemoveButtonClick,
  onCollapseButtonClick,
  onNodeClicked,
  handleRemoveEdgePreview,
  giveFocusPreview,
  onMouseLeftButton,
  giveRemoveAbovePreview,
  onFocusButtonClick,
  onFocusNode,
  onRowClicked,
  treeVersion,
  hoveredNode,
  setPanToNodeId,
  onPopOutClicked
}: Readonly<TreeProps>) {

  const { nodes, links, maxX, maxY } = useMemo(() => {
    function childrenFn(d: TableNodeData): TableNodeData[] | null {
      if ((d as TreeNodeData).isCollapsed) return null;
      return ((d.getChildren?.() ?? []) as TableNodeData[]).filter(() => true);
    }

    const layout = flextree().nodeSize((node: any) => [
      (node.data.width ?? 60) + 60,
      (node.data.height ?? 120) + 100
    ])

    const root = layout.hierarchy(data, childrenFn);
    layout(root);
    const nodes = root.descendants();
    const links = root.links();
    const maxX = Math.max(...nodes.map((n: { x: any }) => n.x ?? 0));
    const maxY = Math.max(...nodes.map((n: { y: any }) => n.y ?? 0));
    return { nodes, links, maxX, maxY };
  }, [data, width, height, treeVersion]);

  const padding = 100
  if (!width || !height) return null
  const svgWidth = Math.max(width, (maxY || 0) + padding)
  const svgHeight = Math.max(height, (maxX || 0) + padding)

  // Zoom/Pan
  const svgRef = useRef<SVGSVGElement>(null)

  // Initialisiere Transform-Status
  const centerX = width / 2;
  const initialOffsetX = centerX 
  const initialOffsetY = TOP_PADDING 

  const [transform, setTransform] = useState(
    d3.zoomIdentity.translate(initialOffsetX, initialOffsetY)
  );

  useEffect(() => {
  if (!svgRef.current) return;
  const svg = d3.select(svgRef.current);
  svg.call(
    d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .filter((event) => event.type !== "dblclick")
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setTransform(event.transform)
      })
  );
}, []);

  const [lastCenteredRootId, setLastCenteredRootId] = useState<number[] | null>(null);

useEffect(() => {
  if (!nodes.length || !width || !height || !svgRef.current) return;

  if (panToNodeId) {
  const { node, center } = panToNodeId;
  const targetNode = nodes.find((n: any) => n.data === node); // Direktes Objekt-Matching!
  if (!targetNode) return;

  const x = targetNode.x;
  const y = targetNode.y;
  const centerX = width / 2;

  let dx, dy;
  if (center) {
    const centerY = height / 2;
    dx = centerX - x;
    dy = centerY - y;
  } else {
    dx = centerX - x;
    dy = TOP_PADDING - y;
  }

  const newTransform = d3.zoomIdentity.translate(dx, dy);
  d3.select(svgRef.current)
    .transition()
    .duration(500)
    .call(d3.zoom().transform as any, newTransform);

  setTransform(newTransform);

  if (setPanToNodeId) {
    setTimeout(() => setPanToNodeId(null), 600);
  }
  return;
}

  //for first redering
  const rootNode = nodes[0];
  if (lastCenteredRootId && JSON.stringify(rootNode.data.id) === JSON.stringify(lastCenteredRootId)) {
    return;
  }

  const centerX = width / 2;
  const initialOffsetX = centerX - (rootNode?.y ?? 0);
  const initialOffsetY = TOP_PADDING - (rootNode?.x ?? 0);
  const initialTransform = d3.zoomIdentity.translate(initialOffsetX, initialOffsetY);

  setTransform(initialTransform);

  d3.select(svgRef.current)
    .call(d3.zoom().transform as any, initialTransform);

  setLastCenteredRootId(rootNode.data.id);

}, [nodes, width, height, panToNodeId, lastCenteredRootId, setPanToNodeId]);

  return (
    <div style={{ position: 'relative', width: svgWidth, height: svgHeight }}>
      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill="#555" />
          </marker>
        </defs>
        <g transform={transform.toString()}>
          {links
            .filter((link: { target: { data: { isPlaceholder: any } } }) => !link.target.data.isPlaceholder)
            .map((link: { source: unknown; target: unknown }, i: number) => (
              <CustomLink key={i} mode={mode} source={link.source} handleRemoveEdgePreview={handleRemoveEdgePreview} onMouseLeftButton={onMouseLeftButton} target={link.target} onEdgeRemoveButtonClick={onEdgeRemoveButtonClick} markerId="arrow" />
            ))}

          {nodes.map((node: any, i: number) => (
            <TreeNodeRenderer
              key={i}
              node={node}
              mode={mode}
              codingButtonClicked={codingButtonClicked}
              focusClicked={focusClicked}
              onMouseLeftButton={onMouseLeftButton}
              setFocusClicked={setFocusClicked}
              onRemoveButtonClick={onRemoveButtonClick}
              onAddButtonClick={onAddButtonClick}
              giveFocusPreview={giveFocusPreview}
              giveRemoveAbovePreview={giveRemoveAbovePreview}
              onCollapseButtonClick={onCollapseButtonClick}
              onNodeClicked={onNodeClicked}
              onFocusButtonClick={onFocusButtonClick}
              onFocusNode={onFocusNode}
              onRowClicked={onRowClicked}
              hoveredNode={hoveredNode}
              onPopOutClicked={onPopOutClicked}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}