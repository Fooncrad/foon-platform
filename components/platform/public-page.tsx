'use client';
import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {usePreferences} from './preferences';
type Page={slug:string;titleAr?:string;titleEn?:string;titleFr?:string;bodyAr?:string;bodyEn?:string;bodyFr?:string};
export default function PublicPage({page}:{page:Page}){const {locale}=usePreferences();const title=locale==='ar'?(page.titleAr||page.titleEn||page.slug):locale==='fr'?(page.titleFr||page.titleEn||page.slug):(page.titleEn||page.titleAr||page.slug);const body=locale==='ar'?(page.bodyAr||''):locale==='fr'?(page.bodyFr||''):(page.bodyEn||'');const Arrow=locale==='ar'?ArrowRight:ArrowLeft;return <main className="managed-public-page" dir={locale==='ar'?'rtl':'ltr'}><div><Link href="/"><Arrow size={17}/>{locale==='ar'?'العودة للرئيسية':locale==='fr'?'Retour à l’accueil':'Back home'}</Link><h1>{title}</h1>{body?<div className="managed-public-body">{body.split(/\n+/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>:<p className="managed-public-empty">{locale==='ar'?'لم يُنشر محتوى هذه الصفحة بعد.':locale==='fr'?'Le contenu de cette page n’est pas encore publié.':'This page has not been published yet.'}</p>}</div></main>}
