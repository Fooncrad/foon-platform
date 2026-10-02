'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import type { Locale } from '@/lib/platform/contracts';
const dictionaries = {ar,en,fr};
type Preferences = {locale: Locale; dark: boolean; setLocale: (v: Locale)=>void; toggleTheme: ()=>void; t: typeof ar};
const Context = createContext<Preferences | null>(null);
export function PreferencesProvider({children}: {children: React.ReactNode}) {
 const [locale,setLocale] = useState<Locale>('ar'); const [dark,setDark]=useState(false);
 useEffect(()=>{const lang=localStorage.getItem('foon.locale'); if(lang==='ar'||lang==='en'||lang==='fr')setLocale(lang);setDark(localStorage.getItem('foon.theme')==='dark');},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';localStorage.setItem('foon.locale',locale);},[locale]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',dark);localStorage.setItem('foon.theme',dark?'dark':'light');},[dark]);
 return <Context.Provider value={{locale,dark,setLocale,toggleTheme:()=>setDark(v=>!v),t:dictionaries[locale]}}>{children}</Context.Provider>;
}
export function usePreferences(){ const context=useContext(Context);if(!context)throw new Error('PreferencesProvider required');return context; }
