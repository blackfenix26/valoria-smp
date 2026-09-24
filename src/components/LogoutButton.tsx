"use client";
export default function LogoutButton({className=""}:{className?:string}){
  return <button className={className} onClick={async()=>{ await fetch("/api/auth/logout",{method:"POST"}); location.href="/" }}>SAIR</button> }
