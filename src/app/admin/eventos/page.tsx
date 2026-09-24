import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="event" title="Eventos" hint="O evento ativo mais próximo aparece automaticamente na home."
  columns={[{key:"name",label:"Nome"},{key:"startsAt",label:"Início"},{key:"endsAt",label:"Fim"},{key:"active",label:"Ativo"}]}
  fields={[{key:"name",label:"Nome",type:"text"},{key:"image",label:"Imagem",type:"image"},{key:"startsAt",label:"Início",type:"date"},{key:"endsAt",label:"Término",type:"date"},{key:"link",label:"Link",type:"text"},{key:"description",label:"Descrição",type:"textarea"},{key:"active",label:"Ativo",type:"bool"}]}/> }
