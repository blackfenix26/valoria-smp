import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="setting" title="Configurações do site" idKey="key"
  hint="Chaves: hero_title (use | para destacar o final), hero_subtitle, footer_text, link_discord, link_instagram, link_tiktok, link_youtube, link_docs, link_terms, link_privacy, link_faq, partners (JSON: [['Nome','Descrição'],...])"
  columns={[{key:"key",label:"Chave"},{key:"value",label:"Valor"}]} fields={[{key:"key",label:"Chave",type:"text"},{key:"value",label:"Valor",type:"textarea"}]}/> }
