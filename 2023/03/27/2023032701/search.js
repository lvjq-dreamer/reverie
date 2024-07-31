class LocalSearch{constructor({path:t="",unescape:e=!1,top_n_per_article:n=1}){this.path=t,this.unescape=e,this.top_n_per_article=n,this.isfetched=!1,this.datas=null}getIndexByWord(t,e,n=!1){const s=[],r=new Set;return n||(e=e.toLowerCase()),t.forEach((t=>{if(this.unescape){const e=document.createElement("div");e.innerText=t,t=e.innerHTML}const o=t.length;if(0===o)return;let h=0,i=-1;for(n||(t=t.toLowerCase());(i=e.indexOf(t,h))>-1;)s.push({position:i,word:t}),r.add(t),h=i+o})),
// Sort index by position of keyword
s.sort(((t,e)=>t.position!==e.position?t.position-e.position:e.word.length-t.word.length)),[s,r]}
// Merge hits into slices
mergeIntoSlice(t,e,n){let s=n[0],{position:r,word:o}=s;const h=[],i=new Set;for(;r+o.length<=e&&0!==n.length;){i.add(o),h.push({position:r,length:o.length});const t=r+o.length;
// Move to next position of hit
for(n.shift();0!==n.length&&(s=n[0],r=s.position,o=s.word,t>r);)n.shift()}return{hits:h,start:t,end:e,count:i.size}}
// Highlight title and content
highlightKeyword(t,e){let n="",s=e.start;for(const{position:r,length:o}of e.hits)n+=t.substring(s,r),s=r+o,n+=`<mark class="search-keyword">${t.substr(r,o)}</mark>`;return n+=t.substring(s,e.end),n}getResultItems(t){const e=[];return this.datas.forEach((({title:n,content:s,url:r})=>{
// The number of different keywords included in the article.
const[o,h]=this.getIndexByWord(t,n),[i,l]=this.getIndexByWord(t,s),a=new Set([...h,...l]).size,c=o.length+i.length;if(0===c)return;const d=[];0!==o.length&&d.push(this.mergeIntoSlice(0,n.length,o));let g=[];for(;0!==i.length;){const t=i[0],{position:e}=t,n=Math.max(0,e-20),r=Math.min(s.length,e+80);g.push(this.mergeIntoSlice(n,r,i))}
// Sort slices in content by included keywords' count and hits' count
g.sort(((t,e)=>t.count!==e.count?e.count-t.count:t.hits.length!==e.hits.length?e.hits.length-t.hits.length:t.start-e.start));
// Select top N slices in content
const u=parseInt(this.top_n_per_article,10);u>=0&&(g=g.slice(0,u));let p="";(r=new URL(r,location.origin)).searchParams.append("highlight",t.join(" ")),0!==d.length?p+=`<li><a href="${r.href}" class="search-result-title">${this.highlightKeyword(n,d[0])}</a>`:p+=`<li><a href="${r.href}" class="search-result-title">${n}</a>`,g.forEach((t=>{p+=`<a href="${r.href}"><p class="search-result">${this.highlightKeyword(s,t)}...</p></a>`})),p+="</li>",e.push({item:p,id:e.length,hitCount:c,includedCount:a})})),e}fetchData(){const t=!this.path.endsWith("json");fetch(this.path).then((t=>t.text())).then((e=>{
// Get the contents from search data
this.isfetched=!0,this.datas=t?[...(new DOMParser).parseFromString(e,"text/xml").querySelectorAll("entry")].map((t=>({title:t.querySelector("title").textContent,content:t.querySelector("content").textContent,url:t.querySelector("url").textContent}))):JSON.parse(e),
// Only match articles with non-empty titles
this.datas=this.datas.filter((t=>t.title)).map((t=>(t.title=t.title.trim(),t.content=t.content?t.content.trim().replace(/<[^>]+>/g,""):"",t.url=decodeURIComponent(t.url).replace(/\/{2,}/g,"/"),t))),
// Remove loading animation
window.dispatchEvent(new Event("search:loaded"))}))}
// Highlight by wrapping node in mark elements with the given class name
highlightText(t,e,n){const s=t.nodeValue;let r=e.start;const o=[];for(const{position:t,length:h}of e.hits){const e=document.createTextNode(s.substring(r,t));r=t+h;const i=document.createElement("mark");i.className=n,i.appendChild(document.createTextNode(s.substr(t,h))),o.push(e,i)}t.nodeValue=s.substring(r,e.end),o.forEach((e=>{t.parentNode.insertBefore(e,t)}))}
// Highlight the search words provided in the url in the text
highlightSearchWords(t){const e=new URL(location.href).searchParams.get("highlight"),n=e?e.split(" "):[];if(!n.length||!t)return;const s=document.createTreeWalker(t,NodeFilter.SHOW_TEXT,null),r=[];for(;s.nextNode();)s.currentNode.parentNode.matches("button, select, textarea")||r.push(s.currentNode);r.forEach((t=>{const[e]=this.getIndexByWord(n,t.nodeValue);if(!e.length)return;const s=this.mergeIntoSlice(0,t.nodeValue.length,e);this.highlightText(t,s,"search-keyword")}))}}