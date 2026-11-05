import CrudManager from "@/components/CrudManager";
import CategoryOrderManager from "@/components/CategoryOrderManager";
import { db } from "@/lib/db";
import { getStoreCategoryOrder } from "@/lib/store-category-order";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [categories, savedOrder] = await Promise.all([
    db.category.findMany({ select: { id: true, name: true } }),
    db.setting.findUnique({ where: { key: "store_category_order" }, select: { value: true } }),
  ]);
  const initialOrder = getStoreCategoryOrder(categories, savedOrder?.value);

  return (
    <>
      <CategoryOrderManager categories={categories} initialOrder={initialOrder} />
      <CrudManager model="category" title="Categorias" columns={[{ key: "name", label: "Nome" }]} fields={[{ key: "name", label: "Nome", type: "text" }]} />
    </>
  );
}
