import { useEffect, useState } from "react";
import RecentSongs from "../PopupComponents/RecentSongs";
import SongSearch from "../PopupComponents/SongSearch";
import "./InitialPopup.css";

const InitialPopup = (props) => {
  return (
    <div>
      <div className="initialPopupBackground"></div>
      <div className="initialPopup">
        <div className="initTitle">Pick a seed song to start.</div>
        <RecentSongs
          enterNodeHandler={props.enterNodeHandler}
          exitNodeHandler={props.exitNodeHandler}
          onNodeClicked={props.onNodeClicked}
          token={props.token}
        />
        <div className="initTitle">
          Or search for a song below... <br></br> (if songs aren't playing...
          just click anywhere on this box and try again)
        </div>
        <SongSearch
          enterNodeHandler={props.enterNodeHandler}
          exitNodeHandler={props.exitNodeHandler}
          onNodeClicked={props.onNodeClicked}
          token={props.token}
        />
        <div className="initTitle"></div>
      </div>
    </div>
  );
};
export default InitialPopup;
