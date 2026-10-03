export {};
declare global {
 interface Window { Square?: { payments(applicationId:string,locationId:string): {
  card():Promise<{attach(selector:string):Promise<void>;destroy():Promise<void>;tokenize(details:{intent:'STORE';customerInitiated:boolean;sellerKeyedIn:boolean;billingContact:{email:string}}):Promise<{status:string;token?:string}>}>;
 } }; }
}
