import React, { useEffect, useState, useRef } from "react";
import { SpotifyAuth, Scopes } from "react-spotify-auth";

import { SpotifyApiContext } from "react-spotify-api";

import Cookies from "js-cookie";

import HomePage from "./components/HomePage";
import "./App.css";
import InitialPopup from "./components/InitialPopup";
import NewSectionPopup from "./components/NewSectionPopup";

const App = () => {
  const [spotifyAuthToken, setSpotifyAuthToken] = useState();

  //state management
  const [inInitialState, setInInitialState] = useState(true);
  const [inNewSectionState, setInNewSectionState] = useState(false);

  // homepage things
  const [bpm, setBpm] = useState(0.0);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [likedGenres, setLikedGenres] = useState({});
  const [sections, setSections] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState({});

  // handle hovering
  const [hoverSong, setHoverSong] = useState({});
  const audioRef = useRef(new Audio(""));

  // hovering for song
  const enterNodeHandler = (hoverSong) => {
    setHoverSong(hoverSong);
    audioRef.current = new Audio(hoverSong.preview_url);
    audioRef.current.play();

    //get and set extra info for bottom player
    fetch(hoverSong["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setHoverSong({ ...hoverSong, artist_data: data });
      });
  };
  const exitNodeHandler = (song) => {
    audioRef.current.pause();
    setHoverSong({});
  };

  // handle first song clicked
  const initialSongClicked = (songObj) => {
    audioRef.current.pause();
    setInInitialState(false);
    setSelectedSongs([songObj]);
    setHoverSong({});

    getUserTopGenres();

    //get starting BPM
    fetch("https://api.spotify.com/v1/audio-features/" + songObj.id, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setBpm(parseFloat(data.tempo));
      });

    //get and set extra selected genres
    fetch(hoverSong["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // set bpm for rest
        setSelectedGenres([...data["genres"]]);
      });
  };

  // when song is clicked within homepage section
  const onSectionSongClickedHandler = (songClicked) => {
    setSelectedSongs([...selectedSongs, songClicked]);

    //get and add new selected genres
    fetch(songClicked["artists"][0]["href"], {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // update genres
        let genresToAdd = [];
        for (var i = 0; i < data["genres"].length; i++) {
          let genreToCheck = data["genres"][i];
          console.log("💗", genreToCheck);
          if (genreToCheck in selectedGenres) {
          } else {
            genresToAdd.push(genreToCheck);
            console.log("🎆", genreToCheck);
          }
        }
        setSelectedGenres([...selectedGenres, ...genresToAdd]);
      });
  };

  // 💠 genre clicked
  const genreClickedHandler = (genreName) => {
    setInNewSectionState(false);
    console.log("💠", genreName);

    let playlistName = "The Sound of " + genreName;
    let genreNameQuery = playlistName.replaceAll(" ", "%20");
    console.log(genreNameQuery);

    let genreSongObjs = [];

    // search for sound of genre
    fetch(
      "https://api.spotify.com/v1/search?type=playlist&q=" + genreNameQuery,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data["playlists"]["items"][0]);

        // get song objs from list
        fetch(data["playlists"]["items"][0]["tracks"]["href"], {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data["items"]);
            genreSongObjs = [...data["items"]];

            let genreSectionTitle = "GENRE: " + genreName;
            getCompatibleSongsAndMakeSection(genreSongObjs, genreSectionTitle);
          });
      });
  };

  // helper for getting playlist tracks
  const getPlaylistTracks = (href, sofar, playlistName) => {
    // get playlist tracks
    fetch(href, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.next !== null) {
          getPlaylistTracks(data.next, [...sofar, ...data.items], playlistName);
        } else {
          getCompatibleSongsAndMakeSection(
            [...sofar, ...data.items],
            "PLAYLIST: " + playlistName
          );
        }
      });
  };

  // 💠 playlist clicked
  const playlistClickedHandler = (playlistId) => {
    setInNewSectionState(false);
    console.log("💠", playlistId);

    // get playlist tracks
    fetch("https://api.spotify.com/v1/playlists/" + playlistId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("spotifyAuthToken"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        getPlaylistTracks(data.tracks.href, [], data.name);
      });
  };

  // load list of song objs and title
  // adds new section
  const getCompatibleSongsAndMakeSection = (listOfSongObjs, title) => {
    // create list of comma separated spotify ids
    var idList = "";
    console.log(listOfSongObjs);
    for (var i = 0; i < listOfSongObjs.length; i++) {
      idList = idList + listOfSongObjs[i]["track"].id + ",";
    }
    idList = idList.substring(0, idList.length - 1);
    // console.log("ID LIST:", idList);
    // batch get audio analysis request
    let compatibleSongs = [];
    fetch("https://api.spotify.com/v1/audio-features?ids=" + idList, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + spotifyAuthToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("🐸 BPM  sound of SONGS", data);
        // only add correct bpm songs
        for (var i = 0; i < data["audio_features"].length; i++) {
          if (
            (parseFloat(data["audio_features"][i].tempo) < bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) > bpm - 3) ||
            (parseFloat(data["audio_features"][i].tempo) / 2 < bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) / 2 > bpm - 3) ||
            (parseFloat(data["audio_features"][i].tempo) * 2 < bpm + 3 &&
              parseFloat(data["audio_features"][i].tempo) * 2 > bpm - 3)
          ) {
            compatibleSongs.push(listOfSongObjs[i]["track"]);
          }
        }
        let sectionObj = {
          sectionTitle: title,
          sectionImg: "TODO",
          songObjs: compatibleSongs,
        };
        // console.log("🟠", sectionObj);
        setSections([...sections, sectionObj]);
        // console.log("💦", compatibleSongs);
      });
  };

  // get users top genres
  const getUserTopGenres = () => {
    let currentGenres = {};
    fetch(
      "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + spotifyAuthToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // iterate over artists and get artists genre
        for (var i = 0; i < data["items"].length; i++) {
          // get artist's genre
          fetch(data["items"][i]["href"], {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + spotifyAuthToken,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              // add genre if not in liked genres
              for (var i = 0; i < data["genres"].length; i++) {
                let genreToCheck = data["genres"][i];
                if (genreToCheck in currentGenres) {
                  let newGenreObj = { ...currentGenres };
                  newGenreObj[genreToCheck] = newGenreObj[genreToCheck] + 1;
                  currentGenres = { ...newGenreObj };
                } else {
                  let newGenreObj = { ...currentGenres };
                  newGenreObj[genreToCheck] = 1;
                  currentGenres = { ...newGenreObj };
                }
              }
              setLikedGenres({ ...currentGenres });
            });
        }
      });
  };

  // get spotify auth token
  useEffect(() => {
    setSpotifyAuthToken(Cookies.get("spotifyAuthToken"));
  }, [Cookies.get("spotifyAuthToken")]);

  return (
    <div className="app">
      {/* If there is a cookie named 'spotifyAuthToken' */}
      {Cookies.get("spotifyAuthToken") ? (
        <SpotifyApiContext.Provider token={spotifyAuthToken}>
          <HomePage
            exitNodeHandler={exitNodeHandler}
            enterNodeHandler={enterNodeHandler}
            setSelectedSongs={setSelectedSongs}
            onSectionSongClickedHandler={onSectionSongClickedHandler}
            hoverSong={hoverSong}
            token={spotifyAuthToken}
            bpm={bpm}
            sections={sections}
            setSections={setSections}
            selectedSongs={selectedSongs}
            setInNewSectionState={setInNewSectionState}
            setUserPlaylists={setUserPlaylists}
            userPlaylists={userPlaylists}
          />
          {inInitialState && (
            <InitialPopup
              exitNodeHandler={exitNodeHandler}
              enterNodeHandler={enterNodeHandler}
              onNodeClicked={initialSongClicked}
              token={spotifyAuthToken}
            />
          )}
          {inNewSectionState && (
            <NewSectionPopup
              exitNodeHandler={exitNodeHandler}
              enterNodeHandler={enterNodeHandler}
              onNodeClicked={initialSongClicked}
              genreClickedHandler={genreClickedHandler}
              playlistClickedHandler={playlistClickedHandler}
              token={spotifyAuthToken}
              setInNewSectionState={setInNewSectionState}
              sections={sections}
              setSections={setSections}
              selectedGenres={selectedGenres}
              likedGenres={likedGenres}
              userPlaylists={userPlaylists}
            />
          )}
        </SpotifyApiContext.Provider>
      ) : (
        <div className="loginDiv">
          SPOTIFY BPM EXPLORER
          <br></br>
          <SpotifyAuth
            className="spotifyButton"
            redirectUri="https://spotify-bpm-explorer.netlify.app"
            clientID="9889f705281f4cd280769c43129189f7"
            scopes={[
              Scopes.userReadPrivate,
              "user-read-email",
              "user-top-read",
              "playlist-modify-private",
              "playlist-read-collaborative",
              "playlist-read-private",
              "playlist-modify-public",
            ]} // either style will work
          />
          <br></br>
          <br></br>
          by <a href="http://www.trudy.computer/">Trudy Painter</a>
        </div>
      )}
    </div>
  );
};

export default App;
