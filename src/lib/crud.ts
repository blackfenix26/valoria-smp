// Modelos editáveis pelo painel admin. Tipos: s=texto sn=texto opcional n=número nn=número opcional b=booleano d=data
export type T = "s"|"sn"|"n"|"nn"|"b"|"d";
export const MODELS: Record<string,{delegate:string;fields:Record<string,T>;create:boolean;del:boolean;upsert?:boolean;order?:object;include?:object;select?:object}> = {
  product:{delegate:"product",create:true,del:true,order:{createdAt:"desc"},include:{category:true},fields:{name:"s",description:"s",image:"s",price:"n",promoPrice:"nn",stock:"n",active:"b",featured:"b",categoryId:"s"}},
  category:{delegate:"category",create:true,del:true,fields:{name:"s"}},
  event:{delegate:"event",create:true,del:true,order:{startsAt:"desc"},fields:{name:"s",image:"sn",description:"s",startsAt:"d",endsAt:"d",link:"sn",active:"b"}},
  banner:{delegate:"banner",create:true,del:true,fields:{title:"s",description:"s",image:"sn",buttonText:"sn",link:"sn",active:"b"}},
  coupon:{delegate:"coupon",create:true,del:true,fields:{code:"s",percent:"n",active:"b"}},
  setting:{delegate:"setting",create:true,del:true,upsert:true,fields:{value:"s"}},
  order:{delegate:"order",create:false,del:false,order:{createdAt:"desc"},include:{user:{select:{name:true,email:true}},items:{include:{product:{select:{name:true}}}}},fields:{status:"s",payment:"sn"}},
  user:{delegate:"user",create:false,del:false,order:{createdAt:"desc"},select:{id:true,name:true,username:true,email:true,role:true,active:true,credits:true,createdAt:true,_count:{select:{orders:true}}},fields:{active:"b",role:"s",credits:"n"}},
  ticket:{delegate:"ticket",create:false,del:false,order:{createdAt:"desc"},include:{user:{select:{name:true}}},fields:{status:"s",reply:"sn"}},
};
export function coerce(fields: Record<string,T>, b: any){
  const out: any = {};
  for(const [k,t] of Object.entries(fields)){
    if(!(k in b)) continue; const v = b[k];
    if(t==="s") out[k] = String(v ?? "");
    else if(t==="sn") out[k] = v===""||v==null ? null : String(v);
    else if(t==="n"||t==="nn"){ if((v===""||v==null)&&t==="nn"){ out[k]=null; continue } const n=Number(v); if(Number.isNaN(n)) return null; out[k]=n }
    else if(t==="b") out[k] = Boolean(v);
    else { const d = new Date(v); if(isNaN(d.getTime())) return null; out[k]=d }
  } return out;
}
