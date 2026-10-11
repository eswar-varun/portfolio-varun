import { profile } from '../data/profile';
import { CopyEmail } from './CopyEmail';
import { FileText, GitHub, LinkedIn, Mail } from './Icons';

export function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container contact-inner" data-reveal>
        <p className="eyebrow">
          <span>04</span> Contact
        </p>
        <h2 className="contact-title">
          Hiring for an SDE role? <em>Let's talk.</em>
        </h2>
        <p className="contact-lede">
          Based in {profile.location}. Email is the fastest way to reach me.
        </p>
        <div className="contact-actions">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            <Mail width={16} height={16} /> Email me
          </a>
          <CopyEmail />
        </div>
        <ul className="contact-links">
          <li>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <LinkedIn width={16} height={16} /> LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              <GitHub width={16} height={16} /> GitHub
            </a>
          </li>
          <li>
            <a href={profile.links.resume} target="_blank" rel="noreferrer">
              <FileText width={16} height={16} /> Resume (PDF)
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span>
          Built with React and TypeScript, live data from the GitHub API.
          {profile.sourceRepo && (
            <>
              {' '}
              <a href={profile.sourceRepo} target="_blank" rel="noreferrer">
                View source
              </a>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
