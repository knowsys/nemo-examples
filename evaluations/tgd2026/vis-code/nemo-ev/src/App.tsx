import { useEffect, useRef, useState } from "react";
import Scene from './components/Scene/Scene';
import type { TableEntriesForTreeNodesQuery, TreeForTableQuery, TableEntriesForTreeNodesResponse, TreeForTableResponse } from "./types/types";
import type { TreeNodeData } from "./data/TreeNodeData";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [message, setMessage] = useState<{ responseType: string, payload: TableEntriesForTreeNodesResponse | TreeForTableResponse } | null>(
    //newExample
    //bigTree
    null
  );
  //http://localhost:8000/ev/?predicate=wellRatedProfessor&query=[["prof_smith"],["prof_jones"]]
  //ancestor
  //http://localhost:8000/ev/?predicate=ancestor&query=[["alice"%2C"edward"]]
  //http://localhost:8000/ev/?predicate=commonDescendant&query=%5B%5B%22alice%22%2C%22edward%22%2C%22bob%22%5D%5D

  //example2
  //http://localhost:8000/ev/?predicate=Alert&query=%5B%5B%22sensor1%22%2C%2223.5%5E%5E%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23double%3E%22%2C%2225.5%5E%5E%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23double%3E%22%5D%5D
  //example3
  //http://localhost:8000/ev/?predicate=HeavyWindAffectedState&query=%5B%5B%22Ohio%22%2C%22113.4%5E%5E%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23double%3E%22%2C%22115.2%5E%5E%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23double%3E%22%5D%5D

  //example4 oldLime
  //http://localhost:8000/ev/?predicate=oldLime&query=%5B%5B%22%3Chttps%3A%2F%2Fwww.openstreetmap.org%2F%3Fmlon%3D13.64137321730922458585%26mlat%3D51.05598393202066631602%3E%22%2C%22Tilia+platyphyllos%22%2C%22243%22%5D%5D
  
  
  // backdrop for loading 
  const [backdropOpen, setBackdropOpen] = useState(true);

  useEffect(() => {
    const bc = new BroadcastChannel("NemoVisualization");
    bcRef.current = bc;

    bc.addEventListener("message", event => {
      console.log("Received:", event.data);
      setMessage(event.data);
      setBackdropOpen(false)
    });

    return () => bc.close();
  }, []);

  const sendMessage = (msg: { queryType: string, payload: TableEntriesForTreeNodesQuery | TreeForTableQuery }) => {
    console.log("Sent:", msg)
    bcRef.current?.postMessage(msg);
    setBackdropOpen(true)
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const predicate = params.get("predicate");
    const query = params.get("query");

    if (!predicate || !query) return;
    let queries: string[] = [];
    try {
      const arr = JSON.parse(query);
      queries = Array.isArray(arr) ? arr.map(e => Array.isArray(e) ? e.join(",") : e) : [];
    } catch {
      console.error("Error parsing query:", query);
      return;
    }
    sendMessage({
      queryType: "treeForTable",
      payload: { predicate: predicate, tableEntries: { queries } }
    })
  }, []);

  const handleCodingButtonClicked = (node: TreeNodeData) => {
    console.log("CodingButton clicked on Node: ", node.id)
  }

  return (
    <div>
      <Scene sendMessage={sendMessage} message={message} codingButtonClicked={handleCodingButtonClicked} />
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;