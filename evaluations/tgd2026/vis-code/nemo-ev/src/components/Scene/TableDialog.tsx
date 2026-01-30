import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { DataGrid } from '@mui/x-data-grid';
import type { TableNodeData } from '../../data/TreeNodeData';
import { Button, DialogActions, TextField, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FaCompress } from 'react-icons/fa';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import StringFormatter from '../../util/StringFormatter';
import type { TableEntryResponse } from '../../types/types';

type TableProps = {
    node: TableNodeData | null;
    mode: "explore" | "query";
    open: boolean;
    onClose: () => void;
    onRowClicked: (row: TableEntryResponse, predicate: string) => void;
    onLoadMoreClicked: (node: TableNodeData, pagination: { start: number, count: number }) => void;
    version: number;
    onTogglePanel: () => void;
};

function TableDialog({
    node,
    mode,
    open,
    onClose,
    onRowClicked,
    onLoadMoreClicked,
    version,
    onTogglePanel
}: Readonly<TableProps>) {
    if (!node) return null;

    const [loadMoreDialogOpen, setLoadMoreDialogOpen] = useState(false);
    const [start, setStart] = useState(node.getPagination().start);
    const [count, setCount] = useState(node.getPagination().count);

    const entries = useMemo(() => node.getTableEntries(), [node, version]); //to update when version changes
    
    let columns: any[] = [];
    if (entries[0]) {
        if (mode === "query") {
            columns = [
                ...entries[0].termTuple.map((_, idx) => ({
                    field: `col${idx}`,
                    headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` :`${node.parameterPredicate[idx]}`,
                    width: 150
                })),
                {
                    field: "action",
                    headerName: "",
                    width: 60,
                    sortable: false,
                    filterable: false,
                    renderCell: (params: any) => (
                        <Tooltip title="Query for this fact!" placement="right" enterDelay={500}>
                            <IconButton
                                onClick={() => {
                                    const row : TableEntryResponse = {
                                        entryId: params.row.id,
                                        termTuple: Object.values(params.row).filter((d, i) => i > 0).map(d => `${d}`)
                                    }
                                    onRowClicked(row, node.getName());
                                    onClose();
                                }}
                            >
                                <FaMagnifyingGlass />
                            </IconButton>
                        </Tooltip>
                    ),
                }
            ];
        } else {
            columns = entries[0].termTuple.map((_, idx) => ({
                field: `col${idx}`,
                headerName: node.parameterPredicate[idx] === undefined ? `var${idx}` :`${node.parameterPredicate[idx]}`,
                width: 150
            }));
        }
    }

    const rows = entries.map((row) => {
        const rowObj: { id: number; [key: string]: any } = { id: row.entryId };
        row.termTuple.forEach((val, colIdx) => {
            rowObj[`col${colIdx}`] = val;
        });
        return rowObj;
    });

    useEffect(() => {
        if (loadMoreDialogOpen) {
            setStart(node.getPagination().start);
            setCount(node.getPagination().count);
        }
    }, [loadMoreDialogOpen, node]);

    return (
        <Dialog open={open} onClose={onClose} fullScreen scroll="paper">
            <DialogTitle>
                Table: {StringFormatter.formatPredicate(node.getName(), node.parameterPredicate)}
                <Tooltip title="Leave fullscreen mode!" placement="left" enterDelay={500}>
                    <IconButton aria-label="panel" onClick={onTogglePanel} sx={{ position: "absolute", right: 8, top: 8 }}>
                        <FaCompress />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Tooltip title={mode === "explore" ? "" : "Click on a row to query after the entries!"} placement="top" enterDelay={500}>
                    <div>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[20, 50, 100]}
                            disableRowSelectionOnClick
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                                    outline: 'none',
                                },
                                '& .MuiDataGrid-row.Mui-selected': {
                                    backgroundColor: 'inherit',
                                },
                                '& .MuiDataGrid-cell.Mui-selected': {
                                    backgroundColor: 'inherit',
                                },
                            }}
                            density="compact"
                            autoHeight
                        />
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            {node.moreEntriesExist && (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => setLoadMoreDialogOpen(true)}
                                    >
                                        Load More
                                    </Button>
                                    <Dialog open={loadMoreDialogOpen} onClose={() => setLoadMoreDialogOpen(false)}>
                                        <DialogTitle>Load More Entries</DialogTitle>
                                        <DialogContent>
                                            <TextField
                                                label="Start"
                                                type="number"
                                                value={start}
                                                onChange={e => setStart(Math.max(0, Number(e.target.value)))}
                                                fullWidth
                                                margin="dense"
                                            />
                                            <TextField
                                                label="Count"
                                                type="number"
                                                value={count}
                                                onChange={e => setCount(Math.max(0, Number(e.target.value)))}
                                                fullWidth
                                                margin="dense"
                                            />
                                        </DialogContent>
                                        {start > count && (
                                            <div style={{
                                                color: "red",
                                                fontSize: 12,
                                                marginTop: 4,
                                                marginLeft: 32
                                            }}
                                            >
                                                Count needs to be greater then Start!
                                            </div>
                                        )}
                                        <DialogActions>
                                            <Button onClick={() => setLoadMoreDialogOpen(false)}>Cancel</Button>
                                            <Button
                                                variant="contained"
                                                disabled={start < 0 || count < 0 || start > count}
                                                onClick={() => {
                                                    setLoadMoreDialogOpen(false);
                                                    onLoadMoreClicked(node, { start, count });
                                                }}
                                            >
                                                Load
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>
                </Tooltip>
            </DialogContent>
        </Dialog >
    );
}

export default TableDialog;