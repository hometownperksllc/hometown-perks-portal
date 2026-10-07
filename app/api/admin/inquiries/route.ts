import {adminFor,database} from '@/lib/billing/server';
const headers={'Cache-Control':'private, no-store'};
export async function GET(request:Request){
 try{
  if(!await adminFor(request))return Response.json({error:'Sign in with your Hometown Perks owner account.'},{status:403,headers});
  const page=Number(new URL(request.url).searchParams.get('page')||0);
  if(!Number.isInteger(page)||page<0||page>10000)return Response.json({error:'Invalid page.'},{status:400,headers});
  const {data,error,count}=await database().from('advertiser_inquiries').select('id,business_name,contact_name,email,phone,service_area,message,connect_plate_interest,created_at',{count:'exact'}).order('created_at',{ascending:false}).order('id').range(page*50,page*50+49);
  if(error)throw error;return Response.json({inquiries:data,total:count,page},{headers});
 }catch{return Response.json({error:'Unable to load inquiries.'},{status:503,headers});}
}
