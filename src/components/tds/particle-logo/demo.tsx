import { ParticleLogo } from "./particle-logo";

const LOGO = "https://thedesignstack.co.in/demo-assets/tds-mark-light.png";

export function ParticleLogoCompo() {
  return (
    <section className="tds-particledemo" id="particle">
      <ParticleLogo src={LOGO} background="#151714" />
      <div className="tds-particledemo__head">
        <div className="tds-particledemo__lg" />
        <div className="tds-particledemo__sm">
          <h3>A shared AI memory for your codebase. Instant commit insights, vector search, and meeting-to-issue workflows.</h3>
        </div>
      </div>
      <div className="tds-particledemo__foot">
        <div className="tds-particledemo__lg">
          <div>
            <p>Platform</p>
            <p>GitHub Repository Intelligence</p>
          </div>
        </div>
        <div className="tds-particledemo__sm flex flex-col gap-4">
          <div className="">
            <p>Codebase Semantic Search</p>
            <p>Automated Commit Summaries</p>
            <p>Meeting Recordings to Issues</p>
            <p>Shared Team Context & Credits</p>
          </div>
          <a href="/dashboard">
             Connect Repository
            <span aria-hidden>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}