import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="coupon" title="Cupons" columns={[{key:"code",label:"Código"},{key:"percent",label:"Desconto %"},{key:"active",label:"Ativo"}]} fields={[{key:"code",label:"Código (MAIÚSCULAS)",type:"text"},{key:"percent",label:"Desconto (%)",type:"number"},{key:"active",label:"Ativo",type:"bool"}]}/> }
