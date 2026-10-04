/* ==========================================================================
   LustrumMoment — Tally-formulier laden na een klik
   --------------------------------------------------------------------------
   Gebruikt op kennismaking.html en aanmelding.html; het formulier komt uit
   data-tally-embed en data-tally-titel op de knop. Los van site.js (mobiel menu). Er wordt pas een verzoek naar tally.so
   gedaan nadat de bezoeker op "Formulier openen" klikt. Zonder JavaScript
   blijft de noscript-link naar het formulier op tally.so staan.
   ========================================================================== */

(function () {
  "use strict";

  var knop = document.getElementById("tally-open");
  var houder = document.getElementById("tally-houder");
  var blok = document.getElementById("tally-blok");
  if (!knop || !houder) { return; }

  knop.addEventListener("click", function () {
    var frame = document.createElement("iframe");
    var adres = new URL(knop.getAttribute("data-tally-embed"));
    // Voorgevulde velden uit de link naar deze pagina (bijvoorbeeld
    // aanmelding.html?klantnummer=...) gaan mee naar het formulier, maar
    // alleen de velden die op de knop zijn toegestaan.
    var toegestaan = (knop.getAttribute("data-tally-velden") || "").split(",");
    new URLSearchParams(window.location.search).forEach(function (waarde, naam) {
      if (toegestaan.indexOf(naam) !== -1) { adres.searchParams.set(naam, waarde); }
    });
    frame.setAttribute("data-tally-src", adres.toString());
    frame.setAttribute("title", knop.getAttribute("data-tally-titel"));
    frame.setAttribute("width", "100%");
    frame.setAttribute("height", "600");
    frame.setAttribute("frameborder", "0");
    frame.setAttribute("marginheight", "0");
    frame.setAttribute("marginwidth", "0");

    // De src zetten we zelf, zodat het formulier altijd laadt; embed.js
    // zorgt daarna alleen nog voor de automatische hoogte.
    frame.setAttribute("src", frame.getAttribute("data-tally-src"));
    houder.appendChild(frame);

    var script = document.createElement("script");
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);

    if (blok) { blok.hidden = true; }
    frame.setAttribute("tabindex", "-1");
    frame.focus();
  });
})();
