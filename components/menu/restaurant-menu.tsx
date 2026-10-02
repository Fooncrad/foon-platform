'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Globe2,Languages,LoaderCircle,Menu as MenuIcon,Moon,QrCode,Search,ShoppingBag,Sun,UtensilsCrossed} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';

type Store={id:string;name:string;slug:string;activity_id:string;country_code:string;currency:string;status:string};
type MenuData={store?:Store;categories?:unknown[];items?:unknown[];error?:string};

export default function RestaurantMenu({slug}:{slug:string}){
 const {locale,setLocale,dark,toggleTheme}=usePreferences();const [data,setData]=useState<MenuData|null>(null);const [showQr,setShowQr]=useState(false);const [query,setQuery]=useState('');
 useEffect(()=>{let alive=true;fetch('/api/public/menu?slug='+encodeURIComponent(slug),{cache:'no-store'}).then(async r=>({ok:r.ok,body:await r.json()})).then(({ok,body})=>{if(alive)setData(ok?body:{error:body.error||'NOT_FOUND'})}).catch(()=>{if(alive)setData({error:'SERVICE_UNAVAILABLE'})});return()=>{alive=false}},[slug]);
 const labels=locale==='ar'?{back:'FOON',menu:'المنيو',scan:'QR المنيو',empty:'لم يضف المطعم أصناف المنيو بعد.',unavailable:'المنيو غير متاح حاليًا.',cart:'السلة',search:'ابحث في المنيو',all:'الكل',restaurant:'مطعم'}:locale==='fr'?{back:'FOON',menu:'Menu',scan:'QR du menu',empty:"Le restaurant n'a pas encore ajouté d'articles.",unavailable:'Menu indisponible.',cart:'Panier',search:'Rechercher dans le menu',all:'Tout',restaurant:'Restaurant'}:{back:'FOON',menu:'Menu',scan:'Menu QR',empty:'This restaurant has not added menu items yet.',unavailable:'Menu unavailable.',cart:'Cart',search:'Search menu',all:'All',restaurant:'Restaurant'};
 const cycle=()=>setLocale(locale==='ar'?'en':locale==='en'?'fr':'ar');const menuUrl=useMemo(()=>'/menu/'+slug,[slug]);
 return <div className="restaurant-menu-shell">
  <header className="menu-header"><div className="menu-header-inner"><Link className="menu-brand" href="/"><span className="brand-mark"><UtensilsCrossed/></span><span>FOON<small>{labels.menu}</small></span></Link><nav><button type="button" onClick={cycle} aria-label="Language"><Languages/><span>{locale.toUpperCase()}</span></button><button type="button" onClick={toggleTheme} aria-label="Theme">{dark?<Sun/>:<Moon/>}</button><button type="button" className="menu-qr-button" onClick={()=>setShowQr(true)}><QrCode/><span>{labels.scan}</span></button></nav></div></header>
  <main className="menu-main">{!data?<div className="menu-state"><LoaderCircle className="spin"/><span>{labels.menu}</span></div>:data.error?<div className="menu-state"><Globe2/><h1>{labels.unavailable}</h1><Link href="/"><ArrowRight/>{labels.back}</Link></div>:<><section className="menu-cover"><div className="menu-cover-copy"><p><UtensilsCrossed/>{labels.restaurant}</p><h1>{data.store?.name}</h1><div className="menu-meta"><span>{data.store?.country_code}</span><span>{data.store?.currency}</span></div></div><button type="button" className="menu-qr-card" onClick={()=>setShowQr(true)}><QrCode/><strong>{labels.scan}</strong><small dir="ltr">{menuUrl}</small></button></section><section className="menu-toolbar"><div className="menu-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={labels.search}/></div><div className="menu-category-strip"><button className="active"><MenuIcon/>{labels.all}</button></div></section><section className="menu-content">{(data.items?.length??0)===0?<div className="menu-empty"><ShoppingBag/><h2>{labels.empty}</h2></div>:null}</section></>}</main>
  {showQr&&<div className="menu-qr-modal" role="dialog" aria-modal="true" aria-label={labels.scan} onClick={()=>setShowQr(false)}><div onClick={e=>e.stopPropagation()}><button className="menu-qr-close" type="button" onClick={()=>setShowQr(false)}>×</button><span className="menu-qr-placeholder"><QrCode/></span><strong>{labels.scan}</strong><p dir="ltr">{typeof window!=='undefined'?window.location.origin+menuUrl:menuUrl}</p></div></div>}
  <button className="menu-cart" type="button" aria-label={labels.cart}><ShoppingBag/><span>{labels.cart}</span></button>
 </div>
}
