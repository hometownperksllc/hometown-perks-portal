const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function load(path,overrides={}){const m=new Module(path,module);m.paths=module.paths;const req=m.require.bind(m);m.require=n=>overrides[n]??req(n);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
const recurring=load('lib/billing/recurring.ts');
test('prepaid 30 calendar days respect month boundaries, leap years and New York date',()=>{
 assert.equal(recurring.firstRenewalDate('2026-10-03'),'2026-11-02');assert.equal(recurring.firstRenewalDate('2028-02-01'),'2028-03-02');assert.equal(recurring.firstRenewalDate('2026-12-15'),'2027-01-14');assert.equal(recurring.localDate(new Date('2026-10-04T02:00:00Z')),'2026-10-03');assert.throws(()=>recurring.firstRenewalDate('2026-02-31'));assert.equal(recurring.nextMonthlyDate('2027-01-31',31),'2027-02-28');assert.equal(recurring.nextMonthlyDate('2027-02-28',31),'2027-03-31');
});
test('only one unlimited fixed $149 USD monthly phase is accepted',()=>{
 const phase={cadence:'MONTHLY',pricing:{type:'STATIC',priceMoney:{amount:14900n,currency:'USD'}}};
 assert.equal(recurring.validMonthlyPlan([phase]),true);assert.equal(recurring.validMonthlyPlan([phase,phase]),false);assert.equal(recurring.validMonthlyPlan([{...phase,periods:1n}]),false);assert.equal(recurring.validMonthlyPlan([{...phase,cadence:'THIRTY_DAYS'}]),false);assert.equal(recurring.validMonthlyPlan([{...phase,pricing:{type:'STATIC',priceMoney:{amount:24900n,currency:'USD'}}}]),false);assert.equal(recurring.validMonthlyPlan([{...phase,pricing:{...phase.pricing,type:'RELATIVE'}}]),false);
});
test('disabled recurring enrollment rejects saving cards and activation without accessing credentials',async()=>{
 const before=process.env.RECURRING_BILLING_ENABLED;delete process.env.RECURRING_BILLING_ENABLED;
 try{for(const path of ['app/api/billing/card/route.ts','app/api/admin/activate/route.ts']){
  const {POST}=load(path,{'@/lib/billing/server':{},'@/lib/billing/recurring':recurring,'@/lib/billing/cancellation':{}});
  assert.equal((await POST(new Request('https://portal.example/api',{method:'POST',body:'invalid'}))).status,403);
 }}finally{if(before!==undefined)process.env.RECURRING_BILLING_ENABLED=before;}
});
test('renewal cancellation removes the card before scheduling cancellation and is safe to repeat once canceled',async()=>{
 const {stopRenewal}=load('lib/billing/cancellation.ts'),calls=[];
 const client={subscriptions:{get:async()=>({subscription:{id:'sub',cardId:'card',version:3n,status:'PENDING'}}),update:async r=>calls.push(['clear',r]),cancel:async r=>{calls.push(['cancel',r]);return {subscription:{id:'sub',status:'CANCELED'}};}}};
 await stopRenewal(client,'sub');assert.deepEqual(calls.map(c=>c[0]),['clear','cancel']);assert.equal(calls[0][1].subscription.cardId,null);
 client.subscriptions.get=async()=>({subscription:{id:'sub',status:'CANCELED'}});await stopRenewal(client,'sub');assert.equal(calls.length,2);
});
test('sandbox credentials cannot fall back to a production token or environment',()=>{
 const before=process.env.SQUARE_SANDBOX_ACCESS_TOKEN,location=process.env.SQUARE_SANDBOX_LOCATION_ID,prod=process.env.SQUARE_ACCESS_TOKEN;
 let used;
 const {sandboxClient}=load('lib/billing/sandbox.ts',{'square':{SquareEnvironment:{Sandbox:'sandbox'},SquareClient:class{constructor(options){used=options;}}}});
 try{delete process.env.SQUARE_SANDBOX_ACCESS_TOKEN;process.env.SQUARE_ACCESS_TOKEN='production-test-token';assert.throws(()=>sandboxClient());process.env.SQUARE_SANDBOX_ACCESS_TOKEN='sandbox-test-token';process.env.SQUARE_SANDBOX_LOCATION_ID='sandbox-location';sandboxClient();assert.deepEqual(used,{token:'sandbox-test-token',environment:'sandbox'});}finally{for(const [k,v] of [['SQUARE_SANDBOX_ACCESS_TOKEN',before],['SQUARE_SANDBOX_LOCATION_ID',location],['SQUARE_ACCESS_TOKEN',prod]]){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
