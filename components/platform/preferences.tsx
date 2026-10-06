'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import type { Locale } from '@/lib/platform/contracts';
type Dictionary=typeof ar;
const defaults={ar,en,fr};
type Preferences = {locale: Locale; dark: boolean; setLocale: (v: Locale)=>void; toggleTheme: ()=>void; t: Dictionary};
const Context = createContext<Preferences | null>(null);
export function PreferencesProvider({children}: {children: React.ReactNode}) {
 const [locale,setLocale] = useState<Locale>('ar'); const [dark,setDark]=useState(false); const preferencesReady=useRef(false);
 const [dictionaries,setDictionaries]=useState<Record<Locale,Dictionary>>(defaults);
 useEffect(()=>{const lang=localStorage.getItem('foon.locale');const savedLocale=lang==='ar'||lang==='en'||lang==='fr'?lang:'ar';document.documentElement.lang=savedLocale;document.documentElement.dir=savedLocale==='ar'?'rtl':'ltr';preferencesReady.current=true;window.setTimeout(()=>{setLocale(savedLocale);setDark(localStorage.getItem('foon.theme')==='dark');},0);},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';if(preferencesReady.current)localStorage.setItem('foon.locale',locale);},[locale]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('foon.theme',dark?'dark':'light');},[dark]);
 useEffect(()=>{let alive=true;const load=()=>fetch('/api/public/translations',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{if(!alive||!data?.dictionaries)return;setDictionaries({ar:{...ar,...data.dictionaries.ar},en:{...en,...data.dictionaries.en},fr:{...fr,...data.dictionaries.fr}})}).catch(()=>{});load();const refresh=()=>load();window.addEventListener('foon-translations-updated',refresh);return()=>{alive=false;window.removeEventListener('foon-translations-updated',refresh)}},[]);
 return <Context.Provider value={{locale,dark,setLocale,t:dictionaries[locale],toggleTheme:()=>setDark(v=>!v)}}>{children}</Context.Provider>;
}
export function usePreferences(){ const context=useContext(Context);if(!context)throw new Error('PreferencesProvider required');return context;}
