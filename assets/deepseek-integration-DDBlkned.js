import{_ as o,C as t}from"./ad-manager-nkcXdfJJ.js";const e=new class{constructor(){this.loadCloudStorageConfig(),this.downloadQueue=new Map,this.downloadHistory=this.loadDownloadHistory()}async loadCloudStorageConfig(){try{const o=await fetch("/src/config/cloud-storage.json");this.cloudStorage=await o.json()}catch(o){console.error("加载云存储配置失败:",o),this.cloudStorage={storages:{}}}}loadDownloadHistory(){try{const o=localStorage.getItem("download_history");return o?JSON.parse(o):[]}catch(o){return console.error("加载下载历史记录失败:",o),[]}}saveDownloadHistory(){try{localStorage.setItem("download_history",JSON.stringify(this.downloadHistory))}catch(o){console.error("保存下载历史记录失败:",o)}}showCloudStorageDialog(o){return new Promise((t=>{const e=this.cloudStorage.storages,n=Object.entries(e).filter((([,t])=>t.tools&&t.tools[o]));if(0===n.length)return alert("没有可用的下载链接"),void t(null);if(1===n.length){const[e,r]=n[0];return void t({storage:e,url:r.tools[o].url,extractCode:r.tools[o].extractCode})}const r=document.createElement("div");r.className="cloud-storage-dialog",r.innerHTML='\n                <div class="dialog-content">\n                    <h3>选择下载源</h3>\n                    <div class="storage-list"></div>\n                    <div class="dialog-buttons">\n                        <button class="cancel-btn">取消</button>\n                    </div>\n                </div>\n            ';const a=r.querySelector(".storage-list");n.forEach((([e,n])=>{const i=document.createElement("div");i.className="storage-item",i.innerHTML=`\n                    <div class="storage-name">${n.name}</div>\n                    <button class="select-btn">选择</button>\n                `,i.querySelector(".select-btn").addEventListener("click",(()=>{document.body.removeChild(r),t({storage:e,url:n.tools[o].url,extractCode:n.tools[o].extractCode})})),a.appendChild(i)})),r.querySelector(".cancel-btn").addEventListener("click",(()=>{document.body.removeChild(r),t(null)})),document.body.appendChild(r)}))}async downloadTool(o){try{const t=await this.showCloudStorageDialog(o);if(!t)return;const e={id:`${o}-${Date.now()}`,toolId:o,storage:t.storage,url:t.url,timestamp:Date.now()};return this.downloadHistory.unshift(e),this.downloadHistory.length>50&&this.downloadHistory.pop(),this.saveDownloadHistory(),window.open(t.url,"_blank"),t.extractCode&&this.showExtractCode(t.extractCode),this.logDownloadEvent(o,t.storage),e}catch(t){return console.error("下载工具失败:",t),alert("下载失败，请稍后重试"),null}}showExtractCode(o){const t=document.createElement("div");t.className="extract-code-notification",t.innerHTML=`\n            <div class="notification-content">\n                <h4>网盘提取码</h4>\n                <div class="extract-code">${o}</div>\n                <p>提取码已复制到剪贴板</p>\n                <button class="close-btn">关闭</button>\n            </div>\n        `,navigator.clipboard.writeText(o).catch((o=>{console.error("复制提取码失败:",o)})),t.querySelector(".close-btn").addEventListener("click",(()=>{document.body.removeChild(t)})),setTimeout((()=>{document.body.contains(t)&&document.body.removeChild(t)}),1e4),document.body.appendChild(t)}logDownloadEvent(o,t){window.gtag&&window.gtag("event","download",{event_category:"tools",event_label:o,storage:t})}getDownloadHistory(){return this.downloadHistory}clearDownloadHistory(){this.downloadHistory=[],this.saveDownloadHistory()}};class n{constructor(){this.downloadManager=e,this.init()}async init(){try{window.ENV||(window.ENV={});const e=await o((()=>import("./api-keys-BI2k6KOc.js")),[]);if(!e.default.DEEPSEEK_API_KEY)return void console.error("DeepSeek API密钥未在配置文件中设置");const n=await t.encrypt(e.default.DEEPSEEK_API_KEY,e.default.ENCRYPTION_KEY);window.ENV.DEEPSEEK_API_KEY_ENCRYPTED=n,console.log("DeepSeek API integration initialized with encrypted key")}catch(e){console.error("Failed to initialize DeepSeek integration:",e)}}async getApiKey(){var e;try{if(!(null==(e=window.ENV)?void 0:e.DEEPSEEK_API_KEY_ENCRYPTED))throw new Error("Encrypted API key not found");const n=await o((()=>import("./api-keys-BI2k6KOc.js")),[]);return await t.decrypt(window.ENV.DEEPSEEK_API_KEY_ENCRYPTED,n.default.ENCRYPTION_KEY)}catch(n){throw console.error("Failed to decrypt API key:",n),new Error("API key decryption failed")}}}try{new n}catch(a){console.error("Failed to initialize DeepSeek integration:",a)}const r=Object.freeze(Object.defineProperty({__proto__:null,DeepSeekIntegration:n},Symbol.toStringTag,{value:"Module"}));export{n as D,r as d,e as f};
//# sourceMappingURL=deepseek-integration-DDBlkned.js.map
