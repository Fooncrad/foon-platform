'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Globe2,Languages,LoaderCircle,Moon,QrCode,ShoppingBag,Sun} from 'lucide-react';
import {usePreferences} from '@/components/platform/preferences';

type Store={id:string;name:string;slug:string;activity_id:string;country_code:string;currency:string;status:string};
type MenuData={store?:Store;categories?:unknown[];items?:unknown[];error?:string};

export default function RestaurantMenu({slug}:{slug:string}){
 const {locale,setLocale,theme,setTheme}=usePreferences();
 const [data,setData]=useState<MenuData|null>(null);
 useEffect(()=>{let alive=true;fetch('/api/public/menu?slug='+encodeURIComponent(slug),{cache:'no-store'}).then(async r=>({ok:r.ok,body:await r.json()})).then(({ok,body})=>{if(alive)setData(ok?body:{error:body.error||'NOT_FOUND'})}).catch(()=>{if(alive)setData({error:'SERVICE_UNAVAILABLE'})});return()=>{alive=false}},[slug]);
 const labels=locale==='ar'?{back:'FOON',menu:'المنيو',scan:'QR المنيو',empty:'لم يضف المطعم أصناف المنيو بعد.',unavailable:'المنيو غير متاح حاليًا.',cart:'السلة'}:locale==='fr'?{back:'FOON',menu:'Menu',scan:'QR du menu',empty:"Le restaurant n'a pas encore ajouté d'articles.",unavailable:'Menu indisponible.',cart:'Panier'}:{back:'FOON',menu:'Menu',scan:'Menu QR',empty:'This restaurant has not added menu items yet.',unavailable:'Menu unavailable.',cart:'Cart'};
 const cycle=()=>setLocale(locale==='ar'?'en':locale==='en'?'fr':'ar');
 return <div className="restaurant-menu-shell">
  <header className="menu-header"><div className="menu-header-inner"><Link className="menu-brand" href="/"><span className="brand-mark">F</span><span>FOON</span></Link><nav><button type="button" onClick={cycle} aria-label="Language"><Languages size={18}/><span>{locale.toUpperCase()}</span></button><button type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label="Theme">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button type="button" className="menu-qr-button" onClick={()=>window.print()}><QrCode size={18}/><span>{labels.scan}</span></button></nav></div></header>
  <main className="menu-main">{!data?<div className="menu-state"><LoaderCircle className="spin"/><span>{labels.menu}</span></div>:data.error?<div className="menu-state"><Globe2/><h1>{labels.unavailable}</h1><Link href="/"><ArrowRight size={16}/>{labels.back}</Link></div>:<><section className="menu-cover"><div><p>{labels.menu}</p><h1>{data.store?.name}</h1><div className="menu-meta"><span>{data.store?.country_code}</span><span>{data.store?.currency}</span></div></div><div className="menu-qr-card"><QrCode/><strong>{labels.scan}</strong><small dir="ltr">/menu/{data.store?.slug}</small></div></section><section className="menu-content">{(data.items?.length??0)===0?<div className="menu-empty"><ShoppingBag/><h2>{labels.empty}</h2></div>:null}</section></>}</main>
  <button className="menu-cart" type="button" aria-label={labels.cart}><ShoppingBag/><span>{labels.cart}</span></button>
 </div>
}
