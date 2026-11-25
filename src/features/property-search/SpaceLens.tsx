import {useId,useState} from 'react'
import {Link} from 'react-router-dom'
import {ArrowUpRight,Compass,ScanLine} from 'lucide-react'

const lenses=[
 {label:'Work from home',title:'A room with a door.',detail:'Look for enough depth for a desk and chair, daylight from the side, and a door you can close during calls.',room:'Study',bounds:[410,83,189,144],point:[503,155],url:'/buy?bhk=3'},
 {label:'Host comfortably',title:'A living room with room to move.',detail:'Trace the path from the entrance to the kitchen. Keep that route clear, even with a dining table and guests in the room.',room:'Living and dining',bounds:[101,83,309,235],point:[254,199],url:'/buy?area=1400'},
 {label:'Get outside',title:'A balcony you can use.',detail:'Check usable depth beyond the door swing and ask which direction the balcony faces before counting on morning light.',room:'Balcony',bounds:[101,41,309,42],point:[255,61],url:'/buy?facing=East'},
] as const

export default function SpaceLens(){
 const [active,setActive]=useState(0)
 const grid=useId()
 const lens=lenses[active]
 return <section className="space-lens" id="space-lens" aria-labelledby="lens-heading">
  <div className="page-width lens-inner">
   <div className="lens-intro"><p className="eyebrow"><ScanLine size={15}/> Floor plan study</p><h2 id="lens-heading">Read between<br/> the <em>walls.</em></h2><p>What matters in a floor plan depends on how you live. Pick a priority and see what to check at your next viewing.</p>
    <div className="lens-options" role="group" aria-label="Choose a viewing priority">{lenses.map((item,index)=><button type="button" key={item.label} aria-pressed={active===index} onClick={()=>setActive(index)}><span>{item.label}</span><ArrowUpRight size={17}/></button>)}</div>
   </div>
   <div className="lens-workspace">
    <div className="lens-bar"><span><Compass size={15}/> Illustrative apartment plan</span><span>{lens.room}</span></div>
    <svg className="lens-plan" viewBox="0 0 700 455" role="img" aria-label={'Illustrative apartment floor plan with '+lens.room.toLowerCase()+' highlighted'}>
     <defs><pattern id={grid} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="#b0bc99" strokeOpacity=".18"/></pattern></defs>
     <rect width="700" height="455" fill={'url(#'+grid+')'}/>
     <rect className="lens-highlight" x={lens.bounds[0]} y={lens.bounds[1]} width={lens.bounds[2]} height={lens.bounds[3]}/>
     <g fill="none" stroke="#d6dfc5" strokeWidth="4">
      <path d="M101 83V41h309v42h189v318H101V83h309v144h189M101 318h309V227M414 318h80v83M267 318v83M410 318v83"/>
      <path d="M118 96h116m20 0h128M422 96h81m11 0h63M586 244v65m0 14v60M118 390h129" strokeWidth="1.5"/>
     </g>
     <g fill="none" stroke="#a8b591" strokeWidth="1.5">
      <rect x="124" y="128" width="43" height="116" rx="4"/><path d="M145 138v94m-19-64h40m-40 38h40"/><rect x="188" y="151" width="45" height="66" rx="16"/>
      <rect x="286" y="201" width="89" height="61" rx="26"/><path d="M307 187v12m43-12v12m-43 65v12m43-12v12"/>
      <rect x="519" y="111" width="59" height="34"/><circle cx="547" cy="163" r="12"/>
      <rect x="510" y="262" width="58" height="90" rx="4"/><path d="M510 285h58m-29-21v20"/>
      <path d="M116 342h124v40m-97-39v14m16-14v14m18-14v14m18-14v14"/>
      <path d="M410 293h-36a36 36 0 0 1 36-36m85 61v33a33 33 0 0 0 33-33m-99-91v-33a33 33 0 0 1 33 33"/>
      <circle cx="128" cy="61" r="10"/><circle cx="390" cy="61" r="10"/>
     </g>
     <g className="lens-dimensions" fill="none" stroke="#a8b591"><path d="M101 413v21m498-21v21m-498-8h498M87 83H66m21 318H66m8-318v318"/><path d="m652 97 0-44-8 12m8-12 8 12"/></g>
     <g className="lens-labels"><text x="194" y="68">BALCONY</text><text x="248" y="301">LIVING / DINING</text><text x="437" y="199">STUDY</text><text x="505" y="375">BEDROOM</text><text x="287" y="367">ENTRY</text><text x="449" y="374">BATH</text><text x="125" y="374">KITCHEN</text><text x="332" y="447">WIDTH</text><text x="647" y="43">N</text></g>
     <g key={lens.label} className="lens-marker" transform={'translate('+lens.point.join(' ')+')'}><circle r="15"/><circle r="4" fill="currentColor"/></g>
    </svg>
    <div className="lens-readout" aria-live="polite"><div><h3>{lens.title}</h3><p>{lens.detail}</p></div><Link className="lens-link" to={lens.url}>{['Browse 3 BHK homes','Browse larger homes','Browse east-facing homes'][active]} <ArrowUpRight size={16}/></Link></div>
   </div>
  </div>
 </section>
}
