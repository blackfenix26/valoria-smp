// Main interactivity for Valória site
document.addEventListener('DOMContentLoaded',()=>{
  // Copy IP
  const copyBtn=document.getElementById('copyIp');
  if(copyBtn){
    copyBtn.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText('Valoria.play.srv.br:25465');
        copyBtn.textContent='Copiado!';setTimeout(()=>copyBtn.textContent='Copiar IP',2000)}catch(e){alert('Não foi possível copiar')}    
    });
  }

  // Live server status from the Minecraft status API
  const statusEl=document.getElementById('serverStatus');
  const playersEl=document.getElementById('playerCount');
  const serverHost='valoria.play.srv.br';
  const serverPort='25465';

  async function updateStatus(){
    if(!statusEl || !playersEl) return;

    try{
      statusEl.textContent='Verificando...';
      statusEl.style.color='#dce8f6';

      const response=await fetch(`https://api.mcsrvstat.us/2/${serverHost}:${serverPort}`);
      if(!response.ok) throw new Error('Falha ao buscar status');

      const data=await response.json();
      const online=Boolean(data?.online);
      const onlinePlayers=data?.players?.online ?? 0;
      const maxPlayers=data?.players?.max ?? 0;

      statusEl.textContent=online ? 'Online' : 'Offline';
      statusEl.style.color=online ? '#7ee787' : '#ff9b9b';
      playersEl.textContent=online ? `${onlinePlayers} / ${maxPlayers}` : '—';
    }catch(error){
      statusEl.textContent='Indisponível';
      statusEl.style.color='#ffcc66';
      playersEl.textContent='—';
    }
  }

  updateStatus();
  setInterval(updateStatus,30000);

  // Contact form
  const contactForm=document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const btn=contactForm.querySelector('button[type="submit"]');
      btn.textContent='Enviando...';
      setTimeout(()=>{btn.textContent='Enviar';alert('Obrigado! Sua mensagem foi enviada.');contactForm.reset()},900);
    });
  }

  // Simple particle background
  const canvas=document.getElementById('particles');
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
  window.addEventListener('resize',resize);resize();
  function makeParticles(){particles=[];for(let i=0;i<160;i++){particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.22,vy:(Math.random()-0.5)*0.22,r:Math.random()*2.2+0.8,alpha:0.05+Math.random()*0.24})}}
  makeParticles();
  function tick(){ctx.clearRect(0,0,W,H);for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;ctx.beginPath();ctx.fillStyle=`rgba(14,165,255,${p.alpha})`;ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(tick)}
  tick();

  // Scroll reveal animations
  const revealElements=document.querySelectorAll('.animate-on-scroll');
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target)}});
  },{threshold:0.2});
  revealElements.forEach(el=>observer.observe(el));

  // Gallery tabs
  const tabs=document.querySelectorAll('.gallery-tab');
  const panels=document.querySelectorAll('.gallery-panel');
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      tabs.forEach(btn=>btn.classList.remove('active'));
      panels.forEach(panel=>panel.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Hero background slideshow using the server images
  const heroBackdrop=document.getElementById('heroBackdrop');
  if(heroBackdrop){
    const heroSlides=[
      'assets/images/banner-cinematic.jpg',
      'assets/images/castle.jpg',
      'assets/images/village.jpg',
      'assets/images/boss.jpg',
      'assets/images/dungeon.jpg',
      'assets/images/events.jpg',
      'assets/images/landscape.jpg'
    ];
    let heroIndex=0;
    setInterval(()=>{
      heroIndex=(heroIndex+1)%heroSlides.length;
      heroBackdrop.style.opacity='0';
      setTimeout(()=>{
        heroBackdrop.src=heroSlides[heroIndex];
        heroBackdrop.style.opacity='0.92';
      }, 400);
    }, 5500);
  }
});
