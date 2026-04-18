
if(!window.React||!window.ReactDOM){
document.getElementById("root").innerHTML='<div style="padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Noto Sans TC,sans-serif;color:#2c2518;line-height:1.6"><div style="font-weight:700;margin-bottom:8px">FitLog 載入失敗</div><div>React 套件未載入成功。請重新整理，或檢查網路/擋廣告外掛是否阻擋 cdnjs、unpkg。</div></div>';
throw new Error("React libraries failed to load");
}
var h=React.createElement,useState=React.useState,useEffect=React.useEffect,useRef=React.useRef,useMemo=React.useMemo;
var A=Object.assign;
var MEAL_OPTIONS=["早餐","午餐","晚餐","點心","宵夜"];
function defaultMeal(){var hr=new Date().getHours();if(hr>=5&&hr<11)return"早餐";if(hr>=11&&hr<14)return"午餐";if(hr>=14&&hr<17)return"點心";if(hr>=17&&hr<24)return"晚餐";return"宵夜"}
var FL_STORAGE_FULL="STORAGE_FULL";
var FL_LOCALSTORAGE_QUOTA_BYTES=5*1024*1024;
var FL_IDB_MIGRATED_KEY="fl_idb_v1_migrated";
var FL_LAST_GDRIVE_BACKUP_KEY="fl_last_gdrive_backup";
var FL_GDRIVE_CLIENT_ID="508003054038-debv8cp85vnbsnji28dhqsr6tp4nl3hl.apps.googleusercontent.com";
var FL_GDRIVE_SCOPE="https://www.googleapis.com/auth/drive.appdata";
var FL_GDRIVE_BACKUP_NAME="fitlog_backup.json";
var FL_LS_SKIP_IDB_MIGRATE={"fl_gemini_keys":1,"fl_gemini_key":1,"fl_apikey_banner_dismissed":1,"fl_pwa_dismissed":1,"fl_last_gdrive_backup":1};
function utf8ByteLength(str){try{return new Blob([String(str)]).size}catch(e){return unescape(encodeURIComponent(String(str))).length}}
function isQuotaExceededError(e){if(!e)return false;var n=e.name||"",c=e.code;return n==="QuotaExceededError"||n==="NS_ERROR_DOM_QUOTA_REACHED"||c===22}
function storageWriteError(original){var err=new Error("STORAGE_WRITE_FAILED");err.code=isQuotaExceededError(original)?FL_STORAGE_FULL:"STORAGE_WRITE";err.original=original;return err}
function dbLsKey(k){return"fl_"+k}
async function migrateLocalStorageToIdbOnce(){
if(!window.idbKeyval)return;
try{
if(localStorage.getItem(FL_IDB_MIGRATED_KEY)==="1")return;
var i,full,raw,parsed;
for(i=localStorage.length-1;i>=0;i--){
full=localStorage.key(i);
if(!full||full.indexOf("fl_")!==0)continue;
if(full===FL_IDB_MIGRATED_KEY)continue;
if(FL_LS_SKIP_IDB_MIGRATE[full])continue;
raw=localStorage.getItem(full);
if(raw==null)continue;
try{parsed=JSON.parse(raw);await idbKeyval.set(full,parsed)}catch(unused){continue}
localStorage.removeItem(full);
}
localStorage.setItem(FL_IDB_MIGRATED_KEY,"1");
}catch(e){}
}
var DB={
get:async function(k){try{if(window.idbKeyval){var gv=await idbKeyval.get(dbLsKey(k));return gv===undefined||gv===null?null:gv}var v=localStorage.getItem(dbLsKey(k));return v?JSON.parse(v):null}catch(e){return null}},
set:async function(k,v){try{if(window.idbKeyval){await idbKeyval.set(dbLsKey(k),v);return}localStorage.setItem(dbLsKey(k),JSON.stringify(v))}catch(e){throw storageWriteError(e)}},
del:async function(k){try{if(window.idbKeyval){await idbKeyval.del(dbLsKey(k));return true}localStorage.removeItem(dbLsKey(k));return true}catch(e){return false}},
listKeys:async function(p){try{if(window.idbKeyval){var keys=await idbKeyval.keys(),out=[],pref=dbLsKey(p),j,fk;for(j=0;j<keys.length;j++){fk=keys[j];if(String(fk).indexOf(pref)===0)out.push(String(fk).slice(3))}return out}var keys=[],i,k;for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k.indexOf(dbLsKey(p))===0)keys.push(k.slice(3))}return keys}catch(e){return[]}}
};
function getFlLocalStorageUsageSync(){var used=0;for(var i=0;i<localStorage.length;i++){var full=localStorage.key(i);if(!full||full.indexOf("fl_")!==0)continue;var val=localStorage.getItem(full)||"";used+=utf8ByteLength(full)+utf8ByteLength(val)}return{usedBytes:used,quotaBytes:FL_LOCALSTORAGE_QUOTA_BYTES}}
async function getFlStorageUsage(){
if(navigator.storage&&navigator.storage.estimate){
try{var est=await navigator.storage.estimate();return{usedBytes:est.usage||0,quotaBytes:Math.max(est.quota||0,FL_LOCALSTORAGE_QUOTA_BYTES)}}catch(e){}
}
if(window.idbKeyval){
try{var keys=await idbKeyval.keys(),used=0,idx,key,val;for(idx=0;idx<keys.length;idx++){key=keys[idx];if(String(key).indexOf("fl_")!==0)continue;val=await idbKeyval.get(key);used+=utf8ByteLength(String(key))+utf8ByteLength(JSON.stringify(val))}return{usedBytes:used,quotaBytes:50*1024*1024}}catch(e2){}
}
return getFlLocalStorageUsageSync();
}
function buildFitlogBackupPayload(allDays,favorites,goals,settings){return{version:1,exportedAt:new Date().toISOString(),allDays:allDays,favorites:favorites,goals:goals,settings:{defaultRules:(settings&&settings.defaultRules)||""}}}
var _gdriveToken=null;
function gdriveGetToken(){return _gdriveToken}
function gdriveClearToken(){_gdriveToken=null}
function gdriveSignOut(){
if(_gdriveToken&&window.google&&google.accounts&&google.accounts.oauth2){
try{google.accounts.oauth2.revoke(_gdriveToken,function(){})}catch(e){}
}
_gdriveToken=null;
}
function gdriveSignIn(promptMode){
var promptStr="";
if(promptMode===true)promptStr="consent";
else if(promptMode===false||promptMode==null)promptStr="";
else if(typeof promptMode==="string")promptStr=promptMode;
return new Promise(function(resolve,reject){
var cid=FL_GDRIVE_CLIENT_ID&&String(FL_GDRIVE_CLIENT_ID).trim();
if(!cid){reject(new Error("尚未設定 OAuth Client ID（請編輯 index.html 的 FL_GDRIVE_CLIENT_ID）"));return}
if(!window.google||!google.accounts||!google.accounts.oauth2){reject(new Error("Google 登入元件未載入，請重新整理"));return}
var client=google.accounts.oauth2.initTokenClient({
client_id:cid,
scope:FL_GDRIVE_SCOPE,
callback:function(r){
if(r&&r.access_token){_gdriveToken=r.access_token;resolve(_gdriveToken)}
else reject(new Error((r&&r.error)||"登入已取消或失敗"))
}
});
client.requestAccessToken({prompt:promptStr});
});
}
async function gdriveEnsureAccessToken(){
if(gdriveGetToken())return;
try{await gdriveSignIn("")}catch(e){}
if(gdriveGetToken())return;
await gdriveSignIn("select_account");
}
async function gdriveRefreshTokenAfter401(){
gdriveClearToken();
try{await gdriveSignIn("")}catch(e){}
if(!gdriveGetToken())await gdriveSignIn("select_account");
}
async function gdriveFetchBackupFileMeta(){
var q="name = '"+FL_GDRIVE_BACKUP_NAME.replace(/'/g,"\\'")+"' and 'appDataFolder' in parents and trashed = false";
var url="https://www.googleapis.com/drive/v3/files?q="+encodeURIComponent(q)+"&spaces=appDataFolder&fields=files(id,modifiedTime)";
var res=await fetch(url,{headers:{Authorization:"Bearer "+_gdriveToken}});
var data=await res.json().catch(function(){return{}});
if(res.status===401){gdriveClearToken();throw new Error("GDRIVE_AUTH_EXPIRED")}
if(!res.ok)throw new Error((data.error&&data.error.message)||"Drive 查詢失敗");
var f=data.files&&data.files[0];
return f?{id:f.id,modifiedTime:f.modifiedTime||null}:null;
}
async function gdriveUploadBackup(payload){
if(!navigator.onLine)throw new Error("OFFLINE");
var bodyStr=JSON.stringify(payload);
var prevMeta=await gdriveFetchBackupFileMeta();
var fileId=prevMeta?prevMeta.id:null;
var res,err,meta;
if(fileId){
res=await fetch("https://www.googleapis.com/upload/drive/v3/files/"+encodeURIComponent(fileId)+"?uploadType=media",{method:"PATCH",headers:{Authorization:"Bearer "+_gdriveToken,"Content-Type":"application/json; charset=UTF-8"},body:bodyStr});
if(res.status===401){gdriveClearToken();throw new Error("GDRIVE_AUTH_EXPIRED")}
if(!res.ok){err=await res.json().catch(function(){return{}});throw new Error((err.error&&err.error.message)||"上傳失敗")}
meta=await res.json().catch(function(){return{}});
return meta.modifiedTime||(new Date().toISOString());
}
var boundary="fitlog_boundary_"+Date.now();
var metaPart=JSON.stringify({name:FL_GDRIVE_BACKUP_NAME,parents:["appDataFolder"]});
var multipart="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+metaPart+"\r\n--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+bodyStr+"\r\n--"+boundary+"--\r\n";
res=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime",{method:"POST",headers:{Authorization:"Bearer "+_gdriveToken,"Content-Type":"multipart/related; boundary="+boundary},body:multipart});
if(res.status===401){gdriveClearToken();throw new Error("GDRIVE_AUTH_EXPIRED")}
if(!res.ok){err=await res.json().catch(function(){return{}});throw new Error((err.error&&err.error.message)||"建立雲端備份失敗")}
meta=await res.json();
return meta.modifiedTime||(new Date().toISOString());
}
async function gdriveDownloadBackupJson(){
if(!navigator.onLine)throw new Error("OFFLINE");
var meta=await gdriveFetchBackupFileMeta();
if(!meta||!meta.id)return{json:null,modifiedTime:null};
var res=await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(meta.id)+"?alt=media",{headers:{Authorization:"Bearer "+_gdriveToken}});
if(res.status===401){gdriveClearToken();throw new Error("GDRIVE_AUTH_EXPIRED")}
if(!res.ok)throw new Error("下載備份失敗");
return{json:JSON.parse(await res.text()),modifiedTime:meta.modifiedTime||null};
}
function readLastGdriveBackupIso(){try{return localStorage.getItem(FL_LAST_GDRIVE_BACKUP_KEY)}catch(e){return null}}
function writeLastGdriveBackupIso(iso){try{if(iso)localStorage.setItem(FL_LAST_GDRIVE_BACKUP_KEY,iso);else localStorage.removeItem(FL_LAST_GDRIVE_BACKUP_KEY)}catch(e){}}
function formatBackupDisplay(iso){
if(!iso)return"尚未備份到雲端";
try{var d=new Date(iso);if(isNaN(d.getTime()))return"尚未備份到雲端";return d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}catch(e){return"尚未備份到雲端"}
}
var uid=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)};
var calcCal=function(p,f,c){return Math.round((+p||0)*4+(+f||0)*9+(+c||0)*4)};
var fmtDate=function(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
var todayStr=function(){return fmtDate(new Date())};
var dateLabel=function(d){if(d===todayStr())return"今天";var y=new Date();y.setDate(y.getDate()-1);if(d===fmtDate(y))return"昨天";return d.slice(5).replace("-","/")};
var addDays=function(d,n){var r=new Date(d+"T12:00:00");r.setDate(r.getDate()+n);return fmtDate(r)};
var weekday=function(d){return["日","一","二","三","四","五","六"][new Date(d+"T12:00:00").getDay()]};
var exportBackupJSON=function(payload,showToastFn){var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="fitlog_backup_"+todayStr()+".json";a.click();URL.revokeObjectURL(u);if(showToastFn)showToastFn("✅ JSON 已匯出（含每日目標與預設規則）")};
var DEFAULT_GOALS={protein:115,fat:60,carbs:200,calories:1800};
var ALL_METRICS_FIELDS=[
{key:"weight",label:"體重",unit:"kg",min:0,max:500,step:0.1},
{key:"bmi",label:"BMI",unit:"",min:0,max:100,step:0.1},
{key:"bodyFat",label:"體脂率",unit:"%",min:0,max:100,step:0.1},
{key:"bodyWater",label:"體水分量",unit:"kg",min:0,max:100,step:0.1},
{key:"protein",label:"蛋白質量",unit:"kg",min:0,max:100,step:0.1},
{key:"fatMass",label:"脂肪量",unit:"kg",min:0,max:300,step:0.1},
{key:"boneMass",label:"骨鹽量",unit:"kg",min:0,max:30,step:0.01},
{key:"muscle",label:"肌肉量",unit:"kg",min:0,max:200,step:0.1},
{key:"bmr",label:"基礎代謝率",unit:"kcal",min:0,max:9999,step:1}
];
var DEFAULT_METRICS_FIELDS=["weight","bodyFat","muscle"];
var FL_IMPORT_MAX_DATES=400;
var FL_IMPORT_MAX_ENTRIES=5000;
var FL_DESC_MAX_LEN=120;
var FL_AI_SUMMARY_MAX_LEN=32;
var FL_TIME_MAX_LEN=32;
var FL_FAV_NAME_MAX_LEN=120;
var FL_DEFAULT_RULES_MAX_LEN=2000;
var FL_IMPORT_NUM_MAX=99999;
var FL_AI_IMAGE_MAX_EDGE=1280;
var FL_AI_IMAGE_JPEG_Q=0.82;
var FL_AI_MAX_IMAGES=20;
var FL_AI_TIMEOUT_BASE_MS=45000;
var FL_AI_TIMEOUT_PER_IMAGE_MS=8000;
var FL_AI_TIMEOUT_MAX_MS=180000;
var FL_BLOCKED_OBJ_KEYS={__proto__:1,constructor:1,prototype:1};
var GEMINI_URL_PRIMARY="https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
var GEMINI_URL_FALLBACK="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
var GEMINI_URL_REPORT="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
var MAX_GEMINI_KEYS=3;
var _keyFlashQuotaUntil=(function(){try{var _r=sessionStorage.getItem("fl_quota_until");if(_r){var _p=JSON.parse(_r);if(Array.isArray(_p)&&_p.length>=3)return _p}}catch(e){}return[0,0,0]})();
function _saveQuotaUntil(){try{sessionStorage.setItem("fl_quota_until",JSON.stringify(_keyFlashQuotaUntil))}catch(e){}}
var _geminiActiveModel="gemini-3-flash-preview";
function isBlockedImportKey(k){if(k==null)return true;var s=String(k);return!!FL_BLOCKED_OBJ_KEYS[s]||s.indexOf("__")===0}
function isValidImportDateKey(dt){if(!dt||typeof dt!=="string")return false;if(!/^\d{4}-\d{2}-\d{2}$/.test(dt))return false;var p=dt.split("-"),y=+p[0],mo=+p[1],da=+p[2];if(y<1970||y>2100||mo<1||mo>12||da<1||da>31)return false;var test=new Date(dt+"T12:00:00");return test.getFullYear()===y&&test.getMonth()+1===mo&&test.getDate()===da}
function clampImportNumber(n,min,max){var x=typeof n==="number"&&!isNaN(n)?n:parseFloat(String(n));if(!isFinite(x))x=0;return Math.max(min,Math.min(max,Math.round(x*100)/100))}
function truncateImportString(s,maxLen){var t=s==null?"":String(s);return t.length>maxLen?t.slice(0,maxLen):t}
function sanitizeFoodImportRow(raw,st){var descRaw=raw&&raw.desc!=null?String(raw.desc):"食物";var desc=truncateImportString(descRaw,FL_DESC_MAX_LEN);if(st&&descRaw.length>FL_DESC_MAX_LEN)st.truncStrings=(st.truncStrings||0)+1;var sumRaw=raw&&raw.aiSummary!=null?String(raw.aiSummary):"";var aiSummary=truncateImportString(sumRaw,FL_AI_SUMMARY_MAX_LEN);if(st&&sumRaw.length>FL_AI_SUMMARY_MAX_LEN)st.truncStrings=(st.truncStrings||0)+1;var id=(raw&&raw.id!=null&&String(raw.id).length<=80)?String(raw.id):uid();var time=truncateImportString(raw&&raw.time!=null?raw.time:"",FL_TIME_MAX_LEN);var row={id:id,desc:desc,time:time,protein:clampImportNumber(raw&&raw.protein,0,FL_IMPORT_NUM_MAX),fat:clampImportNumber(raw&&raw.fat,0,FL_IMPORT_NUM_MAX),carbs:clampImportNumber(raw&&raw.carbs,0,FL_IMPORT_NUM_MAX)};if(aiSummary)row.aiSummary=aiSummary;return row}
function sanitizeExerciseImportRow(raw,st){var descRaw=raw&&raw.desc!=null?String(raw.desc):"運動";var desc=truncateImportString(descRaw,FL_DESC_MAX_LEN);if(st&&descRaw.length>FL_DESC_MAX_LEN)st.truncStrings=(st.truncStrings||0)+1;var sumRaw=raw&&raw.aiSummary!=null?String(raw.aiSummary):"";var aiSummary=truncateImportString(sumRaw,FL_AI_SUMMARY_MAX_LEN);if(st&&sumRaw.length>FL_AI_SUMMARY_MAX_LEN)st.truncStrings=(st.truncStrings||0)+1;var id=(raw&&raw.id!=null&&String(raw.id).length<=80)?String(raw.id):uid();var time=truncateImportString(raw&&raw.time!=null?raw.time:"",FL_TIME_MAX_LEN);var row={id:id,desc:desc,time:time,calories:clampImportNumber(raw&&raw.calories,0,FL_IMPORT_NUM_MAX),duration:clampImportNumber(raw&&raw.duration,0,14400)};if(aiSummary)row.aiSummary=aiSummary;return row}
function sanitizeImportedAllDays(allDays){var stats={datesUsed:0,badDateKeys:0,foodIn:0,exIn:0,skippedRows:0,capDates:false,cappedTotal:false,truncStrings:0};var imp={};if(!allDays||typeof allDays!=="object"||Array.isArray(allDays))return{imp:imp,stats:stats};var rawKeys=Object.keys(allDays),i,u;for(u=0;u<rawKeys.length;u++){var rk=rawKeys[u];if(isBlockedImportKey(rk))continue;if(!isValidImportDateKey(rk))stats.badDateKeys++}var keys=rawKeys.filter(function(k){return !isBlockedImportKey(k)&&isValidImportDateKey(k)}).sort();if(keys.length>FL_IMPORT_MAX_DATES){stats.capDates=true;keys=keys.slice(0,FL_IMPORT_MAX_DATES)}var total=0;outer:for(i=0;i<keys.length;i++){var dt=keys[i];var day=allDays[dt]||{};var fa=Array.isArray(day.food)?day.food:[];var ea=Array.isArray(day.exercise)?day.exercise:[];var fOut=[],eOut=[],j,stDay={truncStrings:0};for(j=0;j<fa.length;j++){if(total>=FL_IMPORT_MAX_ENTRIES){stats.cappedTotal=true;stats.skippedRows+=fa.length-j+ea.length;break}fOut.push(sanitizeFoodImportRow(fa[j],stDay));total++;stats.foodIn++}var mOut=sanitizeMetricsImport(day.metrics);if(stats.cappedTotal){var cappedDay={food:fOut,exercise:[]};if(mOut)cappedDay.metrics=mOut;imp[dt]=cappedDay;stats.datesUsed++;stats.truncStrings+=stDay.truncStrings;break outer}for(j=0;j<ea.length;j++){if(total>=FL_IMPORT_MAX_ENTRIES){stats.cappedTotal=true;stats.skippedRows+=ea.length-j;break}eOut.push(sanitizeExerciseImportRow(ea[j],stDay));total++;stats.exIn++}var normalDay={food:fOut,exercise:eOut};if(mOut)normalDay.metrics=mOut;imp[dt]=normalDay;stats.datesUsed++;stats.truncStrings+=stDay.truncStrings;if(stats.cappedTotal)break outer}return{imp:imp,stats:stats}}
function sanitizeMetricsImport(raw){if(!raw||typeof raw!=="object")return null;var out={};if(raw.weight!=null){var w=clampImportNumber(raw.weight,0,999);if(w>0)out.weight=w}if(raw.bmi!=null){var bmi=clampImportNumber(raw.bmi,0,100);if(bmi>0)out.bmi=bmi}if(raw.bodyFat!=null){var bf=clampImportNumber(raw.bodyFat,0,100);if(bf>0)out.bodyFat=bf}if(raw.bodyWater!=null){var bw=clampImportNumber(raw.bodyWater,0,100);if(bw>0)out.bodyWater=bw}if(raw.protein!=null){var pr=clampImportNumber(raw.protein,0,100);if(pr>0)out.protein=pr}if(raw.fatMass!=null){var fm=clampImportNumber(raw.fatMass,0,300);if(fm>0)out.fatMass=fm}if(raw.boneMass!=null){var bm=clampImportNumber(raw.boneMass,0,30);if(bm>0)out.boneMass=bm}if(raw.muscle!=null){var mu=clampImportNumber(raw.muscle,0,999);if(mu>0)out.muscle=mu}if(raw.bmr!=null){var bmr=clampImportNumber(raw.bmr,0,9999);if(bmr>0)out.bmr=bmr}if(raw.note!=null)out.note=truncateImportString(String(raw.note),FL_DESC_MAX_LEN);return Object.keys(out).length?out:null}
function sanitizeGoalsImport(g){if(!g||typeof g!=="object")return null;var pr=clampImportNumber(g.protein,0,9999),fa=clampImportNumber(g.fat,0,9999),ca=clampImportNumber(g.carbs,0,99999);var cal=clampImportNumber(g.calories,0,999999);if(!cal)cal=Math.round(pr*4+fa*9+ca*4);return{protein:Math.round(pr),fat:Math.round(fa),carbs:Math.round(ca),calories:Math.round(cal)}}
function sanitizeFavoritesImport(arr){if(!Array.isArray(arr))return[];var out=[],mi;for(mi=0;mi<arr.length&&out.length<500;mi++){var it=arr[mi];if(!it||typeof it!=="object")continue;var name=truncateImportString(it.name!=null?it.name:"",FL_FAV_NAME_MAX_LEN).trim();if(!name)continue;out.push({name:name,protein:clampImportNumber(it.protein,0,FL_IMPORT_NUM_MAX),fat:clampImportNumber(it.fat,0,FL_IMPORT_NUM_MAX),carbs:clampImportNumber(it.carbs,0,FL_IMPORT_NUM_MAX)})}return out}
function sanitizeDefaultRulesStr(s){return truncateImportString(s==null?"":String(s),FL_DEFAULT_RULES_MAX_LEN)}
function formatImportSanitizeNote(st){var parts=[];if(st.badDateKeys)parts.push("略過無效日期 "+st.badDateKeys+" 個鍵");if(st.capDates)parts.push("日期超過上限，只保留 "+FL_IMPORT_MAX_DATES+" 天");if(st.cappedTotal)parts.push("總筆數超過 "+FL_IMPORT_MAX_ENTRIES+"，已截斷");if(st.skippedRows)parts.push("略過列數約 "+st.skippedRows);if(st.truncStrings)parts.push("描述／時間已截斷 "+st.truncStrings+" 處");return parts.length?("\n\n匯入清洗："+parts.join("；")):""}
function escapeCsvFormulaCell(val){var s=val==null?"":String(val);if(/^[=+\-@\t\r]/.test(s))return"'"+s.replace(/"/g,'""');return s}
function normalizeApiKey(s){if(!s)return"";return String(s).replace(/[\uFEFF\u200B-\u200D\u2060]/g,"").replace(/\s/g,"").trim()}
function migrateSessionGeminiKeysToLocalOnce(){try{localStorage.removeItem("fl_gemini_storage_mode");if(localStorage.getItem("fl_gemini_keys"))return;var sRaw=sessionStorage.getItem("fl_gemini_keys");if(!sRaw)return;var sp=JSON.parse(sRaw);if(!Array.isArray(sp))return;var slots=[];for(var i=0;i<MAX_GEMINI_KEYS;i++)slots.push(normalizeApiKey(sp[i]||""));if(!slots.some(function(k){return !!k}))return;localStorage.setItem("fl_gemini_keys",JSON.stringify(slots));if(slots[0])localStorage.setItem("fl_gemini_key",slots[0]);sessionStorage.removeItem("fl_gemini_keys")}catch(e){}}
function getApiKeySlots(){
migrateSessionGeminiKeysToLocalOnce();
var raw=localStorage.getItem("fl_gemini_keys");
if(raw){
try{
var parsed=JSON.parse(raw);
if(Array.isArray(parsed)){
var out=[];
for(var i=0;i<MAX_GEMINI_KEYS;i++)out.push(normalizeApiKey(parsed[i]||""));
return out;
}
}catch(e){}
}
var legacy=normalizeApiKey(localStorage.getItem("fl_gemini_key"));
if(legacy){
var migrated=[legacy,"",""];
localStorage.setItem("fl_gemini_keys",JSON.stringify(migrated));
return migrated;
}
return ["","",""];
}
function getApiKeys(){return getApiKeySlots().filter(function(k){return !!k})}
function setApiKeys(arr){
var slots=[];
for(var i=0;i<MAX_GEMINI_KEYS;i++)slots.push(normalizeApiKey(arr&&arr[i]||""));
localStorage.setItem("fl_gemini_keys",JSON.stringify(slots));
if(slots[0])localStorage.setItem("fl_gemini_key",slots[0]);else localStorage.removeItem("fl_gemini_key");
try{sessionStorage.removeItem("fl_gemini_keys")}catch(e){}
}
function formatGeminiApiError(msg){var m=msg||"API錯誤";var s=String(m);if(/resource_exhausted|rate\s*limit|quota|429|too\s*many\s*requests/i.test(s))return s+"（配額／速率限制：請稍後再試、換 Key，或到 Google Cloud 檢查配額）";if(/referrer|referer|HTTP\s*referrer|PERMISSION_DENIED/i.test(s))return s+"（常見原因：Key 設了「HTTP 網域限制」但白名單未含 "+location.origin+"/*；或請求來源被擋）";if(/api\s*key|API_KEY/i.test(s)&&/not valid|invalid|expired/i.test(s))m+=" 若 Cloud 憑證「應用程式限制」已是「無」：多半是手機貼上的 Key 含不可見字元或舊快取—請在設定清空欄位後從 AI Studio 整段重貼並儲存；仍不行則到瀏覽器設定清除本站（"+location.hostname+"）網站資料。若曾設「網站」限制，白名單須含「"+location.origin+"/*」與本機網址。";return m}
var FOOD_ITEM_SCHEMA={type:"object",properties:{name:{type:"string",description:"部位或食材名稱，例如：白飯、滷肉與滷汁、配菜"},grams:{type:"number",description:"該項估計重量（克）"},calories:{type:"number",description:"該項估計熱量（大卡）"}},required:["name","grams","calories"]};
var FOOD_SCHEMA={type:"object",properties:{protein:{type:"number",description:"蛋白質（克）"},fat:{type:"number",description:"脂肪（克）"},carbs:{type:"number",description:"碳水化合物（克）"},confidence:{type:"string",enum:["高","中","低"],description:"對此估算的信心等級"},summary:{type:"string",description:"繁體中文極短標題（約6-16字，最多18字），概括這餐給日誌列表；不要數字與單位"},reasoning:{type:"string",description:"一句補充說明（可選，與 breakdown 不重複則可簡短）"},breakdown:{type:"array",description:"將整份餐點拆成主要組成，逐項估計克數與該項熱量，用於解釋總營養如何加總",items:FOOD_ITEM_SCHEMA,minItems:1}},required:["protein","fat","carbs","confidence","summary","reasoning","breakdown"]};
var EXERCISE_SCHEMA={type:"object",properties:{calories:{type:"number",description:"主動消耗熱量（kcal）"},duration:{type:"number",description:"運動時長（分鐘）"},summary:{type:"string",description:"繁體中文極短標題（約6-16字，最多18字），概括這次運動給日誌列表；不要數字與單位"},reasoning:{type:"string",description:"一句繁體中文，說明如何從描述或截圖得出數字"}},required:["calories","duration","summary","reasoning"]};
var LOG_SUMMARY_SCHEMA={type:"object",properties:{summary:{type:"string",description:"繁體中文極短標題（約6-16字，最多18字），日誌列表用；不要數字"}},required:["summary"]};
function normalizeAiSummary(s){var t=s==null?"":String(s).replace(/\s+/g," ").trim();if(t.length>FL_AI_SUMMARY_MAX_LEN)t=t.slice(0,FL_AI_SUMMARY_MAX_LEN);return t}
function foodSummaryFromAiResult(result,desc){if(!result)return"";var s=normalizeAiSummary(result.summary);if(s)return s;if(result.breakdown&&result.breakdown.length){var names=result.breakdown.map(function(it){return String(it.name||"").trim()}).filter(Boolean).slice(0,2);if(names.length)return normalizeAiSummary(names.join("、"))}var r=String(result.reasoning!=null?result.reasoning:"").trim();if(r)return normalizeAiSummary(r.length>28?r.slice(0,28)+"…":r);return normalizeAiSummary(desc)}
function exerciseSummaryFromAiResult(result,desc){if(!result)return"";var s=normalizeAiSummary(result.summary);if(s)return s;var r=String(result.reasoning!=null?result.reasoning:"").trim();if(r)return normalizeAiSummary(r.length>FL_AI_SUMMARY_MAX_LEN?r.slice(0,FL_AI_SUMMARY_MAX_LEN):r);return normalizeAiSummary(desc)}
function recordDisplayTitle(entry,fallbackDesc){var d=fallbackDesc!=null?fallbackDesc:(entry&&entry.desc);var sum=entry&&entry.aiSummary!=null?normalizeAiSummary(entry.aiSummary):"";if(sum)return sum;return d!=null?String(d):""}
function shouldBackgroundSummarizeFood(entry){if(!entry||entry.aiSummary)return false;if(!checkAI())return false;var pr=+(entry.protein||0),fa=+(entry.fat||0),ca=+(entry.carbs||0);if(!pr&&!fa&&!ca)return false;return true}
function shouldBackgroundSummarizeExercise(entry){if(!entry||entry.aiSummary)return false;if(!checkAI())return false;var cal=+(entry.calories||0),dur=+(entry.duration||0);if(!cal&&!dur)return false;return true}
function foodConfidenceBadge(cf){var s=cf==null?"":String(cf).trim();if(s==="高")return{text:"高",bg:"var(--teal)"};if(s==="中")return{text:"中",bg:"var(--amber)"};if(s==="低")return{text:"低",bg:"var(--red)"};return{text:"—",bg:"var(--text-ter)"}}
function compressDataUrlForAi(dataUrl,maxEdge,jpegQ){
