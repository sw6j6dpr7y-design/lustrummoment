/* ==========================================================================
   LustrumMoment — Rekenhulp
   --------------------------------------------------------------------------
   Los van site.js (mobiele menu) en quick-scan.js (Quick Scan). Rekent
   uitsluitend in de browser van de bezoeker; er wordt niets opgeslagen of
   verstuurd. Alleen actief op wat-is-een-steunstichting-sbbi.html.
   ========================================================================== */

(function () {
  "use strict";
  var root = document.getElementById("lm-rekenhulp");
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };

  var euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0, minimumFractionDigits: 0 });
  var getal = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

  // Nederlandse notatie: punt als duizendtal, komma als decimaalteken ("1.250,50").
  function lees(input) {
    var ruw = input.value.trim().replace(/\s|€/g, "");
    if (ruw === "") return { waarde: 0, geldig: true, leeg: true };
    var schoon = ruw.replace(/\./g, "").replace(",", ".");
    var heel = input.dataset.soort === "aantal";
    var ok = heel ? /^\d+$/.test(schoon) : /^\d+(\.\d{1,2})?$/.test(schoon);
    return ok ? { waarde: parseFloat(schoon), geldig: true, leeg: false } : { waarde: 0, geldig: false, leeg: false };
  }

  function veld(el) {
    var r = lees(el), fout = $(el.id + "-fout");
    el.setAttribute("aria-invalid", r.geldig ? "false" : "true");
    if (fout) fout.classList.toggle("is-zichtbaar", !r.geldig);
    return r;
  }

  var groepen = [
    { sleutel: "leden", naam: "Leden", kleur: "#00584d", pct: true, opslagbaar: true, woord: ["lid", "leden"] },
    { sleutel: "oudleden", naam: "Oud-leden", kleur: "#007063", pct: true, opslagbaar: true, woord: ["oud-lid", "oud-leden"] },
    { sleutel: "familie", naam: "Familie en vrienden", kleur: "#009f8c", pct: true, opslagbaar: true, woord: ["gever", "gevers"] },
    { sleutel: "vast", naam: "Vaste sponsors", kleur: "#ebc346", pct: false, opslagbaar: false, woord: ["sponsor", "sponsors"] },
    { sleutel: "nieuw", naam: "Nieuwe sponsors", kleur: "#953421", pct: false, opslagbaar: false, woord: ["sponsor", "sponsors"] }
  ];

  function meervoud(n, w) { return n === 1 ? w[0] : w[1]; }

  // Laatst berekende uitkomst, bewaard zodat de mailknop hem kan gebruiken
  // zonder alles opnieuw te moeten uitrekenen.
  var laatsteUitkomst = { totaal: 0, gevers: 0, regels: [], scenarios: [] };

  function rekenActiviteiten() {
    var items = root.querySelectorAll(".rh-activiteit");
    var totaal = 0, onderdelen = [];
    items.forEach(function (item) {
      var vink = item.querySelector(".rh-activiteit-vink");
      var blok = item.querySelector(".rh-activiteit-bedrag");
      blok.hidden = !vink.checked;
      if (!vink.checked) return;
      var bedragInput = blok.querySelector('input[data-soort="bedrag"]');
      var r = veld(bedragInput);
      if (r.waarde <= 0) return;
      var naam = vink.dataset.naam;
      var tekst = blok.querySelector(".rh-anders-tekst");
      if (tekst && tekst.value.trim()) naam = tekst.value.trim();
      totaal += r.waarde;
      onderdelen.push(naam + " (" + euro.format(r.waarde) + ")");
    });
    return { totaal: totaal, detail: onderdelen.join(", ") };
  }

  function reken() {
    var nieuwJa = root.querySelector('input[name="rh-nieuw"]:checked').value === "ja";
    $("rh-nieuw-velden").hidden = !nieuwJa;

    var moment = root.querySelector('input[name="rh-moment"]:checked').value;
    var isJubileum = moment === "jubileum";
    $("rh-jubileum-opslag").hidden = !isJubileum;
    $("rh-moment-woord").textContent = isJubileum ? "jubileum" : "lustrum";
    var opslagPct = isJubileum ? parseInt($("rh-opslag-pct").value, 10) : 0;
    $("rh-opslag-pct-uit").textContent = opslagPct + "%";

    var totaal = 0, gevers = 0, regels = [], opslagbaseGrondslag = 0;

    groepen.forEach(function (g) {
      if (g.sleutel === "nieuw" && !nieuwJa) return;
      var aantal = veld($("rh-" + g.sleutel + "-aantal"));
      var gift = veld($("rh-" + g.sleutel + "-gift"));
      var pct = 100;

      if (g.pct) {
        pct = parseInt($("rh-" + g.sleutel + "-pct").value, 10);
        $("rh-" + g.sleutel + "-pct-uit").textContent = pct + "%";
        $("rh-" + g.sleutel + "-signaal").classList.toggle("is-zichtbaar", aantal.waarde > 0 && pct === 0);
      }

      var n = Math.round(aantal.waarde * pct / 100);
      var bedrag = n * gift.waarde;
      if (bedrag > 0) {
        totaal += bedrag;
        gevers += n;
        if (g.opslagbaar) opslagbaseGrondslag += bedrag;
        var detail = g.pct
          ? getal.format(n) + " van de " + getal.format(aantal.waarde) + " (" + pct + "%) × " + euro.format(gift.waarde)
          : getal.format(n) + " " + meervoud(n, g.woord) + " × " + euro.format(gift.waarde);
        regels.push({ naam: g.naam, kleur: g.kleur, bedrag: bedrag, detail: detail });
      }
    });

    var activiteiten = rekenActiviteiten();
    if (activiteiten.totaal > 0) {
      totaal += activiteiten.totaal;
      opslagbaseGrondslag += activiteiten.totaal;
      regels.push({ naam: "Extra activiteiten", kleur: "#367431", bedrag: activiteiten.totaal, detail: activiteiten.detail });
    }

    if (isJubileum && opslagPct > 0 && opslagbaseGrondslag > 0) {
      var opslagBedrag = Math.round(opslagbaseGrondslag * opslagPct / 100);
      totaal += opslagBedrag;
      regels.push({
        naam: "Jubileumeffect (eigen inschatting)", kleur: "#4d5c59", bedrag: opslagBedrag,
        detail: "+" + opslagPct + "% over leden, oud-leden, familie/vrienden en extra activiteiten samen", isOpslag: true
      });
    }

    var tekst = euro.format(Math.round(totaal));
    $("rh-totaal").textContent = tekst;
    $("rh-mobiel-totaal").textContent = tekst;
    $("rh-totaal-sub").textContent = "Samen opgebracht door " + getal.format(gevers) + " " + (gevers === 1 ? "gever of sponsor" : "gevers en sponsors");

    var heeft = regels.length > 0;
    $("rh-leeg").hidden = heeft;
    $("rh-opbouw-blok").hidden = !heeft;

    var balk = $("rh-balk"), lijst = $("rh-opbouw");
    balk.innerHTML = ""; lijst.innerHTML = "";
    regels.forEach(function (r) {
      var aandeel = totaal > 0 ? r.bedrag / totaal * 100 : 0;
      var s = document.createElement("span");
      s.style.width = aandeel + "%"; s.style.background = r.kleur;
      balk.appendChild(s);

      var li = document.createElement("li");
      if (r.isOpslag) li.className = "is-opslag";
      li.innerHTML =
        '<span class="rh-stip" aria-hidden="true" style="background:' + r.kleur + '"></span>' +
        '<span class="rh-naam"></span><span class="rh-bedrag"></span><span class="rh-detail"></span>';
      li.querySelector(".rh-naam").textContent = r.naam;
      li.querySelector(".rh-bedrag").textContent = euro.format(Math.round(r.bedrag));
      li.querySelector(".rh-detail").textContent = r.detail + ", " + Math.round(aandeel) + "% van het totaal";
      lijst.appendChild(li);
    });

    laatsteUitkomst.totaal = totaal;
    laatsteUitkomst.gevers = gevers;
    laatsteUitkomst.regels = regels;
    laatsteUitkomst.scenarios = rekenBandbreedte();
    zetMailKnop();
  }

  // --- Bandbreedte: dezelfde vereniging in drie scenario's ---------------
  // Alleen de pct-gebaseerde groepen (leden, oud-leden, familie/vrienden)
  // schalen mee met het scenario. Vaste en nieuwe sponsors en de opbrengst
  // van extra activiteiten blijven in elk scenario gelijk aan wat hierboven
  // is ingevuld — dat is een bewuste, eenvoudige keuze: geen apart
  // "vaste kosten"-veld per activiteit.
  var scenarios = [
    { sleutel: "voorzichtig", naam: "Voorzichtig", factor: 0.6 },
    { sleutel: "verwacht", naam: "Verwacht", factor: 1 },
    { sleutel: "optimistisch", naam: "Optimistisch", factor: 1.4 }
  ];

  function rekenScenario(factor) {
    var giften = 0, gevers = 0, deelnameTeller = 0, deelnameNoemer = 0;

    groepen.forEach(function (g) {
      if (g.sleutel === "nieuw" && root.querySelector('input[name="rh-nieuw"]:checked').value !== "ja") return;
      var aantal = lees($("rh-" + g.sleutel + "-aantal"));
      var gift = lees($("rh-" + g.sleutel + "-gift"));
      var pct = 100;
      if (g.pct) {
        pct = Math.min(100, Math.round(parseInt($("rh-" + g.sleutel + "-pct").value, 10) * factor));
        deelnameNoemer += aantal.waarde;
      }
      var n = Math.round(aantal.waarde * pct / 100);
      if (g.pct) deelnameTeller += n;
      giften += n * gift.waarde;
      gevers += n;
    });

    var activiteiten = rekenActiviteiten().totaal;
    var opslagbaseGrondslag = giften + activiteiten;
    var moment = root.querySelector('input[name="rh-moment"]:checked').value;
    if (moment === "jubileum") {
      var opslagPct = parseInt($("rh-opslag-pct").value, 10);
      giften += Math.round(opslagbaseGrondslag * opslagPct / 100);
    }

    var deelnamePct = deelnameNoemer > 0 ? Math.round(deelnameTeller / deelnameNoemer * 100) : 0;
    return {
      deelname: deelnamePct, gevers: gevers, giften: giften, activiteiten: activiteiten,
      totaal: giften + activiteiten
    };
  }

  function rekenBandbreedte() {
    var lijst = $("rh-scenario-body");
    lijst.innerHTML = "";
    var heeftActiviteiten = rekenActiviteiten().totaal > 0;
    $("rh-scenario-noot").hidden = !heeftActiviteiten;

    var resultaten = [];
    scenarios.forEach(function (sc) {
      var r = rekenScenario(sc.factor);
      var tr = document.createElement("tr");
      if (sc.sleutel === "verwacht") tr.className = "rh-scenario-huidig";
      tr.innerHTML =
        "<td></td><td class=\"rh-num\"></td><td class=\"rh-num\"></td>" +
        "<td class=\"rh-num\"></td><td class=\"rh-num\"></td><td class=\"rh-num\"></td>";
      var cellen = tr.querySelectorAll("td");
      cellen[0].textContent = sc.naam;
      cellen[1].textContent = r.deelname + "%";
      cellen[2].textContent = getal.format(r.gevers);
      cellen[3].textContent = euro.format(Math.round(r.giften));
      cellen[4].textContent = euro.format(Math.round(r.activiteiten));
      cellen[5].textContent = euro.format(Math.round(r.totaal));
      lijst.appendChild(tr);
      resultaten.push({ naam: sc.naam, deelname: r.deelname, totaal: r.totaal });
    });
    return resultaten;
  }

  // --- Mail de berekening ---------------------------------------------
  // Opent het eigen e-mailprogramma van de bezoeker met een kant-en-klaar
  // bericht. Het "aan"-veld laten we leeg: de bezoeker vult zelf in of het
  // naar zichzelf gaat (om later intern door te sturen) of direct naar het
  // bestuur. Er wordt niets naar een server gestuurd of hier opgeslagen.
  function bouwBericht() {
    var regels = ["Indicatie lustruminvestering, gemaakt met de rekenhulp op lustrummoment.nl", ""];

    if (laatsteUitkomst.regels.length) {
      laatsteUitkomst.regels.forEach(function (r) {
        var detail = r.detail.replace(/, \d+% van het totaal$/, "");
        regels.push(r.naam + ": " + euro.format(Math.round(r.bedrag)) + " (" + detail + ")");
      });
    } else {
      regels.push("(nog geen gegevens ingevuld)");
    }

    regels.push("");
    regels.push("Verwacht totaal: " + euro.format(Math.round(laatsteUitkomst.totaal)) +
      ", van " + getal.format(laatsteUitkomst.gevers) + " gevers en sponsors samen.");
    regels.push("");
    regels.push("Bandbreedte:");
    laatsteUitkomst.scenarios.forEach(function (s) {
      regels.push("- " + s.naam + " (" + s.deelname + "% deelname): " + euro.format(Math.round(s.totaal)));
    });

    regels.push("");
    regels.push("Dit is een eigen inschatting, geen toezegging en geen fiscaal advies.");
    regels.push("Vragen? Plan een kennismaking: https://www.lustrummoment.nl/kennismaking.html");

    return regels.join("\n");
  }

  function zetMailKnop() {
    var knop = $("rh-mail");
    if (!knop) return;
    var onderwerp = "Indicatie lustruminvestering";
    knop.href = "mailto:?subject=" + encodeURIComponent(onderwerp) + "&body=" + encodeURIComponent(bouwBericht());
  }

  root.addEventListener("input", reken);
  root.addEventListener("change", reken);

  $("rh-wis").addEventListener("click", function () {
    root.querySelectorAll('input[type="text"]').forEach(function (i) { i.value = ""; });
    root.querySelectorAll('input[type="range"]').forEach(function (i) { i.value = 0; });
    root.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
    root.querySelector('input[name="rh-nieuw"][value="nee"]').checked = true;
    root.querySelector('input[name="rh-moment"][value="lustrum"]').checked = true;
    reken();
    $("rh-leden-aantal").focus();
  });

  var mobiel = $("rh-mobielbalk");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      mobiel.classList.toggle("is-weg", e[0].isIntersecting);
    }, { threshold: 0.15 }).observe($("rh-uitkomst"));
  }

  reken();
})();
