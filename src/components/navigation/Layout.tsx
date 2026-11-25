import {useEffect,useRef,useState} from 'react'
import {Link,NavLink,Outlet,ScrollRestoration,useLocation} from 'react-router-dom'
import {ArrowDownRight,ArrowUpRight,Heart,Menu,Scale,X} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import type {State} from '@/app/store'
import {modes} from '@/features/properties/model'
import {useSession} from '@/features/auth/session'

import {useAccountFavourites} from '@/features/favourites/account'
import {publicAsset} from '@/lib/paths'
function Brand(){return <Link to="/" className="brand" aria-label="Habitat home"><img src={publicAsset("favicon.svg")} alt=""/><span>HABITAT<span>.</span></span></Link>}
export default function Layout(){
 const {t,i18n}=useTranslation()
 const {session}=useSession()
 const {saved,compared}=useSelector((state:State)=>state.selection)
 const favourites=useAccountFavourites()
 const savedCount=favourites.isAccount?favourites.query.data?.length??0:saved.length
 const {key,pathname}=useLocation()
 const [opened,setOpened]=useState('')
 const menu=opened===key
 const menuButton=useRef<HTMLButtonElement>(null)
 const menuPanel=useRef<HTMLElement>(null)
 useEffect(()=>{
  if(!menu)return
  menuPanel.current?.querySelector('a')?.focus()
  function closeOnEscape(event:KeyboardEvent){
   if(event.key!=='Escape')return
   setOpened('')
   menuButton.current?.focus()
  }
  window.addEventListener('keydown',closeOnEscape)
  return ()=>window.removeEventListener('keydown',closeOnEscape)
 },[menu])
 const links=modes.map(mode=><NavLink key={mode} to={'/'+mode.toLowerCase()}>{t(mode)}</NavLink>)
 return <><a className="skip" href="#main">Skip to content</a><header className="site-header"><Brand/><nav className="desktop-nav" aria-label="Property categories">{links}</nav><div className="header-actions">
 <button className="icon language" onClick={()=>void i18n.changeLanguage(i18n.language==='en'?'hi':'en')} aria-label="Switch language">{i18n.language==='en'?'EN / हिन्दी':'हिन्दी / EN'}</button>
 <Link className="icon" to="/saved" aria-label={t('Saved')+' '+savedCount}><Heart size={18}/>{savedCount>0&&<sup>{savedCount}</sup>}</Link>
 <Link className="icon desktop-nav" to="/compare" aria-label={t('Compare')+' '+compared.length}><Scale size={18}/>{compared.length>0&&<sup>{compared.length}</sup>}</Link>
 <Link className="desktop-nav login-link" to={session?'/dashboard':'/login'}>{session?'Dashboard':t('Login')}</Link>
 <Link className="button small desktop-nav" to="/list-property">{t('List')} <ArrowUpRight size={15}/></Link>
 <button ref={menuButton} className="icon menu-toggle" aria-expanded={menu} aria-controls={menu?'site-menu':undefined} aria-label={menu?'Close menu':'Open menu'} onClick={()=>setOpened(menu?'':key)}>{menu?<X/>:<Menu/>}</button>
 </div></header>
 {menu&&<nav ref={menuPanel} id="site-menu" className="mobile-menu" aria-label="Site menu">{links}<NavLink to="/map">{t('Map')}</NavLink><NavLink to="/compare">{t('Compare')}</NavLink><NavLink to={session?'/dashboard':'/login'}>{session?'Dashboard':t('Login')}</NavLink><NavLink to="/list-property">{t('List')}</NavLink></nav>}
 <main id="main" tabIndex={-1}><Outlet/></main>
 <footer className="footer"><div className="footer-main"><div><Brand/><h2>Make room<br/>for what’s next.</h2></div><Link to="/properties" className="footer-arrow" aria-label="Explore all properties"><ArrowDownRight size={48}/></Link></div><div className="footer-links"><Link to="/map">{t('Map')}</Link><Link to="/plot-studio">{t('Studio')}</Link><Link to="/calculators">{t('Tools')}</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><div className="footer-end"><span>HABITAT. / INDIA</span><span>{pathname==='/'?'FROM BLUEPRINT TO BELONGING':'EVERY DREAM DESERVES AN ADDRESS'}</span></div></footer><ScrollRestoration/></>
}
