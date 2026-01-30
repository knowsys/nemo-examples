import IndentedTree from "../Tree/IndentedTree";
import { TreeNodeData } from "../../data/TreeNodeData";
import '../../assets/Overlay.css'
import { Tooltip } from '@mui/material';
import { useState } from 'react';
import { Resizable } from "re-resizable";
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

type SidePanelProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  rootNode: TreeNodeData;
  hoveredNode: TreeNodeData | null;
  setHoveredNode: (node: TreeNodeData | null) => void;
  onNodeClick: (node: TreeNodeData, bool: boolean) => void;
};

export default function SidePanel({
  open,
  onClose,
  rootNode,
  hoveredNode,
  setHoveredNode,
  onNodeClick,
}: Readonly<SidePanelProps>) {
  const [drawerWidth, setDrawerWidth] = useState(400);

  const HANDLE_WIDTH = 2;
  return (
    <>
      {!open && (
        <Tooltip title="Open the overview tree!" placement="left" enterDelay={500}>
          <button
            className="overlay-toggle-btn"
            style={{ left: 0 }}
            onClick={() => onClose(true)}
          >
            <IoIosArrowForward />
          </button>
        </Tooltip>
      )}
      {open && (
        <Tooltip title="Close the overview tree!" placement="left" enterDelay={500}>
          <button
            className="overlay-toggle-btn"
            onClick={() => onClose(false)}
            style={{
              position: 'fixed',
              top: '50%',
              left: drawerWidth - HANDLE_WIDTH,
              transform: 'translateY(-50%)',
              zIndex: 4,
            }}
          >
            <IoIosArrowBack />
          </button>
        </Tooltip>
      )}
      {/* somehow css doesnt work, so inline */}

      {open && (
        <Resizable
          size={{ width: drawerWidth, height: "100vh" }}
          minWidth={150}
          maxWidth={700}
          enable={{ right: open }}
          handleStyles={{
            right: {
              cursor: "ew-resize",
            }
          }}
          onResize={(e, direction, ref, d) => {
            setDrawerWidth(ref.offsetWidth);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 4,
            height: "100vh",
            background: "#fff",
            boxShadow: open ? "2px 0 8px rgba(0,0,0,0.07)" : undefined,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: drawerWidth - HANDLE_WIDTH,
              height: "100%",
              padding: 24,
              boxSizing: "border-box",
              overflowY: "auto",
              transition: "width 0.2s",
            }}
          >
            <IndentedTree
              node={rootNode}
              onNodeClick={onNodeClick}
              hoveredNode={hoveredNode}
              setHoveredNode={setHoveredNode}
            />
          </div>
        </Resizable>
      )}
    </>
  );
}