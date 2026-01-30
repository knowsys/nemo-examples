import '../../../assets/NodeBox.css'
import type { RuleNodeData } from '../../../data/TreeNodeData'
import StringFormatter from '../../../util/StringFormatter'

type NodeBoxProps = {
  node: RuleNodeData
  onMouseEnter?: () => void 
}

export function RuleNodeBox({ node, onMouseEnter}: Readonly<NodeBoxProps>) {
  return (
    <div
      className={`rule-node-box${node.isBlurred ? ' node-blur' : ''}${node.isGreyed ? ' node-grey' : ''}`}
      onMouseEnter={onMouseEnter}
      style={{
        width: node.width,
        height: node.height,
        minWidth: 60,
        minHeight: 33,
      }}
    >
      {StringFormatter.formatRuleName(node.getName())}
    </div>
  )
}