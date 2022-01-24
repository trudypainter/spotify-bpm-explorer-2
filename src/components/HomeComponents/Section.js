import { useEffect, useState } from "react";
import "./Section.css";
import SongItem from "../GeneralComponents/SongItem";

const Section = (props) => {
  const [entered, setEntered] = useState(true);
  const headingStyle = {
    backgroundColor: props.section.sectionColor,
  };
  console.log("🍓HEADING", headingStyle);

  return (
    <div className="sectionContainer">
      <div style={headingStyle} className="sectionTitle">
        <div className="titleText">{props.section.sectionTitle} </div>
      </div>
      <div className="sectionSongBox">
        {props.section.songObjs.map((songObj) => (
          <div className="sectionTest">
            <SongItem
              enterNodeHandler={props.enterNodeHandler}
              exitNodeHandler={props.exitNodeHandler}
              onSongClickedHandler={props.onSongClickedHandler}
              songObj={songObj}
              entered={entered}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Section;
