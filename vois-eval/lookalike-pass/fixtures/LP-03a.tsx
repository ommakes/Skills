import {useState} from "react";
export default function P(){const [o,setO]=useState(false);return <>{o&&<div className="fixed inset-0 bg-black/50"><button>×</button></div>}<button onClick={()=>{if(confirm("sure?"))del()}}>Delete</button></>}
