/**
 * Language preference + first-visit routing.
 *
 * The URL is authoritative: `/zh/...` always renders Chinese. For unprefixed
 * paths we redirect to `/zh` when the visitor previously chose Chinese or the
 * device's primary language is Chinese. A stored `en` choice always wins.
 */
export const LOCALE_STORAGE_KEY = 'mz-locale'

export type LocalePreference = 'en' | 'zh'

export const LOCALE_BOOT_SCRIPT = `(function(){try{
  var key='${LOCALE_STORAGE_KEY}';
  var path=location.pathname||'/';
  if(path==='/zh'||path.indexOf('/zh/')===0)return;
  var stored=null;
  try{stored=localStorage.getItem(key)}catch(e){}
  var wanted=stored==='zh'||stored==='en'?stored:null;
  if(!wanted){
    var lang='';
    try{lang=navigator.language||(navigator.languages&&navigator.languages[0])||''}catch(e){}
    wanted=String(lang).toLowerCase().indexOf('zh')===0?'zh':'en';
  }
  if(wanted==='zh'){
    var target='/zh'+(path==='/'?'':path)+location.search+location.hash;
    location.replace(target);
  }
}catch(e){}})()`
