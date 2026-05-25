// Re-apply the URL fragment scroll after the page has fully loaded.
//
// The user guide is one long page, and WilhelmSK's in-app "?" buttons deep-link
// into it as user-guide/#<section>. SFSafariViewController (the in-app browser)
// attempts the initial hash scroll before the long page finishes laying out
// fonts/images, so it frequently lands at the very top — on the "Skip to
// content" link — instead of the requested section. Re-running the scroll on
// `load` (and once more after layout settles) lands the reader where intended.
(function () {
  function targetElement() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return null;
    }
    var id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (e) {
      // Leave id as-is if it isn't valid percent-encoding.
    }
    return document.getElementById(id);
  }

  function fixScroll() {
    var el = targetElement();
    // Only correct a load that stuck at the top; never yank a reader who has
    // already scrolled down (their scrollY would be well past zero by then).
    if (el && window.scrollY < 5) {
      el.scrollIntoView();
    }
  }

  window.addEventListener("load", function () {
    fixScroll();
    setTimeout(fixScroll, 300);
  });
})();
