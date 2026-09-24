import CrudManager from "@/components/CrudManager";
import { db } from "@/lib/db"; export const dynamic = "force-dynamic";
export default async function Page(){ const cats = await db.category.findMany();
  return <CrudManager model="product" title="Produtos" columns={[{key:"name",label:"Nome"},{key:"category.name",label:"Categoria"},{key:"price",label:"Preço"},{key:"promoPrice",label:"Promo"},{key:"active",label:"Ativo"},{key:"featured",label:"Destaque"}]}
   fields={[{key:"name",label:"Nome",type:"text"},{key:"price",label:"Preço",type:"number"},{key:"promoPrice",label:"Preço promocional",type:"number"},{key:"stock",label:"Estoque (-1 = ilimitado)",type:"number"},{key:"categoryId",label:"Categoria",type:"select",options:cats.map(c=>[c.id,c.name] as [string,string])},{key:"image",label:"Imagem",type:"image"},{key:"description",label:"Descrição",type:"textarea"},{key:"active",label:"Ativo",type:"bool"},{key:"featured",label:"Destaque",type:"bool"}]}/> }
