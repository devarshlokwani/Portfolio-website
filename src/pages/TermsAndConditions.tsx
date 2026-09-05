import { LegalLayout } from '@/components/legal/LegalLayout'

export function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" lastUpdated="30 August 2026">
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
          The design, writing, and code that make up this site belong to Devarsh Lokwani, except
          where a specific project or piece of work is explicitly licensed otherwise (for example,
          open-source repositories linked from the Projects section, which carry their own
          licenses). Project write-ups describe real work Devarsh has done; screenshots and demos
          are representative of that work at the time they were published.
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
          Questions about these terms: <a href="mailto:devarshlokwani480@gmail.com">devarshlokwani480@gmail.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
