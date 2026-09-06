/* ==========================================================================
   LustrumMoment — het enige JavaScript op deze site
   --------------------------------------------------------------------------
   Dit bestand doet precies één ding: het maakt van de navigatie een inklapbaar
   menu op smalle schermen.

   De site werkt volledig zonder JavaScript. Staat het uit, dan blijft de
   navigatie gewoon als lijst staan en is alles bereikbaar. De veelgestelde
   vragen gebruiken het ingebouwde details/summary van de browser en hebben
   hier dus niets van nodig.

   Het script staat bewust in de <head> zonder defer: de eerste regel zet de
   klasse "js" op <html>, zodat de opmaak meteen weet dat het menu ingeklapt
   mag worden. Zou dat later gebeuren, dan flitst de open lijst even in beeld.
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  function start() {
    var header = document.querySelector(".site-header__binnen");
    var nav = document.getElementById("hoofdnavigatie");
    if (!header || !nav) { return; }

    // Vanaf 62rem (992px) staat de navigatie altijd uitgeklapt; dat is
    // hetzelfde omslagpunt als in style.css.
    var breed = window.matchMedia("(min-width: 62rem)");

    var knop = document.createElement("button");
    knop.type = "button";
    knop.className = "nav-knop";
    knop.textContent = "Menu";
    knop.setAttribute("aria-expanded", "false");
    knop.setAttribute("aria-controls", "hoofdnavigatie");
    header.insertBefore(knop, nav);

    function zet(open) {
      knop.setAttribute("aria-expanded", open ? "true" : "false");
      nav.hidden = !open;
    }

    function pasAan() {
      if (breed.matches) {
        // Breed scherm: knop speelt geen rol, lijst altijd zichtbaar.
        nav.hidden = false;
        knop.setAttribute("aria-expanded", "false");
      } else {
        zet(knop.getAttribute("aria-expanded") === "true");
      }
    }

    knop.addEventListener("click", function () {
      zet(knop.getAttribute("aria-expanded") !== "true");
    });

    // Escape sluit het menu en zet de focus terug op de knop, zodat je met
    // het toetsenbord niet verdwaalt.
    nav.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !breed.matches) {
        zet(false);
        knop.focus();
      }
    });
    knop.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !breed.matches) { zet(false); }
    });

    if (breed.addEventListener) {
      breed.addEventListener("change", pasAan);
    } else if (breed.addListener) {
      breed.addListener(pasAan); // oudere browsers
    }

    zet(false);
    pasAan();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
