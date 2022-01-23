import { useEffect, useState, useRef } from "react";
import BottomBar from "./HomeComponents/BottomBar";
import TopHeader from "./HomeComponents/TopHeader";
import "./HomePage.css";
import Section from "./HomeComponents/Section";

const HomePage = (props) => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // 🔴 GET USER INFO
    fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserInfo(data);
        getUserTopSongs();
        getUserPlaylists([], 0);
        getUserTopArtists();
      });
  }, [props.bpm]);

  const getUserTopSongs = () => {
    fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("🌽 TOP SHORT SONGS", data);
        // CREATE FIRST SECTION WITH THE TOP SONGS
        // TODO: add filter for the different tempos
        const userSongsToSearch = [...data.items];

        fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + props.token,
            },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            // CREATE FIRST SECTION WITH THE TOP SONGS
            // TODO: add filter for the different tempos
            getRecentCompatibleSongs([...data.items, ...userSongsToSearch]);
          });
      });
  };

  const getRecentCompatibleSongs = (listOfSongObjs) => {
    // create list of comma separated spotify ids
    var idList = "";
    console.log(listOfSongObjs);
    for (var i = 0; i < listOfSongObjs.length; i++) {
      idList = idList + listOfSongObjs[i].id + ",";
    }
    idList = idList.substring(0, idList.length - 1);
    // batch get audio analysis request
    let compatibleSongs = [];
    fetch("https://api.spotify.com/v1/audio-features?ids=" + idList, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🍋 BPM TOP SONGS", data);
        // only add correct bpm songs
        for (var i = 0; i < data["audio_features"].length; i++) {
          if (
            (parseFloat(data["audio_features"][i].tempo) < props.bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) > props.bpm - 3) ||
            (parseFloat(data["audio_features"][i].tempo) / 2 < props.bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) / 2 >
                props.bpm - 3) ||
            (parseFloat(data["audio_features"][i].tempo) * 2 < props.bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) * 2 > props.bpm - 3)
          ) {
            compatibleSongs.push(listOfSongObjs[i]);
          }
        }

        console.log("😀", userInfo);
        let sectionObj;
        // PARSEABLE OBJECT FOR SECTION
        if (Object.keys(userInfo).length > 1) {
          sectionObj = {
            sectionTitle: "Your Recent Tracks",
            sectionImg: userInfo.images[0]["url"],
            songObjs: compatibleSongs,
          };
        } else {
          sectionObj = {
            sectionTitle: "Your Recent Tracks",
            sectionImg: "none",
            songObjs: compatibleSongs,
          };
        }

        props.setSections([sectionObj]);
      });
  };

  const getUserPlaylists = (soFarPlaylists, offset) => {
    fetch("https://api.spotify.com/v1/me/playlists?limit=50&offset=" + offset, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🧑‍🎤Playlists: ", data);
        console.log(
          "🍉Playlists: ",
          data.items.length,
          data.items.length === 0
        );
        if (data.items.length < 50) {
          console.log("🐸", soFarPlaylists);
          props.setUserPlaylists([...soFarPlaylists, ...data.items]);
        } else {
          soFarPlaylists = [...soFarPlaylists, ...data.items];
          getUserPlaylists(soFarPlaylists, offset + 50);
        }
        props.setLoading(false);
      });
  };

  // TODO: get user top artists
  const getUserTopArtists = () => {
    let artistObjs = [];
    fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("💠", data);
        artistObjs = [...data.items];
        fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + props.token,
            },
          }
        )
          .then((response) => response.json())
          .then((data) => {
            for (var i = 0; i < data.items; i++) {
              let ix = artistObjs.findIndex(data.items[i]);
              if (ix !== -1) {
                artistObjs.push([...artistObjs, data.items[i]]);
              }
            }
            props.setLikedArtists([...artistObjs]);
          });
      });
  };

  return (
    <div>
      <TopHeader
        token={props.token}
        userInfo={userInfo}
        bpm={props.bpm}
        selectedSongs={props.selectedSongs}
        enterNodeHandler={props.enterNodeHandler}
        exitNodeHandler={props.exitNodeHandler}
      />
      <BottomBar
        token={props.token}
        userInfo={userInfo}
        hoverSong={props.hoverSong}
        setInNewSectionState={props.setInNewSectionState}
        userPlaylists={props.userPlaylists}
        loading={props.loading}
        setLoading={props.setLoading}
      />
      <div className="sectionBox">
        {props.sections.map((section) => (
          <Section
            enterNodeHandler={props.enterNodeHandler}
            exitNodeHandler={props.exitNodeHandler}
            onSongClickedHandler={props.onSectionSongClickedHandler}
            token={props.token}
            section={section}
            loading={props.loading}
            setLoading={props.setLoading}
          />
        ))}
      </div>
    </div>
  );
};
export default HomePage;
