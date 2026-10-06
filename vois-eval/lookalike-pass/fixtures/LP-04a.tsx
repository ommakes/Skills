import {useState} from "react";
export default function P(){const [shown,setShown]=useState(false);const save=()=>{setShown(true);setTimeout(() => setShown(false), 3000)};return <button onClick={save}>{shown?"Saved":"Save"}</button>}
