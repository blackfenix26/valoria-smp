import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="ticket" title="Suporte" canCreate={false} canDelete={false} hint="Responda os chamados e mova cada conversa entre as filas de atendimento. Use a busca por cliente ou assunto para localizar rapidamente."
  filters={[{key:"status",label:"Status",options:[["OPEN","Abertos"],["IN_PROGRESS","Em atendimento"],["RESOLVED","Resolvidos"],["CLOSED","Fechados"]]}]}
  quickActions={[{label:"Assumir",value:"IN_PROGRESS",className:"text-amber-300",whenStatuses:["OPEN"]},{label:"Resolver",value:"RESOLVED",className:"text-emerald-300",whenStatuses:["IN_PROGRESS"]},{label:"Reabrir",value:"OPEN",className:"text-sky-300",whenStatuses:["RESOLVED","CLOSED"]}]}
  columns={[{key:"user.name",label:"Cliente"},{key:"subject",label:"Assunto"},{key:"category",label:"Categoria"},{key:"createdAt",label:"Data"},{key:"status",label:"Status"}]}
  fields={[{key:"status",label:"Status",type:"select",options:[["OPEN","Aberto"],["IN_PROGRESS","Em atendimento"],["RESOLVED","Resolvido"],["CLOSED","Fechado"]]},{key:"reply",label:"Resposta ao cliente",type:"textarea"}]}/> }
