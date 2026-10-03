const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const Module=require('node:module');
const ts=require('typescript');
function load(path,overrides={}){const m=new Module(path,module);m.paths=module.paths;const original=m.require.bind(m);m.require=(name)=>overrides[name]??original(name);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
const {verifySignature}=load('lib/billing/signature.ts');
const {launchReady}=load('lib/billing/server.ts');
const body='{"type":"payment.updated","data":{"id":"example"}}', key='test-key',url='https://portal.example/api/square/webhook';
const signature=crypto.createHmac('sha256',key).update(url+body).digest('base64');
test('webhook rejects changed body, URL, key, missing signature and malformed lengths',()=>{assert.equal(verifySignature(body,signature,key,url),true);assert.equal(verifySignature(body+' ',signature,key,url),false);assert.equal(verifySignature(body,signature,key,url+'/'),false);assert.equal(verifySignature(body,signature,key+'x',url),false);assert.equal(verifySignature(body,null,key,url),false);assert.equal(verifySignature(body,'x',key,url),false);});
test('launch requires both switches and complete future-dated terms with confirmed hosts',()=>{const offer={enabled:true,terms_version:'v1',terms_text:'Approved terms',launch_deadline:'2099-01-01',confirmed_locations:['Contracted host']};const previous=process.env.PAID_ENROLLMENT_ENABLED;try{delete process.env.PAID_ENROLLMENT_ENABLED;assert.equal(launchReady(offer),false);process.env.PAID_ENROLLMENT_ENABLED='true';assert.equal(launchReady(offer),true);assert.equal(launchReady({...offer,enabled:false}),false);assert.equal(launchReady({...offer,confirmed_locations:[]}),false);assert.equal(launchReady({...offer,terms_text:''}),false);assert.equal(launchReady({...offer,launch_deadline:'2000-01-01'}),false);}finally{if(previous===undefined)delete process.env.PAID_ENROLLMENT_ENABLED;else process.env.PAID_ENROLLMENT_ENABLED=previous;}});

const server=load('lib/billing/server.ts');
test('webhook failure logs only stage and status, and keeps payment lookup failures retryable',async()=>{
 const previousKey=process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,previousUrl=process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
 const originalError=console.error,logs=[];
 process.env.SQUARE_WEBHOOK_SIGNATURE_KEY=key;process.env.SQUARE_WEBHOOK_NOTIFICATION_URL=url;
 console.error=(...args)=>logs.push(args);
 let lookups=0;
 try {
  const {POST}=load('app/api/square/webhook/route.ts',{'@/lib/billing/signature':{verifySignature},'@/lib/billing/server':{square(){return {payments:{async get(){lookups++;throw Object.assign(new Error('PRIVATE SDK BODY AND TOKEN'),{statusCode:404,body:{secret:'DO NOT LOG'}});}}};}}});
  const payload=JSON.stringify({type:'payment.created',data:{object:{payment:{id:'fake-payment'}}}});
  const signed=crypto.createHmac('sha256',key).update(url+payload).digest('base64');
  const response=await POST(new Request(url,{method:'POST',body:payload,headers:{'x-square-hmacsha256-signature':signed}}));
  assert.equal(response.status,500);assert.equal(lookups,1);
  assert.deepEqual(logs,[['[square_webhook] synchronization_failed',{stage:'square_payment_lookup',statusCode:404,code:null}]]);
  const rejected=await POST(new Request(url,{method:'POST',body:payload}));
  assert.equal(rejected.status,403);assert.equal(lookups,1);
 }finally{
  console.error=originalError;
  for(const [name,value] of [['SQUARE_WEBHOOK_SIGNATURE_KEY',previousKey],['SQUARE_WEBHOOK_NOTIFICATION_URL',previousUrl]]){if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});
test('disabled signup and checkout reject requests before touching credentials or external services',async()=>{const previous=process.env.PAID_ENROLLMENT_ENABLED;delete process.env.PAID_ENROLLMENT_ENABLED;try{for(const path of ['app/api/signup/route.ts','app/api/enrollment/checkout/route.ts']){const {POST}=load(path,{'@/lib/billing/server':server});const response=await POST(new Request('https://portal.example/api',{method:'POST',body:'{}'}));assert.equal(response.status,403);}}finally{if(previous!==undefined)process.env.PAID_ENROLLMENT_ENABLED=previous;}});
