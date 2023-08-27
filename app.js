//CODING PRACTICE 7

const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initilizeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
    playerMatchId: dbObject.player_match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  };
};

//Get all players
app.get("/players/", async (request, response) => {
  const allPlayers = `
    SELECT *
    FROM
    player_details`;
  const playersArray = await db.all(allPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Get a Single Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
    *
    FROM
    player_details
    WHERE
    player_id = ${playerId};`;
  const playerArray = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(playerArray));
});

//Update a Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const playerInfo = `
    UPDATE
      player_details
    SET
      player_name='${playerName}'
    WHERE
      player_id = '${playerId}';`;
  const final = await db.run(playerInfo);
  const final_1 = convertDbObjectToResponseObject(final);
  response.send("Player Details Updated");
});

//Get a Single Player Match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayer = `
    SELECT
    *
    FROM
    match_details
    WHERE
    match_id = ${matchId};`;
  const playerArray = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(playerArray));
});

//Get all Matches of a player
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const allPlayers = `
    SELECT 
    match_id,match,year
    FROM
    player_match_score 
    NATURAL JOIN match_details
    WHERE 
    player_id = ${playerId};`;
  const playersArray = await db.all(allPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Get all list of players for a specific match
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const allPlayers = `
    SELECT 
    player_id,player_name
    FROM
    player_match_score NATURAL JOIN player_details
    WHERE
    match_id = ${matchId}`;
  const playersArray = await db.all(allPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Get Stats and Player Details
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes 
    FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE
    player_details.player_id = ${playerId};
    `;
  const playerArray = await db.get(getPlayer);
  response.send(playerArray);
});

module.exports = app;
