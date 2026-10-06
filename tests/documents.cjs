const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function load(path,mocks={}){const m=new Module(path,module);m.paths=module.paths;const req=m.require.bind(m);m.require=n=>mocks[n]??req(n);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
const files=load('lib/documents/files.ts');
const id='11111111-1111-4111-8111-111111111111';
test('document upload rejects non-owners before reading the file or accessing storage',async()=>{
 const api=load('app/api/admin/documents/route.ts',{'@/lib/billing/server':{adminFor:async()=>null,database(){throw Error('Forbidden');}},'@/lib/documents/files':files});
 assert.equal((await api.POST(new Request('https://example.com',{method:'POST',body:'bad'}))).status,403);
});
test('private document signing rejects another merchant and never generates a link',async()=>{
 let signed=false;const db={from(table){return {select(){return this;},eq(){return this;},maybeSingle:async()=>table==='merchant_documents'?{data:{id,merchant_id:id,storage_path:'private.pdf'}}:{data:null}};},storage:{from(){signed=true;throw Error();}}};
 const api=load('app/api/merchant/documents/route.ts',{'@/lib/billing/server':{userFor:async()=>({id:'other-user'}),adminFor:async()=>null,database:()=>db},'@/lib/documents/files':files});
 assert.equal((await api.GET(new Request(`https://example.com?id=${id}`))).status,404);assert.equal(signed,false);
});
test('owner-bound PDF access uses only the saved path and short-lived download filename',async()=>{
 let args;const db={from(table){return {select(){return this;},eq(){return this;},maybeSingle:async()=>({data:table==='merchant_documents'?{id,merchant_id:id,storage_path:'saved/path.pdf',file_name:'signed.pdf'}:{id}})};},storage:{from:()=>({createSignedUrl:async(...a)=>{args=a;return {data:{signedUrl:'https://storage.example/signed'}};}})}};
 const api=load('app/api/merchant/documents/route.ts',{'@/lib/billing/server':{userFor:async()=>({id:'owner-user'}),adminFor:async()=>{throw Error('Must not need admin');},database:()=>db},'@/lib/documents/files':files});
 const response=await api.GET(new Request(`https://example.com?id=${id}&download=1&path=foreign.pdf`));assert.equal(response.status,200);assert.deepEqual(args,['saved/path.pdf',60,{download:'signed.pdf'}]);assert.equal(response.headers.get('cache-control'),'private, no-store');
});
test('merchant document list always filters by the verified login, never a supplied merchant',async()=>{
 const filters=[];const q={select(){return this;},eq(...a){filters.push(a);return this;},order:async()=>({data:[{id,title:'Owned',merchants:{user_id:'verified'}}]})};
 const api=load('app/api/merchant/documents/route.ts',{'@/lib/billing/server':{userFor:async()=>({id:'verified'}),database:()=>({from:()=>q})},'@/lib/documents/files':files});
 const response=await api.GET(new Request('https://example.com?merchantId=victim'));assert.deepEqual(filters,[['merchants.user_id','verified']]);assert.ok(!JSON.stringify(await response.json()).includes('user_id'));
});
test('PDF validation rejects oversized and non-PDF bytes and filenames cannot create storage paths',()=>{
 assert.equal(files.validPdf(Buffer.from('<html>private</html>')),false);assert.equal(files.validPdf(Buffer.from('%PDF-1.7\n')),true);assert.equal(files.validPdf(Buffer.alloc(files.DOCUMENT_LIMIT+1)),false);assert.ok(!files.documentName('../../signed contract.pdf').includes('/'));
});
