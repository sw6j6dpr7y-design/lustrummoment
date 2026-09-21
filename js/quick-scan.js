/* ==========================================================================
   LustrumMoment — Quick Scan
   --------------------------------------------------------------------------
   Verbetert het formulier op quick-scan.html met een stapsgewijze flow, een
   koepel-zoekfunctie en een directe uitkomst. Zonder JavaScript blijven alle
   vragen gewoon onder elkaar zichtbaar (de datalist werkt dan nog als native
   autocomplete, alleen de controle- en doorschakellogica hieronder niet) en
   kun je via de vaste link onderaan het formulier alsnog naar de
   kennismakingspagina. Los van site.js, dat alleen het mobiele menu doet.

   De koepellijst (KOEPELS/ALIASSEN) komt letterlijk uit
   "koepelorganisaties.xlsx" — zie de toelichting bovenaan quick-scan.html.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("quickscan");
  if (!form) { return; }

  /* --- Koepellijst, letterlijk uit koepelorganisaties.xlsx ---------------- */
  var KOEPELS = [
    "Aikido Bond Nederland", "Algemene Nederlandse Sjoelbond",
    "American Football Bond Nederland", "Badminton Nederland",
    "Bob en Slee Bond Nederland", "Boksbond", "Cheersport Netherlands",
    "Federatie Oosterse Gevechtskunsten", "Gehandicaptensport Nederland",
    "Holland Surfing Association", "IJshockey Nederland", "Judo Bond Nederland",
    "Karate-Do Bond Nederland", "KNAC Nationale Autosport Federatie",
    "Koninklijke HandboogSport Nederland", "Koninklijk Nederlands Korfbalverbond",
    "Koninklijk Nederlands Watersport Verbond", "Koninklijke Nederlandsche Kegel Bond",
    "Koninklijke Nederlandsche Kolfbond", "Koninklijke Nederlandsche Motorboot Club",
    "Koninklijke Nederlandsche Schaatsenrijders Bond", "Koninklijke Nederlandsche Wielren Unie",
    "Koninklijke Nederlandse Algemene Schermbond", "Koninklijke Nederlandse Atletiekunie",
    "Koninklijke Nederlandse Baseball en Softball Bond", "Koninklijke Nederlandse Biljart Bond",
    "Koninklijke Nederlandse Cricket Bond", "Koninklijke Nederlandse Dambond",
    "Koninklijke Nederlandse Golf Federatie", "Koninklijke Nederlandse Gymnastiek Unie",
    "Koninklijke Nederlandse Hippische Sportfederatie", "Koninklijke Nederlandse Hockey Bond",
    "Koninklijke Nederlandse Kaatsbond", "Koninklijke Nederlandse Krachtsport en Fitnessbond",
    "Koninklijke Nederlandse Lawn Tennis Bond", "Koninklijke Nederlandse Motorrijders Vereniging",
    "Koninklijke Nederlandse Roeibond", "Koninklijke Nederlandse Schaakbond",
    "Koninklijke Nederlandse Schietsport Associatie", "Koninklijke Nederlandse Vereniging voor Luchtvaart",
    "Koninklijke Nederlandse Voetbal Bond", "Koninklijke Nederlandse Zwembond",
    "Koninklijke Sportvisunie", "Koninklijke Wandel Bond Nederland",
    "Nederlandse Lacrosse Bond", "Nederlands Handbal Verbond",
    "Nederlandse Algemene Danssport Bond", "Nederlandse Basketball Bond",
    "Nederlandse Beugel Bond", "Nederlandse Bowling Federatie",
    "Nederlandse Bridge Bond", "Nederlandse Curling Bond", "Nederlandse Darts Bond",
    "Nederlandse Draken Boot Federatie", "Nederlandse Floorball en Unihockey Bond",
    "Nederlandse Frisbee Bond", "Nederlandse Gewichthef Bond", "Nederlandse Go Bond",
    "Nederlandse Indoor en Outdoor Bowls Bond", "Nederlandse Jeu de Boules Bond",
    "Nederlandse Klim- en Bergsport Vereniging", "Nederlandse Klootschietbond",
    "Nederlandse Kruisboog Bond", "Nederlandse Minigolf Bond",
    "Nederlandse Onderwatersport Bond", "Nederlandse Oriënteringsloop Bond",
    "Nederlandse Rollersports Bond", "Nederlandse Ski Vereniging",
    "Nederlandse Tafeltennisbond", "Nederlandse Toer Fiets Unie",
    "Nederlandse Triathlon Bond", "Nederlandse Vechtsportbond",
    "Nederlandse Volleybalbond", "Nederlandse Waterski en Wakeboard Bond",
    "Reddingsbrigade Nederland", "Rugby Nederland", "Skateboard Federatie Nederland",
    "Squash Bond Nederland", "Survivalrun Bond Nederland", "Taekwondo Bond Nederland",
    "KNMO (Koninklijke Nederlandse Muziek Organisatie)", "Koornetwerk Nederland",
    "FPG (Federatie Paardrijden Gehandicapten)"
  ];

  // Gangbare afkortingen -> exacte naam zoals die in KOEPELS staat.
  var ALIASSEN = {
    "knvb": "Koninklijke Nederlandse Voetbal Bond",
    "knhb": "Koninklijke Nederlandse Hockey Bond",
    "nevobo": "Nederlandse Volleybalbond",
    "knltb": "Koninklijke Nederlandse Lawn Tennis Bond",
    "kngu": "Koninklijke Nederlandse Gymnastiek Unie",
    "knzb": "Koninklijke Nederlandse Zwembond",
    "knau": "Koninklijke Nederlandse Atletiekunie",
    "knwu": "Koninklijke Nederlandsche Wielren Unie",
    "knhs": "Koninklijke Nederlandse Hippische Sportfederatie",
    "knsa": "Koninklijke Nederlandse Schietsport Associatie",
    "nttb": "Nederlandse Tafeltennisbond",
    "knsb": "Koninklijke Nederlandsche Schaatsenrijders Bond",
    "nkb": "Nederlandse Klootschietbond",
    "knbb": "Koninklijke Nederlandse Biljart Bond",
    "nbb": "Nederlandse Bridge Bond",
    "ndb": "Nederlandse Darts Bond",
    "njbb": "Nederlandse Jeu de Boules Bond",
    "knmo": "KNMO (Koninklijke Nederlandse Muziek Organisatie)",
    "koninklijke nederlandse muziek organisatie": "KNMO (Koninklijke Nederlandse Muziek Organisatie)",
    "knkv": "Koninklijk Nederlands Korfbalverbond",
    "knmv": "Koninklijke Nederlandse Motorrijders Vereniging",
    "ntfu": "Nederlandse Toer Fiets Unie",
    "watersportverbond": "Koninklijk Nederlands Watersport Verbond",
    "sportvisserij nederland": "Koninklijke Sportvisunie",
    "fpg": "FPG (Federatie Paardrijden Gehandicapten)",
    "federatie paardrijden gehandicapten": "FPG (Federatie Paardrijden Gehandicapten)"
  };

  function zoekKoepel(tekst) {
    var q = tekst.trim().toLowerCase();
    if (!q) { return null; }
    for (var i = 0; i < KOEPELS.length; i++) {
      if (KOEPELS[i].toLowerCase() === q) { return KOEPELS[i]; }
    }
    if (ALIASSEN[q]) { return ALIASSEN[q]; }
    return null;
  }

  /* --- Stappen -------------------------------------------------------------- */
  var stappen = form.querySelectorAll(".qs__stap");
  var dots = form.querySelectorAll(".qs__voortgang span");
  var resultaat = document.getElementById("qs-resultaat");
  var stapIndex = { "qs-1": 0, "qs-1-zoek": 0, "qs-2": 1, "qs-3": 2 };

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
      var status = document.getElementById("qs-koepel-status");
      if (status) { status.textContent = ""; }
      dots.forEach(function (d) { d.classList.remove("on"); });
      toon("qs-1");
    });
    resultaat.appendChild(opnieuw);

    resultaat.hidden = false;
    resultaat.setAttribute("tabindex", "-1");
    resultaat.focus();
  }

  // Pas hier — niet al in de HTML — worden de vervolgstappen en het
  // resultaat verborgen, zodat de pagina zonder JavaScript gewoon alle
  // vragen toont.
  stappen.forEach(function (s) { s.hidden = s.id !== "qs-1"; });
  resultaat.hidden = true;
  dots[0].classList.add("on");

  document.getElementById("qs-1-volgende").addEventListener("click", function () {
    var keuze = form.querySelector('input[name="qs-koepel"]:checked');
    if (!keuze) {
      document.getElementById("qs-1").querySelector("h2").focus();
      return;
    }
    if (keuze.value === "nee") { toon("qs-1-zoek"); return; }
    toon("qs-2");
  });

  /* --- Koepel-zoekstap -------------------------------------------------- */
  var koepelInvoer = document.getElementById("qs-koepel-zoek");
  var koepelStatus = document.getElementById("qs-koepel-status");

  document.getElementById("qs-koepel-controleer").addEventListener("click", function () {
    var gevonden = zoekKoepel(koepelInvoer.value);
    if (!koepelInvoer.value.trim()) {
      koepelInvoer.focus();
      return;
    }
    if (gevonden) {
      koepelStatus.textContent = "Gevonden: " + gevonden + ". Je kunt door naar de volgende vraag.";
      toon("qs-2");
    } else {
      toonResultaat(false);
    }
  });

  document.getElementById("qs-koepel-niet-gevonden").addEventListener("click", function () {
    toonResultaat(false);
  });

  // querySelectorAll, niet querySelector: "Vorige vraag" naar stap 1 staat
  // op twee plekken (de koepel-zoekstap en stap 2).
  form.querySelectorAll('[data-vorige="qs-1"]').forEach(function (b) {
    b.addEventListener("click", function () { toon("qs-1"); });
  });
  form.querySelectorAll('[data-vorige="qs-2"]').forEach(function (b) {
    b.addEventListener("click", function () { toon("qs-2"); });
  });
  form.querySelectorAll('[data-volgende="qs-3"]').forEach(function (b) {
    b.addEventListener("click", function () { toon("qs-3"); });
  });
  document.getElementById("qs-bekijk").addEventListener("click", function () { toonResultaat(true); });
})();
