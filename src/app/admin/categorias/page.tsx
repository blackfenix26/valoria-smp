import CrudManager from "@/components/CrudManager";
export default function Page(){ return <CrudManager model="category" title="Categorias" columns={[{key:"name",label:"Nome"}]} fields={[{key:"name",label:"Nome",type:"text"}]}/> }
