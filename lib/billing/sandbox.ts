import {SquareClient,SquareEnvironment} from 'square';
export function sandboxClient(){
 const token=process.env.SQUARE_SANDBOX_ACCESS_TOKEN;
 if(!token || !process.env.SQUARE_SANDBOX_LOCATION_ID)throw new Error('Sandbox credentials are not configured');
 // This constructor can never select production, regardless of other billing settings.
 return new SquareClient({token,environment:SquareEnvironment.Sandbox});
}
