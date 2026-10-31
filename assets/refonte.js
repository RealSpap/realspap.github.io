(function(){"use strict";
var d=document,h=d.documentElement,$=function(s,r){return(r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,wide=matchMedia('(min-width:53rem)').matches,fine=matchMedia('(pointer:fine)').matches;
var Q={};

var clamp=function(x){return x<0?0:x>1?1:x};
h.classList.add('js');var pinsOn=wide&&!rm&&!Q.nopin&&!!document.querySelector('[data-pin=hero]');if(pinsOn)h.classList.add('pins');
var KEY='rv3',S;try{S=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){S={}}S.seals=S.seals||{};S.days=S.days||{};
function save(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');if(o.intro)S.intro=1;localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var SEALS={first:'Read a line',replay:'Replayed a command',source:'Opened a source',unread:'Found an unread line',corrected:'Opened a correction',daily:'Answered the reading of the day',share:'Copied your result',journey:'Followed the key to the end',matrix:'Filled the matrix',error:'Looked for my errors'};
var ORDER=Object.keys(SEALS).filter(function(k){return k!=='matrix'||document.getElementById('dots')});var TOT=ORDER.length;
function count(){return ORDER.filter(function(k){return S.seals[k]}).length}
function refresh(){var hud=$('#hud');if(hud){hud.hidden=false;$('#hudn').textContent=count()+' / '+TOT}}
function toast(t){var el=$('#toast');if(!el)return;el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('on')},2800)}
function seal(k){if(!SEALS[k]||S.seals[k])return;S.seals[k]=1;save();refresh();toast('Seal '+count()+' / '+TOT+': '+SEALS[k]+'. Well read.');if(count()===TOT)setTimeout(openGuardian,1800)}
function openGuardian(){var g=$('#guardian');if(!g)return;$('#gtxt').textContent='Seals collected: '+count()+' / '+TOT+'.'+(count()===TOT?' You are a Guardian. This is cosmetic: it unlocks nothing.':'');$('#glist').innerHTML=ORDER.map(function(k){return '<li>'+(S.seals[k]?'&#10003; ':'&#9675; ')+SEALS[k]+'</li>'}).join('');if(g.showModal&&!g.open)g.showModal()}
refresh();
function typeText(el,full,done){if(el._t)clearTimeout(el._t);var cur=d.createElement('span');cur.className='cur';var i=0;(function step(){if(i>full.length){cur.remove();if(done)done();return}el.textContent=full.slice(0,i);el.appendChild(cur);i++;el._t=setTimeout(step,i%9?16:70)})()}
if(fine&&!rm){var mx=0,my=0,mt=false;addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;if(!mt){mt=true;requestAnimationFrame(function(){mt=false;h.style.setProperty('--mx',mx.toFixed(3));h.style.setProperty('--my',my.toFixed(3))})}},{passive:true})}
if(Q.mx!==undefined){h.style.setProperty('--mx',Q.mx);h.style.setProperty('--my',Q.my||0)}
var vf=$('.vframe'),hv=vf&&$('video',vf),vs=null,img=vf&&$('img',vf);
if(hv&&wide&&!rm){hv.src=hv.getAttribute('data-src');hv.addEventListener('canplay',function(){if(Q.t!==undefined){hv.currentTime=Q.t%7;hv.addEventListener('seeked',function(){vf.classList.add('vid');hv.pause();if(onVid)onVid()},{once:true})}else{hv.play();vf.classList.add('vid')}},{once:true});hv.load()}
var onVid=null;
if(wide&&!rm&&window.IntersectionObserver){var vio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var v=$('video[data-src]',e.target);if(v&&!v.src){v.src=v.getAttribute('data-src');v.addEventListener('canplay',function(){v.classList.add('on');v.play()},{once:true});v.addEventListener('error',function(){v.removeAttribute('src')},{once:true})}vio.unobserve(e.target)})},{rootMargin:'300px'});$$('.st').forEach(function(s){vio.observe(s)})}
if(!rm&&fine){var pc=d.createElement('canvas');pc.id='pc';d.body.appendChild(pc);var px=pc.getContext('2d'),PW,PH,P=[];var psize=function(){PW=pc.width=innerWidth;PH=pc.height=innerHeight};psize();addEventListener('resize',psize);
 for(var i=0;i<46;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.6+Math.random()*1.5,v:.12+Math.random()*.4,a:.15+Math.random()*.4,s:Math.random()*6.28});
 (function ploop(){if(!d.hidden&&Q.t===undefined){px.clearRect(0,0,PW,PH);px.fillStyle='#e8c27a';for(var i=0;i<P.length;i++){var p=P[i];p.y-=p.v;p.s+=.01;p.x+=Math.sin(p.s)*.25;if(p.y<-4){p.y=PH+4;p.x=Math.random()*PW}px.globalAlpha=p.a;px.beginPath();px.arc(p.x,p.y,p.r,0,6.283);px.fill()}}requestAnimationFrame(ploop)})()}
var pins=pinsOn?$$('[data-pin]').map(function(el){return{el:el,id:el.getAttribute('data-pin'),last:-1}}):[];var handlers={};
function prog(el){var r=el.getBoundingClientRect(),len=el.offsetHeight-innerHeight;return len>0?clamp(-r.top/len):0}
var tick=false;function frame(){tick=false;pins.forEach(function(p){var v=prog(p.el);if(Math.abs(v-p.last)>1e-4){p.last=v;p.el.style.setProperty('--p',v.toFixed(4));if(handlers[p.id])handlers[p.id](v)}})}
function onS(){if(!tick){tick=true;requestAnimationFrame(frame)}}addEventListener('scroll',onS,{passive:true});addEventListener('resize',onS);addEventListener('pageshow',function(){pins.forEach(function(q){q.last=-1});onS()});
var hero=$('[data-pin=hero]'),cv=$('#hc'),curP=0,drawFn=null;
if(false&&hero&&cv&&pinsOn){var ctx=cv.getContext('2d'),sc=d.createElement('canvas'),sx=sc.getContext('2d',{willReadFrequently:true}),CELL=14,dpr=Math.min(devicePixelRatio||1,1.5),cols,rows,CW,CH,cwI,chI,key,rnd,atlas,gl='0123456789ABCDEF',LV=['#3a2a0c','#6b440f','#a87830','#d9a441','#e8c27a','#fff1c9'];
 var setup=function(){var bw=vf.clientWidth,bh=vf.clientHeight;if(!bw)return;CW=cv.width=Math.round(bw*dpr);CH=cv.height=Math.round(bh*dpr);cols=Math.ceil(bw/CELL);rows=Math.ceil(bh/CELL);sc.width=cols;sc.height=rows;var cw=CW/cols,chh=CH/rows;cwI=Math.ceil(cw);chI=Math.ceil(chh);key=new Float32Array(cols*rows);rnd=new Float32Array(cols*rows);var s=12345;for(var k=0;k<key.length;k++){s=(s*1664525+1013904223)>>>0;rnd[k]=s/4294967296;key[k]=.12+.8*(.55*rnd[k]+.45*((k%cols)/cols))}
  atlas=d.createElement('canvas');atlas.width=cwI*16;atlas.height=chI*6;var a=atlas.getContext('2d');a.font=Math.floor(chI*.82)+'px ui-monospace,Menlo,Consolas,monospace';a.textAlign='center';a.textBaseline='middle';for(var l=0;l<6;l++){a.fillStyle=LV[l];for(var g=0;g<16;g++)a.fillText(gl.charAt(g),g*cwI+cwI/2,l*chI+chI/2)}};
 setup();addEventListener('resize',function(){setup();if(drawFn)drawFn()});
 var source=function(){return(hv&&vf.classList.contains('vid')&&hv.readyState>=2)?hv:img};
 var drawCover=function(c,s,w,hh){var iw=s.videoWidth||s.naturalWidth,ih=s.videoHeight||s.naturalHeight;if(!iw)return false;var sw=Math.min(iw,ih*w/hh),sx0=(s===img)?iw-sw:(iw-sw)/2;c.drawImage(s,sx0,0,sw,ih,0,0,w,hh);return true};
 var P1=0,P2=0;
 drawFn=function(){var p1=P1,p2=P2,s=source();if(!s||!cols)return;ctx.globalAlpha=1;if(p2<=0){if(!drawCover(ctx,s,CW,CH))return}else{ctx.fillStyle='#050403';ctx.fillRect(0,0,CW,CH)}
  if(p1<=0)return;if(!drawCover(sx,s,cols,rows))return;var id=sx.getImageData(0,0,cols,rows).data,tt=Math.floor(performance.now()/170),cwf=CW/cols,chf=CH/rows;
  for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){var k=j*cols+i;if(p1<=key[k])continue;var pi=k*4,lum=(id[pi]*.3+id[pi+1]*.59+id[pi+2]*.11)/255,x0=i*cwf,y0=j*chf,dy=0,al=1;
   if(p2>0){dy=p2*p2*CH*(.25+1.1*rnd[k]);al=1-p2;if(al<=0)continue}else{ctx.globalAlpha=1;ctx.fillStyle='#050403';ctx.fillRect(x0,y0,cwI,chI)}
   var lv=Math.min(5,Math.floor(Math.pow(lum,.5)*6.4));if(lv<1&&rnd[k]<.22)lv=1;if(p2>0)lv=Math.min(5,lv+1);if(lv<1)continue;ctx.globalAlpha=al;ctx.drawImage(atlas,((k*7+tt)&15)*cwI,lv*chI,cwI,chI,x0,y0+dy,cwI,chI)}ctx.globalAlpha=1};
 onVid=function(){if(drawFn&&(P1>0||P2>0))drawFn()};
 if(hv&&hv.requestVideoFrameCallback){(function rv(){hv.requestVideoFrameCallback(function(){if(vf.classList.contains('cv')&&P2<=0&&drawFn)drawFn();rv()})})()}
 handlers.hero_cv=function(p){P1=clamp((p-.14)/.36);P2=clamp((p-.52)/.4);var on=P1>0||P2>0;vf.classList.toggle('cv',on);$$('.eyes,.keyg,.keyhit',vf).forEach(function(e){e.style.opacity=String(1-clamp(P1*6))});if(on)drawFn()}}
handlers.hero=function(p){var c=$('.copy',hero),cap=$('.cap',hero),sh=$('.sh',hero);if(c){c.style.opacity=String(1-clamp((p-.06)/.14));c.style.translate='0 '+(-p*80).toFixed(1)+'px'}if(cap)cap.style.opacity=String(clamp((p-.5)/.12)*(1-clamp((p-.9)/.08)));if(sh)sh.style.opacity=String(1-clamp(p/.05));
 var e=function(x){return x*x*(3-2*x)},z=e(clamp((p-.08)/.62)),ir=e(clamp((p-.3)/.5)),am=e(clamp((p-.72)/.14))*(1-e(clamp((p-.9)/.09)));
 var H=hero.style;H.setProperty('--z',(1+.5*z).toFixed(4));H.setProperty('--is',(1-.75*ir).toFixed(4));H.setProperty('--am',(.8*am).toFixed(4));H.setProperty('--amz',(1+.5*am).toFixed(4));
 var eo=String(1-clamp(z*3));$$('.eyes',vf).forEach(function(n){n.style.opacity=eo});$$('.keyg',vf).forEach(function(n){n.style.opacity=eo})};
var kh=$('.keyhit'),kg=$('.keyg');if(kh&&kg){kh.addEventListener('mouseenter',function(){kg.classList.remove('go');void kg.offsetWidth;kg.classList.add('go')});kh.addEventListener('click',function(){kh.classList.remove('turn');void kh.offsetWidth;kh.classList.add('turn');kg.classList.remove('go');void kg.offsetWidth;kg.classList.add('go');seal('key')})}
function countUp(el){var to=parseInt(el.getAttribute('data-to'),10),t0=performance.now();(function f(now){var k=clamp((now-t0)/1100);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})(t0)}
var io=window.IntersectionObserver&&new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;t.classList.add('in');if(t.classList.contains('rv')){$$('.cnt',t).forEach(countUp)}if(t.id==='how')seal('how');if(t.classList.contains('dots')&&!pinsOn)seal('matrix');io.unobserve(t)})},{threshold:.2});
$$('.rv,.bars,.dots,#how').forEach(function(el){if(rm||Q.y!==undefined||!io){el.classList.add('in')}else io.observe(el)});
var steps=$$('.jr .st'),cur=-1;
function setStep(i){if(i===cur)return;cur=i;steps.forEach(function(s,k){s.classList.toggle('on',k===i)});$$('.jline li').forEach(function(l,k){l.classList.toggle('on',k===i)});var n=$('#jnum');if(n)n.textContent='0'+(i+1)+' / 0'+steps.length;var lock=$('.lock');if(lock){lock.classList.remove('fail');if(i===2)setTimeout(function(){if(cur===2)lock.classList.add('fail')},1100)}
 var jt=$('#jtype');if(i===1&&jt&&!rm&&Q.y===undefined){var ls=jt.getAttribute('data-cmd').split('\n');typeText(jt,ls.map(function(l,k){return(k<2?'$ ':'')+l}).join('\n'))}if(i===3)seal('journey')}
if(steps.length){if(pinsOn){handlers.jr=function(p){setStep(Math.min(steps.length-1,Math.round(p*(steps.length-1))))}}else{steps.forEach(function(s){s.classList.add('on')});var lk=$('.lock');if(lk)setTimeout(function(){lk.classList.add('fail')},1200)}}
var dotsEl=$$('.mxs .dots .d');function pad(n){return('00'+n).slice(-3)}
function setMx(n){dotsEl.forEach(function(el,i){el.classList.toggle('on',i<n)});var c=$('#mxc');if(c)c.textContent=pad(n)+' / 100';var m=$('#mxn');if(m)m.textContent=String(Math.min(86,n));if(n>=100)seal('matrix')}
if(dotsEl.length){if(pinsOn){handlers.mx=function(p){setMx(Math.round(clamp(p/.8)*100))};setMx(0)}else setMx(100)}
var doc=$('#doc'),lit=doc&&$('.lit',doc),cb=$('#cmdbox');
if(doc){{doc.addEventListener('mousemove',function(e){var r=lit.getBoundingClientRect();lit.style.setProperty('--lx',(e.clientX-r.left)+'px');lit.style.setProperty('--ly',(e.clientY-r.top)+'px')},{passive:true})}
 if(Q.lx!==undefined&&lit){lit.style.setProperty('--lx',Q.lx+'px');lit.style.setProperty('--ly',Q.ly+'px')}
 doc.addEventListener('click',function(e){var b=e.target.closest('.rp');if(!b)return;var row=b.closest('.row'),i=row.getAttribute('data-i'),s=row.getAttribute('data-s');$$('.row[data-i="'+i+'"]',doc).forEach(function(r){r.classList.add('open')});seal('first');if(s==='corrected')seal('corrected');
  cb.hidden=false;clearTimeout(cb._t);if(b.hasAttribute('data-rev')){cb.classList.add('rev');cb.textContent=b.getAttribute('data-rev');seal('unread');seal('source')}else{cb.classList.remove('rev');var cmd=b.getAttribute('data-cmd');if(rm)cb.textContent=cmd;else typeText(cb,cmd,function(){seal('replay')});if(rm)seal('replay')}})}
d.addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;if(a.hasAttribute('data-src'))seal('source');if(a.hasAttribute('data-err'))seal('error');if(a.hasAttribute('data-how'))seal('how')});
var OPT=['One key can change it, with no notice read.','A group of keys must agree.','A timelock gives notice before any change.','The reading cannot say.'];
var CARDS=[{t:'Admin of a lending vault. A Safe was found and its quorum read: 3 of 5. No notice period was read in this example.',a:1,n:'A group must agree. How long the notice is was not read.'},{t:'A router contract on a busy chain. Neither owner(), admin() nor any known role answered.',a:3,n:'Nothing could be read. That says nothing about how well it is protected.'},{t:'A pool whose admin is another contract. The reader could not classify that contract.',a:3,n:'One hop is known, the next is not: nothing is said about who ends up in charge.'},{t:'A staking manager whose admin is an address with no code.',a:0,n:'One key. It may belong to a person, a service or a device: I read addresses, not people.'},{t:'A treasury behind a timelock of 24 hours. Who may propose an operation was not read.',a:2,n:'There is a notice before a change. Who may propose was not read.'},{t:'A program on a non-EVM chain, upgradable by a committee: 4 of 7 members. No time lock is described in this example.',a:1,n:'A committee must agree. No notice is described.'},{t:'An account with no code on a chain the testnet oracle tracks. The address is native.',a:3,n:'A native account has no admin to read: the card says not read, not none.'},{t:'A router whose owner is a 2-of-3 multisig behind a 48 hour timelock.',a:2,n:'A timelock stands in front of the change: 48 hours of notice, then the group must agree.'}];
var gc=$('#gcard');
if(gc){var today=new Date().toISOString().slice(0,10),DAY=today;
 var idx=Math.floor(Date.parse(DAY)/864e5)%CARDS.length,card=CARDS[idx];
 var esc=function(s){return String(s).replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})};
 var dateAdd=function(k){return new Date(Date.parse(DAY)-k*864e5).toISOString().slice(0,10)};
 var streak=function(){var n=0,k=S.days[DAY]!==undefined?0:1;while(S.days[dateAdd(k)]!==undefined){n++;k++}return n};
 var gridTxt=function(){var o=[];for(var k=6;k>=0;k--){var v=S.days[dateAdd(k)];o.push(v===1?'●':v===0?'○':'·')}return o.join(' ')};
 var render=function(){var ans=S.days[DAY];var html='<div class="gh">'+esc(DAY)+' &middot; reading of the day</div><p class="gq">'+esc(card.t)+'</p><p class="gq" style="margin-top:12px"><b>Who can change this contract, and with what notice?</b></p>';
  if(ans===undefined){html+='<div class="gopts">'+OPT.map(function(o,i){return'<button type="button" data-k="'+i+'">'+esc(o)+'</button>'}).join('')+'</div>'}
  else{html+='<div class="gopts">'+OPT.map(function(o,i){return'<button type="button" disabled class="'+(i===card.a?'right':'')+'">'+esc(o)+'</button>'}).join('')+'</div><div class="gres"><p>'+(ans===1?'Read correctly. ':'Not this time. ')+esc(card.n)+'</p><p class="grid" aria-label="Last 7 days">'+gridTxt()+'</p><p>Streak: '+streak()+' day'+(streak()===1?'':'s')+', stored on this device and nowhere else.</p><pre id="gshare">Reading of the day '+esc(DAY)+'  '+gridTxt()+'  streak '+streak()+'\n(invented contracts, no account)</pre><button class="btn line sm" type="button" id="gcopy">Copy my result</button></div>'}
  gc.innerHTML=html};
 render();
 gc.addEventListener('click',function(e){var b=e.target.closest('button[data-k]');if(b){S.days[DAY]=(+b.getAttribute('data-k')===card.a)?1:0;save();render();seal('daily');return}
  if(e.target.id==='gcopy'){var t=$('#gshare').textContent;var done=function(){seal('share');toast('Result copied.')};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){});else{var ta=d.createElement('textarea');ta.value=t;d.body.appendChild(ta);ta.select();try{d.execCommand('copy')}catch(x){}ta.remove();done()}}})}
var hud=$('#hud');if(hud)hud.addEventListener('click',openGuardian);
var gcl=$('#gclose');if(gcl)gcl.addEventListener('click',function(){$('#guardian').close()});
var gr=$('#greset');if(gr)gr.addEventListener('click',function(){S.seals={};save();refresh();openGuardian()});
var er=$('#erase');if(er)er.addEventListener('click',function(){try{localStorage.removeItem(KEY)}catch(e){}S={seals:{},days:{}};refresh();toast('Erased.');if(gc)location.reload()});
var sess=$('#sess');
if(sess){var L=[['p','$ ','python3 scripts/prove.py'],['m','# sample output, formatted from values published in the README; run the command for the real one'],['o','0x9BF45734D09bC7CA39238e767B2af9AAc62a7f52  getScore(address)'],['o','0x1f7d7550B1b028f7571E69A784071F0205FD2EfA  80 100 75 100 80 85'],['o','methodologyHash 0x7a8280d6...'],['o','block 90896188 = 0x56af73c'],['o','cooldown 608400 s -> 0 in the executing block'],['k','8 OK, 0 DIFFERENCE, 0 UNREAD in 3 s']];
 var CHs=34,LG=300,st=[],t0=.6;L.forEach(function(l){st.push(t0);t0+=(l[0]==='p'?l[l.length-1].length*CHs/1000+.5:LG/1000)});var TOTAL=t0,HOLD=6;
 var es=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')};
 var render=function(t){var o='';for(var i=0;i<L.length;i++){var l=L[i],s=st[i];if(t<s)break;if(l[0]==='p'){var n=Math.min(l[2].length,Math.floor((t-s)*1000/CHs));o+='<span class="p">'+l[1]+'</span><span class="c">'+es(l[2].slice(0,n))+'</span>\n'}else{o+='<span class="'+l[0]+'">'+es(l[l.length-1])+'</span>\n'}}sess.innerHTML=o+'<span class="cur"></span>'};
 if(rm){render(1e9);var cu=$('.cur',sess);if(cu)cu.remove()}else if(Q.t!==undefined){render(Q.t%(TOTAL+HOLD))}else{var s0=performance.now();(function lp(now){render(((now-s0)/1000)%(TOTAL+HOLD));requestAnimationFrame(lp)})(s0)}}
requestAnimationFrame(function(){frame()});if(Q.y!==undefined)setTimeout(function(){scrollTo(0,Q.y);frame();setTimeout(frame,200)},900);
if(false)window.__bench=function(n){var t=performance.now();for(var i=0;i<n;i++){if(drawFn){P1=.6;P2=0;drawFn()}}return(performance.now()-t)/n};
if(false)window.__bench2=function(n){var t=performance.now();for(var i=0;i<n;i++){if(drawFn){P1=1;P2=.5;drawFn()}}return(performance.now()-t)/n};
})();

(function(){"use strict";var d=document,$=function(s,r){return(r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
var top=$('#top');if(top){var on=function(){top.classList.toggle('cond',scrollY>40)};addEventListener('scroll',on,{passive:true});on()}
var dots=$('#dots');
if(dots){var det=$('#mxd');
 $$('.fb[data-f]').forEach(function(b){b.addEventListener('click',function(){dots.setAttribute('data-f',b.getAttribute('data-f'));$$('.fb[data-f]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')})})});
 dots.addEventListener('click',function(e){var b=e.target.closest('.d');if(!b)return;$$('.d.sel',dots).forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');det.textContent=b.getAttribute('data-d');var v=b.getAttribute('data-v');if(v!=='held'){var a=d.createElement('a');a.href='#not-held';a.textContent=' See it in the list below.';det.appendChild(a)}else{var a2=d.createElement('a');a2.href='https://github.com/RealSpap/onchain-postmortems/tree/main/'+b.getAttribute('data-slug');a2.textContent=' Open the entry.';a2.setAttribute('data-src','');det.appendChild(a2)}})}
$$('.fb[data-m]').forEach(function(b){b.addEventListener('click',function(){var c=$('#barsc');if(c)c.setAttribute('data-m',b.getAttribute('data-m'));$$('.fb[data-m]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')})})});
var cp=$('#copycmd');if(cp)cp.addEventListener('click',function(){var t=cp.getAttribute('data-copy');var ok=function(){cp.textContent='Copied'};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){});else{var ta=d.createElement('textarea');ta.value=t;d.body.appendChild(ta);ta.select();try{d.execCommand('copy')}catch(x){}ta.remove();ok()}});
var wide=matchMedia('(min-width:53rem)').matches,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
if(wide&&!rm&&window.IntersectionObserver){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var v=e.target;if(!v.src){v.src=v.getAttribute('data-lazy');v.addEventListener('canplay',function(){v.classList.add('on');v.play()},{once:true});v.addEventListener('error',function(){v.removeAttribute('src')},{once:true})}io.unobserve(v)})},{rootMargin:'400px'});$$('video[data-lazy]').forEach(function(v){io.observe(v)})}
})();

(function(){var d=document,h=d.documentElement,b=d.getElementById('lampbtn');
 if(b)b.addEventListener('click',function(){var on=!h.classList.contains('lampon');h.classList.toggle('lampon',on);b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'Lamp off':'Lamp on'});
 var doc=d.getElementById('doc');if(doc)doc.addEventListener('click',function(e){var bar=e.target.closest('.bar');if(!bar)return;var row=bar.closest('.row'),btn=row&&row.querySelector('.rp');if(btn)btn.click()});
 var lb=d.getElementById('lockbtn');if(lb)lb.addEventListener('click',function(){var l=d.querySelector('.lock');if(!l)return;l.classList.remove('fail');void l.offsetWidth;setTimeout(function(){l.classList.add('fail')},700)});
})();

(function(){var d=document,h=d.documentElement,$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
 var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function typer(el,full){clearTimeout(el._t);var i=0;(function s(){el.textContent=full.slice(0,i++);if(i<=full.length)el._t=setTimeout(s,i%9?16:70)})()}
 function play(st){var i=st.getAttribute('data-i');st.classList.remove('on');void st.offsetWidth;setTimeout(function(){st.classList.add('on');
   var lk=st.querySelector('.lock');if(lk){lk.classList.remove('fail');setTimeout(function(){lk.classList.add('fail')},1100)}
   var jt=st.querySelector('#jtype');if(jt&&jt.getAttribute('data-cmd')){var ls=jt.getAttribute('data-cmd').split('\n');typer(jt,ls.map(function(l,k){return(k<2?'$ ':'')+l}).join('\n'))}},60)}
 $$('.rep').forEach(function(b){b.addEventListener('click',function(){play(b.closest('.st'))})});
 var pins=h.classList.contains('pins');
 if(!pins&&!rm&&window.IntersectionObserver&&/^#?$/.test(location.hash.replace(/^#/,''))){var sts=$$('.jr .st');sts.forEach(function(s){s.classList.remove('on')});var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);play(e.target)}})},{threshold:.45});sts.forEach(function(s){io.observe(s)})}
})();


(function(){var d=document,jr=d.querySelector('.jr');if(!jr)return;
 d.querySelectorAll('.jline li').forEach(function(li,i){li.setAttribute('role','button');li.setAttribute('tabindex','0');li.setAttribute('aria-label','Go to step '+(i+1));
  function go(){if(!d.documentElement.classList.contains('pins'))return;var top=jr.getBoundingClientRect().top+scrollY,len=jr.offsetHeight-innerHeight;scrollTo({top:top+len*(i/3)+4,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
  li.addEventListener('click',go);li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})})})();

(function(){var d=document,box=d.getElementById('hubcards');if(!box)return;var cards=[].slice.call(box.querySelectorAll('.card')),th='all',q='',ts=d.getElementById('tools'),th2=ts&&ts.querySelector('.toolh');
 function ap(){var n=0;cards.forEach(function(c){var ok=(th==='all'||c.getAttribute('data-t')===th)&&(!q||c.textContent.toLowerCase().indexOf(q)>-1);c.hidden=!ok;if(ok)n++});
  if(ts){var any=[].slice.call(ts.querySelectorAll('.card')).some(function(c){return !c.hidden});ts.hidden=!any}
  var m=d.getElementById('cards');if(m)m.hidden=![].slice.call(m.querySelectorAll('.card')).some(function(c){return !c.hidden});
  d.getElementById('hubn').textContent=n+(n===1?' page':' pages')}
 function set(k){th=k;[].slice.call(d.querySelectorAll('.fb[data-th]')).forEach(function(x){x.setAttribute('aria-pressed',x.getAttribute('data-th')===k?'true':'false')});ap()}
 [].slice.call(d.querySelectorAll('.fb[data-th]')).forEach(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-th'));if(history.replaceState)history.replaceState(null,'',b.getAttribute('data-th')==='outils'?'#tools':location.pathname)})});
 var i=d.getElementById('hq');if(i)i.addEventListener('input',function(){q=i.value.trim().toLowerCase();ap()});
 function fromHash(){}
 fromHash();addEventListener('hashchange',fromHash)})();

(function(){var b=document.getElementById('rdcopy');if(!b)return;b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-copy-from'));if(!t)return;var done=function(m){b.textContent=m;setTimeout(function(){b.textContent='Copy the commands'},2500)};try{navigator.clipboard.writeText(t.textContent).then(function(){done('Copied')},function(){done('Select and copy the text above')})}catch(e){done('Select and copy the text above')}})})();
(function(){var dlg=document.getElementById('pal'),inp=document.getElementById('pali'),ul=document.getElementById('pall'),btn=document.getElementById('srch');
if(!dlg||!inp||!ul||typeof dlg.showModal!=='function')return;
var ITEMS=[['Home','/'],['Research','/research/'],['Contact','/contact.html'],['Postmortems checker','/tools/onchain-postmortems-checker.html'],['Admin key checker','/tools/admin-key-checker.html'],['Check your Safe','/tools/check-your-safe.html'],['Oracle (testnet)','https://realspap.github.io/oracle/'],['Registry','/registry.html'],['Method and limits','/method.html'],['Find my errors','/errors.html'],['The 100 statements','/statements.html'],['Home: a real report','/#reading'],['Home: Morpho Blue report','/#morpho'],['Home: the registry in 72 dots','/#registry-scene'],['Home: what I could not read','/#trust'],['Home: a report on your own contract','/#try'],['Home: run the commands yourself','/#replay'],['Home: tell me about a mistake','/#correct'],['Home: who I am','/#about']];
var cur=0,shown=ITEMS.slice();
function draw(){ul.innerHTML='';shown.forEach(function(it,i){var li=document.createElement('li');li.setAttribute('role','option');li.setAttribute('aria-selected',i===cur?'true':'false');li.textContent=it[0];var s=document.createElement('small');s.textContent=it[1];li.appendChild(s);li.addEventListener('click',function(){go(it)});ul.appendChild(li)});}
function go(it){dlg.close();location.href=it[1]}
function filt(){var q=inp.value.trim().toLowerCase();shown=q?ITEMS.filter(function(x){return x[0].toLowerCase().indexOf(q)>-1||x[1].toLowerCase().indexOf(q)>-1}):ITEMS.slice();cur=0;draw()}
function open(){filt();inp.value='';shown=ITEMS.slice();cur=0;draw();dlg.showModal();inp.focus()}
if(btn){btn.hidden=false;btn.addEventListener('click',open)}
var b2=document.querySelector('.srch2');if(b2){b2.hidden=false;b2.addEventListener('click',function(){var m=document.getElementById('menu');if(m&&m.open)m.close();open()})}
document.addEventListener('keydown',function(e){var t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);if(((e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey)||((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)&&!e.altKey))&&!dlg.open){e.preventDefault();open()}});
inp.addEventListener('input',filt);
inp.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();cur=Math.min(shown.length-1,cur+1);draw()}else if(e.key==='ArrowUp'){e.preventDefault();cur=Math.max(0,cur-1);draw()}else if(e.key==='Enter'){e.preventDefault();if(shown[cur])go(shown[cur])}});
document.getElementById('palx').addEventListener('click',function(){dlg.close()});
dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
})();

(function(){var map={research:'/research/',oracle:'https://realspap.github.io/oracle/',registry:'/registry.html',method:'/method.html',errors:'/errors.html'};['top','bar'].forEach(function(k){var e=k==='top'?document.getElementById('top'):document.querySelector('.bar');if(!e)return;var a=e.getAttribute('data-active'),h=map[a];if(!h)return;var l=e.querySelector('a[href="'+h+'"]');if(l)l.setAttribute('aria-current','page')})})();

(function(){var tabs=[].slice.call(document.querySelectorAll('.tabs [role=tab]'));if(!tabs.length)return;
function sel(t){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;x.classList.toggle('on',on);var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on})}
tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t)});t.addEventListener('keydown',function(e){var k=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(k){e.preventDefault();var n=tabs[(i+k+tabs.length)%tabs.length];n.focus();sel(n)}})});
sel(tabs[0])})();

(function(){var d=[].slice.call(document.querySelectorAll('details.dd,.bar details.more'));if(!d.length)return;
function shut(except){d.forEach(function(x){if(x!==except&&x.open)x.open=false})}
d.forEach(function(x){x.addEventListener('toggle',function(){if(x.open)shut(x)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=d.filter(function(x){return x.open})[0];if(o){o.open=false;var s=o.querySelector('summary');if(s)s.focus()}}});
document.addEventListener('click',function(e){if(!e.target.closest('details.dd,.bar details.more'))shut(null)})})();

(function(){var scenes=[].slice.call(document.querySelectorAll('.vsc,.reg'));if(!scenes.length)return;
var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
var rvs=[].slice.call(document.querySelectorAll('.rv'));
if(rm||!('IntersectionObserver' in window)){rvs.forEach(function(e){e.classList.add('in')});scenes.forEach(function(e){e.classList.add('seen')})}
else{var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');var s=x.target.closest('.vsc');if(s)s.classList.add('seen');io.unobserve(x.target)}})},{threshold:.12});rvs.forEach(function(e){io.observe(e)})}
var rg=document.getElementById('rg'),cnt=document.getElementById('rgc'),sec=document.querySelector('.reg');
if(rg&&cnt&&sec){var dots=[].slice.call(rg.children),N=dots.length;
 function show(n){n=Math.max(0,Math.min(N,n));dots.forEach(function(d,i){d.classList.toggle('on',i<n)});cnt.textContent=n}
 if(rm){show(N)}else{show(0);var wide=matchMedia('(min-width:52rem)');
  function onScroll(){if(!wide.matches)return;var r=sec.getBoundingClientRect(),span=sec.offsetHeight-innerHeight;var p=span>0?Math.max(0,Math.min(1,-r.top/(span*.8))):1;show(Math.round(p*N))}
  var ticking=false;addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(function(){ticking=false;onScroll()})}},{passive:true});
  var done=false;var ob=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting&&!wide.matches&&!done){done=true;var t0=null;(function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/1800);show(Math.round(p*N));if(p<1)requestAnimationFrame(step)})(performance.now())}})},{threshold:.4});ob.observe(sec);
  onScroll()}}
})();

(function(){var vs=[].slice.call(document.querySelectorAll('video[data-lazy]:not([data-src])'));vs=vs.filter(function(v){return v.classList.contains('rain')||v.classList.contains('emb')});if(!vs.length)return;
if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window))return;
var io=new IntersectionObserver(function(es){es.forEach(function(x){var v=x.target;if(x.isIntersecting){if(!v.getAttribute('src')){v.src=v.getAttribute('data-lazy')}var p=v.play();if(p&&p.catch)p.catch(function(){})}else{v.pause()}})},{threshold:.15});vs.forEach(function(v){io.observe(v)})})();

(function(){[].forEach.call(document.querySelectorAll('.car'),function(car){var sec=car.closest('.carsec'),ctl=sec.querySelector('.car-ctl'),dots=[].slice.call(sec.querySelectorAll('.car-dot')),sl=[].slice.call(car.querySelectorAll('.slide'));
if(ctl&&sl.length>1)ctl.hidden=false;
function idx(){return Math.max(0,Math.min(sl.length-1,Math.round(car.scrollLeft/(car.clientWidth+parseFloat(getComputedStyle(car).columnGap||0)))))}
function mark(){var i=idx();dots.forEach(function(d,k){d.setAttribute('aria-current',k===i?'true':'false')});sl.forEach(function(s,k){s.setAttribute('aria-hidden',k===i?'false':'true')})}
function go(i){i=Math.max(0,Math.min(sl.length-1,i));car.scrollTo({left:sl[i].offsetLeft-car.offsetLeft,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'})}
car.addEventListener('scroll',function(){window.requestAnimationFrame(mark)},{passive:true});
[].forEach.call(sec.querySelectorAll('.car-b'),function(b){b.addEventListener('click',function(){go(idx()+parseInt(b.getAttribute('data-d'),10))})});
dots.forEach(function(d,k){d.addEventListener('click',function(){go(k)})});
car.addEventListener('keydown',function(e){if(e.target!==car)return;if(e.key==='ArrowRight'){e.preventDefault();go(idx()+1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(idx()-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(sl.length-1)}});
var down=false,x0=0,s0=0;car.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button,code,pre'))return;down=true;x0=e.clientX;s0=car.scrollLeft});
window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>6)car.classList.add('drag');if(car.classList.contains('drag'))car.scrollLeft=s0-dx});
window.addEventListener('pointerup',function(e){if(!down)return;down=false;if(car.classList.contains('drag')){var dx=e.clientX-x0,i=idx();car.classList.remove('drag');go(dx<-40?i+1:dx>40?i-1:i)}});
mark()})})();

(function(){var rows=[].slice.call(document.querySelectorAll('.hrow'));if(!rows.length)return;var fs=[].slice.call(document.querySelectorAll('.hf')),q=document.getElementById('hq2'),n=document.getElementById('hubn2'),th='all';
function apply(){var w=(q&&q.value||'').trim().toLowerCase(),c=0;rows.forEach(function(r){var ok=(th==='all'||r.getAttribute('data-t')===th)&&(!w||r.textContent.toLowerCase().indexOf(w)>-1);r.hidden=!ok;if(ok)c++});if(n)n.textContent=c+(c===1?' page':' pages')}
fs.forEach(function(b){b.addEventListener('click',function(){th=b.getAttribute('data-th');fs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});apply()})});
if(q)q.addEventListener('input',apply)})();

(function(){var hs=[].slice.call(document.querySelectorAll('.vsc .disp,.ch-st .disp,.hub2 .disp,.reg .disp'));if(!hs.length)return;
hs.forEach(function(h){if(h.closest('.h3-back'))return;if(!h.closest('.rv,.ch-st'))h.classList.add('in');h.classList.add('tt')})})();

(function(){var f=document.querySelector('.big-fig');if(!f||matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window))return;var end=parseInt(f.textContent,10);if(!end)return;f.textContent='0';
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.disconnect();var t0=null;(function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/1300);f.textContent=Math.round(end*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)})(performance.now())})},{threshold:.5});io.observe(f)})();

(function(){var dlg=document.getElementById('menu');if(!dlg||typeof dlg.showModal!=='function')return;var btns=[].slice.call(document.querySelectorAll('.menu-btn,.bar-menu'));if(!btns.length)return;
btns.forEach(function(b){b.hidden=false});
var act=(document.getElementById('top')||{getAttribute:function(){return ''}}).getAttribute('data-active');if(act){var l=dlg.querySelector('a[data-k="'+act+'"]');if(l)l.setAttribute('aria-current','page')}
var last=null;function open(b){last=b;dlg.showModal();var x=document.getElementById('menux');if(x)x.focus()}
btns.forEach(function(b){b.addEventListener('click',function(){open(b)})});
document.getElementById('menux').addEventListener('click',function(){dlg.close()});
dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
dlg.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.getAttribute('href').charAt(0)==='#')dlg.close()});
dlg.addEventListener('close',function(){if(last)last.focus()})})();


var SM=(function(){var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,io='IntersectionObserver' in window;
function once(el,fn,t){if(!el)return;if(rm||!io){fn(true);return}
 var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();fn(false)}},{threshold:t||.5});o.observe(el)}
function tween(ms,f,done){var t0=null;requestAnimationFrame(function s(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/ms);f(p);if(p<1)requestAnimationFrame(s);else if(done)done()})}
function ease(p){return 1-Math.pow(1-p,3)}
function grid(el,ms){if(!el)return;var c=[].slice.call(el.children);if(!rm&&io)c.forEach(function(x){x.classList.remove('on')});
 once(el,function(fin){if(fin){c.forEach(function(x){x.classList.add('on')});return}
  tween(ms,function(p){var n=Math.round(p*c.length);for(var i=0;i<n;i++)c[i].classList.add('on')})},.4)}
if(!rm&&io){var vo=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('fxon',e.isIntersecting)})});
 [].forEach.call(document.querySelectorAll('.fx'),function(f){vo.observe(f.parentNode)})}
return{rm:rm,once:once,tween:tween,ease:ease,grid:grid}})();

(function(){var hero=document.getElementById('hero3'),ch=document.getElementById('chain');if(!hero&&!ch)return;
var rm=SM.rm,st=ch?[].slice.call(ch.querySelectorAll('.ch-st')):[],N=st.length,cur=-1,gone=hero&&hero.querySelector('.h3-copy'),
 kc=ch&&ch.querySelector('.kc'),kl=kc?[].slice.call(kc.querySelectorAll('li')):[],
 rl=ch?[].slice.call(ch.querySelectorAll('.ch-rail b')):[],ty=ch&&ch.querySelector('.ch-type'),tyS=ty?ty.textContent:'',fl=ch&&ch.querySelector('.fixl');
function cl(v){return v<0?0:v>1?1:v}
var HOLD=.25;
function prog(el){var r=el.getBoundingClientRect(),s=el.offsetHeight-innerHeight;return s>0?cl(-r.top/s):0}
function stepFig(k,x){
 if(k===0&&kc){var kk=cl((x-.1)/.6);kc.style.setProperty('--kk',kk.toFixed(3));kl.forEach(function(li,i){li.classList.toggle('lit',kk>=i/(kl.length-1)-.02)})}
 if(k===1&&ty){var n=Math.round(cl((x-.12)/.45)*tyS.length);if(ty.textContent.length!==n)ty.textContent=tyS.slice(0,n);st[1].classList.toggle('res',x>.6)}
 if(k===2&&fl)fl.style.setProperty('--fx',cl((x-.12)/.5).toFixed(3))}
if(ch&&rm){ch.classList.add('static');st.forEach(function(s,k){stepFig(k,1)})}
function tick(){
 if(hero&&!rm){var p=prog(hero),hp=cl((p-HOLD)/(1-HOLD));hero.style.setProperty('--hp',hp.toFixed(3));if(gone)gone.classList.toggle('gone',hp>.55)}
 if(!ch||rm)return;var q=prog(ch),best=0,bo=-1;ch.style.setProperty('--cp',q.toFixed(3));
 st.forEach(function(s,k){var x=q*N-k,edge=(k===0&&x<.5)||(k===N-1&&x>.5),
   o=edge?1:cl((x+.2)/.4)*cl((1.2-x)/.4),ot=edge?1:cl((x-.02)/.28)*cl((.96-x)/.14);
  s.style.setProperty('--o',o.toFixed(3));s.style.setProperty('--ot',ot.toFixed(3));s.style.setProperty('--x',cl(x).toFixed(3));s.style.setProperty('--xu',Math.max(-.3,Math.min(1.3,x)).toFixed(3));
  if(o>bo){bo=o;best=k}stepFig(k,x)});
 if(best!==cur){cur=best;st.forEach(function(s,k){var on=k===best;s.classList.toggle('on',on);s.inert=!on});rl.forEach(function(m,k){m.classList.toggle('rl-on',k<=best);m.classList.toggle('rl-cur',k===best)})}}
var t=false;function on(){if(!t){t=true;requestAnimationFrame(function(){t=false;tick()})}}
addEventListener('scroll',on,{passive:true});addEventListener('resize',on);tick()})();

(function(){var t=document.querySelector('.trm');if(!t)return;var out=t.querySelector('.t-live'),
 L=t.querySelector('.t-ghost').textContent.replace(/\n$/,'').split('\n');
function kind(s){return s.charAt(0)==='$'?'t-c':s.charAt(0)==='#'?'t-n':'t-o'}
function put(cls){var n=document.createElement('span');n.className=cls;out.appendChild(n);return n}
function fill(n,s){var m=s.match(/^(.*0x0{24})([0-9a-f]{40})(.*)$/i);if(!m){n.textContent=s+'\n';return}
 n.textContent=m[1];var b=document.createElement('b');b.textContent=m[2];n.appendChild(b);n.appendChild(document.createTextNode(m[3]+'\n'))}
SM.once(t,function(fin){
 if(fin){L.forEach(function(s){fill(put(kind(s)),s)});t.classList.add('done');return}
 var i=0;setTimeout(function next(){if(i>=L.length){t.classList.add('done');return}
  var s=L[i++],k=kind(s),n=put(k);
  if(k!=='t-c'){fill(n,s);setTimeout(next,k==='t-n'?320:520);return}
  var j=0;(function type(){n.textContent=s.slice(0,++j);if(j<s.length)setTimeout(type,16+Math.random()*24);else{n.textContent+='\n';setTimeout(next,420)}})()},300)},.45)})();

(function(){var g=document.querySelector('.tlk');if(!g)return;var n=g.querySelector('.tlk-n'),T=172800;
function set(p){g.style.setProperty('--t',p.toFixed(4));n.textContent=Math.round(T*p)+' s'}
if(!SM.rm)set(0);
SM.once(g,function(fin){if(fin){set(1);g.classList.add('done');return}
 setTimeout(function(){SM.tween(2600,function(p){set(SM.ease(p))},function(){set(1);g.classList.add('done')})},250)},.6)})();

(function(){var g=document.querySelector('.sg');if(!g)return;var on=[].slice.call(g.querySelectorAll('li.on')),n=g.querySelector('.sg-n');
if(!SM.rm){on.forEach(function(l){l.classList.remove('on')});n.textContent='0'}
SM.once(g,function(fin){if(fin){on.forEach(function(l){l.classList.add('on')});n.textContent='6';g.classList.add('done');return}
 on.forEach(function(l,i){setTimeout(function(){l.classList.add('on');n.textContent=i+1;
  if(i===on.length-1)setTimeout(function(){g.classList.add('done')},200)},300+i*170)})},.6)})();

SM.grid(document.querySelector('#wrong .cells'),1500);
SM.grid(document.querySelector('#cited .cells'),1800);

var Lire=(function(){
var RPC='https://ethereum-rpc.publicnode.com';
var SLOT_ADMIN='0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
var ZERO=/^0x0{40}$/;
function rpc(f,m,p){return f(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:m,params:p})}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(j){if(!j||typeof j!=='object'||Array.isArray(j))throw new Error('unexpected answer');if(j.error){var e=new Error(j.error.message||'error');e.revert=(typeof j.error==='object'&&(j.error.code===3||/execution reverted/i.test(String(j.error.message||''))));throw e}
 if(typeof j.result!=='string'||!/^0x[0-9a-fA-F]*$/.test(j.result))throw new Error('unexpected answer');return j.result})}
function call(f,to,data){return rpc(f,'eth_call',[{to:to,data:data},'latest']).catch(function(e){if(e.revert)return null;throw e})}
function addr(w){return (w&&/^0x[0-9a-f]{64}$/i.test(w))?'0x'+w.slice(26).toLowerCase():null}
function num(w){return (w&&/^0x[0-9a-f]{1,64}$/i.test(w))?BigInt(w):null}
function dur(s){s=Number(s);var d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),o=[];if(d)o.push(d+(d===1?' day':' days'));if(h)o.push(h+' h');if(m&&!d)o.push(m+' min');if(!o.length)o.push(s+' s');return o.join(' ')+' ('+s+' seconds)'}
function short(a){return a.slice(0,8)+'…'+a.slice(-6)}
function classer(f,a,depth,out){
 return rpc(f,'eth_getCode',[a,'latest']).then(function(code){
  if(code==='0x'){out.push({t:'who',txt:a+' has no code: it is an ordinary account, usually controlled by one private key. The blockchain does not show whether someone holds that key.',cmd:'eth_getCode '+a});return}
  return Promise.all([call(f,a,'0xe75235b8'),call(f,a,'0xa0e67e2b'),call(f,a,'0xf27a0c92'),call(f,a,'0x6a42b8f8'),call(f,a,'0xf851a440')]).then(function(r){
   var th=num(r[0]),own=r[1],md=num(r[2]),dl=num(r[3]),adm=addr(r[4]);
   if(th!==null&&own&&own.length>=130){var n=Number(BigInt('0x'+own.slice(2+64,2+128)));out.push({t:'who',txt:a+' answers getThreshold() and getOwners(): it looks like a Safe (a multisig wallet). In this Safe, '+th+' of '+n+' signers must sign together. The blockchain does not show who the signers are outside the blockchain.',cmd:'getThreshold() 0xe75235b8 , getOwners() 0xa0e67e2b'});return}
   if(md!==null||dl!==null){var s=md!==null?md:dl;out.push({t:'who',txt:a+' answers '+(md!==null?'getMinDelay()':'delay()')+' with '+dur(s)+': it looks like a timelock. A change waits for this delay before it applies.',cmd:(md!==null?'getMinDelay() 0xf27a0c92':'delay() 0x6a42b8f8')});
     if(adm&&!ZERO.test(adm)&&depth<3){out.push({t:'step',txt:'The timelock is administered by '+adm+':',cmd:'admin() 0xf851a440'});return classer(f,adm,depth+1,out)}return}
   out.push({t:'who',txt:a+' is a contract of a type that I do not recognise: not a Safe, and not a timelock that I know.',cmd:'eth_getCode '+a})})})}
function lire(f,a){
 var out=[];a=(a||'').trim();
 if(!/^0x[0-9a-fA-F]{40}$/.test(a)){return Promise.resolve([{t:'err',txt:'Type an address: 0x followed by 40 hexadecimal characters.'}])}
 a=a.toLowerCase();
 return rpc(f,'eth_getCode',[a,'latest']).then(function(code){
  if(code==='0x'){return [{t:'err',txt:'This address has no code on Ethereum mainnet, so it is not a contract there. It is an account, or the contract is on another blockchain.'}]}
  return Promise.all([call(f,a,'0x8da5cb5b'),call(f,a,'0xf851a440'),rpc(f,'eth_getStorageAt',[a,SLOT_ADMIN,'latest']).catch(function(e){if(e.revert)return null;throw e})]).then(function(r){
   var o=addr(r[0]),ad=addr(r[1]),sl=addr(r[2]);var seen={},ctl=[],zeros=[];
   [[o,'owner()','0x8da5cb5b'],[ad,'admin()','0xf851a440'],[sl,'proxy admin slot (EIP-1967)','eth_getStorageAt '+SLOT_ADMIN.slice(0,10)+'…']].forEach(function(c){if(c[0]&&ZERO.test(c[0])){if(c[1]==='owner()'||c[1]==='admin()')zeros.push(c[1]);return}if(c[0]&&!seen[c[0]]){seen[c[0]]=1;ctl.push(c)}});
   if(!ctl.length&&zeros.length){return [{t:'none',txt:zeros.join(' and ')+' returns the zero address: the owner gave up ownership, or no owner was ever set. This check does not read other ways to change the contract (roles, upgrades through other functions). This is a first read, not an audit.'}]}
   if(!ctl.length){return [{t:'none',txt:'I found no owner(), no admin() and no proxy admin slot on this contract. That does not mean nobody can change it: it may use roles, another function name, or no admin at all. I cannot tell from these reads.'}]}
   var p=Promise.resolve();ctl.forEach(function(c){p=p.then(function(){out.push({t:'ctl',txt:c[1]+' returns '+c[0]+'.',cmd:c[2]});return classer(f,c[0],0,out)})});
   return p.then(function(){if(zeros.length)out.push({t:'ctl',txt:zeros.join(' and ')+' returns the zero address (renounced, or never set).'});out.push({t:'limit',txt:'Not read here: access through roles, accounts that can pause the contract, guardians, the modules and guards of a Safe, upgrades through other functions, and who holds each key outside the blockchain. This is a first read, not an audit.'});return out})})})
 .catch(function(e){return [{t:'err',txt:'Not read: the public node did not answer ('+e.message+'). This is not a result about the contract. Try again, or run the commands below yourself.'}]})}
function cmds(a){a=(a||'').trim();var ok=/^0x[0-9a-fA-F]{40}$/.test(a);a=ok?a.toLowerCase():'0xYourContractAddress';
 return ['RPC=https://ethereum-rpc.publicnode.com','M='+a,
 "q() { curl -s $RPC -H 'content-type: application/json' -d \"{\\\"jsonrpc\\\":\\\"2.0\\\",\\\"id\\\":1,\\\"method\\\":\\\"eth_call\\\",\\\"params\\\":[{\\\"to\\\":\\\"$1\\\",\\\"data\\\":\\\"$2\\\"},\\\"latest\\\"]}\"; }",
 "r() { curl -s $RPC -H 'content-type: application/json' -d \"{\\\"jsonrpc\\\":\\\"2.0\\\",\\\"id\\\":1,\\\"method\\\":\\\"$1\\\",\\\"params\\\":[$2]}\"; }",
 'r eth_getCode "\\"$M\\",\\"latest\\""   # is there contract code?',
 'q $M 0x8da5cb5b   # owner()','q $M 0xf851a440   # admin()',
 'r eth_getStorageAt "\\"$M\\",\\"'+SLOT_ADMIN+'\\",\\"latest\\""   # proxy admin slot (EIP-1967)',
 '# then, for the address returned by owner() or admin():','O=0xAddressReturnedAbove','q $O 0xe75235b8   # getThreshold(), if it is a Safe','q $O 0xa0e67e2b   # getOwners()','q $O 0xf27a0c92   # getMinDelay(), if it is a timelock','q $O 0x6a42b8f8   # delay(), the timelock of some protocols','q $O 0xf851a440   # admin(), who administers a timelock'].join('\n')}
return{lire:lire,cmds:cmds}})();
(function(){var form=document.getElementById('rdform');if(!form||typeof fetch!=='function'||typeof BigInt==='undefined')return;form.hidden=false;
var inp=document.getElementById('rdaddr'),out=document.getElementById('rdout'),cmd=document.getElementById('rdcmd2'),go=document.getElementById('rdgo'),cp=document.getElementById('rdcopy2');
function setCmd(){cmd.textContent=Lire.cmds(inp.value)}
function idle(m){out.textContent='';var p=document.createElement('p');p.className='rdidle';p.textContent=m;out.appendChild(p)}
function draw(rows){out.textContent='';rows.forEach(function(r,i){var d=document.createElement('div');d.className='rdl rdl-'+r.t;var p=document.createElement('p');p.textContent=r.txt;d.appendChild(p);
 if(r.cmd){var c=document.createElement('code');c.textContent=r.cmd;d.appendChild(c)}d.style.transitionDelay=(i*140)+'ms';out.appendChild(d);requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add('in')})})})}
form.addEventListener('submit',function(e){e.preventDefault();setCmd();if(!go){idle('The commands below now use your address. Nothing was sent.');return}idle('Reading from a public Ethereum node…');go.disabled=true;
 Lire.lire(function(u,o){return fetch(u,o)},inp.value).then(draw).then(function(){go.disabled=false},function(){go.disabled=false})});
document.getElementById('rdshow').addEventListener('click',function(){setCmd();idle('The commands below now use your address. Nothing was sent.');cmd.scrollIntoView({block:'nearest',behavior:'smooth'})});
inp.addEventListener('input',setCmd);
[].forEach.call(form.querySelectorAll('.chip'),function(b){b.addEventListener('click',function(){inp.value=b.getAttribute('data-addr');setCmd();inp.focus()})});
cp.addEventListener('click',function(){var done=function(m){var o=cp.textContent;cp.textContent=m;setTimeout(function(){cp.textContent=o},1600)};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(cmd.textContent).then(function(){done('Copied')},function(){done('Select and copy')})}else{done('Select and copy')}})})();

(function(){var nav=document.querySelector('nav.acts');if(!nav||!matchMedia('(min-width:75rem)').matches)return;nav.hidden=false;
var MAP=[['hero3',0],['band',0],['latest',0],['chain',0],['reading',1],['cited',1],['readit',1],['replay',1],['registry-scene',2],['categories',2],['offer',3],['trust',3],['wrong',3],['faq',3],['follow',3],['try',4],['correct',4],['about',4]];
var secs=MAP.map(function(m){return[document.getElementById(m[0]),m[1]]}).filter(function(m){return m[0]}),links=[].slice.call(nav.querySelectorAll('a')),cur=-1,t=false;
function tick(){t=false;var y=innerHeight*.45,a=0;secs.forEach(function(m){var r=m[0].getBoundingClientRect();if(r.top<=y&&r.bottom>y)a=m[1]});
 if(a!==cur){cur=a;links.forEach(function(l,i){if(i===a)l.setAttribute('aria-current','true');else l.removeAttribute('aria-current')})}}
addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(tick)}},{passive:true});tick()})();

(function(){[].forEach.call(document.querySelectorAll('.acc'),function(a){var b=a.querySelector('.acc-b'),p=a.querySelector('.acc-a');if(!b||!p)return;
function set(o){a.classList.toggle('open',o);b.setAttribute('aria-expanded',o?'true':'false');if(o){p.removeAttribute('inert');p.removeAttribute('aria-hidden')}else{p.setAttribute('inert','');p.setAttribute('aria-hidden','true')}}
set(false);b.addEventListener('click',function(){set(b.getAttribute('aria-expanded')!=='true')})})})();

