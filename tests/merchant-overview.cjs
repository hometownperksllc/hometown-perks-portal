const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function route(server){const path='app/api/merchant/overview/route.ts',m=new Module(path,module);m.paths=module.paths;const req=m.require.bind(m);m.require=n=>n==='@/lib/billing/server'?server:req(n);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
test('dashboard rejects signed-out users without querying account records',async()=>{
 const {GET}=route({userFor:async()=>null,database(){throw Error('Must not access database');}});
 assert.equal((await GET(new Request('https://portal.example/api/merchant/overview'))).status,401);
});
test('every dashboard query uses the verified user and no payment identifiers or owner flag are taken from the request',async()=>{
 const queries=[];
 const db={from(table){const q={table,filters:[],select(columns,options){this.columns=columns;this.head=options?.head;return this;},eq(k,v){this.filters.push([k,v]);return this;},maybeSingle:async()=>({data:table==='merchants'?{business_name:'Owned business'}:null,error:null}),then(resolve){resolve({count:7,error:null});}};queries.push(q);return q;}};
 const {GET}=route({userFor:async()=>({id:'verified-owner'}),database:()=>db});
 const response=await GET(new Request('https://portal.example/api/merchant/overview?user_id=victim&isOwner=true'));
 const body=await response.json();assert.equal(response.status,200);assert.equal(body.businessName,'Owned business');assert.equal(body.isOwner,false);assert.equal(body.enrollmentStatus,null);assert.equal(body.counts.views,7);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(queries.length,12);assert.ok(queries.every(q=>q.filters.some(([k,v])=>k==='user_id'&&v==='verified-owner')));assert.ok(queries.every(q=>!q.columns.includes('square_')));
});
test('a database failure is reported rather than showing fabricated zero statistics',async()=>{
 const q={select(){return this;},eq(){return this;},maybeSingle:async()=>({error:{code:'UNAVAILABLE'}}),then(resolve){resolve({error:{code:'UNAVAILABLE'}});}};
 const {GET}=route({userFor:async()=>({id:'owner'}),database:()=>({from:()=>q})});
 assert.equal((await GET(new Request('https://portal.example/api/merchant/overview'))).status,503);
});
