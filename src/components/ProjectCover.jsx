// A generated "screenshot" used until a project has a real image or video.
// `variant` changes the mock layout so neighbouring cards don't look identical.
export default function ProjectCover({ title, accent, variant = 0 }) {
  // "Project One: AI Study Companion" → "AI Study" + accented "Companion".
  const [name, ...rest] = title.split(":");
  const words = (rest.join(":").trim() || name).split(" ");
  const last = words.pop();

  return (
    <div className="cover" style={{ "--c": accent }} aria-hidden="true">
      <div className="cover__window">
        <div className="cover__bar">
          <i />
          <i />
          <i />
          <span className="cover__url" />
        </div>
        <div className="cover__content">
          <div className="cover__title">
            {words.join(" ")} <em>{last}</em>
          </div>
          <div className="cover__line" style={{ width: "72%" }} />
          <div className="cover__line" style={{ width: "54%" }} />
          {variant % 3 === 0 && (
            <div className="cover__row">
              <span className="cover__tile" />
              <span className="cover__tile" />
              <span className="cover__tile" />
            </div>
          )}
          {variant % 3 === 1 && (
            <div className="cover__chart">
              {[40, 65, 50, 85, 60, 95, 75, 55].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          )}
          {variant % 3 === 2 && <span className="cover__btn" />}
        </div>
      </div>
    </div>
  );
}
