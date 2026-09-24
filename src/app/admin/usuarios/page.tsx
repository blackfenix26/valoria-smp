import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="user" title="Usuários" canCreate={false} canDelete={false}
  columns={[{key:"name",label:"Nome"},{key:"username",label:"Usuário"},{key:"email",label:"E-mail"},{key:"createdAt",label:"Cadastro"},{key:"_count.orders",label:"Pedidos"},{key:"credits",label:"Saldo"},{key:"role",label:"Função"},{key:"active",label:"Ativo"}]}
  fields={[{key:"active",label:"Ativo",type:"bool"},{key:"role",label:"Função",type:"select",options:[["USER","Usuário"],["ADMIN","Administrador"]]},{key:"credits",label:"Saldo",type:"number"}]}/> }
