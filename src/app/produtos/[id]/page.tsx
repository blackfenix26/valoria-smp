import { notFound } from "next/navigation"; import { db, getSettings } from "@/lib/db"; import { getSession } from "@/lib/auth"; import AddButtons from "@/components/AddButtons"; import ReviewForm from "@/components/ReviewForm";
import { parseProductBenefits } from "@/lib/product-content";
export const dynamic = "force-dynamic";
export default async function Produto({params,searchParams}:{params:{id:string};searchParams:{realmId?:string}}){
  const p = await db.product.findUnique({where:{id:params.id},include:{category:true,reviews:{where:{status:"APPROVED"},include:{user:{select:{name:true}}},orderBy:{createdAt:"desc"}}}});
  if(!p||!p.active) notFound(); const price = p.promoPrice??p.price, brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const [settings,session]=await Promise.all([getSettings(),getSession()]);
  const account=session?await db.user.findUnique({where:{id:session.id},select:{email:true}}):null;
  const realmCandidate=p.id===settings.realm_feature_product_id&&searchParams.realmId&&account?.email?await db.realm.findFirst({where:{id:searchParams.realmId,active:true,premium:false},select:{id:true,name:true,leaderEmail:true}}):null;
  const selectedRealm=realmCandidate?.leaderEmail&&account?.email&&realmCandidate.leaderEmail.toLowerCase()===account.email.toLowerCase()?{id:realmCandidate.id,name:realmCandidate.name}:null;
  let gallery: string[] = [], sections: [string,string][] = [];
  let vipBenefits: {title:string;detail:string}[] = [];
  try { gallery = JSON.parse(p.gallery || "[]"); } catch { gallery = (p.gallery || "").split(/\r?\n/).filter(Boolean); }
  try { sections = JSON.parse(p.sections || "[]"); } catch {}
  if(p.vipBenefits){try{const parsed=JSON.parse(p.vipBenefits);if(Array.isArray(parsed))vipBenefits=parsed}catch{}}
  const images = [...new Set(gallery.filter(Boolean))];
  const videoUrl = p.videoDemo || "";
  const youtubeId = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1];
  const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
  const directVideo = /\.(mp4|webm|ogg)(?:$|[?#])/i.test(videoUrl);
  const videoEmbed = youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
  if (!vipBenefits.length && p.category.name.toLowerCase().includes("combo")) vipBenefits = parseProductBenefits(p.description);
  return <main className="page-shell max-w-7xl">
    <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-12">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-card"><img src={p.image} alt={p.name} className="aspect-[4/3] w-full object-cover"/></div>
      <div className="flex flex-col items-start gap-5 py-2"><span className="rounded-md border border-white/15 bg-surf px-3 py-1 text-xs text-mut">{p.category.name}</span><div><h1 className="text-3xl font-bold md:text-4xl">{p.name}</h1><div className="mt-3 flex items-center gap-2 text-sm">{p.reviews.length>0?<><span className="text-gold">{"★".repeat(Math.round(p.reviews.reduce((sum,review)=>sum+review.stars,0)/p.reviews.length))}</span><b>{(p.reviews.reduce((sum,review)=>sum+review.stars,0)/p.reviews.length).toFixed(1)}</b><span className="text-mut">({p.reviews.length} avaliações aprovadas)</span></>:<span className="text-mut">Sem avaliações aprovadas</span>}</div>{vipBenefits.length===0&&<p className="mt-4 max-w-2xl whitespace-pre-line leading-7 text-mut">{p.description}</p>}</div>
        {vipBenefits.length>0&&<section className="w-full"><h2 className="mb-3 text-sm font-semibold">Benefícios incluídos</h2><ul className="grid gap-2 sm:grid-cols-2">{vipBenefits.map((benefit,index)=><li key={`${benefit.title}-${index}`} className="rounded-xl border border-white/10 bg-card p-3"><b className="text-sm">{benefit.title}</b>{benefit.detail&&<p className="mt-1 text-xs leading-5 text-mut">{benefit.detail}</p>}</li>)}</ul></section>}
        {vipBenefits.length>0&&<section className="w-full"><h2 className="mb-3 text-sm font-semibold">Benefícios incluídos</h2><ul className="grid gap-2 sm:grid-cols-2">{vipBenefits.map((benefit,index)=><li key={`${benefit.title}-${index}`} className="rounded-xl border border-white/10 bg-card p-3"><b className="text-sm">{benefit.title}</b>{benefit.detail&&<p className="mt-1 text-xs leading-5 text-mut">{benefit.detail}</p>}</li>)}</ul></section>}
        <div className="flex flex-wrap items-baseline gap-3"><p className="text-3xl font-bold">{brl(price)}</p>{p.promoPrice&&<s className="text-base text-mut">{brl(p.price)}</s>}</div>
        {p.id===settings.realm_feature_product_id&&<p className="text-sm text-mut">{selectedRealm?`Este produto ativará o destaque de ${selectedRealm.name} após a confirmação do pagamento.`:"Para comprar este destaque, acesse a página do seu reino usando a conta cadastrada como líder."}</p>}
        {(p.id!==settings.realm_feature_product_id||selectedRealm)&&<AddButtons big p={{id:p.id,name:p.name,price,image:p.image,realmId:selectedRealm?.id,realmName:selectedRealm?.name}}/>}
      </div>
    </div>
    {sections.length>0&&<section className="mt-12 grid gap-4 md:grid-cols-2">{sections.map(([title,content],index)=><article key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-card p-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-mut">{content}</p></article>)}</section>}
    {(images.length>0||videoUrl)&&<section className="mt-12"><h2 className="mb-5 text-2xl font-bold">Demonstração</h2>{images.length>0&&<div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{images.map((src,index)=><img key={`${src}-${index}`} src={src} alt={`${p.name}, demonstração ${index+1}`} className="aspect-video w-full rounded-xl border border-white/10 object-cover" loading="lazy"/>)}</div>}{videoEmbed?<div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black"><iframe src={videoEmbed} title={`Demonstração de ${p.name}`} className="aspect-video w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>:directVideo?<video controls preload="metadata" className="mx-auto aspect-video max-h-[560px] w-full max-w-4xl rounded-2xl border border-white/10 bg-black"><source src={videoUrl}/></video>:videoUrl&&<a href={videoUrl} target="_blank" rel="noreferrer" className="btn-o inline-flex">Assistir demonstração</a>}</section>}
    <section className="mt-12 max-w-3xl"><h2 className="text-2xl font-bold">Avaliações verificadas</h2><div className="mt-4 space-y-3">{p.reviews.length?p.reviews.map(r=><div key={r.id} className="rounded-xl border border-white/10 bg-card p-4 text-sm"><b>{r.user.name}</b> <span className="text-gold">{"★".repeat(r.stars)}</span><p className="mt-2 text-mut">{r.comment}</p></div>):<p className="text-sm text-mut">Ainda sem avaliações aprovadas.</p>}</div><ReviewForm productId={p.id}/></section>
  </main>;
}
