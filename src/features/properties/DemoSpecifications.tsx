import {useState} from 'react'
import {money} from './model'
import type {DemoDetails, DemoRoom} from './demoDetails'

export function DemoSpecifications({details:d}:{details:DemoDetails}){
 const spec=[
  ['State',d.state],['Segment',d.segment],['Bathrooms',d.bathrooms],['Balconies',d.balconies],
  ['Carpet area',squareFeet(d.carpet_sqft)],['Built-up area',squareFeet(d.built_up_sqft)],
  ['Super built-up area',squareFeet(d.super_built_up_sqft)],['Plot area',squareFeet(d.plot_area_sqft)],
  ['Floor',d.floor===0?'Ground':d.floor],['Total floors',d.total_floors],['Parking spaces',d.parking_spaces],
  ['Road width',d.road_width_ft?d.road_width_ft+' ft':null],['Property age',d.age_years?d.age_years+' years':null],
  ['Possession',d.possession],['Orientation',d.orientation],['Security deposit',d.deposit_inr?money(d.deposit_inr):null]
 ]
 return <><h3>Property specifications</h3>
 <dl className="fields">{spec.filter(([,value])=>value!=null).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
 <h3>Amenities</h3><p>{d.amenities.join(' · ')}</p></>
}
function squareFeet(value?:number){return value==null?null:value.toLocaleString('en-IN')+' sq ft'}

export function DemoRoomPlan({rooms}:{rooms:DemoRoom[]}){
 const [active,setActive]=useState(0)
 const room=rooms[active]
 if(!room)return null
 const scale=180/Math.max(room.width,room.depth)
 const width=room.width*scale
 const depth=room.depth*scale
 const x=(360-width)/2,y=(250-depth)/2
 return <>
  <p>Illustrative room diagrams. Select a room to inspect its proportions.</p>
  <div className="segmented" role="group" aria-label="Illustrative rooms">{rooms.map((option,index)=><button type="button" key={option.name} aria-pressed={index===active} onClick={()=>setActive(index)}>{option.name}</button>)}</div>
  <div className="blueprint"><svg viewBox="0 0 360 250" role="img" aria-label={room.name+' is '+room.width+' by '+room.depth+' feet'}>
   <rect x={x} y={y} width={width} height={depth} fill="none" stroke="currentColor" strokeWidth="3"/>
   <path d={'M '+x+' '+(y-13)+' h '+width+' M '+(x+width+13)+' '+y+' v '+depth} fill="none" stroke="currentColor" strokeDasharray="3 4"/>
   <text x="180" y={y-19} textAnchor="middle" fill="currentColor">{room.width} ft</text>
   <text x={x+width+18} y="126" fill="currentColor">{room.depth} ft</text>
   <text x="180" y="126" textAnchor="middle" fill="currentColor">{room.width*room.depth} sq ft</text>
  </svg></div>
 </>
}
