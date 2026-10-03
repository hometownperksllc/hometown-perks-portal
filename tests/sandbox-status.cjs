const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),Module=require('node:module'),ts=require('typescript');
const path='lib/billing/sandbox-status.ts',m=new Module(path,module);m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,path);
const {readSandboxStatus}=m.exports;
function client(refundStatus='COMPLETED',subscription={}){return {
 payments:{get:async()=>({payment:{id:'p',locationId:'sandbox',status:'COMPLETED',amountMoney:{amount:14900n,currency:'USD'},refundIds:['r']}})},
 refunds:{get:async()=>({refund:{paymentId:'p',locationId:'sandbox',status:refundStatus,amountMoney:{amount:14900n,currency:'USD'}}})},
 subscriptions:{get:async()=>({subscription:{id:'s',locationId:'sandbox',status:'PENDING',cardId:null,canceledDate:'2026-10-03',...subscription}})}
};}
test('reads current provider refund and cancellation without creating payments or changing subscriptions',async()=>{
 const current=await readSandboxStatus(client(),{paymentId:'p',subscriptionId:'s'},'sandbox');
 assert.equal(current.refund_status,'COMPLETED');assert.equal(current.subscription_status,'PENDING');assert.equal(current.card_removed,true);assert.equal(current.cancellation_scheduled,true);assert.ok(current.provider_checked_at);
});
test('pending refund and an attached card are never labeled completed or removed',async()=>{
 const current=await readSandboxStatus(client('PENDING',{cardId:'test-card',canceledDate:null,actions:[]}),{paymentId:'p',subscriptionId:'s'},'sandbox');
 assert.equal(current.refund_status,'PENDING');assert.equal(current.card_removed,false);assert.equal(current.cancellation_scheduled,false);
});
test('foreign location is rejected and unbound refunds are not accepted',async()=>{
 await assert.rejects(()=>readSandboxStatus(client(),{paymentId:'p'},'other'));
 const c=client();c.refunds.get=async()=>({refund:{paymentId:'other-payment',locationId:'sandbox',status:'COMPLETED',amountMoney:{amount:14900n,currency:'USD'}}});
 assert.equal((await readSandboxStatus(c,{paymentId:'p'},'sandbox')).refund_status,undefined);
});
