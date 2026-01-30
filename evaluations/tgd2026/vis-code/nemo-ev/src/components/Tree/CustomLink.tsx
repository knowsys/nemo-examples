import { useState } from "react";
import '../../assets/Link.css'
import { TableNodeData, type TreeNodeData } from "../../data/TreeNodeData";
import { EXTENDED_HEIGHT, greyedButtonStyle, NORMAL_HEIGHT } from "../../types/constants";
import { Tooltip } from "@mui/material";
import { FaScissors } from "react-icons/fa6";

type LinkProps = {
  source: any;
  target: any;
  mode: "explore" | "query";
  markerId?: string;
  onEdgeRemoveButtonClick: (source: TreeNodeData, target: TreeNodeData) => void;
  handleRemoveEdgePreview: (source: TreeNodeData) => void;
  onMouseLeftButton: () => void;
};

export default function CustomLink({ source, target, mode, onEdgeRemoveButtonClick,onMouseLeftButton, handleRemoveEdgePreview }: Readonly<LinkProps>) {
  const [showButton, setShowButton] = useState(false);

  const sourcePoint = [
    source.x,
    source.y + (source.data.isExpanded ? EXTENDED_HEIGHT + 4: NORMAL_HEIGHT * 3 - 8)
  ]
  const targetPoint = [
    target.x,
    target.y + 2
  ]

  const midX = (sourcePoint[0] + targetPoint[0]) / 2;
  const midY = (sourcePoint[1] + targetPoint[1]) / 2;

  const path = `
  M${sourcePoint[0]},${sourcePoint[1]}
  L${targetPoint[0]},${targetPoint[1]}
`;

  const isBlurred = source.data.isBlurred || target.data.isBlurred;
  const isGrey = source.data.isGreyed || target.data.isGreyed;

  return (
    <g
      onMouseEnter={() => setShowButton(true)}
      onMouseLeave={() => setShowButton(false)}
    >
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        className={
          `${isBlurred ? 'edge-blur' : ''}${isGrey ? ' node-grey' : ''}`
        }
      />
      <path
        d={path}
        fill="none"
        stroke="#555"
        strokeWidth={1.5}
        className={
          `${isBlurred ? 'edge-blur' : ''}${isGrey ? ' node-grey' : ''}`
        }
      />

      {showButton && (source.data instanceof TableNodeData) && mode === "query" && (
        <foreignObject x={midX - 12} y={midY - 12} width={24} height={24}>
          <Tooltip title="Cut this edge!" placement="right" enterDelay={500}>
            <button
              className="custom-link-btn"
              onClick={() => onEdgeRemoveButtonClick(source.data, target.data)}
              onMouseEnter={() => handleRemoveEdgePreview(source.data)}
              onMouseLeave={() => onMouseLeftButton()}
              style={greyedButtonStyle(source.data) as React.CSSProperties}
            >
              <FaScissors />
            </button>
          </Tooltip>
        </foreignObject>
      )}
    </g>
  );
}