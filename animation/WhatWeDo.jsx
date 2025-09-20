function WhatWeDo() {
  const [active, setActive] = React.useState(2); // mặc định chọn SmartKey

  const buttons = ["Face ID", "Tracking", "SmartKey", "Remote"];

  const features = [
    "Facial Recognition Access",
    "Smartkey Management",
    "Data & Activity Tracking",
    "Remote Control & Alerts",
  ];

  const imageMap = {
    Face_ID: "./design/SOURCE_IMAGE/faceid.jpg",
    Tracking: "./design/SOURCE_IMAGE/tracking.jpg",
    SmartKey: "./design/SOURCE_IMAGE/3ab22c03a786bba289ba84a859ca6a16.jpg",
    Remote: "./design/SOURCE_IMAGE/remote.jpg",
  };

  return (
    <section className="what-we-do">
      <div className="header-row">
        <h2>WHAT WE DO</h2>
        <div className="button-group">
          <div className="row">
            {buttons.slice(0, 2).map((btn, i) => (
              <button
                key={btn}
                className={active === i ? "active" : ""}
                onClick={() => setActive(i)}
              >
                {btn}
              </button>
            ))}
          </div>
          <div className="row">
            {buttons.slice(2).map((btn, i) => (
              <button
                key={btn}
                className={active === i + 2 ? "active" : ""}
                onClick={() => setActive(i + 2)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="content-row">
        <ul className="features">
          {features.map((f, i) => (
            <li key={i} className={active === i ? "active" : ""}>
              <span className="number">{`0${i + 1}`}</span>
              {f}
              <span className="arrow">➜</span>
            </li>
          ))}
        </ul>

        <div className="feature-image">
          <img src={imageMap[buttons[active]]} alt={buttons[active]} />
        </div>
      </div>
    </section>
  );
}
