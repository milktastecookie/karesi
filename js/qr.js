/* 아주 작은 QR 코드 생성기 (바이트 모드, 오류 정정 M, 버전 1~6 · 영문 주소 약 100자까지)
   알고리즘은 Project Nayuki의 QR Code generator(MIT)를 참고해 줄였어요.
   사용: KARESI_QR('https://...') → <svg> 문자열 (AvA 웹사이트와 같은 생성기) */
(function(){
const EC=[0,10,16,26,18,24,16], BL=[0,1,1,1,2,2,4], RAW=[0,26,44,70,100,134,172];
function mul(x,y){let z=0;for(let i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z}
function divisor(d){const r=new Array(d).fill(0);r[d-1]=1;let root=1;for(let i=0;i<d;i++){for(let j=0;j<d;j++){r[j]=mul(r[j],root);if(j+1<d)r[j]^=r[j+1]}root=mul(root,2)}return r}
function rem(data,div){const r=new Array(div.length).fill(0);for(const b of data){const f=b^r.shift();r.push(0);div.forEach((c,i)=>r[i]^=mul(c,f))}return r}

function encode(text){
  const bytes=[...new TextEncoder().encode(text)];
  let ver=1;for(;ver<=6;ver++){if(4+8+bytes.length*8<=(RAW[ver]-EC[ver]*BL[ver])*8)break}
  if(ver>6)throw new Error('QR: text too long');
  const cap=(RAW[ver]-EC[ver]*BL[ver])*8;
  const bits=[];const put=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1)};
  put(4,4);put(bytes.length,8);bytes.forEach(b=>put(b,8));
  put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
  for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
  const data=[];for(let i=0;i<bits.length;i+=8){let v=0;for(let j=0;j<8;j++)v=(v<<1)|bits[i+j];data.push(v)}
  // 블록 나누기 + 오류 정정 코드 + 섞기
  const nb=BL[ver],ecl=EC[ver],raw=RAW[ver],nShort=nb-raw%nb,shortLen=Math.floor(raw/nb),div=divisor(ecl);
  const blocks=[];for(let i=0,k=0;i<nb;i++){const dat=data.slice(k,k+shortLen-ecl+(i<nShort?0:1));k+=dat.length;const e=rem(dat,div);if(i<nShort)dat.push(0);blocks.push(dat.concat(e))}
  const cw=[];for(let i=0;i<blocks[0].length;i++)blocks.forEach((b,j)=>{if(i!==shortLen-ecl||j>=nShort)cw.push(b[i])});

  const size=ver*4+17;
  const M=[...Array(size)].map(()=>new Array(size).fill(false)),F=[...Array(size)].map(()=>new Array(size).fill(false));
  const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
  for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  [[3,3],[size-4,3],[3,size-4]].forEach(([cx,cy])=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy,d=Math.max(Math.abs(dx),Math.abs(dy));if(x>=0&&x<size&&y>=0&&y<size)set(x,y,d!==2&&d!==4)}});
  if(ver>1){const a=size-7;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(a+dx,a+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}
  const fmt=mask=>{const d=(0<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((d<<10)|r)^0x5412;const g=i=>((b>>>i)&1)===1;
    for(let i=0;i<=5;i++)set(8,i,g(i));set(8,7,g(6));set(8,8,g(7));set(7,8,g(8));for(let i=9;i<15;i++)set(14-i,8,g(i));
    for(let i=0;i<8;i++)set(size-1-i,8,g(i));for(let i=8;i<15;i++)set(8,size-15+i,g(i));set(8,size-8,true)};
  fmt(0);
  // 데이터 배치 (오른쪽 아래부터 지그재그)
  let i=0;for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let v=0;v<size;v++)for(let j=0;j<2;j++){const x=right-j,up=((right+1)&2)===0,y=up?size-1-v:v;if(!F[y][x]&&i<cw.length*8){M[y][x]=((cw[i>>>3]>>>(7-(i&7)))&1)===1;i++}}}
  // 마스크 고르기
  const masks=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=m=>{for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!F[y][x]&&masks[m](x,y))M[y][x]=!M[y][x]};
  const penalty=()=>{let p=0,dark=0;
    for(let y=0;y<size;y++){let run=1;for(let x=1;x<=size;x++){if(x<size&&M[y][x]===M[y][x-1])run++;else{if(run>=5)p+=run-2;run=1}}}
    for(let x=0;x<size;x++){let run=1;for(let y=1;y<=size;y++){if(y<size&&M[y][x]===M[y-1][x])run++;else{if(run>=5)p+=run-2;run=1}}}
    for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
    M.forEach(r=>r.forEach(c=>dark+=c));p+=Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10;return p};
  let best=0,bp=Infinity;for(let m=0;m<8;m++){apply(m);fmt(m);const s=penalty();if(s<bp){bp=s;best=m}apply(m)}
  apply(best);fmt(best);
  return M;
}

window.KARESI_QR=function(text,dark,light,label){
  const M=encode(text),n=M.length,q=3;let d='';
  M.forEach((r,y)=>r.forEach((c,x)=>{if(c)d+=`M${x+q} ${y+q}h1v1h-1z`}));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n+q*2} ${n+q*2}" shape-rendering="crispEdges" role="img" aria-label="${label||'QR 코드'}"><rect width="100%" height="100%" fill="${light||'#EEF1F7'}"/><path d="${d}" fill="${dark||'#070A14'}"/></svg>`;
};
})();
