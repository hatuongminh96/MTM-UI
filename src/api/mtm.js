import moment from 'moment';
import axios from 'axios';
import Song from '../entities/Song.js';
import SongRank from '../entities/SongRank.js';
import MediaItem from '../entities/MediaItem.js';
import ChartPosition from '../entities/ChartPosition.js';

const BASE_URL = "http://localhost:8888/api";

export default class MusicAPI {

  constructor() { }

  /**
   * Handles errors in request
   */
  static handleError = (error) => {
    var message = "Unreachable server error";
    if (error.response.data.errors[0] != undefined) {
      message = error.response.data.errors[0].details;
    }

    throw new Error(message);
  };

  /**
   * Get songs in the billboard chart in a given date
   */
  static getChart = (date) => {

    let query = `SELECT DISTINCT ?position ?name ?id ?name1 
    WHERE {
      ?Chart a schema:MusicPlaylist;
        schema:datePublished "${date}";
        schema:track ?ListItem0.
      ?ListItem0 a schema:ListItem;
        schema:item ?Song;
        schema:position ?position.
      ?Song a schema:MusicRecording;
        schema:name ?name;
        schema:byArtist ?Artist;
        billboard:id ?id.
      ?Artist a schema:MusicGroup;
        schema:name ?name1
    }`;
    let LRA_URL = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);
    
    return axios.get(LRA_URL)
      .then(function (res) {

        let result = res.data.table.rows;
        let chart = [];

        result.forEach((chartItem) => {
          chart.push(new ChartPosition(chartItem['?position'], chartItem['?id'], chartItem['?name'], chartItem['?name1']));
        });

        return chart;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
};

  /**
   * Get song information given an id
   */
  static getSongInfo = (id) => {

    // let url = BASE_URL + "/songs/" + id;
    let query = `SELECT DISTINCT ?name ?duration ?url ?name1 ?albumRelease ?image ?album_name 
    WHERE {
      ?Song a schema:MusicRecording;
        schema:name ?name;
        schema:duration ?duration;
        schema:url ?url;
        billboard:id "${id}";
        schema:byArtist ?Artist;
        schema:inAlbum ?Album.
      ?Artist a schema:MusicGroup;
        schema:name ?name1.
      ?Album a schema:MusicAlbum;
        schema:albumRelease ?albumRelease;
        schema:image ?image;
        schema:name ?album_name
    }`
    let url = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);

    return axios.get(url)
	.then( function(response) {
    let result = response.data.table.rows[0];
    let song = new Song(id, result['?name'], result['?name1'], result['?album_name'], result['?albumRelease'], result['?duration'], result['?url'], result['?image']);
		return song;
	})
	.catch( function(error) {
		MusicAPI.handleError(error);
	});

  }

  /**
   * Get historical ranks of a song given an id
   */
  static getSongRankings = (id) => {
    // let requestUrl = BASE_URL + "/songs/" + id + "/ranks";
    let query = `SELECT DISTINCT ?datePublished ?position 
    WHERE {
      ?Chart a schema:MusicPlaylist;
        schema:datePublished ?datePublished;
        schema:track ?ListItem0.
      ?ListItem0 a schema:ListItem;
        schema:item ?Song;
        schema:position ?position.
      ?Song a schema:MusicRecording;
        billboard:id "${id}"
    }`;
    let requestUrl = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);

    return axios.get(requestUrl)
      .then(function (res) {
        let result = res.data.table.rows;
        let rankings = [];

        result.forEach((ranking) => {
          rankings.push(new SongRank(ranking['?datePublished'], ranking['?position']));
        });

        return rankings;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }

  /**
   * Get related media of a song given an id.
   */
  static getSongMedia = (id) => {
    // let requestUrl = BASE_URL + "/songs/" + id + "/media?n=4";
    let query = `SELECT DISTINCT ?url ?thumbnail ?name 
    WHERE {
      ?Media a schema:MediaObject;
        schema:url ?url;
        schema:image ?thumbnail;
        schema:name ?name.
      ?MusicRecording a schema:MusicRecording;
        schema:subjectOf ?Media;
        billboard:id "${id}"
    }`;
    let requestUrl = "http://localhost:9000/api/lra/query?q=" + encodeURIComponent(query);
    return axios.get(requestUrl)
      .then(function (response) {
        let result = response.data.table.rows;
        let media = [];
        console.log(result);
        result.forEach((mediaObj) => {
          media.push(new MediaItem(mediaObj['?url'], mediaObj['?name'],
            mediaObj['?thumbnail']));
        });

        return media;
      })
      .catch(function (error) {
        MusicAPI.handleError(error);
      });
  }
}
