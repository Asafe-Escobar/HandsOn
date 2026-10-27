// Formulário de cadastro (médico ou estudante de qualquer período) que abre nos botões de compra.
// O cadastro é obrigatório: só depois de o lead ser gravado no CRM a pessoa segue para o checkout.
// A janela é montada no primeiro clique e o listener fica no document.
(() => {
  // Endpoint serverless (api/lead.js) que grava o lead no CRM. A chave do Supabase fica só no servidor.
  const CRM_ENDPOINT = "/api/lead";
  const CURSO = "HandsON Medsafe — 14 de novembro";


  // Paleta da landing: azul-noite #060D16/#0B1724, turquesa #16B7B1, bordas #1E3248, fonte Archivo
  const css = `
  .hl-lock{overflow:hidden}
  .hl-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,8,15,.82);backdrop-filter:blur(4px)}
  .hl-overlay[hidden],.hl-overlay [hidden]{display:none !important}
  .hl-modal{position:relative;width:100%;max-width:500px;max-height:calc(100vh - 32px);overflow:auto;padding:36px 36px 30px;border-radius:14px;background:linear-gradient(180deg,#0B1724 0%,#060D16 75%);border:1px solid #1E3248;box-shadow:0 0 80px -20px rgba(22,183,177,.45);font-family:'Archivo',system-ui,sans-serif;color:#fff;text-align:center;box-sizing:border-box}
  .hl-modal *{box-sizing:border-box}
  .hl-close{position:absolute;top:12px;right:14px;width:36px;height:36px;border:0;border-radius:50%;background:transparent;color:#8CA3B8;font-size:28px;line-height:1;cursor:pointer}
  .hl-close:hover{color:#fff;background:rgba(255,255,255,.06)}
  .hl-logo{margin:0 auto 20px;display:inline-flex;flex-direction:column;align-items:flex-start;font-weight:900;font-size:30px;line-height:.86;letter-spacing:-.03em;color:#fff}
  .hl-logo span{background:#16B7B1;color:#060D16;padding:3px 7px 1px;margin:3px 0 0 36px;border-radius:3px}
  .hl-modal h2{margin:0 0 22px;font-size:22px;line-height:1.25;font-weight:400;text-transform:uppercase;letter-spacing:-.01em}
  .hl-modal h2 strong{font-weight:800;color:#16B7B1}
  .hl-form{display:flex;flex-direction:column;gap:12px}
  .hl-profile{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;border:1px solid #1E3248;border-radius:8px;background:#03080F;margin-bottom:4px}
  .hl-profile label{position:relative;cursor:pointer}
  .hl-profile input{position:absolute;opacity:0;pointer-events:none}
  .hl-profile span{display:block;padding:11px 6px;border-radius:5px;font-size:13px;font-weight:700;color:#B4C6D6;transition:background .2s,color .2s}
  .hl-profile input:checked + span{background:#16B7B1;color:#060D16}
  .hl-profile input:focus-visible + span{outline:2px solid #fff;outline-offset:2px}
  .hl-input{width:100%;height:52px;padding:0 18px;border:1px solid #1E3248;border-radius:6px;background:#03080F;color:#fff;font:500 15px 'Archivo',system-ui,sans-serif;outline:none;appearance:none}
  .hl-input::placeholder{color:#6F869B}
  .hl-input:focus{border-color:#16B7B1;box-shadow:0 0 0 3px rgba(22,183,177,.18)}
  select.hl-input{cursor:pointer;color:#fff;background-image:linear-gradient(45deg,transparent 50%,#16B7B1 50%),linear-gradient(135deg,#16B7B1 50%,transparent 50%);background-position:calc(100% - 22px) 50%,calc(100% - 16px) 50%;background-size:6px 6px;background-repeat:no-repeat}
  select.hl-input option{background:#0B1724;color:#fff}
  .hl-row{display:grid;grid-template-columns:1fr 100px;gap:10px}
  .hl-error{margin:0;font-size:13px;color:#F9A954}
  .hl-submit{margin-top:6px;height:58px;border:0;border-radius:6px;background:#16B7B1;color:#060D16;font:800 16px 'Archivo',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:filter .2s,transform .2s}
  .hl-submit:hover{filter:brightness(1.08);transform:translateY(-1px)}
  .hl-submit:disabled{opacity:.7;cursor:wait}
  a.hl-submit{display:flex;align-items:center;justify-content:center;text-decoration:none}
  .hl-done p{margin:0 0 24px;font-size:15px;line-height:1.6;color:#D4E0EA}
  .hl-done p strong{color:#fff}
  .hl-check{width:68px;height:68px;margin:4px auto 18px;border-radius:50%;background:#16B7B1;color:#060D16;font-size:36px;line-height:68px;font-weight:900;box-shadow:0 0 40px rgba(22,183,177,.5)}
  @media (max-width:520px){.hl-modal{padding:30px 18px 22px}.hl-modal h2{font-size:19px}.hl-profile span{font-size:12px;padding:10px 3px}}`;

  const html = `
  <div class="hl-overlay" hidden>
    <div class="hl-modal" role="dialog" aria-modal="true" aria-labelledby="hl-title">
      <button class="hl-close" type="button" aria-label="Fechar">×</button>
      <p class="hl-logo" role="img" aria-label="HandsON">Hands<span>ON</span></p>
      <div class="hl-step-form">
        <h2 id="hl-title"><strong>Receba uma oferta especial</strong><br>Cadastre-se para conhecer as condi&ccedil;&otilde;es</h2>
        <p style="margin:0 0 20px;color:#D4E0EA;font-size:15px;line-height:1.5">&Eacute; estudante de medicina? <strong style="color:#16B7B1">Temos condi&ccedil;&otilde;es especiais para voc&ecirc;.</strong></p>
        <form class="hl-form" novalidate>
          <input name="empresa" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
          <input class="hl-input" name="nome" type="text" placeholder="Nome completo" autocomplete="name" required>
          <input class="hl-input" name="email" type="email" placeholder="E-mail" autocomplete="email" required>
          <input class="hl-input" name="whatsapp" type="tel" placeholder="(DDD) WhatsApp" autocomplete="tel" inputmode="numeric" maxlength="19" required>
          </div>
          <p class="hl-error" role="alert" hidden></p>
          <button class="hl-submit" type="submit">Concluir cadastro</button>
        </form>
      </div>
      <div class="hl-done" hidden>
        <div class="hl-check" aria-hidden="true">✓</div>
        <h2><strong>Cadastro feito!</strong></h2>
        <p>Obrigado, <strong class="hl-done-name"></strong>. Estamos levando você para o pagamento seguro para fazer seu cadastro no HandsON.</p>
        <button class="hl-submit hl-done-close" type="button">Fechar</button>
      </div>
    </div>
  </div>`;

  let overlay, form, err, submit, lastFocus = null;

  const montar = () => {
    if (overlay && document.body.contains(overlay)) return;
    if (!document.getElementById("hl-style")) {
      const st = document.createElement("style");
      st.id = "hl-style"; st.textContent = css;
      document.head.appendChild(st);
    }
    document.body.insertAdjacentHTML("beforeend", html);
    overlay = document.body.lastElementChild;
    form = overlay.querySelector(".hl-form");
    err = overlay.querySelector(".hl-error");
    submit = form.querySelector(".hl-submit");

    overlay.querySelector(".hl-close").addEventListener("click", close);
    overlay.querySelector(".hl-done-close").addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });


    // Máscaras simples
    form.whatsapp.addEventListener("input", () => {
      let d = form.whatsapp.value.replace(/\D/g, "");
      if (d.length > 11 && d.startsWith("55")) d = d.slice(2);  // digitou com DDI +55
      d = d.slice(0, 11);
      form.whatsapp.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
    });
    form.addEventListener("submit", enviar);
  };

  const open = (e) => {
    e.preventDefault();
    montar();
    lastFocus = document.activeElement;
    overlay.querySelector(".hl-step-form").hidden = false;
    overlay.querySelector(".hl-done").hidden = true;
    err.hidden = true; overlay.hidden = false;
    document.documentElement.classList.add("hl-lock");
    setTimeout(() => form.nome.focus(), 50);
  };
  const close = () => { overlay.hidden = true; document.documentElement.classList.remove("hl-lock"); if (lastFocus) lastFocus.focus(); };

  // Abre o cadastro nos bot?es de inscri??o.
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (!a || (overlay && overlay.contains(a)) || a.getAttribute("href") !== "#cadastro") return;
    open(e);
  }, true);
  document.addEventListener("keydown", (e) => {
    if (!overlay || overlay.hidden) return;
    if (e.key === "Escape") return close();
    if (e.key !== "Tab") return;
    // Mantém o Tab dentro da janela
    const foco = [...overlay.querySelectorAll("button, input:not([name=empresa]), select")].filter(el => !el.disabled && el.offsetParent);
    const [primeiro, ultimo] = [foco[0], foco[foco.length - 1]];
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });

  const fail = (msg, field) => { err.textContent = msg; err.hidden = false; if (field) field.focus(); return false; };
  const validate = () => {
    if (form.nome.value.trim().split(/\s+/).length < 2) return fail("Informe seu nome completo.", form.nome);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) return fail("Informe um e-mail válido.", form.email);
    const tel = form.whatsapp.value.replace(/\D/g, "");
    if (tel.length < 10 || tel.length > 11) return fail("Informe o WhatsApp com DDD.", form.whatsapp);
    err.hidden = true; return true;
  };

  const utm = () => {
    const q = new URLSearchParams(location.search), o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(k => { if (q.get(k)) o[k] = q.get(k); });
    return o;
  };

  const send = async (lead) => {
    const r = await fetch(CRM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    if (!r.ok) throw new Error("HTTP " + r.status);
  };

  async function enviar(e) {
    e.preventDefault();
    if (!validate()) return;
    const lead = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      whatsapp: "+55" + form.whatsapp.value.replace(/\D/g, ""),
      curso: CURSO,
      pagina: location.href,
      enviado_em: new Date().toISOString(),
      empresa: form.empresa.value,
      ...utm(),
    };
    submit.disabled = true; submit.textContent = "Enviando...";
    try {
      await send(lead);
      overlay.querySelector(".hl-done-name").textContent = lead.nome.split(" ")[0];
      overlay.querySelector(".hl-step-form").hidden = true;
      overlay.querySelector(".hl-done").hidden = false;
      overlay.querySelector(".hl-done-close").focus();
      form.reset();
      if (window.fbq) window.fbq("track", "Lead");
      if (window.dataLayer) window.dataLayer.push({ event: "lead_handson" });
    } catch (x) {
      console.error("Falha ao enviar lead:", x);
      // sem cadastro gravado não há checkout: a pessoa tenta de novo ou fala com a equipe
      fail("Não foi possível concluir o cadastro agora. Tente novamente ou fale com a equipe pelo WhatsApp.");
    } finally {
      submit.disabled = false; submit.textContent = "Concluir cadastro";
    }
  }
})();
