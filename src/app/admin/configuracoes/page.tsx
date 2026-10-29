import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="setting" title="Configurações do site" idKey="key"
  hint="Edite o conteúdo do site. Configure realm_feature_product_id com o ID do produto de destaque premium para habilitar o botão nas páginas dos reinos. Wiki e FAQ são gerenciadas em suas próprias páginas; patrocinadores também têm editor dedicado."
  columns={[{key:"key",label:"Chave"},{key:"value",label:"Valor"}]} fields={[{key:"key",label:"Chave",type:"text"},{key:"value",label:"Valor",type:"textarea"}]}/> }
