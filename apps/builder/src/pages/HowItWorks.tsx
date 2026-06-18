import { Link } from '../lib/router';

/**
 * Explainer — /how-it-works. Copy is verbatim from the hand-off (§3); EN v1, ES is Phase 8.
 * The "Pocket Plan" section keeps the amber DRAFT chip until the legal wording is signed (§2).
 */
export function HowItWorks() {
  return (
    <article className="rb-prose">
      <h1>How it works</h1>

      <h2>What this is</h2>
      <p className="lead">
        The Red Binder Project is a free set of tools for immigrant and mixed-status families. You
        fill out a short form once, and it makes documents you can print, sign, and keep — a plan
        for the day someone doesn't come home.
      </p>
      <p>
        It won't stop what's happening. It can help a family be a little less lost on the worst day
        of their lives.
      </p>
      <p>We don't fix the system. We help you be ready for it.</p>

      <h2>How it works</h2>
      <p>
        Pick what you need. Enter your information once. Print the documents. Everything happens on
        your own device — there's no account, no database, and nothing you type is sent anywhere or
        saved. The code is open, so anyone can check that's true, and anyone can use it to do the
        same in their own town.
      </p>
      <p>Free. Bilingual. Nothing kept.</p>

      <h2>The three documents</h2>
      <p>
        <strong>Power of attorney — who handles money and home.</strong> If you're detained or can't
        be there, someone you trust needs to be able to act: pay the rent, get into the bank, get
        the van out of impound, deal with the school and the doctor, keep the household going. A
        power of attorney names that person and gives them that authority. It must be signed in
        front of a notary, under your state's rules, to work — printing it is the first step, not
        the last.
      </p>
      <p>
        <strong>Red Binder Plan — the map for the people you trust.</strong> When the head of a
        household vanishes, the questions come fast. Who gets the kids. Where are the papers, the
        passwords, the names. Who to call first. The Red Binder Plan writes it all down in one
        place, so a trusted person can step in without guessing. Bright, on the shelf, easy to grab
        in the dark.
      </p>
      <p>
        <strong>Pocket Plan — the card you carry, and the plan that finds you.</strong> The one
        below. Read it slowly.
      </p>

      <section className="rb-draft-section">
        <h2>The Pocket Plan — and the one decision that can't be undone</h2>
        {/* DRAFT gate (§2): stays until Taylor signs the legal wording. */}
        <p>
          <span className="rb-draft-chip">Draft — for attorney review</span>
        </p>
        <p>
          If ICE detains you, officers will push you to sign papers. They may tell you signing gets
          you out faster, or that if you don't sign you'll sit in detention for months. What they
          usually put in front of you is a <strong>stipulated order of removal</strong> — an
          agreement to be deported without ever seeing a judge.
        </p>
        <p>
          Here is what most people don't know: signing that paper leaves a{' '}
          <strong>removal order</strong> on your record. That order can bar you from coming back for
          5, 10, or 20 years — sometimes for the rest of your life — and it can turn a future return
          into a crime. It deports you about as fast as the lawful alternative. The lasting damage
          is far worse.
        </p>
        <p>
          And this is the part to sit with:{' '}
          <strong>even if you have decided you want to leave</strong> — even if you're done fighting
          and you just want to go home — what you sign still matters enormously. There is a lawful
          way to leave that does <strong>not</strong> leave a removal order on your record:{' '}
          <strong>voluntary departure.</strong> You ask a judge for it, with a lawyer. It is not a
          form an officer hands you. Same exit — a very different future.
        </p>
        <p>
          So the rule on the card is simple:{' '}
          <strong>do not sign anything an officer hands you until you talk to a lawyer</strong> —
          especially a paper that says "stipulation," "removal order," "voluntary departure," or
          "waiver." If you're afraid to return to your country, never sign a paper saying you have
          no fear. No one can force you to sign.
        </p>
        <p>
          The Pocket Plan is two pieces. A <strong>card you carry</strong> — what to say, the one
          rule, and nothing on it that could identify you if it's taken. And a{' '}
          <strong>binder page</strong>, kept at home and with someone you trust, holding what a
          lawyer needs to find you and act for you fast: your full legal name and every spelling of
          it, your date of birth, your country of birth, an A-number if you have one, and the people
          to call.
        </p>
        <p>
          Honest limit: this card can't stop a deportation, and it isn't a lawyer. What it does is
          help you avoid one mistake — signing away your right to see a judge — and help your people
          reach a lawyer fast.
        </p>
      </section>

      <h2>What this can't do</h2>
      <p>
        It does not stop a tow truck. It does not answer the emails no one returns. It does not
        bring anyone back. We're not going to tell you it fixes anything. It's a way to be a little
        less lost — and a thing you can hand to a neighbor so they can do the same.
      </p>

      <h2>For organizers and neighbors</h2>
      <p>It's free and open. Use it in your own town, for your own people.</p>
      <p>
        <Link to="/start-one" className="rb-cta">
          Start one in your town
        </Link>
      </p>

      <hr className="rb-rule" />
      <p className="rb-fineprint">
        Not legal advice. Using this tool does not create an attorney-client relationship, and it
        does not make us your lawyers. A power of attorney must be signed and notarized to be
        effective. For advice about your situation, talk to a licensed attorney. A TCB Law
        initiative — built by Taylor C. Berger, attorney (MS/TN).
      </p>
    </article>
  );
}
