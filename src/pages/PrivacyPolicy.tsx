import { LegalLayout } from '@/components/legal/LegalLayout'
import { EMAIL, EMAIL_HREF } from '@/lib/contact'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="30 September 2026">
      <section>
        <h2>Overview</h2>
        <p>
          This is Devarsh Lokwani's personal portfolio site. It doesn't run ads, sell data, or
          track you across other sites. This page explains, plainly, what little information the
          site does collect, why, and how it's handled.
        </p>
        <p>
          Most of this site collects nothing at all. Reading the pages, looking at the work, and
          browsing the certificates involve no account, no form, and no third party. Three things
          are different, and each is described below: the contact form, the booking calendar, and
          the guestbook.
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
          <strong className="text-fg">Signing in to the guestbook.</strong> The "Sign the Wall"
          guestbook is public to read, and signing in is required only to write on it. Sign-in is
          handled by Firebase Authentication, a Google service, using whichever of Google or
          GitHub you choose. Devarsh never sees or handles your password: you authenticate with
          that provider directly, and it reports back to Firebase that the sign-in succeeded.
        </p>
        <p>
          Signing in creates an account record held by Firebase Authentication. That record holds
          the identifiers your chosen provider returns, which normally include your email address,
          your display name, a link to your profile picture, and an opaque user ID. The site
          itself reads only your display name from it. Your email address is never displayed on
          the wall, never stored in the guestbook, and never used to contact you. Your profile
          picture is not loaded either: the coloured initials next to a signature are drawn by
          this site from your name, on a colour worked out from your user ID so it stays the
          same each visit. That keeps every image on the wall served from this domain rather
          than from Google's or GitHub's.
        </p>
        <p>
          <strong className="text-fg">What a signature stores.</strong> When you sign, one record
          is written to Firestore, a Google database, holding your display name, your message,
          which provider you signed in with, the time you signed, and your Firebase user ID. That
          record is public: anyone who visits the wall can read all of it, including which of the
          two providers you used, which is shown as a small mark on your signature. Nothing else
          about you is written, and nothing is inferred from it.
        </p>
        <p>
          Your user ID is also the record's name, which is how one signature per person is
          enforced by the database itself rather than merely asked for. It is an identifier for
          this project only, meaningless anywhere else, and not linked to anything outside the
          wall.
        </p>
        <p>
          <strong className="text-fg">Abuse prevention.</strong> The guestbook is protected by
          Firebase App Check using Google reCAPTCHA v3, which is what stops automated scripts
          writing to the wall directly. reCAPTCHA works by observing how a visitor's browser
          behaves, and Google receives your IP address and that activity when it runs. It is
          Google's service, governed by Google's privacy policy, not something this site can see
          the workings of. Note that this currently loads on every page of the site while the
          guestbook is connected, not only on the guestbook page.
        </p>
        <p>
          <strong className="text-fg">Booking calendar.</strong> The Contact page can show a
          booking calendar provided by Cal.com. It does not load on its own: it stays behind a
          button until you ask for it, because loading it opens a connection to Cal.com, which
          can then see your IP address, set its own cookies in your browser, and report errors
          to its own monitoring provider. None of that happens unless you press the button. If
          you book a time, the details you give go to Cal.com and are governed by their privacy
          policy. You can skip the embed entirely and open Cal.com directly instead.
        </p>
        <p>
          <strong className="text-fg">Hosting.</strong> The site is served by Vercel, which like
          any web host records standard request information such as your IP address and browser
          type in its server logs. That is a by-product of serving the page, not something this
          site collects or looks at.
        </p>
        <p>
          Nothing else is collected. There is no payment processing, no newsletter, and no form
          on this site asks for anything beyond what's described above. Fonts and images are
          served from this site's own domain rather than a third-party CDN.
        </p>
      </section>

      <section>
        <h2>Where your data is held</h2>
        <p>
          Guestbook signatures and sign-in records are held by Google on its own infrastructure,
          which means they may be stored and processed outside Australia. The contact form is
          handled by Formspree and booking details by Cal.com, both on their own infrastructure.
          Each of those services is governed by its own privacy policy and its own security
          arrangements.
        </p>
      </section>

      <section>
        <h2>Cookies &amp; local storage</h2>
        <p>
          <strong className="text-fg">This site sets no cookies of its own.</strong> It stores a
          couple of small preferences directly in your browser instead: your dark/light theme
          choice, and whether you've already seen the intro animation, so they persist between
          visits. Both stay on your device, are never transmitted anywhere, and exist purely to
          make the site work the way you left it.
        </p>
        <p>
          Two third parties do store things in your browser, and both are tied to features you
          choose to use. Signing in to the guestbook leaves a Firebase session in your browser's
          storage, which is what keeps you signed in between visits, and clears when you sign
          out. Google reCAPTCHA, which protects the guestbook from automated writing, sets its
          own cookies. If you load the booking calendar, Cal.com sets a small number of its own
          for security and session purposes.
        </p>
        <p>
          There is no cookie banner because nothing here is set for advertising, analytics, or
          tracking you between sites. What is set is what makes signing in and abuse prevention
          work. Rather than ask you to dismiss a notice about tracking that isn't happening, the
          tracking simply isn't there.
        </p>
      </section>

      <section>
        <h2>Analytics &amp; tracking</h2>
        <p>
          This site does not use Google Analytics, advertising pixels, heat mapping, session
          recording, or any other third-party tracking or analytics service. No profile is built
          about you, nothing is sold or shared for marketing, and no record is kept of which
          pages you read.
        </p>
      </section>

      <section>
        <h2>Third-party links</h2>
        <p>
          The site links out to places like GitHub, LinkedIn, Foundr, Memora, and the DMCA.com
          status page behind the badge in the footer. Once you follow one of those links, you're
          on a site Devarsh doesn't control, governed by that site's own privacy policy. The
          badge image itself is served from this domain, not from DMCA.com, so it loads without
          telling them you were here.
        </p>
      </section>

      <section>
        <h2>Data retention</h2>
        <ul>
          <li>Contact form messages are kept only as long as needed to read and respond to them.</li>
          <li>
            Guestbook signatures stay on the wall until you remove yours or it is removed for
            breaking the rules in the Terms.
          </li>
          <li>
            Your Firebase sign-in record lasts until the account is deleted. Removing your
            signature does not remove it, because the two are separate things: ask and it will be
            deleted too.
          </li>
        </ul>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You can edit or delete your own signature yourself, at any time, from the wall while
          signed in. Deleting it removes the record outright rather than hiding it.
        </p>
        <p>
          For anything else, including a copy of what is held under your name, deletion of the
          sign-in record behind it, or a question about any of the above, email{' '}
          <a href={EMAIL_HREF}>{EMAIL}</a> and it'll be sorted out directly, with no formal
          process needed for a site this size.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          This site isn't aimed at children, and the guestbook shouldn't be signed by anyone
          under 13. If you believe a child has signed it, write to{' '}
          <a href={EMAIL_HREF}>{EMAIL}</a> and the entry will be removed.
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
          Questions about this policy: <a href={EMAIL_HREF}>{EMAIL}</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
