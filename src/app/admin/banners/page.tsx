import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="banner" title="Gerenciar Banners" hint="O primeiro banner ativo substitui imagem, título, descrição e botão do hero da home."
  columns={[{key:"title",label:"Título"},{key:"buttonText",label:"Botão"},{key:"link",label:"Link"},{key:"active",label:"Ativo"}]}
  fields={[{key:"title",label:"Título (use | para destacar o final)",type:"text"},{key:"image",label:"Imagem",type:"image"},{key:"buttonText",label:"Texto do botão",type:"text"},{key:"link",label:"Link",type:"text"},{key:"description",label:"Descrição",type:"textarea"},{key:"active",label:"Ativo",type:"bool"}]}/> }
