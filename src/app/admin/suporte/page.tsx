import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="ticket" title="Suporte" canCreate={false} canDelete={false}
  columns={[{key:"user.name",label:"Cliente"},{key:"subject",label:"Assunto"},{key:"category",label:"Categoria"},{key:"createdAt",label:"Data"},{key:"status",label:"Status"}]}
  fields={[{key:"status",label:"Status",type:"select",options:[["OPEN","Aberto"],["IN_PROGRESS","Em atendimento"],["RESOLVED","Resolvido"],["CLOSED","Fechado"]]},{key:"reply",label:"Resposta ao cliente",type:"textarea"}]}/> }
