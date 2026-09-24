import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="order" title="Pedidos" canCreate={false} canDelete={false} hint="Marque como Aprovado após confirmar o pagamento: os produtos passam a aparecer em Meus Produtos do cliente."
  columns={[{key:"id",label:"ID"},{key:"user.name",label:"Cliente"},{key:"items.length",label:"Itens"},{key:"total",label:"Valor"},{key:"createdAt",label:"Data"},{key:"status",label:"Status"},{key:"payment",label:"Pagamento"}]}
  fields={[{key:"status",label:"Status",type:"select",options:[["PENDING","Pendente"],["APPROVED","Aprovado"],["CANCELED","Cancelado"]]},{key:"payment",label:"Forma de pagamento",type:"text"}]}/> }
