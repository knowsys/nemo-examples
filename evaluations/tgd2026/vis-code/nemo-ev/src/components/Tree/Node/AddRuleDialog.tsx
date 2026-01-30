import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import type { Rule } from '../../../types/types'
import React, { useState } from 'react'
import type { TableNodeData } from '../../../data/TreeNodeData'

type AddRuleDialogProps = {
  open: boolean
  node: TableNodeData
  onClose: () => void
  rules: Rule[]
  onRuleSelect: (rule: Rule, position: number) => void
  title?: string
  showPositionDialog?: boolean
}

function splitPredicates(body: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (const element of body) {
    const char = element;
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) result.push(current.trim());
  return result;
}

function getPredicateParts(body: string): string[] {
  return splitPredicates(body)
    .map(p => p.trim().replace(/[.\s]*$/, ""))
    .filter(p => p.includes('(') && p.endsWith(')'));
}

function getRulePositions(rule: Rule, nodeName: string): string[] {
  const [head, body] = rule.stringRepresentation.split(':-').map(s => s.trim());
  if (!body) return [];
  const bodyParts = getPredicateParts(body);
  const positions: string[] = [];
  for (let i = 0; i < bodyParts.length; i++) {
    const parts = [...bodyParts];
    if (parts[i].startsWith(nodeName)) {
      parts[i] = '<currentRoot>';
      positions.push(`${head} :- ${parts.join(', ')}`);
    }
  }
  return positions;
}

export default function AddRuleDialog({
  open,
  node,
  onClose,
  rules,
  onRuleSelect,
  title = "Rules",
  showPositionDialog = false
}: Readonly<AddRuleDialogProps>) {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [positionDialogOpen, setPositionDialogOpen] = useState(false)

  const handleRuleClick = (rule: Rule) => {
    if (!showPositionDialog) { //if add below, add rule on position 0
      onRuleSelect(rule, 0);
      setSelectedRule(null);
      setPositionDialogOpen(false);
      return;
    }

    const [_, body] = rule.stringRepresentation.split(':-').map(s => s.trim());
    const nodeName = node.getName();
    const possibleChildrenNames = getPredicateParts(body || "").map(p => p.split('(')[0].trim());
    
    const childrenWithSameName = possibleChildrenNames.filter(n => n === nodeName).length;
    if (childrenWithSameName === 1) {
      const pos = possibleChildrenNames.findIndex(n => n === nodeName);
      onRuleSelect(rule, pos);
      setSelectedRule(null);
      setPositionDialogOpen(false);
    } else { //if there are multiple children with the same name, show position dialog
      setSelectedRule(rule);
      setPositionDialogOpen(true);
    }
  };

  const handlePositionSelect = (idx: number) => {
    if (selectedRule) {
      onRuleSelect(selectedRule, idx)
      setPositionDialogOpen(false)
      setSelectedRule(null)
    }
  }

  const handlePositionDialogClose = () => {
    setPositionDialogOpen(false)
    setSelectedRule(null)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ pb: 1, pt: 1.5 }}>{title}</DialogTitle>
        <DialogContent sx={{ p: 1, pb: 0 }}>
          {/*showPositionDialog && (
            <div style={{ color: "#b71c1c", marginBottom: 8, paddingLeft: 16, fontWeight: 500 }}>
              The query will be lost when adding a new root!
            </div>
          )*/}
          <List sx={{ p: 0 }}>
            {rules.map((rule, idx) => (
              <ListItem
                key={idx}
                disablePadding
                sx={{ minHeight: 28 }}
              >
                <ListItemButton
                  onClick={() => handleRuleClick(rule)}
                  sx={{ py: 0.5, minHeight: 28 }}
                >
                  <ListItemText
                    primary={rule.stringRepresentation}
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 1, pt: 0 }}>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={positionDialogOpen} onClose={handlePositionDialogClose}>
        <DialogTitle sx={{ pb: 1, pt: 1.5 }}>Choose Position</DialogTitle>
        <DialogContent sx={{ p: 1, pb: 0 }}>
          <List sx={{ p: 0 }}>
            {selectedRule && getRulePositions(selectedRule, node.getName()).map((option, idx) => (
              <ListItem key={idx} disablePadding sx={{ minHeight: 28 }}>
                <ListItemButton
                  onClick={() => handlePositionSelect(idx)}
                  sx={{ py: 0.5, minHeight: 28 }}
                >
                  <ListItemText
                    primary={option}
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 1, pt: 0 }}>
          <Button onClick={handlePositionDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}