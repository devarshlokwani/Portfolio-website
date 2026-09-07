import { LegalLayout } from '@/components/legal/LegalLayout'
import { EMAIL, EMAIL_HREF } from '@/lib/contact'

export function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="7 September 2026">
      <section>
        <h2>Acceptance</h2>
        <p>
          This site is Devarsh Lokwani's personal portfolio, a place to see his work, get in
          touch, and (if the guestbook is live) leave a note. By using it, you're agreeing to the
          few, low-stakes terms below.
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
      </section>

      <section>
        <h2>Guestbook conduct</h2>
        <p>If the "Sign the Wall" guestbook is live, entries you post there must not:</p>
        <ul>
          <li>Contain abusive, hateful, or illegal content</li>
          <li>Impersonate another person</li>
          <li>Spam, advertise, or link to unrelated third-party sites</li>
        </ul>
        <p>
          Basic automatic filtering and a short cooldown between submissions are in place, and
          entries that don't belong may be removed at Devarsh's discretion, without notice.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          This site is provided as-is. It's a personal project, kept up and improved on a
          best-effort basis, not a commercial product with uptime guarantees or formal support.
        </p>
      </section>

      <section>
        <h2>Third-party links</h2>
        <p>
          Links to other sites (GitHub, LinkedIn, Foundr, and similar) are provided for
          convenience. Devarsh isn't responsible for the content, availability, or practices of
          any site this one links to.
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
