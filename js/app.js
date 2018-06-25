var app = (function (window) {
  'use strict';
  const API = 'https://nba-players.herokuapp.com/';
  const stats = [
    {"label":"ppg", "property":"points_per_game"},
    {"label":"mpg", "property":"minutes_per_game"},
    {"label":"fg%", "property":"field_goal_percentage"},
    {"label":"ft%", "property":"free_throw_percentage"},
    {"label":"3pt%", "property":"three_point_percentage"},
    {"label":"rpg", "property":"rebounds_per_game"},
    {"label":"apg", "property":"assists_per_game"},
    {"label":"spg", "property":"steals_per_game"},
    {"label":"bpg", "property":"blocks_per_game"},
    {"label":"tpg", "property":"turnovers_per_game"},
  ];
  let roster = [];

  // function for dynamic sorting
  function compareNumericValues(key, order='asc') {
    return function(a, b) {
     
      if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
          return 0; 
      }

      return (
        (order == 'asc') ? (a[key] - b[key]) : (b[key] - a[key])
      );
    };
  }

  function findStatByProperty (value) {
    console.log(value);
    const stat = stats.find( obj => obj['property'] === value);
    console.log("stat",stat);
    return stat;
  }

  function getTeam () {
    return document.getElementById("team").value;
  }

  function getTeams() {
    const url = API + 'teams';
    const request = new Request(url);

    fetch(request)
      .then(response => response.json())
      .then(response => {
        displayTeams(response);
        const team = getTeam();
        getRoster(team);
      });
  }

  function displayTeams(teams) {

    const selector = document.getElementById("team");
    selector.innerHTML = "";
    // set listener once on init
    selector.addEventListener("change", updateRoster);

    teams.forEach( (team) => {
      const option = document.createElement('option');
      option.value = team;
      option.innerHTML = team;
      selector.appendChild(option);
    });
  }

  function enhanceTeamData () {
    // add full name
    // add colors
    // location
    // name
  }

  function updateRoster(event) {
    const team = this.value;
    console.log("////////" + team + "////////");
    getRoster(team);
  }

  function clearRoster() {
    const rosterContainer = document.getElementById("roster");
    if (rosterContainer) {
      rosterContainer.innerHTML = "";
    }
  }

  function calculateNumColumns (numItems) {
    let numColumns = 6;
    let lowestDiff = Math.abs(numItems % numColumns - numColumns);

    for (let i = numColumns; i > 2; i--) {
      const remaining = (numItems % i);
      const diff = Math.abs(remaining - i);

      if (remaining == 0) {
        return i;
      }

      if (lowestDiff > diff) {
        lowestDiff = diff;
        numColumns = i;
      }
    }

    return numColumns;
  } 

  function getRoster(team) {
    const url = API + 'players-stats-teams/' + team;
    const request = new Request(url);

    fetch(request)
      .then(response => response.json())
      .then(response => {
        roster = response;
        setRosterHeading(roster[0]['team_name']);
        refreshRoster(roster);
      }); 
  }

  function refreshRoster(roster) {
    clearRoster();
    displayRoster(roster);
  }

  function createRow () {
    const row = document.createElement('div');
    row.classList.add("columns","is-variable");
    return row;
  }

  function addKeyStat (label, value) {
    const statContainer = document.createElement('div');
    statContainer.classList.add("stat");

    const labelElement = document.createElement('label');
    labelElement.classList.add("heading");
    labelElement.innerHTML = label;

    const valueElement = document.createElement('span');
    valueElement.classList.add("title");
    valueElement.innerHTML = value;

    statContainer.appendChild(labelElement);
    statContainer.appendChild(valueElement);

    return statContainer;
  }

  function addStat (label, value) {
    const statContainer = document.createElement('div');
    statContainer.classList.add("stat");

    const labelElement = document.createElement('label');
    labelElement.classList.add("heading");
    labelElement.innerHTML = label;

    const valueElement = document.createElement('span');
    valueElement.innerHTML = value;

    statContainer.appendChild(labelElement);
    statContainer.appendChild(valueElement);

    return statContainer;
  }

  function handleImageLoadError (error) {

    // if (this.src.split('/').length == 6) {
    //   this.src = this.src.substr(0, this.src.lastIndexOf('/'));
    // } else {
      this.src = "./images/default.png";
    //}
  }

  function createRosterLayout (roster, sortBy) {
    const rosterCells = document.createDocumentFragment();
    const leaders = 3;
    const numColumns = calculateNumColumns(roster.length - leaders);
    let row;
    
    roster.forEach( (player, index) => {

      if (index === 0) {
        row = createRow();
        row.classList.add("leaders");
        rosterCells.appendChild(row);
      } 
      if (index >= leaders) {
        if ( (index - leaders) % numColumns === 0 ) {
          row = createRow();
          rosterCells.appendChild(row);
        }
      }
      
      const column = document.createElement('div');
      if (index == 0) {
        column.classList.add("is-two-fifths");
      } else if (index >= leaders) {
        column.classList.add("is-one-fifth");
      }
      column.classList.add("column");
      const playerDetails = document.createElement('div');
      playerDetails.classList.add("player-details");

      const playerImage = document.createElement('img');
      playerImage.src = getImageUrl(player.name);
      playerImage.onerror = handleImageLoadError;
      playerDetails.appendChild(playerImage);

      const playerName = document.createElement('p');
      playerName.classList.add("name","subtitle");
      playerName.innerHTML = player.name;

      playerDetails.appendChild(playerName);

      const keyStat = findStatByProperty(sortBy);
      const keyStatContainer = document.createElement('div');
      keyStatContainer.classList.add('key-stat');
      keyStatContainer.appendChild(addKeyStat( keyStat['label'],player[ keyStat['property'] ]));
      playerDetails.appendChild( keyStatContainer );

      const statsContainer = document.createElement('div');
      statsContainer.classList.add('stats');
      stats.forEach( stat => {

        const {label, property} = stat;
        if (property !== sortBy) {
          statsContainer.appendChild( addStat( label, player[property] ) );
        }
      })

      playerDetails.appendChild( statsContainer );
      column.appendChild(playerDetails);
      row.appendChild(column);
    });   

    return rosterCells;
  }

  function getImageUrl (name) {
    const nameWashed = name.replace(/[^\-\w\s]/gi, '');
    const nameSplit = nameWashed.split(' ');
    const firstname = nameSplit[0];
    let surname = nameSplit[1];

    if (nameSplit.length > 2) {
      surname += "_" + nameSplit[2];
      console.log("surname",surname);
    } 

    return `${API}players/${surname}/${firstname}`;
  }


  function getSortBy () {
    return document.getElementById("sort-by").value;
  }

  function displayRoster(roster) {
    const sortBy = getSortBy();
    const rosterContainer = document.getElementById("roster");
    // sort roster by ppg
    roster.sort(compareNumericValues(sortBy,'desc'));
    console.log(roster);
    // add roster cells
    rosterContainer.appendChild( createRosterLayout(roster, sortBy) );
  }

  function setRosterHeading (text) {
    const heading = document.getElementById("roster-heading");
    heading.innerHTML = text;
  }

  function createHeading(text) {
    const heading = document.createElement('h1');
    heading.innerHTML = text;
    heading.classList.add("title");
    return heading;
  }

  function initLayout () {
    const app = document.getElementById('app');
  }

  function sortRoster (event) {
    console.log(this.value);
    const currentRoster = roster;
    refreshRoster(currentRoster);
  }

  function initSortBy () {
    const selector = document.getElementById("sort-by");
    stats.forEach( stat => {
      const option = document.createElement('option');
      option.value = stat['property'];
      option.innerHTML = stat['label'];
      selector.appendChild(option);
    });

    selector.addEventListener("change",sortRoster);
  }

  function init() {
    initSortBy();
    getTeams();
  }

  return {
    init: init
  }

})(window);
