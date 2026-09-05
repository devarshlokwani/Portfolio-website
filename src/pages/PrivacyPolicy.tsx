import { LegalLayout } from '@/components/legal/LegalLayout'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="30 August 2026">
      <section>
        <h2>Overview</h2>
        <p>
          This is Devarsh Lokwani's personal portfolio site. It doesn't run ads, sell data, or
          track you across other sites. This page explains, plainly, what little information the
          site does collect, why, and how it's handled.
        </p>
      </section>

      <section>
        <h2>Information collected</h2>
        <p>
          <strong className="text-fg">Contact form.</strong> If you send a message through the
          Contact section, your name, email address, and message are submitted to Formspree, a
          third-party form service, and forwarded to Devarsh's inbox. They're used only to read
          and reply to what you sent. It is not stored in any database this site controls, not added
          to a mailing list, not used for anything else.
        </p>
        <p>
          <strong className="text-fg">Guestbook ("Sign the Wall").</strong> If that feature is
          live and you leave an entry, the name and message you type are stored in a Firebase
          database and shown publicly to other visitors on the wall. A randomly-generated,
          anonymous identifier is stored alongside your entry solely to prevent repeated
          submissions in a short window. It isn't linked to any other information about you.
        </p>
        <p>
          Nothing else is collected. There's no account system, no payment processing, and no
          form on this site asks for anything beyond what's described above.
        </p>
      </section>

      <section>
        <h2>Cookies &amp; local storage</h2>
        <p>
          The site stores a couple of small preferences directly in your browser: your dark/light
          theme choice, and whether you've already seen the intro animation, so they persist
          between visits. Both stay on your device, are never transmitted anywhere, and exist
          purely to make the site work the way you left it.
        </p>
      </section>

      <section>
        <h2>Analytics &amp; tracking</h2>
        <p>
          This site does not use Google Analytics, advertising pixels, or any other third-party
          tracking or analytics service.
        </p>
      </section>

      <section>
        <h2>Third-party links</h2>
        <p>
          The site links out to places like GitHub, LinkedIn, and Foundr. Once you follow one of
          those links, you're on a site Devarsh doesn't control, governed by that site's own
          privacy policy.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <ul>
          <li>Contact form messages are kept only as long as needed to read and respond to them.</li>
          <li>Guestbook entries stay visible until removed by the site owner.</li>
        </ul>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          Want a guestbook entry removed, or want to know exactly what's been submitted under your
          name? Email{' '}
          <a href="mailto:devarshlokwani480@gmail.com">devarshlokwani480@gmail.com</a> and it'll be
          sorted out directly, with no formal process needed for a site this size.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          If what this site collects or how it's handled ever changes, this page will be updated
          and the date at the top will reflect it.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy: <a href="mailto:devarshlokwani480@gmail.com">devarshlokwani480@gmail.com</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
