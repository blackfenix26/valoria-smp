import "./globals.css"; import type { Metadata } from "next"; import Header from "@/components/Header"; import Footer from "@/components/Footer"; import CartProvider from "@/components/CartProvider";
export const metadata: Metadata = { title:"Valoria BLCKX | Loja Oficial", description:"Loja oficial, atualizações e comunidade da Valoria BLCKX.", icons:{icon:"/assets/favicon.png"} };
export default function Root({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body className="min-h-screen font-sans"><CartProvider><Header/>{children}<Footer/></CartProvider></body></html>;
}
