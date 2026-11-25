import {useRef,useState} from 'react'
import {convertArea} from '@/features/properties/model'
const rooms=[{name:'Living',x:34,y:35,w:180,h:120},{name:'Bedroom',x:214,y:35,w:140,h:120},{name:'Bedroom 2',x:34,y:155,w:125,h:115},{name:'Kitchen',x:159,y:155,w:106,h:115},{name:'Bath',x:265,y:155,w:89,h:76},{name:'Entry',x:265,y:231,w:89,h:39},{name:'Balcony',x:354,y:35,w:52,h:120}]
export function FloorPlan({facing}:{facing:string}){
 const [active,setActive]=useState(0)
 const [zoom,setZoom]=useState(1)
 const [metric,setMetric]=useState(false)
 const [labels,setLabels]=useState(true)
 const [angle,setAngle]=useState(0)
 const [offset,setOffset]=useState([0,0])
 const frame=useRef<HTMLDivElement>(null)
 const drag=useRef<{x:number;y:number;offset:number[]}|null>(null)
 const room=rooms[active]
 return <div className="floor-plan" ref={frame}><div className="segmented"><button disabled={zoom<=1} onClick={()=>setZoom(z=>Math.max(1,z-.2))}>Zoom out</button><button disabled={zoom>=1.6} onClick={()=>setZoom(z=>Math.min(1.6,z+.2))}>Zoom in</button><button aria-pressed={metric} onClick={()=>setMetric(!metric)}>{metric?'Metres':'Feet'}</button><button aria-pressed={labels} onClick={()=>setLabels(!labels)}>Labels</button><button onClick={()=>setAngle(a=>(a+90)%360)}>Rotate plan</button>{document.fullscreenEnabled&&<button onClick={()=>void (document.fullscreenElement?document.exitFullscreen():frame.current?.requestFullscreen())}>Toggle fullscreen</button>}<button onClick={()=>{setActive(0);setZoom(1);setMetric(false);setLabels(true);setAngle(0);setOffset([0,0])}}>Reset</button></div>
 <div className="blueprint"><svg viewBox="0 0 440 310" role="group" aria-label="Illustrative floor plan. Select a room or drag the background to pan."
 onPointerDown={event=>{if(event.target!==event.currentTarget)return;event.currentTarget.setPointerCapture(event.pointerId);drag.current={x:event.clientX,y:event.clientY,offset}}}
 onPointerMove={event=>{if(!drag.current)return;const scale=440/event.currentTarget.getBoundingClientRect().width;setOffset([drag.current.offset[0]+(event.clientX-drag.current.x)*scale,drag.current.offset[1]+(event.clientY-drag.current.y)*scale])}}
 onLostPointerCapture={()=>{drag.current=null}}>
 <g transform={'translate('+(220+offset[0])+' '+(155+offset[1])+') rotate('+angle+') scale('+zoom+') translate(-220 -155)'}>{rooms.map((r,i)=><g key={r.name} role="button" tabIndex={0} aria-label={r.name} aria-pressed={i===active} onClick={()=>setActive(i)} onKeyDown={event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();setActive(i)}}}>
 <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={active===i?'#d5a28b':'#eadac2'} stroke="#77513e" strokeWidth="2"/>
 {labels&&<text x={r.x+r.w/2} y={r.y+r.h/2} textAnchor="middle">{r.name}</text>}</g>)}
 <path d="M55 35h96m89 0h80m34 36v45m-320 68v53" fill="none" stroke="#faf3e5" strokeWidth="5" pointerEvents="none"/>
 <path d="M193 155v-22a22 22 0 0 1 22 22m98 76v-20a20 20 0 0 1 20 20" fill="none" stroke="#986958" pointerEvents="none"/>
 <path key={active} className="room-dimension" d={'M'+(room.x+5)+' '+(room.y+10)+'h'+(room.w-10)+'m0 -4v8m'+(10-room.w)+' -8v8M'+(room.x+7)+' '+(room.y+12)+'v'+(room.h-22)} fill="none" stroke="#903c25" strokeDasharray="3 3" pointerEvents="none"/>
 </g><text x="395" y="20">↑ N</text></svg></div>
 <label>Selected room<select value={active} onChange={event=>setActive(Number(event.target.value))}>{rooms.map((r,i)=><option key={r.name} value={i}>{r.name}</option>)}</select></label>
 <p aria-live="polite"><strong>{room.name}</strong> · {(room.w/10*(metric?.3048:1)).toFixed(1)} × {(room.h/10*(metric?.3048:1)).toFixed(1)} {metric?'m':'ft'} · {convertArea(room.w*room.h/100,'sq ft',metric?'sq m':'sq ft').toFixed(1)} {metric?'sq m':'sq ft'}</p><p>Entry facing {facing}. Orientation information is provided for buyers who consider Vastu.</p></div>
}
