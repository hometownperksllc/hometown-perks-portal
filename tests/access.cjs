const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function load(path,overrides={}){const m=new Module(path,module);m.paths=module.paths;const req=m.require.bind(m);m.require=n=>overrides[n]??req(n);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
test('public diagnostic and arbitrary email endpoints cannot call external services',async()=>{
 assert.equal((await load('app/api/test-square/route.ts').GET()).status,404);
 assert.equal((await load('app/api/send-email/route.ts').POST()).status,410);
});
test('Connect Plate writes reject signed-out requests before reading a body or database',async()=>{
 const {POST}=load('app/api/update-connect-plate/route.ts',{'@/lib/billing/server':{userFor:async()=>null,database(){throw Error('must not reach db');}}});
 assert.equal((await POST(new Request('https://portal.example/api',{method:'POST',body:'invalid json'}))).status,401);
});
test('owner management rejects merchants before reading private records',async()=>{
 for(const path of ['app/api/admin/overview/route.ts','app/api/admin/ad-requests/route.ts']){
  const route=load(path,{'@/lib/billing/recurring':{},'@/lib/billing/server':{adminFor:async()=>null,database(){throw Error('must not reach db');}}});
  assert.equal((await (route.GET??route.POST)(new Request('https://portal.example/api'))).status,403);
 }
});
test('Connect Plate changes constrain both record ID and authenticated owner and reject javascript links',async()=>{
 const filters=[];let updates=0;
 const builder={update(){updates++;return this;},eq(k,v){filters.push([k,v]);return this;},select(){return this;},async maybeSingle(){return {data:null,error:null};}};
 const {POST}=load('app/api/update-connect-plate/route.ts',{'@/lib/billing/server':{userFor:async()=>({id:'owner-id'}),database:()=>({from:()=>builder})}});
 const body={id:'11111111-1111-1111-1111-111111111111',website:'',facebook:'',instagram:'',google_review_link:'',phone:'',featured_message:''};
 const request=b=>new Request('https://portal.example/api',{method:'POST',body:JSON.stringify(b)});
 assert.equal((await POST(request({...body,website:'javascript:alert(1)'}))).status,400);assert.equal(updates,0);
 assert.equal((await POST(request(body))).status,404);assert.deepEqual(filters,[['id',body.id],['user_id','owner-id']]);
});
