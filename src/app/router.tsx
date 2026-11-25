import {createBrowserRouter,Navigate,Outlet,useLocation,useRouteError,type RouteObject} from 'react-router-dom'
import {useEffect} from 'react'
import Layout from '@/components/navigation/Layout'
import {useSession} from '@/features/auth/session'
import {supabase} from '@/lib/supabase'
import {Link} from 'react-router-dom'
function Protected(){
 const {session,ready}=useSession()
 const {pathname,search}=useLocation()
 if(!ready)return <p className="route-wait">Checking your account…</p>
 if(!supabase&&pathname==='/list-property')return <Outlet/>
 if(!session)return <Navigate replace to={'/login?next='+encodeURIComponent(pathname+search)}/>
 return <Outlet/>
}
function Shell(){
 const {pathname}=useLocation()
 useEffect(()=>{
  const path=pathname.split('/').filter(Boolean).map(part=>part.replace(/-/g,' ')).join(' · ')
  document.title=path?path.replace(/^./,letter=>letter.toUpperCase())+' | HABITAT.':'HABITAT. — Every dream deserves an address'
  const descriptions:Record<string,string>={'/buy':'Discover homes for sale across India.','/rent':'Compare rental homes by city, rent and configuration.','/plot-studio':'Visualize rectangular plot dimensions, frontage and estimated cost.','/calculators':'Estimate home loan, rental and purchase costs in INR.','/map':'Explore approximate listing locations across India.'}
  document.querySelector('meta[name="description"]')?.setAttribute('content',descriptions[pathname]??'Discover and list homes, plots and commercial spaces across India.')
 },[pathname])
 return <Layout/>
}
function ErrorScreen(){const error=useRouteError();return <section className="page-width section subpage"><h1>Something went wrong.</h1><p>{error instanceof Error?'The page could not be loaded.':'This address is unavailable.'}</p><Link className="text-link" to="/">Return home</Link></section>}
function Opening(){return <div className="opening" role="status"><svg viewBox="0 0 200 140" aria-hidden="true"><path pathLength="1" d="M12 118h176M34 107V67l65-31 64 31v40M34 67l65 30 64-30M99 97v20M56 77V57m86 0v20M25 60V39m-5 0h10m-10 21h10M46 127h115m-115-4v8m115-8v8" fill="none" stroke="currentColor"/></svg><strong>HABITAT<span>.</span></strong><span className="eyebrow">Opening marketplace</span></div>}
const discover=async()=>({Component:(await import('@/pages/Discover/Discover')).default})
const selections=async()=>({Component:(await import('@/pages/Discover/Discover')).Selections})
const info=async()=>({Component:(await import('@/pages/Discover/Discover')).Info})
const auth=async()=>({Component:(await import('@/features/auth/AuthPage')).default})
const wizard=async()=>({Component:(await import('@/features/property-listing/Wizard')).default})
const dashboard=async()=>({Component:(await import('@/features/dashboard/Dashboard')).default})
const calculators=async()=>({Component:(await import('@/features/calculators/Calculators')).default})
const routes=(paths:string[],lazy:RouteObject['lazy']):RouteObject[]=>paths.map(path=>({path,lazy}))
export const router=createBrowserRouter([{path:'/',Component:Shell,ErrorBoundary:ErrorScreen,HydrateFallback:Opening,children:[
 {index:true,lazy:async()=>({Component:(await import('@/pages/Home/Home')).default})},
 ...routes(['buy','rent','plots','commercial','pg','properties'],discover),
 ...routes(['compare','saved'],selections),
 ...routes(['about','contact','privacy','terms','*'],info),
 ...routes(['login','register','forgot-password','reset-password'],auth),
 ...routes(['calculators','calculators/emi','calculators/rent','calculators/purchase-cost'],calculators),
 {path:'property/:slug',lazy:async()=>({Component:(await import('@/pages/PropertyDetails/Detail')).default})},
 {path:'map',lazy:async()=>({Component:(await import('@/features/maps/MapPage')).default})},
 {path:'plot-studio',lazy:async()=>({Component:(await import('@/features/plot-studio/Plot')).default})},
 {Component:Protected,children:[...routes(['list-property','edit-property/:id'],wizard),...routes(['dashboard','dashboard/listings','dashboard/enquiries','dashboard/visits','profile'],dashboard)]}
]}],{basename:import.meta.env.BASE_URL})
