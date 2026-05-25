// Re-apply the URL fragment scroll after the page has loaded.
//
// The user guide is one long page, and WilhelmSK's in-app "?" buttons deep-link
// into it as user-guide/#<section>. SFSafariViewController (the in-app browser)
// runs its initial fragment scroll before this long page finishes laying out
// (web fonts, images), so it lands at the very top — on the "Skip to content"
// link — instead of the requested section. Re-assert the scroll across the
// first second after load to beat the late layout, then stop so we never fight
// a reader who has started scrolling.
(function () {
  function scrollToTarget() {
    var hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }
    var id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch (e) {
      // Leave id as-is if it isn't valid percent-encoding.
    }
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView();
    }
  }

  function run() {
    // Fire at 0ms, 125ms, ... 1000ms — covers the in-app browser's late layout.
    for (var i = 0; i <= 8; i++) {
      setTimeout(scrollToTarget, i * 125);
    }
  }

  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run);
  }
})();
