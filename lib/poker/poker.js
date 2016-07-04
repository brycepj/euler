const fs = require('fs-extra');

const pokerHands = fs.readFileSync(
  '/home/bryce/_repos/euler-problems/bin/data/poker.txt',
  'utf-8').split('\n');

var handResults = {
  "1": 0,
  "2": 0,
};

const face2Num = {
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
};

var handsValidators = {
  '10': royalFlushCheck,
  '9': straightFlushCheck, // * top of straight
  '8': fourOfAKindCheck, // set card
  '7': fullHouseCheck, // * set card
  '6': flushCheck, // * top flush card
  '5': straightCheck, // top straight card
  '4': threeOfAKindCheck, // * set card
  '3': twoPairCheck, // * both pair cards, and next
  '2': onePairCheck, // * pair card, and next
  '1': highCardCheck // * high card, and all next
};

var parsedHands = parseRawHands(pokerHands);

function run() {
  parsedHands.forEach((game, idx) => {
    storeWinner(determineWinner(game[0], game[1]));
  });

  console.log(handResults);
}

function storeWinner(winner) {
  handResults[winner]++;
}

function determineWinner(handOne, handTwo) {
  var parsedHandOne = determineHand(handOne);
  var parsedHandTwo = determineHand(handTwo);
  return parsedHandOne.key > parsedHandTwo.key ?
    1 : (parsedHandOne.key === parsedHandTwo.key ?
      handleTie(parsedHandOne.details, parsedHandTwo.details) : 2);
}

function handleTie(detailsOne, detailsTwo) {
  var winner; // both params are arrays
  detailsOne.forEach((val, idx) => {
    var foe = detailsTwo[idx];
    if (val > foe) {
      winner = 1;
      return;
    } else if (val < foe) {
      winner = 2;
      return;
    }
  });
  if (winner != 1 && winner != 2) {
    console.log("HEY YO", detailsOne, detailsTwo)
  }
  return winner;
}

function determineHand(hand) {
  var bestHand;
  for (var handKey = 10; handKey > 0; handKey--) {
    var handCheck = handsValidators[handKey](hand);
    if (handCheck) {
      bestHand = {
        key: handKey,
        details: handCheck
      };
      break;
    }
  }
  return bestHand;
}


function highCardCheck(hand) {
  return getHandValues(hand).reverse();
}

function royalFlushCheck(hand) {
  return royalCheck(hand) && flushCheck(hand) && straightCheck(hand);
}


function straightFlushCheck(hand) {
  var checkFlush = flushCheck(hand);
  var checkStraight = straightCheck(hand);
  return !!checkFlush && !!checkStraight ? checkStraight : false;
}

function fourOfAKindCheck(hand) {
  return ofAKindCheck(4, hand);
}

function threeOfAKindCheck(hand) {
  return ofAKindCheck(3, hand);
}

function twoPairCheck(hand) {
  var pairCheck = ofAKindCheck(2, hand);
  var hasTwoPair = pairCheck && pairCheck.length == 2;
  return hasTwoPair ? pairCheck : false;
}

function onePairCheck(hand) {
  var pairCheck = ofAKindCheck(2, hand);
  var hasOnePair = pairCheck && pairCheck.length == 1;
  return hasOnePair ? pairCheck : false;
}

function fullHouseCheck(hand) {
  var threeOfAKindCheck = ofAKindCheck(3, hand);
  var hasPair = ofAKindCheck(2, hand);
  var isFullHouse = !!threeOfAKindCheck && !!hasPair;
  return isFullHouse ? threeOfAKindCheck : false;
}

function ofAKindCheck(kind, hand) {
  var arr = [];
  var matches = findMatches(hand);
  for (var cardVal in matches) {
    var ofAKind = matches[cardVal];
    if (ofAKind === kind) {
      // stores the value of the match
      arr.push(cardVal);
    }
  }
  // TODO: Check if matches exist, specifically if they 
  // are of the same degree of kind. In other words, only take note
  // of four of a kind, if you're looking for of a kind. Pairs should return
  // false
  var highCard;

  if (arr.length) {
    highCard = hand.filter((card) => {
      var val = card[0];
      return arr.indexOf(val) === -1;
    }).sort(function(a, b) { return a - b; }).reverse()[0][0];
    arr.push(highCard);
  }

  // also need to find the high card not paired
  return arr.length ? arr : false;
}

function findMatches(hand) {
  var matches = {};
  getHandValues(hand)
    .forEach((value) => {
      if (matches[value]) {
        matches[value]++;
      } else {
        matches[value] = 1;
      }
    });
  return matches;
}

function royalCheck(hand) {
  // TODO: Consider a utility for checking required cards
  var required = [10, 11, 12, 13, 14];
  return hand.every((card) => {
    var cardValue = card[0];
    var idx = required.indexOf(cardValue);
    if (idx > -1) {
      delete required[idx]
    }
    return idx > -1;
  });
  // how to check for the prescence of a card 
}

function flushCheck(hand) {
  var store;
  var isFlush = getHandSuits(hand).every((suit) => {
    if (!store) {
      store = suit;
      return true;
    } else {
      return store === suit;
    }
  });
  return isFlush ? getHandValues(hand).reverse()[0] : false;
}

function straightCheck(hand) {
  var store;
  var sortedValues = getHandValues(hand);
  var isStraight = sortedValues.every((val) => {
    if (!store) {
      store = val;
      return true;
    } else {
      store++;
      return store === val;
    }
  });
  return isStraight ? sortedValues.reverse()[0] : false;
}

// TODO : write utility for storing first value and then validating others against it

function getHandValues(hand) {
  var arr = [];
  hand.forEach((card) => {
    arr.push(card[0]);
  });
  return arr
    .sort(function(a, b) { return a - b; });;
}

function getHandSuits(hand) {
  var arr = [];
  hand.forEach((card) => {
    arr.push(card[1]);
  });
  return arr;
}

function parseRawHands(rawHands) {
  var parsed = [];

  pokerHands.forEach((hand, idx, hands) => {
    const handArr = hand.split(" ");
    const splitCards = handArr.forEach((card, idx, cards) => {
      const val = card[0];
      const suit = card[1];
      cards[idx] = [maybeConvertFace2Num(val), suit];
    });

    var p1 = handArr.slice(0, 5);
    var p2 = handArr.slice(5);

    parsed.push([p1, p2]);
  });
  return parsed;
}

function maybeConvertFace2Num(value) {
  const toReturn = isRoyalty(value) ? face2Num[value] : value;
  return coerceNumber(toReturn);
}
function isRoyalty(value) {
  return Object.keys(face2Num).indexOf(value) > -1;
}
function coerceNumber(val) {
  var coerced = Number(val);
  return !isNaN(coerced) ? coerced : val;
};

function meetsAll(hand, arr) {
  // TODO: Make sure that `every` quits on first failure
  var meetsAll = arr.every((fn) => {
    var validate = fn(hand);
    if (!!validate) {

    } else {
      return false;
    }
  });
}


module.exports = run;

