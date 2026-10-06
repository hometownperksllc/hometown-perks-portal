const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
function load(path,mocks){const m=new Module(path,module);m.paths=module.paths;const req=m.require.bind(m);m.require=n=>mocks[n]??req(n);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);return m.exports;}
const recurring=load('lib/billing/recurring.ts',{});
const setup=load('lib/billing/setup.ts',{'./recurring':recurring});
test('setup denies non-owners before reading a body or contacting Square',async()=>{
 const api=load('app/api/admin/billing-setup/route.ts',{'@/lib/billing/server':{adminFor:async()=>null,square(){throw Error('Must not call');}},'@/lib/billing/setup':setup});
 assert.equal((await api.POST(new Request('https://example.com',{method:'POST',body:'invalid'}))).status,403);
});
test('preparation preserves webhook destination and extra events, creates only a fixed-price catalog plan and exposes no signing key',async()=>{
 process.env.SQUARE_ENVIRONMENT='production';process.env.SQUARE_WEBHOOK_NOTIFICATION_URL='https://portal.hometownperksusa.com/api/square/webhook';delete process.env.SQUARE_MONTHLY_PLAN_VARIATION_ID;
 const existing={id:'existing',enabled:true,notificationUrl:process.env.SQUARE_WEBHOOK_NOTIFICATION_URL,eventTypes:['other.event'],signatureKey:'private-signature'};let update,plan;
 const client={webhooks:{subscriptions:{get:async()=>({subscription:existing}),update:async request=>{update=request;return {subscription:{...existing,...request.subscription}};}}},catalog:{object:{upsert:async request=>{plan=request;return {catalogObject:{type:'SUBSCRIPTION_PLAN',subscriptionPlanData:{subscriptionPlanVariations:[{id:'verified-plan'}]}}};},get:async()=>({object:{type:'SUBSCRIPTION_PLAN_VARIATION',subscriptionPlanVariationData:{phases:[{cadence:'MONTHLY',pricing:{type:'STATIC',priceMoney:{amount:14900n,currency:'USD'}}}]}}})}}};
 const result=await setup.billingSetup(client,true);assert.equal(result.planValid,true);assert.equal(result.webhookReady,true);assert.equal(result.planConfigured,false);assert.equal(result.planVariationId,'verified-plan');assert.deepEqual(Object.keys(update.subscription),['eventTypes']);assert.ok(update.subscription.eventTypes.includes('other.event'));assert.equal(plan.idempotencyKey,'hometown-monthly-149-usd-v1');assert.equal(plan.object.subscriptionPlanData.subscriptionPlanVariations[0].subscriptionPlanVariationData.phases[0].pricing.priceMoney.amount,14900n);assert.ok(!JSON.stringify(result).includes('private-signature'));
});
test('a foreign webhook destination prevents any configuration mutation',async()=>{
 const client={webhooks:{subscriptions:{get:async()=>({subscription:{enabled:true,notificationUrl:'https://foreign.example/'}})}}};
 await assert.rejects(()=>setup.billingSetup(client,true));
});
