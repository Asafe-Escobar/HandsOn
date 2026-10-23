// Formulário de cadastro (médico ou estudante de qualquer período) que abre nos botões de compra.
// O cadastro é obrigatório: só depois de o lead ser gravado no CRM a pessoa segue para o checkout.
// A janela é montada no primeiro clique e o listener fica no document.
(() => {
  // Endpoint serverless (api/lead.js) que grava o lead no CRM. A chave do Supabase fica só no servidor.
  const CRM_ENDPOINT = "/api/lead";
  const CURSO = "HandsON Medsafe — 14 de novembro";
  const CHECKOUT = "https://ensino.medsafebrasil.com.br/comprar/C99EFL4";
  const CHAVE_CADASTRO = "handson-cadastrado";

  const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  const PERIODOS = Array.from({ length: 12 }, (_, i) => `${i + 1}º período`);

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
        <h2 id="hl-title"><strong>Preencha seus dados</strong><br>para garantir a sua vaga</h2>
        <form class="hl-form" novalidate>
          <div class="hl-profile" role="radiogroup" aria-label="Você é">
            <label><input type="radio" name="perfil" value="medico" checked><span>Sou médico(a)</span></label>
            <label><input type="radio" name="perfil" value="aluno"><span>Sou estudante de medicina</span></label>
          </div>
          <input name="empresa" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
          <input class="hl-input" name="nome" type="text" placeholder="Nome completo" autocomplete="name" required>
          <input class="hl-input" name="email" type="email" placeholder="E-mail" autocomplete="email" required>
          <input class="hl-input" name="whatsapp" type="tel" placeholder="(DDD) WhatsApp" autocomplete="tel" inputmode="numeric" maxlength="19" required>
          <div class="hl-row hl-only-medico">
            <input class="hl-input" name="crm" type="text" placeholder="Número do CRM" inputmode="numeric" maxlength="7">
            <select class="hl-input" name="crm_uf" aria-label="UF do CRM"><option value="">UF</option>${UFS.map(u => `<option>${u}</option>`).join("")}</select>
          </div>
          <select class="hl-input hl-only-aluno" name="periodo" aria-label="Período" hidden>
            <option value="">Em qual período você está?</option>${PERIODOS.map(p => `<option>${p}</option>`).join("")}
          </select>
          <p class="hl-error" role="alert" hidden></p>
          <button class="hl-submit" type="submit">Continuar para o pagamento</button>
        </form>
      </div>
      <div class="hl-done" hidden>
        <div class="hl-check" aria-hidden="true">✓</div>
        <h2><strong>Cadastro feito!</strong></h2>
        <p>Obrigado, <strong class="hl-done-name"></strong>. Estamos levando você para o pagamento seguro para garantir a sua vaga no HandsON.</p>
        <a class="hl-submit hl-done-close hl-go" href="#">Ir para o pagamento</a>
      </div>
    </div>
  </div>`;

  let overlay, form, err, submit, lastFocus = null, destino = CHECKOUT;

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
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

    form.querySelectorAll('input[name="perfil"]').forEach(r => r.addEventListener("change", () => { sync(); err.hidden = true; }));
    sync();

    // Máscaras simples
    form.whatsapp.addEventListener("input", () => {
      let d = form.whatsapp.value.replace(/\D/g, "");
      if (d.length > 11 && d.startsWith("55")) d = d.slice(2);  // digitou com DDI +55
      d = d.slice(0, 11);
      form.whatsapp.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
    });
    form.crm.addEventListener("input", () => { form.crm.value = form.crm.value.replace(/\D/g, "").slice(0, 7); });
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

  // Checkout com as UTMs da landing, para a venda manter a origem da campanha
  const comUtm = (url) => {
    const u = new URL(url), q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => { if (q.get(k) && !u.searchParams.has(k)) u.searchParams.set(k, q.get(k)); });
    return u.toString();
  };
  const jaCadastrado = () => { try { return sessionStorage.getItem(CHAVE_CADASTRO) === "1"; } catch (x) { return false; } };

  // Todos os botões de compra passam pelo cadastro antes do checkout
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a");
    if (!a || (overlay && overlay.contains(a)) || !/ensino\.medsafebrasil\.com\.br\/(comprar|matricula)/.test(a.getAttribute("href") || "")) return;
    destino = a.href;
    if (jaCadastrado()) { e.preventDefault(); location.href = comUtm(destino); return; }  // já se cadastrou nesta visita
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

  // Alterna campos de médico / estudante
  const sync = () => {
    const aluno = form.perfil.value === "aluno";
    overlay.querySelectorAll(".hl-only-medico").forEach(el => el.hidden = aluno);
    overlay.querySelectorAll(".hl-only-aluno").forEach(el => el.hidden = !aluno);
  };

  const fail = (msg, field) => { err.textContent = msg; err.hidden = false; if (field) field.focus(); return false; };
  const validate = () => {
    if (form.nome.value.trim().split(/\s+/).length < 2) return fail("Informe seu nome completo.", form.nome);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) return fail("Informe um e-mail válido.", form.email);
    const tel = form.whatsapp.value.replace(/\D/g, "");
    if (tel.length < 10 || tel.length > 11) return fail("Informe o WhatsApp com DDD.", form.whatsapp);
    if (form.perfil.value === "medico") {
      if (form.crm.value.length < 4) return fail("Informe o número do seu CRM.", form.crm);
      if (!form.crm_uf.value) return fail("Selecione a UF do seu CRM.", form.crm_uf);
    } else if (!form.periodo.value) return fail("Selecione o seu período.", form.periodo);
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
    const medico = form.perfil.value === "medico";
    const lead = {
      perfil: medico ? "medico" : "aluno",
      nome: form.nome.value.trim(),
      email: form.email.value.trim().toLowerCase(),
      whatsapp: "+55" + form.whatsapp.value.replace(/\D/g, ""),
      crm: medico ? form.crm.value : "",
      crm_uf: medico ? form.crm_uf.value : "",
      periodo: medico ? "" : form.periodo.value,
      curso: CURSO,
      pagina: location.href,
      enviado_em: new Date().toISOString(),
      empresa: form.empresa.value,
      ...utm(),
    };
    submit.disabled = true; submit.textContent = "Enviando...";
    try {
      await send(lead);
      try { sessionStorage.setItem(CHAVE_CADASTRO, "1"); } catch (x) {}
      const url = comUtm(destino);
      const ir = overlay.querySelector(".hl-go");
      ir.href = url;
      overlay.querySelector(".hl-done-name").textContent = lead.nome.split(" ")[0];
      overlay.querySelector(".hl-step-form").hidden = true;
      overlay.querySelector(".hl-done").hidden = false;
      ir.focus();
      form.reset(); sync();
      if (window.fbq) window.fbq("track", "Lead");
      if (window.dataLayer) window.dataLayer.push({ event: "lead_handson", perfil: lead.perfil });
      setTimeout(() => { location.href = url; }, 1200);
    } catch (x) {
      console.error("Falha ao enviar lead:", x);
      // sem cadastro gravado não há checkout: a pessoa tenta de novo ou fala com a equipe
      fail("Não foi possível concluir o cadastro agora. Tente novamente ou fale com a equipe pelo WhatsApp.");
    } finally {
      submit.disabled = false; submit.textContent = "Continuar para o pagamento";
    }
  }
})();
