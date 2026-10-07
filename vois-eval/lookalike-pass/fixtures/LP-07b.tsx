import {Tabs} from "@/components/ui/tabs";
const pages=[{path:"/",views:10}];
const funnel=[{step:"Visited",count:10}];
export default function P(){return <Tabs>{funnel.map((f)=><div key={f.step} className="h-2 bg-primary" style={{width:`${f.count}%`}}/>)}<p>How visitors progress to signup</p>{pages.map((p)=><span key={p.path}>{p.path}</span>)}</Tabs>}
