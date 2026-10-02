/* ==========================================================================
   LustrumMoment — Tally-formulier laden na een klik
   --------------------------------------------------------------------------
   Los van site.js (mobiel menu). Er wordt pas een verzoek naar tally.so
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
    frame.setAttribute("data-tally-src",
      "https://tally.so/embed/2EQ91e?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1");
    frame.setAttribute("title", "Kennismaking LustrumMoment");
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
