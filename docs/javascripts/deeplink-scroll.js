// Keep the URL fragment pinned to the top of the viewport until the page
// stops reflowing.
//
// The user guide is one long page, and WilhelmSK's in-app "?" buttons deep-link
// into it as user-guide/#<section>. In SFSafariViewController the initial
// fragment scroll runs before images above a deep section finish loading, so
// the page is still short when it scrolls — then the images load, everything
// below shifts down, and the target ends up at (or near) the top of the page,
// showing the "Skip to content" view instead of the section. Sections near the
// top are unaffected; deep ones fail. A fixed-duration retry isn't enough when
// images load slowly, so we re-assert the scroll every frame until the target
// has held the top of the viewport, bailing the instant the reader scrolls.
(function () {
  function targetId() {
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
    return id;
  }

  function pin() {
    var id = targetId();
    if (!id) {
      return;
    }

    var deadline = Date.now() + 4000;   // give slow image loads time to settle
    var stableFrames = 0;
    var userScrolled = false;

    function onUserScroll() { userScrolled = true; }
    var opts = { passive: true };
    window.addEventListener("wheel", onUserScroll, opts);
    window.addEventListener("touchmove", onUserScroll, opts);
    window.addEventListener("keydown", onUserScroll, opts);

    function stop() {
      window.removeEventListener("wheel", onUserScroll, opts);
      window.removeEventListener("touchmove", onUserScroll, opts);
      window.removeEventListener("keydown", onUserScroll, opts);
    }

    (function tick() {
      if (userScrolled) {                 // never fight a reader who has moved
        stop();
        return;
      }
      var el = document.getElementById(id);
      if (el) {
        var top = Math.round(el.getBoundingClientRect().top);
        if (Math.abs(top) > 2) {
          // Instant (not smooth) so the position is final this frame and we
          // can tell whether a later reflow moved it.
          el.scrollIntoView({ behavior: "auto", block: "start" });
          stableFrames = 0;
        } else {
          stableFrames++;                 // held the top this frame
        }
      }
      // Settled (held the top for a few frames) or out of time: done.
      if (stableFrames >= 5 || Date.now() > deadline) {
        stop();
        return;
      }
      requestAnimationFrame(tick);
    })();
  }

  if (document.readyState === "complete") {
    pin();
  } else {
    window.addEventListener("load", pin);
  }
})();
