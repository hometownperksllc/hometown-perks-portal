import type {SquareClient} from 'square';
export async function stopRenewal(client:SquareClient,subscriptionId:string){
 const current=await client.subscriptions.get({subscriptionId,include:'actions'});
 const sub=current.subscription;if(!sub?.id)throw new Error('Subscription unavailable');
 if(sub.status==='CANCELED' || sub.status==='COMPLETED')return sub;
 // Remove the automatic payment source immediately, including pending starts.
 if(sub.cardId)await client.subscriptions.update({subscriptionId,subscription:{version:sub.version,cardId:null}});
 const result=await client.subscriptions.cancel({subscriptionId});
 if(!result.subscription?.id)throw new Error('Cancellation unconfirmed');
 return result.subscription;
}
