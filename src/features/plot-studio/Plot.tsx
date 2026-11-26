import {useState} from 'react'
import {money,units,convertArea,regionalArea} from '@/features/properties/model'
type Unit=keyof typeof units
export function PlotTool({compact=false,initialArea=1350,initialWidth=initialArea/45,initialDepth=45,initialRate=2500,initialRoad=24,initialSide='South'}:{compact?:boolean;initialArea?:number;initialWidth?:number;initialDepth?:number;initialRate?:number;initialRoad?:number;initialSide?:string}){
 const [width,setWidth]=useState(initialWidth)
 const [length,setLength]=useState(initialDepth)
 const [rate,setRate]=useState(initialRate)
 const [side,setSide]=useState(initialSide)
 const [road,setRoad]=useState(initialRoad)
 const [unit,setUnit]=useState<Unit>('sq ft')
 const [regional,setRegional]=useState(0)
 const [sale,setSale]=useState(0)
 const area=width*length
 const scale=Math.min(235/Math.max(width,1),155/Math.max(length,1))
 const w=width*scale,h=length*scale,x=(440-w)/2,y=(260-h)/2
 return <div className="tool-grid"><div className="tool-controls"><div className="segmented">{(compact?[[20,40],[30,45],[30,50],[40,60]]:[[15,40],[20,40],[20,50],[25,50],[30,40],[30,50],[40,60],[50,80]]).map(([a,b])=><button key={a+'-'+b} aria-pressed={width===a&&length===b} onClick={()=>{setWidth(a);setLength(b)}}>{a} × {b}</button>)}</div><div className="fields">
 <label>Frontage width (ft)<input type="number" min="0" max="10000" step="any" value={width} onChange={event=>setWidth(Math.max(0,Math.min(10000,Number(event.target.value))))}/></label>
 <label>Depth (ft)<input type="number" min="0" max="10000" step="any" value={length} onChange={event=>setLength(Math.max(0,Math.min(10000,Number(event.target.value))))}/></label>
 <label>Rate per sq ft (₹)<input type="number" min="0" value={rate} onChange={event=>setRate(Math.max(0,Number(event.target.value)))}/></label>
 <label>Road side<select value={side} onChange={event=>setSide(event.target.value)}>{['North','East','South','West'].map(s=><option key={s}>{s}</option>)}</select></label>
 {!compact&&<label>Road width (ft)<input type="number" min="0" value={road} onChange={event=>setRoad(Math.max(0,Number(event.target.value)))}/></label>}
 {!compact&&<><label>Display area in<select value={unit} onChange={event=>setUnit(event.target.value as Unit)}>{Object.keys(units).map(s=><option key={s}>{s}</option>)}</select></label><label>Quoted price (₹)<input type="number" min="0" value={sale} onChange={event=>setSale(Math.max(0,Number(event.target.value)))}/></label><label>Local unit size (sq ft)<input type="number" min="0" value={regional} onChange={event=>setRegional(Math.max(0,Number(event.target.value)))}/></label></>}
 </div>{!compact&&<button className="text-link" onClick={()=>{setWidth(initialArea/45);setLength(45);setRate(2500);setSide('South');setUnit('sq ft');setRegional(0);setSale(0);setRoad(24)}}>Reset plot</button>}
 <p className="tool-value" aria-live="polite">{convertArea(area,'sq ft',unit).toLocaleString('en-IN',{maximumFractionDigits:2})} <small>{unit}</small></p><p>Estimated plot price <b>{money(area*rate)}</b></p>{sale>0&&area>0&&<p>Quoted rate {money(sale/area)} per sq ft</p>}{regional>0&&<p>{(area/regionalArea(1,regional)).toLocaleString('en-IN',{maximumFractionDigits:3})} local units, using your conversion</p>}</div>
 <div className="blueprint plot-drawing"><svg viewBox="0 0 440 290" role="img" aria-label={width+' by '+length+' feet, road along '+side}><defs><pattern id="plot-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0v16" fill="none" stroke="currentColor" opacity=".15"/></pattern></defs>
 <rect width="440" height="290" fill="url(#plot-grid)"/>
 <line x1={side==='East'?x+w+17:side==='West'?x-17:x} x2={side==='East'?x+w+17:side==='West'?x-17:x+w} y1={side==='North'?y-25:side==='South'?y+h+25:y} y2={side==='North'?y-25:side==='South'?y+h+25:y+h} stroke="#786958" strokeWidth={Math.min(28,road/2)} opacity=".25"/>
 <rect x={x} y={y} width={w} height={h} fill="#b56b493e" stroke="currentColor" strokeWidth="2"/><path d={'M'+x+' '+(y-12)+'h'+w+'m0 -5v10m'+(-w)+' -10v10M'+(x-12)+' '+y+'v'+h} fill="none" stroke="currentColor" strokeDasharray="4 3"/>
 {[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="3" fill="currentColor"/>)}
 <text x="220" y={y-20} textAnchor="middle">{width.toLocaleString('en-IN',{maximumFractionDigits:2})} ft</text><text x={x+w+24} y="135">{length} ft</text><text x="220" y="137" textAnchor="middle">{area.toLocaleString('en-IN',{maximumFractionDigits:2})} SQ FT</text><text x="24" y="266">{road} FT ROAD / {side.toUpperCase()}</text><text x="386" y="34">↑ N</text></svg></div>
 </div>
}
export default function Plot(){return <section className="page-width section subpage"><p className="eyebrow accent">Land visualization</p><h1>Plot <em>Studio.</em></h1><p>Explore rectangular land dimensions and use a locally confirmed conversion for regional units.</p><PlotTool/></section>}
