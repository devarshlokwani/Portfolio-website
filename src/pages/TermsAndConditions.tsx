import { useRouteTransition } from '@/app/routeTransition'
import { LegalLayout } from '@/components/legal/LegalLayout'
import { EMAIL, EMAIL_HREF } from '@/lib/contact'

export function TermsAndConditions() {
  const { goTo } = useRouteTransition()

  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="30 September 2026">
      <section>
        <h2>Acceptance</h2>
        <p>
          This site is Devarsh Lokwani's personal portfolio, a place to see his work, get in
          touch, and leave a note on the guestbook. By using it, you're agreeing to the few,
          low-stakes terms below.
        </p>
      </section>

      <section>
        <h2>Content ownership</h2>
        <p>
          The design, writing, code, illustrations, and hand-drawn artwork that make up this site
          belong to Devarsh Lokwani, and are protected by copyright from the moment they were
          created. No registration is needed for that to be true. The exception is work that is
          explicitly licensed otherwise, such as the open-source repositories linked from the
          Projects section, which carry their own licenses and are governed by those.
        </p>
        <p>
          Project write-ups describe real work Devarsh has done. Screenshots and demos are
          representative of that work at the time they were published.
        </p>
        <p>
          <strong className="text-fg">What you're welcome to do.</strong> Read it, share a link to
          it, and quote a short passage with attribution and a link back. Referencing the work in
          a normal way, the way one site links to another, needs no permission at all.
        </p>
        <p>
          <strong className="text-fg">What needs asking first.</strong> Republishing pages or
          substantial parts of them, reusing the writing as your own, lifting the artwork or
          illustrations, or copying the site's design and code to build your own portfolio.
          Passing any of this off as your own work is the thing this section exists to be clear
          about. Ask and the answer is often yes: <a href={EMAIL_HREF}>{EMAIL}</a>.
        </p>
        <p>
          <strong className="text-fg">Third-party marks.</strong> Company names and logos shown on
          the Certificates page identify the organisation that issued a certificate Devarsh holds.
          They remain the property of their respective owners and are used only to identify the
          issuer. Nothing here implies endorsement, sponsorship, or affiliation.
        </p>
        <p>
          If you believe something on this site infringes your copyright, write to{' '}
          <a href={EMAIL_HREF}>{EMAIL}</a> with enough detail to identify the material and it will
          be looked at promptly.
        </p>
        <p>
          The site is registered with DMCA.com, and the badge in the footer links to that record.
          It does not create or replace any of the rights above, which exist automatically. Where
          content from this site is found republished elsewhere, a takedown notice will be sent to
          the host or platform concerned.
        </p>
      </section>

      <section>
        <h2>Signing in</h2>
        <p>
          Reading the "Sign the Wall" guestbook needs no account. Writing on it does, through
          either Google or GitHub. That is there so a signature is attributable to someone rather
          than anonymous, and so one person gets one signature.
        </p>
        <p>
          Sign in with an account that is actually yours, and keep it secure: anything posted from
          it is treated as posted by you. Signing in reads your display name and nothing else,
          and what happens to the rest of your account details is set out in the{' '}
          {/* Routed rather than reloaded, like every other internal link. */}
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault()
              goTo('/privacy')
            }}
          >
            Privacy Policy
          </a>
          . Your email address is never shown on the wall.
        </p>
        <p>
          Access to the guestbook can be withdrawn without notice if these terms are broken. The
          sign-in providers have their own terms, and your account with them is a matter between
          you and them.
        </p>
      </section>

      <section>
        <h2>Guestbook conduct</h2>
        <p>Entries you post must not:</p>
        <ul>
          <li>Contain abusive, hateful, harassing, or illegal content</li>
          <li>Impersonate another person, or sign in with an account that isn't yours</li>
          <li>Spam, advertise, or link to unrelated third-party sites</li>
          <li>Publish anyone's personal information, including your own contact details</li>
          <li>Infringe someone else's copyright or other rights</li>
        </ul>
        <p>
          A basic word filter and automated abuse prevention are in place, but neither is a
          substitute for the rules above. Entries that don't belong may be edited or removed at
          Devarsh's discretion, without notice, and repeated breaches may mean no further
          signatures from that account.
        </p>
      </section>

      <section>
        <h2>How the guestbook works</h2>
        <p>
          One signature per account. Coming back and signing again replaces what you wrote rather
          than adding a second entry, and re-dates it, which also moves it back to the top of the
          wall.
        </p>
        <p>
          Your signature is yours to change or take down whenever you like, from the wall itself
          while signed in. Deleting it removes the record rather than hiding it, though copies may
          persist for a while in backups or in anything a visitor saved or a search engine cached,
          which is outside anyone's control.
        </p>
        <p>
          Signatures may be pinned to the top of the wall at Devarsh's discretion. Pinning is a
          choice about what to feature and is not an endorsement of the person or what they wrote.
        </p>
      </section>

      <section>
        <h2>What you post</h2>
        <p>
          What you write stays yours. By posting it you're giving permission to display it on this
          site, for as long as it's up, which is the whole point of a public wall. Nothing else is
          claimed over it: it will not be sold, licensed on, or used to advertise anything.
        </p>
        <p>
          Post only what you have the right to post, and treat anything you write there as
          public, because it is. Signatures are other people's words, not Devarsh's, and are not
          reviewed before they appear.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Use the site normally. Don't try to break it, get around the sign-in or the abuse
          prevention on the guestbook, write to it by any route other than the site itself, scrape
          it wholesale, or put load on it that a person reading pages wouldn't.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          This site is provided as-is. It's a personal project, kept up and improved on a
          best-effort basis, not a commercial product with uptime guarantees or formal support.
          The guestbook in particular may be taken down, reset, or changed at any time, so don't
          treat it as somewhere to keep anything you'd miss.
        </p>
        <p>
          Nothing in these terms limits any rights you have under the Australian Consumer Law or
          other laws that cannot be excluded by agreement.
        </p>
      </section>

      <section>
        <h2>Third-party links</h2>
        <p>
          Links to other sites (GitHub, LinkedIn, Foundr, Memora, and similar) are provided for
          convenience. Devarsh isn't responsible for the content, availability, or practices of
          any site this one links to. The guestbook also depends on services run by Google, and
          their availability is not something this site controls.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of New South Wales, Australia, where Devarsh is
          based. Anything that can't be sorted out by an email first belongs in the courts of that
          state.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          These terms may be updated occasionally as the site changes. The date at the top of this
          page always reflects the latest version.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={EMAIL_HREF}>{EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
