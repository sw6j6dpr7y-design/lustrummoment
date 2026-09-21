/* ==========================================================================
   LustrumMoment — Quick Scan
   --------------------------------------------------------------------------
   Verbetert het formulier op quick-scan.html met een stapsgewijze flow en
   een directe uitkomst. Zonder JavaScript blijven alle drie de vragen
   gewoon onder elkaar zichtbaar (de HTML zelf verbergt niets) en kun je via
   de vaste link onderaan het formulier alsnog naar de kennismakingspagina.
   Los van site.js, dat alleen het mobiele menu doet.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("quickscan");
  if (!form) { return; }

  var stappen = form.querySelectorAll(".qs__stap");
  var dots = form.querySelectorAll(".qs__voortgang span");
  var resultaat = document.getElementById("qs-resultaat");
  var stapIndex = { "qs-1": 0, "qs-2": 1, "qs-3": 2 };

  function toon(id) {
    stappen.forEach(function (s) { s.hidden = s.id !== id; });
    resultaat.hidden = true;
    var index = stapIndex[id];
    dots.forEach(function (d, i) { d.classList.toggle("on", i <= index); });
    var kop = document.getElementById(id).querySelector("h2");
    if (kop) { kop.setAttribute("tabindex", "-1"); kop.focus(); }
  }

  function toonResultaat(inAanmerking) {
    stappen.forEach(function (s) { s.hidden = true; });
    dots.forEach(function (d) { d.classList.add("on"); });

    if (inAanmerking) {
      resultaat.innerHTML =
        '<span class="qs__icoon qs__icoon--ok" aria-hidden="true"><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"></polyline></svg></span>' +
        '<h2>Een steunstichting SBBI lijkt mogelijk</h2>' +
        '<p>Op basis van je antwoorden lijkt een steunstichting SBBI voor jullie vereniging haalbaar. ' +
        'Dit is een eerste, snelle inschatting — geen fiscaal advies en geen garantie. Wij zoeken het ' +
        'definitieve antwoord voor je uit tijdens een vrijblijvende kennismaking.</p>' +
        '<p><a class="knop knop--primair" href="kennismaking.html">Plan een kennismaking</a></p>';
    } else {
      resultaat.innerHTML =
        '<span class="qs__icoon qs__icoon--nee" aria-hidden="true"><svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg></span>' +
        '<h2>Een steunstichting SBBI ligt niet direct voor de hand</h2>' +
        '<p>De regeling is wettelijk voorbehouden aan sport- en muziekverenigingen die lid zijn van een ' +
        'landelijke, representatieve koepel. Twijfel je of jullie vereniging toch voldoet? Neem gerust ' +
        'contact op, dan kijken we samen mee.</p>' +
        '<p><a class="knop knop--secundair" href="kennismaking.html">Neem contact op</a></p>';
    }

    var opnieuw = document.createElement("button");
    opnieuw.type = "button";
    opnieuw.className = "qs__opnieuw";
    opnieuw.textContent = "Opnieuw beginnen";
    opnieuw.addEventListener("click", function () {
      form.reset();
      dots.forEach(function (d) { d.classList.remove("on"); });
      toon("qs-1");
    });
    resultaat.appendChild(opnieuw);

    resultaat.hidden = false;
    resultaat.setAttribute("tabindex", "-1");
    resultaat.focus();
  }

  // Pas hier — niet al in de HTML — worden stap 2, stap 3 en het resultaat
  // verborgen, zodat de pagina zonder JavaScript gewoon alle vragen toont.
  stappen.forEach(function (s) { s.hidden = s.id !== "qs-1"; });
  resultaat.hidden = true;
  dots[0].classList.add("on");

  form.querySelector('[data-volgende="qs-2"]').addEventListener("click", function () {
    var keuze = form.querySelector('input[name="qs-koepel"]:checked');
    if (!keuze) {
      document.getElementById("qs-1").querySelector("h2").focus();
      return;
    }
    if (keuze.value === "nee") { toonResultaat(false); return; }
    toon("qs-2");
  });

  form.querySelector('[data-vorige="qs-1"]').addEventListener("click", function () { toon("qs-1"); });
  form.querySelector('[data-volgende="qs-3"]').addEventListener("click", function () { toon("qs-3"); });
  form.querySelector('[data-vorige="qs-2"]').addEventListener("click", function () { toon("qs-2"); });
  document.getElementById("qs-bekijk").addEventListener("click", function () { toonResultaat(true); });
})();
