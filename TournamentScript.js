function createTournamentTabs() {
  // Get the active spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Check if A Bracket tab already exists, delete if it does
  var existingABracket = ss.getSheetByName('A Bracket');
  if (existingABracket) {
    ss.deleteSheet(existingABracket);
  }

  // Check if B Bracket tab already exists, delete if it does
  var existingLoosers = ss.getSheetByName('B Bracket');
  if (existingLoosers) {
    ss.deleteSheet(existingLoosers);
  }

  // Create new Winners tab
  var ABracketSheet = ss.insertSheet('A Bracket');

  // Create new Loosers tab
  var BBracketSheet = ss.insertSheet('B Bracket');

  // Get the players sheet and player data
  var playersSheet = ss.getSheetByName('Players');
  var playersData = playersSheet.getRange('B2:C' + playersSheet.getLastRow()).getValues();
  
  // Remove any empty rows
  playersData = playersData.filter(player => player[0] && player[1]);

  // Check if number of players is less then 4 and it is mod 8. If not, then add John Doe players
  if (playersData.length <=4) {
    modifyPlayersData(playersData, 4);
  } else {
    modifyPlayersData(playersData, 8);
  }
  
  // Shuffle the players for random matchups
  playersData = shuffleArray(playersData);
  
  // Calculate the number of rounds
  var numberOfAllPlayers = playersData.length;
  var numberOfBPlayers;
  if (numberOfAllPlayers % 2 === 0) {
        numberOfBBracketPlayers = numberOfAllPlayers / 2;
    } else {
        numberOfBBracketPlayers = (numberOfAllPlayers - 1) / 2;
    }
  var ABracketNumRounds = Math.ceil(Math.log2(numberOfAllPlayers));
  var BBRacketNumRounds = Math.ceil(Math.log2(numberOfBBracketPlayers));

  // Generate the initial matches
  var rounds = [];
  rounds.push(generateMatches(playersData));

  // Generate subsequent rounds with randomized opponents
  for (var i = 1; i < ABracketNumRounds; i++) {
    var previousRoundWinners = rounds[i - 1].map(match => match.winner).filter(player => player !== null);
    previousRoundWinners = shuffleArray(previousRoundWinners); // Shuffle winners for random matchups
    rounds.push(generateMatches(previousRoundWinners));
  }

  // Fill in the sheet with the match data
  //fillWinnersSheet(ABracketSheet, rounds);
  //createMatch(ABracketSheet,10,3,"up", "Marek", "Peto");
  //createMatch(ABracketSheet,14,3,"down", "Marek", "Peto");
  createTournament(ABracketSheet, playersData);
  //writePlayers(ABracketSheet, playersData);
}

function modifyPlayersData(playersData, mod) {
  if (playersData.length % mod !== 0) {
    for (var i = 1; i < mod; i++) {
      if ((playersData.length + i) % 8 === 0) {
        for (var j = 1; j <= i; j++) {
          playersData.push(['John', 'Doe']);
        }
      }
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function writePlayers(sheet, playersData) {
  for (var i = 0; i < playersData.length; i++) {
    sheet.getRange(20 + i, 1).setValue(playersData[i][0] + ' ' + playersData[i][1]);
  }
}

function generateMatches(playersData) {
  var matches = [];
  for (var i = 0; i < playersData.length; i += 2) {
    var player1 = playersData[i];
    var player2 = playersData[i + 1] || ['BYE', ''];
    matches.push({
      player1: player1,
      player2: player2,
      winner: player2[0] === 'BYE' ? player1 : null
    });
  }
  return matches;
}

function fillWinnersSheet(sheet, rounds) {
  for (var roundIndex = 0; roundIndex < rounds.length; roundIndex++) {
    var colOffset = roundIndex * 3;
    sheet.getRange(1, 1 + colOffset).setValue('Round ' + (roundIndex + 1));
    var row = 2;
    rounds[roundIndex].forEach(match => {
      if (match.player1 && match.player2) {
        sheet.getRange(row, 1 + colOffset).setValue(match.player1[0] + ' ' + match.player1[1]);
        sheet.getRange(row + 1, 1 + colOffset).setValue(match.player2[0] + ' ' + match.player2[1]);
        sheet.getRange(row, 2 + colOffset).setValue('');
        sheet.getRange(row + 1, 2 + colOffset).setValue('');
        sheet.getRange(row, 3 + colOffset).setValue('');
        sheet.getRange(row + 1, 3 + colOffset).setValue('');
        if (match.winner) {
          sheet.getRange(row, 4 + colOffset).setValue(match.winner[0] + ' ' + match.winner[1]);
        } else {
          sheet.getRange(row, 4 + colOffset).setFormula('=IF(B' + row + '>B' + (row + 1) + ';A' + row + ';A' + (row + 1) + ')');
        }
        row += 2;
      }
    });
  }
}

function createMatch(sheet, row, column, offset, orientation, player1, player2) {
  sheet.getRange(row, column).setValue(player1);
  sheet.getRange(row, column).setBorder(true, true, true, true, false, false);
  sheet.getRange(row + 1, column).setValue(player2);
  sheet.getRange(row + 1, column).setBorder(true, true, true, true, false, false);
  //sheet.getRange(row, column + 1).setValue(1);
  sheet.getRange(row, column + 1).setBorder(true, true, true, true, false, false);
  //sheet.getRange(row + 1, column + 1).setValue(1);
  sheet.getRange(row + 1, column + 1).setBorder(true, true, true, true, false, false);
  if (orientation == "up") {
    //sheet.getRange(row + 1, column + 2).setValue(1);
    sheet.getRange(row + 1, column + 2).setBorder(false, true, true, false, false, false);
    for (var i =1; i <= offset; i++) {
      sheet.getRange(row + 1 + i, column + 3).setBorder(false, true, false, false, false, false);
    }
  } else if (orientation == "down") {
    //sheet.getRange(row, column + 2).setValue(1);
    sheet.getRange(row, column + 2).setBorder(true, true, false, false, false, false);
    for (var i =1; i <= offset; i++) {
      sheet.getRange(row - i, column + 3).setBorder(false, true, false, false, false, false);
    }
  }
}

function createTournament(sheet, playersData) {
  var numberOfPlayers = playersData.length;
  var numberOfBrackets;
  var rounds = Math.ceil(Math.log2(numberOfPlayers));
  var initNumber = 2;
  for (var round = 1; round <= rounds; round++) {
    var offset = 2 ** round - 2;
    var space = 2 ** (round + 1) -2;
    var iteration = 1;
    for (var i = 1; i <= numberOfPlayers / round; i += 2) {
      if (round !== rounds) {
        if (iteration % 2 === 0) {
          var orientation = "down";
        } else {
          var orientation = "up";
        }
      } else {
        var orientation = "none";
      }
      if (round === 1) {
        var player1 = playersData[i - 1];
        var player2 = playersData[i];
      } else {
        var player1 = ['', ''];
        var player2 = ['', ''];
      }
      if (iteration === 1) {
        createMatch(sheet,initNumber + offset, 1 + 3 * (round - 1), offset, orientation, player1[0] + " " + player1[1], player2[0] + " " + player2[1]);
      } else {
        createMatch(sheet,initNumber + offset + (space + 2) * (iteration - 1), 1 + 3 * (round - 1), offset, orientation, player1[0] + " " + player1[1], player2[0] + " " + player2[1]);
      }
      iteration = iteration + 1;
    }
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Tournament')
      .addItem('Generate Brackets', 'createTournamentTabs')
      .addToUi();
}
