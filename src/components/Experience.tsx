import { education, experience, skills } from '../data/profile';
import { SectionHead } from './SectionHead';

export function Experience() {
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead index="02" label="Experience" title="Where I've worked" />

        <ol className="timeline">
          {experience.map((job) => (
            <li key={job.company} className="timeline-item" data-reveal>
              <div className="timeline-meta">
                <span>{job.period}</span>
                <span className="muted">{job.location}</span>
              </div>
              <div className="timeline-body">
                <h3>
                  {job.role} <span className="at">at</span> {job.company}
                </h3>
                <ul className="timeline-points">
                  {job.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <ul className="tags">
                  {job.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}

          <li className="timeline-item" data-reveal>
            <div className="timeline-meta">
              <span>{education.period}</span>
              <span className="muted">Education</span>
            </div>
            <div className="timeline-body">
              <h3>
                {education.degree} <span className="at">at</span> {education.school}
              </h3>
              <p className="timeline-note">
                {education.detail} · {education.certs.join(' · ')}
              </p>
            </div>
          </li>
        </ol>

        <div className="skills" data-reveal>
          {skills.map((g) => (
            <div key={g.group} className="skill-group">
              <h3>{g.group}</h3>
              <p>{g.items.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
