// Starter Terms of Use, Privacy Policy and the public Report / complaints page.
// IMPORTANT: these are plain-English starting points, not legal advice. Have an Australian lawyer review them before launch.
import { Link, useSearchParams } from 'react-router-dom';
import { LuFlag as Flag, LuScale as Scale, LuShieldCheck as ShieldCheck } from 'react-icons/lu';
import { SITE } from '../siteConfig.js';
import { ReportForm } from '../components/ReportDialog.jsx';
import { IconTile } from '../components/ui.jsx';

function LegalPage({ icon, title, children }) {
  return (
    <div className="container container-md page legal">
      <div className="row mb" style={{ gap: 14 }}><IconTile icon={icon} size={48} /><h1>{title}</h1></div>
      <p className="muted small">Last updated: {SITE.lastUpdated}</p>
      <div className="legal-note mt">
        <b>Template:</b> this page is a plain-English starting point written for the Nearvo app. It is not legal advice. Please have it reviewed by an Australian lawyer and fill in the details in square brackets before you launch.
      </div>
      {children}
    </div>
  );
}

export function Terms() {
  return (
    <LegalPage icon={Scale} title="Terms of Use">
      <h2>1. About Nearvo</h2>
      <p>{SITE.name} is operated by {SITE.legalName} (ABN {SITE.abn}) ("we", "us"). Nearvo is an online platform that helps customers find and contact independent tradespeople ("tradies") and lets tradies send quotes.</p>
      <p>Tradies are independent businesses. They are not our employees, agents or contractors. Any agreement for work is made directly between the customer and the tradie. We are not a party to that agreement and we don't perform, supervise or guarantee the work.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 18 or older and give us accurate, up-to-date information.</li>
        <li>Keep your password safe. You're responsible for activity on your account.</li>
        <li>One person or business per account. Don't impersonate anyone.</li>
      </ul>

      <h2>3. If you are a tradie</h2>
      <ul>
        <li>You must have an active Australian Business Number (ABN). We check it automatically with the Australian Business Register when you join and when you change it.</li>
        <li>You are responsible for holding every licence, registration, permit and insurance that the law requires for the work you quote on, in each state where you work, and for following all laws that apply to your work.</li>
        <li>Licence numbers you add to your profile are shown as provided by you. We don't verify them.</li>
        <li>Your quotes, prices and profile must be accurate and not misleading. Your work is covered by the consumer guarantees in the Australian Consumer Law.</li>
      </ul>

      <h2>4. If you are a customer</h2>
      <ul>
        <li>Describe your job honestly. Don't post personal information about other people.</li>
        <li>Before work starts, we recommend you ask for the tradie's licence and insurance details, check them with your state's licensing authority, and get the price and scope in writing.</li>
        <li>Price, timing, payment and any warranty are agreed directly between you and the tradie.</li>
      </ul>

      <h2>5. What we check, and what we don't</h2>
      <p>We check that each tradie's ABN is active on the Australian Business Register. We don't check identity, trade licences, insurance, qualifications, the quality of work, or whether a tradie is right for your job. Ratings and reviews are the opinions of customers who hired the tradie through Nearvo.</p>

      <h2>6. Reviews and content</h2>
      <ul>
        <li>Only customers who hired a tradie through Nearvo can review them, once per job. Reviews must be honest and about your own experience.</li>
        <li>Don't post fake, paid or incentivised reviews, reviews of your own business or a competitor, or content that is false, defamatory, abusive, discriminatory, or that shares someone's private information.</li>
        <li>Tradies can publicly reply to reviews about them.</li>
        <li>We don't remove or edit genuine reviews just because they are negative. We may hide content that breaks these rules or the law, including after a report, and we may restore it after review.</li>
        <li>You keep ownership of what you post, and you give us a licence to display it on Nearvo.</li>
      </ul>

      <h2>7. Reports and complaints</h2>
      <p>Anyone, with or without an account, can report a review, profile or job using the Report links or our <Link to="/report">Report & complaints page</Link>, or by emailing {SITE.contactEmail}. We aim to review every report within 7 days and will tell you the outcome.</p>

      <h2>8. Payments</h2>
      <p>Nearvo is currently free to use. We don't take or hold payments for jobs. Customers pay tradies directly. If we introduce fees we'll tell you before they apply.</p>

      <h2>9. Pausing or closing accounts</h2>
      <p>We may pause or close an account, or hide content, if it breaks these terms or the law, or to protect other users. Where it's reasonable to do so we'll tell you why and give you a chance to respond. You can close your account at any time by contacting us.</p>

      <h2>10. Your rights under the Australian Consumer Law</h2>
      <p>Nothing in these terms excludes, restricts or changes any right or remedy you have under the Australian Consumer Law or other laws that can't be excluded.</p>

      <h2>11. Our responsibility</h2>
      <p>We provide the platform with reasonable care and skill. To the extent the law allows, we aren't responsible for the work tradies do, for agreements between customers and tradies, or for content posted by users. Where our liability can be limited, it is limited to supplying the service again or paying the cost of having it supplied again.</p>

      <h2>12. Changes and contact</h2>
      <p>We may update these terms. If a change is significant we'll let you know before it takes effect. These terms are governed by the laws of {SITE.state}, Australia. Questions: {SITE.contactEmail}.</p>
    </LegalPage>
  );
}

export function Privacy() {
  return (
    <LegalPage icon={ShieldCheck} title="Privacy Policy">
      <p className="mt">This policy explains how {SITE.legalName} (ABN {SITE.abn}) collects and handles personal information when you use {SITE.name}. We aim to follow the Australian Privacy Principles in the Privacy Act 1988 (Cth).</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Account details:</b> name, email, mobile number, password (stored encrypted, never in plain text).</li>
        <li><b>Tradie details:</b> business name, ABN or ACN and the public business details returned by the Australian Business Register, licence number if you add it, base suburb, service area, services, prices and profile photo.</li>
        <li><b>Jobs, quotes, reviews and reports</b> you post or send, including the suburb of a job.</li>
        <li><b>Technical information:</b> basic logs such as IP address and browser type, used for security and to keep the site running. Your location is only used if you tap "Use my location", and only to search near you.</li>
      </ul>
      <p>We don't collect identity documents, and we don't ask for or store payment card details.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To run Nearvo: show tradie profiles, send jobs to tradies in the right area, deliver quotes, and let customers and tradies contact each other.</li>
        <li>To check a tradie's ABN with the Australian Business Register.</li>
        <li>To send you service emails (such as confirming your email, new quotes or jobs, and report outcomes).</li>
        <li>To keep the platform safe, handle reports and complaints, and meet our legal obligations.</li>
      </ul>
      <p>We don't sell your personal information. We'll only send marketing emails if you agree, and every one will have an unsubscribe link.</p>

      <h2>Who can see your information</h2>
      <ul>
        <li><b>Public:</b> a tradie's business name, photo, base suburb, service area, services, prices, ABN details, reviews and replies. A customer's first name appears on their reviews.</li>
        <li><b>Tradies in the area</b> see a job's description, suburb and the customer's first name. A customer's full name, phone and email are shared only with the tradie they hire, and the tradie's contact details only with that customer.</li>
        <li><b>Service providers</b> who help us run Nearvo, such as our hosting provider ({SITE.hostingLocation}), email provider and map tiles (OpenStreetMap), only as needed to provide their service.</li>
        <li>Authorities, if the law requires it.</li>
      </ul>

      <h2>Storage and security</h2>
      <p>Your information is stored on servers in {SITE.hostingLocation}. We use reasonable security measures, including encrypted passwords and restricted admin access. We keep information only as long as we need it for the purposes above or as required by law, then delete or de-identify it.</p>

      <h2>Access, correction and deletion</h2>
      <p>You can view and update most of your details in your account. To ask for a copy of your information, a correction, or to delete your account, email {SITE.contactEmail}. We'll respond within 30 days.</p>

      <h2>Complaints</h2>
      <p>If you have a privacy concern, contact us first at {SITE.contactEmail} and we'll respond within 30 days. If you're not satisfied, you can contact the Office of the Australian Information Commissioner (oaic.gov.au).</p>
    </LegalPage>
  );
}

export function ReportPage() {
  const [params] = useSearchParams();
  const type = ['review', 'tradie', 'job'].includes(params.get('type')) ? params.get('type') : 'other';
  const id = parseInt(params.get('id'), 10) || null;
  return (
    <div className="container container-md page">
      <div className="row mb" style={{ gap: 14 }}><IconTile icon={Flag} size={48} color="var(--red)" bg="var(--red-bg)" /><h1>Report content or make a complaint</h1></div>
      <p className="muted mb-lg">
        Use this form to report a review, profile or job that is false, defamatory, fake, offensive, a scam or shares private information. You don't need an account.
        We review every report, usually within 7 days, and email you the outcome. You can also email us at {SITE.contactEmail}.
      </p>
      <div className="card card-pad">
        <p className="small muted mb">Reporting something specific? The quickest way is the <b>Report</b> link next to the review or on the profile. Otherwise, include a link or the business name below.</p>
        <ReportForm targetType={type} targetId={id} />
      </div>
    </div>
  );
}
