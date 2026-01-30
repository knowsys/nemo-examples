import type { TableNodeData, TreeNodeData } from '../../../data/TreeNodeData'
import { useState } from 'react'
import '../../../assets/Node.css'
import { TableNodeBox } from './TableNodeBox'
import { FaLaptopCode } from 'react-icons/fa'
import AddRuleDialog from './AddRuleDialog'
import {Tooltip } from '@mui/material'
import { TbFocus2 } from 'react-icons/tb'
import { greyedButtonStyle, NORMAL_HEIGHT } from '../../../types/constants'
import { FaCodeFork, FaCodePullRequest } from 'react-icons/fa6'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import type { Rule, TableEntryResponse } from '../../../types/types'


type NodeProps = {
    node: TableNodeData,
    mode: 'explore' | 'query';
    focusClicked: TreeNodeData | null;
    setFocusClicked: (node: TreeNodeData | null) => void;
    onAddButtonClick: (node: TableNodeData, ruleId: Rule, index: number) => void;
    giveRemoveAbovePreview: (node: TreeNodeData) => void;
    onRemoveButtonClick: (node: TreeNodeData) => void;
    onCollapseButtonClick: (node: TreeNodeData, bool: boolean) => void;
    onNodeClicked: (node: TreeNodeData) => void;
    onMouseLeftButton: () => void;
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onFocusButtonClick: (node: TableNodeData, bool: boolean) => void;
    isHovered?: boolean;
    onPopOutClicked: (node: TableNodeData) => void;
    codingButtonClicked: (node: TableNodeData) => void;
}

export default function TableNode({
    node,
    mode,
    focusClicked,
    codingButtonClicked,
    setFocusClicked,
    onAddButtonClick,
    onMouseLeftButton,
    onRemoveButtonClick,
    onCollapseButtonClick,
    giveRemoveAbovePreview,
    onNodeClicked,
    onRowClicked,
    onFocusButtonClick,
    isHovered,
    onPopOutClicked
}: Readonly<NodeProps>) {
    const [hovered, setHovered] = useState(false)
    const [activeDialog, setActiveDialog] = useState<"above" | "below" | null>(null)

    const handleRuleAboveSelect = (rule: Rule, index: number) => {
        setActiveDialog(null)
        onAddButtonClick(node, rule, index)
    }
    const handleRuleBelowSelect = (rule: Rule, index: number) => {
        setActiveDialog(null)
        onAddButtonClick(node, rule, index)
    }

    return (
        <div
            className={`custom-node${isHovered ? ' hovered' : ''}`}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: isHovered ? '#eaf6fb' : undefined
            }}
        >
            <TableNodeBox
                node={node}
                mode={mode}
                onMouseEnter={() => setHovered(true)}
                onNodeClicked={onNodeClicked}
                onRowClicked={onRowClicked}
                onPopOutClicked={onPopOutClicked}
            />
            {(((hovered || focusClicked === node) && mode === "explore") || (mode === "query" && focusClicked === node))  && (
                <Tooltip title={node === focusClicked ? "Reset focus!" : "Focus on this node!"} placement="right" enterDelay={500}>
                    <button
                        type="button"
                        className="custom-node-btn-corner-base custom-node-btn-corner-explore"
                        style={{ top: -NORMAL_HEIGHT, left: node.width - 10, ...(greyedButtonStyle(node) as React.CSSProperties) }}
                        onClick={() => {
                            if (focusClicked === node) {
                                setFocusClicked(null)
                            }
                            else {
                                setFocusClicked(node)
                            }
                            onFocusButtonClick(node, node === focusClicked)
                        }}
                    >
                        <TbFocus2 />
                    </button>
                </Tooltip>
            )}
            {
                node.isRootNode && node.hasRulseAbove() && mode === "query" && (
                    <Tooltip title="Add a new rule above the root!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className={`custom-node-btn-top add${node.isBlurred ? ' node-blur' : ''}`}
                            onClick={() => setActiveDialog("above")}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            {/*<FaCodeBranch />*/}
                            <FaCodeFork style={{ transform: "rotate(180deg)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                node.isLeafNode && node.hasRulsesBelow() && mode === "query" && (
                    <Tooltip title="Add a new rule below this leaf!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className={`custom-node-btn-bottom add${node.isBlurred ? ' node-blur' : ''}`}
                            onClick={() => setActiveDialog("below")}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            <FaCodePullRequest style={{ transform: "scaleY(-1)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                hovered && !node.isRootNode && mode === "query" && (
                    <Tooltip title="Make this node the new root node!" placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className="custom-node-btn-top"
                            onClick={() => onRemoveButtonClick(node)}
                            onMouseEnter={() => giveRemoveAbovePreview(node)}
                            onMouseLeave={onMouseLeftButton}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            <FaCodeFork style={{ transform: "rotate(180deg)" }} />
                        </button>
                    </Tooltip>
                )
            }

            {
                !node.isLeafNode && (hovered || node.isCollapsed) && mode === "explore" && (
                    <Tooltip title={node.isCollapsed ? "Show the subtree!" : "Hide the subtree!"} placement="right" enterDelay={500}>
                        <button
                            type="button"
                            className="custom-node-btn-bottom"
                            onClick={() => {
                                onCollapseButtonClick(node, !node.isCollapsed)
                                setHovered(false)
                            }}
                            style={greyedButtonStyle(node) as React.CSSProperties}
                        >
                            {node.isCollapsed ? <IoIosArrowDown /> : <IoIosArrowUp />}
                        </button>
                    </Tooltip>
                )
            }
            {/* {hovered && mode === "explore" && (
                <Tooltip title={"Highlight in Code!"} placement="right" enterDelay={500}>
                    <button
                        type="button"
                        className="custom-node-btn-side-left"
                        style={{ right: node.width, ...(greyedButtonStyle(node) as React.CSSProperties) }}
                        onClick={() => codingButtonClicked(node)}
                    >
                        <FaLaptopCode />
                    </button>
                </Tooltip>
            )} */}
            {/* RulesAbove */}
            <AddRuleDialog title={"Add Rule Above"} open={activeDialog === "above"} onClose={() => setActiveDialog(null)} rules={node.getRulesAbove()} onRuleSelect={handleRuleAboveSelect} node={node} showPositionDialog={true}/>

            {/* RulesBelow */}
            <AddRuleDialog title={"Add Rule Below"} open={activeDialog === "below"} onClose={() => setActiveDialog(null)} rules={node.getRulesBelow()} onRuleSelect={handleRuleBelowSelect} node={node}/>
        </div >
    )
}