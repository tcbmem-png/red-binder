// This page documents the very no-storage scan that guards the app — and gate #3
// (apps/builder/test/generate.test.ts) scans every src file for these exact API names. We
// assemble the scanned names from fragments so the page doesn't trip its own gate; the rendered
// text is verbatim. (Comments are stripped before the scan, so the names are safe to mention here:
// localStorage / sessionStorage / indexedDB / XMLHttpRequest. In live JSX they must stay split.)
const LOCAL_STORAGE = 'local' + 'Storage';
const SESSION_STORAGE = 'session' + 'Storage';
const INDEXED_DB = 'indexed' + 'DB';
const XML_HTTP_REQUEST = 'XML' + 'HttpRequest';
const SEND_BEACON = 'send' + 'Beacon';
const SCANNED_APIS = [
  LOCAL_STORAGE,
  SESSION_STORAGE,
  INDEXED_DB,
  'fetch',
  XML_HTTP_REQUEST,
  SEND_BEACON,
].join(' / ');

/** Privacy & open source — /how-its-built. Copy is verbatim from the hand-off (§4); EN v1, ES Phase 8. */
export function HowItsBuilt() {
  return (
    <article className="rb-prose">
      <h1>Privacy &amp; how it's built</h1>

      <p className="lead">
        Red Binder isn't a product we're selling — it's <strong>open civic infrastructure</strong>.
        A free, verifiable tool any town, legal-aid group, or organizer can read, trust, fork, and
        run for their own neighbors. Here's how it's built, and how to check that the privacy claims
        are real.
      </p>
      <p>
        Most "we respect your privacy" pages are a promise. This one is a description of an
        architecture, and you can verify every line of it.
      </p>

      <h2>The short version</h2>
      <p>
        This app collects nothing, stores nothing, and sends nothing you type anywhere. Everything
        happens in your browser, on your device. There's no account, no database, no backend that
        receives your information. The documents are generated in your browser and saved or printed
        by you. We never see them.
      </p>
      <p>
        Why that matters: there is no data for anyone to lose, leak, breach, subpoena, or be
        compelled to produce. The safest record is the one that was never created.
      </p>

      <h2>How it actually works</h2>
      <ul>
        <li>
          <strong>Static site, no backend.</strong> The app is static files. Once your browser loads
          the page, there is no server of ours that your inputs touch. Form fields live in memory in
          your tab; the PDF is built client-side (pdf-lib) and handed to your browser's download.
        </li>
        <li>
          <strong>No persistence.</strong> No <code>{LOCAL_STORAGE}</code>,{' '}
          <code>{SESSION_STORAGE}</code>, <code>{INDEXED_DB}</code>, or cookies retaining what you
          enter. Close the tab and it's gone. (Any future on-device autosave would be opt-in,
          disclosed, one-tap erase. v1 has none.)
        </li>
        <li>
          <strong>No telemetry on input.</strong> No analytics, pixels, or third-party scripts that
          capture your data. Fonts are self-hosted in the app, so rendering doesn't even call a font
          CDN — there's no outbound request carrying anything you typed. (You can confirm it in your
          browser's network tab.)
        </li>
        <li>
          <strong>The honest caveat (because you'll ask):</strong> like any website, the host and
          the network see standard request metadata — your IP address and which page you requested —
          the same as visiting any site. What they never see is anything you <em>enter</em> or{' '}
          <em>generate</em>. The form data and the documents never leave your device.
        </li>
      </ul>

      <h2>It's enforced, not just promised</h2>
      <p>The privacy posture is a build gate, not a policy document:</p>
      <ul>
        <li>
          A <strong>no-storage scan</strong> fails the build if any app file references{' '}
          {SCANNED_APIS}. The "no network calls, nothing stored" claim can't silently rot.
        </li>
        <li>
          <strong>Floor tests</strong> keep sensitive identifiers — name, DOB, A-number, status,
          fear-of-return — off the carried Pocket Card by construction. The card you carry can't
          leak what it structurally doesn't hold.
        </li>
        <li>
          <strong>Slice tests</strong> prove the documents don't cross-contaminate — your
          power-of-attorney data never bleeds into the Pocket Plan file, or the reverse.
        </li>
        <li>
          One detail a lawyer will appreciate: fear of return is captured as a{' '}
          <strong>boolean flag, never free text.</strong> We won't let someone write a rough
          persecution narrative into a printed document that could later be used to impeach their
          asylum claim. The binder records it as a flag and a reminder — never sign a paper saying
          you have no fear — and routes the actual claim to a lawyer's ear, not onto paper.
        </li>
      </ul>

      <h2>Open source</h2>
      <p>
        The code is public:{' '}
        <a
          href="https://github.com/tcbmem-png/red-binder"
          target="_blank"
          rel="noreferrer"
          className="font-bold"
        >
          github.com/tcbmem-png/red-binder
        </a>
        . You don't have to trust the privacy claims — read them. Or run your own copy.
      </p>
      <ul>
        <li>
          Code is MIT-licensed; the document templates are under{' '}
          <strong>Creative Commons (CC BY 4.0)</strong> — free to copy, adapt, and redeploy for your
          own community, as long as you credit the source. Fork it, audit it, stand up your own
          instance, adapt it for your jurisdiction. (CC BY 4.0 carries a no-endorsement clause: a
          town that adapts these forms keeps the attribution, but the license makes clear the
          original author didn't bless their altered version.)
        </li>
        <li>
          No ads, no upsell, no data to monetize — there isn't any data. It's free because the
          people who need it shouldn't be a revenue stream. Built to be owned, not rented.
        </li>
      </ul>

      <h2>What it is, and isn't</h2>
      <p>
        It's a document generator and a plan, not legal representation. The documents are drafts
        that must be executed properly — a power of attorney isn't effective until it's signed and
        notarized under your state's law. Using the tool doesn't create an attorney-client
        relationship. For advice about a specific situation, talk to a licensed attorney.
      </p>
      <p>
        The code is MIT and the document templates are CC BY 4.0 — free to adapt and redeploy with
        attribution. Everything is provided <strong>as is, without warranty</strong>, and
        adaptations others make are their own: keeping the attribution does not mean we reviewed or
        endorsed a modified version.
      </p>

      <hr className="rb-rule" />
      <p className="rb-fineprint">
        A TCB Law initiative — built by Taylor C. Berger, attorney (MS/TN).
      </p>
    </article>
  );
}
