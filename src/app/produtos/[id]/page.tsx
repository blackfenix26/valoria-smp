import Link from "next/link";
import { ArrowLeft, Check, Images, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation"; import { db, getSettings } from "@/lib/db"; import { getSession } from "@/lib/auth"; import AddButtons from "@/components/AddButtons"; import ReviewForm from "@/components/ReviewForm";
import { parseProductBenefits } from "@/lib/product-content";
export const dynamic = "force-dynamic";
export default async function Produto({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{realmId?:string}>}){
  const { id } = await params;
  const sp = await searchParams;
  const p = await db.product.findUnique({where:{id},include:{category:true,reviews:{where:{status:"APPROVED"},include:{user:{select:{name:true}}},orderBy:{createdAt:"desc"}}}});
  if(!p||!p.active) notFound(); const price = p.promoPrice??p.price, brl = (n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  const [settings,session]=await Promise.all([getSettings(),getSession()]);
  const account=session?await db.user.findUnique({where:{id:session.id},select:{email:true}}):null;
  const realmCandidate=p.id===settings.realm_feature_product_id&&sp.realmId&&account?.email?await db.realm.findFirst({where:{id:sp.realmId,active:true,premium:false},select:{id:true,name:true,leaderEmail:true}}):null;
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
  const averageRating=p.reviews.length?p.reviews.reduce((sum,review)=>sum+review.stars,0)/p.reviews.length:null;
  const discount=p.promoPrice!==null&&p.price>0&&p.promoPrice<p.price?Math.round((1-p.promoPrice/p.price)*100):0;
  return <main className="page-shell max-w-7xl">
    <Link href="/produtos" className="mb-6 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-mut transition hover:text-white"><ArrowLeft size={15}/> Voltar para a loja</Link>
    <div className="product-detail-grid grid items-start gap-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
      <div className="min-w-0">
        <div className="product-detail-media relative overflow-hidden rounded-[28px] border border-white/10 bg-card">
          <img src={p.image} alt={p.name} fetchPriority="high" className="aspect-[4/3] w-full object-contain p-8 sm:p-12"/>
          {discount>0&&<span className="product-discount absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold">-{discount}%</span>}
        </div>
        {images.length>0&&<section className="mt-4"><h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-mut"><Images size={15}/> Mais imagens</h2><div className="grid grid-cols-3 gap-3">{images.map((src,index)=><img key={`${src}-${index}`} src={src} alt={`${p.name}, imagem ${index+1}`} className="aspect-square w-full rounded-xl border border-white/10 bg-card object-contain p-2" loading="lazy"/>)}</div></section>}
      </div>
      <section className="product-purchase-panel rounded-[28px] border border-white/10 bg-card p-5 sm:p-7 lg:sticky lg:top-24">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="product-category rounded-full border border-white/10 bg-surf px-3 py-1.5">{p.category.name}</span>{p.featured&&<span className="product-highlight rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide">Destaque</span>}</div>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{p.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">{averageRating!==null?<><span aria-label={`${averageRating.toFixed(1)} de 5 estrelas`} className="flex items-center gap-1 text-gold"><Star size={14} className="fill-current"/>{averageRating.toFixed(1)}</span><span className="text-mut">· {p.reviews.length} {p.reviews.length===1?"avaliação aprovada":"avaliações aprovadas"}</span></>:<span className="text-mut">Ainda sem avaliações aprovadas</span>}</div>
        <p className="mt-5 whitespace-pre-line text-sm leading-6 text-mut">{p.description}</p>
        {vipBenefits.length>0&&<section className="mt-6"><h2 className="mb-3 text-xs font-bold uppercase tracking-[.15em] text-mut">Benefícios incluídos</h2><ul className="product-benefits grid gap-2 sm:grid-cols-2">{vipBenefits.map((benefit,index)=><li key={`${benefit.title}-${index}`} className="product-benefit rounded-xl border border-white/10 bg-surf/50 p-3"><b className="flex items-start gap-2 text-sm"><Check size={15} className="mt-0.5 shrink-0 text-emerald-300"/>{benefit.title}</b>{benefit.detail&&<p className="mt-1 pl-[23px] text-xs leading-5 text-mut">{benefit.detail}</p>}</li>)}</ul></section>}
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1"><p className="text-3xl font-black tabular-nums">{brl(price)}</p>{discount>0&&<><s className="pb-1 text-sm text-mut">{brl(p.price)}</s><span className="pb-1 text-xs font-semibold text-emerald-300">Economize {brl(p.price-price)}</span></>}</div>
          {p.id===settings.realm_feature_product_id&&<p className="mt-3 rounded-xl border border-blue-300/15 bg-blue-400/5 p-3 text-xs leading-5 text-mut">{selectedRealm?`Este produto ativará o destaque de ${selectedRealm.name} após a confirmação do pagamento.`:"Para comprar este destaque, acesse a página do seu reino usando a conta cadastrada como líder."}</p>}
          {(p.id!==settings.realm_feature_product_id||selectedRealm)&&<div className="mt-5 w-full"><AddButtons big p={{id:p.id,name:p.name,price,image:p.image,realmId:selectedRealm?.id,realmName:selectedRealm?.name}}/></div>}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-mut"><ShieldCheck size={13}/> Checkout seguro · entrega após aprovação</p>
        </div>
      </section>
    </div>
    {sections.length>0&&<section className="mt-12 grid gap-4 md:grid-cols-2">{sections.map(([title,content],index)=><article key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-card p-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-mut">{content}</p></article>)}</section>}
    {videoUrl&&<section className="mt-12"><h2 className="mb-5 text-2xl font-bold">Demonstração</h2>{videoEmbed?<div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black"><iframe src={videoEmbed} title={`Demonstração de ${p.name}`} className="aspect-video w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>:directVideo?<video controls preload="metadata" className="mx-auto aspect-video max-h-[560px] w-full max-w-4xl rounded-2xl border border-white/10 bg-black"><source src={videoUrl}/></video>:<a href={videoUrl} target="_blank" rel="noreferrer" className="btn-o inline-flex">Assistir demonstração</a>}</section>}
    <section className="mt-12 max-w-3xl"><h2 className="text-2xl font-bold">Avaliações verificadas</h2><div className="mt-4 space-y-3">{p.reviews.length?p.reviews.map(r=><div key={r.id} className="rounded-xl border border-white/10 bg-card p-4 text-sm"><b>{r.user.name}</b> <span className="text-gold">{"★".repeat(r.stars)}</span><p className="mt-2 text-mut">{r.comment}</p></div>):<p className="text-sm text-mut">Ainda sem avaliações aprovadas.</p>}</div><ReviewForm productId={p.id}/></section>
  </main>;
}
