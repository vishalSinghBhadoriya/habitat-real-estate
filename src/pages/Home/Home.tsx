import {useState} from 'react'
import {Link} from 'react-router-dom'
import {ArrowDown,ArrowUpRight} from 'lucide-react'
import {art,cities} from '@/data/demo'
import Search from '@/features/property-search/Search'
import {useProperties} from '@/features/properties/api'
import Card from '@/features/properties/Card'
import SpaceLens from '@/features/property-search/SpaceLens'
import {PlotTool} from '@/features/plot-studio/Plot'
import {EmiTool} from '@/features/calculators/Calculators'
import {supabase} from '@/lib/supabase'
import {publicAsset} from '@/lib/paths'
import './home.css'
const categories=[['Apartments','Apartment',art.apart],['Independent houses','Independent house',art.villa],['Duplexes','Duplex',art.villa],['Villas','Villa',art.hero],['Residential plots','Residential plot',publicAsset('images/properties/plot.svg')],['Commercial','Office',art.office],['PG accommodation','PG',art.inside]]
const gallery=[['Courtyard residence',art.hero],['Apartment living',art.inside],['Urban workplaces',art.office]]
export default function Home(){
 const [chapter,setChapter]=useState(0)
 const [city,setCity]=useState('Indore')
 const inventory=useProperties()
 const count=useProperties(new URLSearchParams({q:city}),undefined,0,1)
 const picks=inventory.data?.items.slice(0,3)??[]
 return <>
 <section className="home-masthead">
  <div className="page-width masthead-layout">
   <div className="masthead-copy">
    <p className="eyebrow"><span/> The Indian property marketplace</p>
    <h1>Every dream<br/>deserves an<br/><em>address.</em></h1>
    <p>Find a home, a plot, or a place to build your business across India.</p>
   </div>
   <figure className="masthead-image"><picture><source media="(max-width: 700px)" srcSet={publicAsset("images/architecture/courtyard-small.webp")}/><img className="hero-img" src={art.hero} alt="Illustrative terracotta courtyard residence at dusk" fetchPriority="high"/></picture><figcaption>Courtyard residence · Architectural concept</figcaption><a href="#space-lens" className="masthead-lens">Read a floor plan <ArrowDown size={16}/></a></figure>
   <Search/>
   <div className="masthead-links"><a href="#featured"><ArrowDown size={15}/> Featured listings</a><Link to="/map">Explore the map <ArrowUpRight size={15}/></Link></div>
  </div>
 </section>
 <section className="page-width section home-featured" id="featured"><div className="section-head"><div><p className="eyebrow accent">The property edit</p><h2>Places worth <em>finding.</em></h2></div><Link className="text-link" to="/properties">View all properties <ArrowUpRight size={18}/></Link></div>
 {!supabase&&<p className="demo-note">Sample listings and illustrative imagery</p>}{inventory.isError&&<p role="alert">Properties could not be loaded.</p>}{inventory.isPending&&<p>Loading properties…</p>}{inventory.isSuccess&&picks.length===0&&<p>No published properties yet.</p>}<div className="cards">{picks.map(p=><Card key={p.id} property={p}/>)}</div></section>
 <SpaceLens/>
 <section className="page-width section"><p className="eyebrow accent">Find your kind of place</p><h2>Space for <em>every plan.</em></h2><div className="category-grid">{categories.map(([label,category,img])=><Link key={category} to={'/properties?'+new URLSearchParams({type:category})}><img src={img} loading="lazy" alt=""/><span>{label} <ArrowUpRight size={19}/></span></Link>)}</div></section>
 <section className="dark gallery-section"><div className="page-width section"><p className="eyebrow">Architectural gallery</p><h2>Spaces to <em>explore.</em></h2><figure><img key={chapter} src={gallery[chapter][1]} alt={gallery[chapter][0]+' concept'} loading="lazy"/><figcaption>Illustrative architectural studies</figcaption></figure><div className="segmented">{gallery.map(([title],index)=><button key={title} aria-pressed={chapter===index} onClick={()=>setChapter(index)}>{title}</button>)}</div></div></section>
 <section className="page-width section split"><div><p className="eyebrow accent">Across India</p><h2>Start with<br/>a <em>city.</em></h2><p>{count.isSuccess?count.data.total+' listings in '+city:city}</p><Link className="text-link" to={'/properties?'+new URLSearchParams({q:city})}>Browse {city} <ArrowUpRight size={17}/></Link></div><div className="city-grid">{cities.map(item=><button key={item.name} aria-pressed={item.name===city} onClick={()=>setCity(item.name)}>{item.name}<ArrowUpRight size={15}/></button>)}</div></section>
 <section className="clay"><div className="page-width section"><div className="section-head"><div><p className="eyebrow accent">Architectural tools</p><h2>Draw the <em>possibilities.</em></h2></div><Link className="text-link" to="/plot-studio">Open Plot Studio <ArrowUpRight size={18}/></Link></div><PlotTool compact/></div></section>
 <section className="page-width section"><div className="section-head"><div><p className="eyebrow accent">Financial planning</p><h2>Plan the <em>numbers.</em></h2></div><Link className="text-link" to="/calculators/emi">Full EMI calculator <ArrowUpRight size={18}/></Link></div><EmiTool compact/></section>
 <section className="list-banner"><div className="page-width section split"><div><h2>Give your property<br/>a <em>new chapter.</em></h2><Link className="button" to="/list-property">List your property <ArrowUpRight size={18}/></Link></div><ol>{['Add property information','Enter dimensions and specifications','Upload property photographs','Set your price','Preview and publish'].map(step=><li key={step}>{step}</li>)}</ol></div></section>
 </>
}
