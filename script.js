var volgordes = [
  "0123",
  "0132",
  "0213",
  "0231",
  "0312",
  "0321",
  "1023",
  "1032",
  "1203",
  "1230",
  "1302",
  "1320",
  "2013",
  "2031",
  "2103",
  "2130",
  "2301",
  "2310",
  "3012",
  "3021",
  "3102",
  "3120",
  "3201",
  "3210",
];
// Truc om de 24 volgordes om de 4 getallen over de 4 plaatsen te verdelen -->
// op een handige manier langs te lopen; het zijn de 24 'masks'.
var times = "\u00D7";
var eraf = "\u2212";
var operatie = ["+", "-", "*", "/", "(", ")"];
var operatie2 = ["+", eraf, times, ":", "(", ")"];
var getallen = new Array(4);
var gebruikt = new Array(4);
var oplossingen = new Array();
var aantalOpgaven = 0;
var gemaakteOpgaven = new Array();

var aantal_oplossingen = 0;
var numclicks;
var voorbeeldOplossing = "";


function printSolution(res) {
  let d = document.createElement("details");
  let s = document.createElement("summary");
  s.innerHTML = `[
    ${res.getallen[0]}
    ${res.getallen[1]}
    ${res.getallen[2]}
    ${res.getallen[3]}
  ] (${res.solutions.length}${times})`
  // BUG solutions array contains empties (removed overcounts)? removed but not deleted ...
  d.appendChild(s);
  let ol = document.createElement("ol");
  for (sol of res.solutions) {
    if (sol) {
      let li = document.createElement("li");
      sol = sol.replaceAll(/\*/g, times);
      sol = sol.replaceAll(/\//g, ":");
      sol = sol.replaceAll(/-/g, eraf);
      li.innerHTML = `\(${sol}\)`;
      ol.appendChild(li);
    }
  }
  d.appendChild(ol);
  return d;
}

function gen() {
  let n = Number(document.getElementById("num_to_generate").value);
  let tgt = document.getElementById("puzzels");
  for (let i = 0; i < n; i++) {
    let res = generate();
    let e = printSolution(res);
    tgt.appendChild(e);
    console.log(res);
  }
}

function solve() {
  let ns = [
    Number(document.getElementById("n1").value),
    Number(document.getElementById("n2").value),
    Number(document.getElementById("n3").value),
    Number(document.getElementById("n4").value),
  ];
  let tgt = document.getElementById("puzzels");
  sols = calculate(ns);
  let e = printSolution({ getallen: ns, solutions: sols });
  tgt.appendChild(e);
  console.log({ getallen: getallen, solutions: sols });
}

function generate() {
  var solutions = 0;
  numclicks = 0;
  do {
    for (var i = 0; i < 4; i++) {
      getallen[i] = 1 + Math.floor(Math.random() * 9);
    }
    getallen.sort(); //getallen sorteren van klein naar groot, om te kunnen checken of het al eens gebruikt is
    // solutions = calculate();
    solutions = calculate(getallen);
  } while (
    solutions.length <= 50 * 0.85 ** aantalOpgaven ||
    gemaakteOpgaven.indexOf(
      "" + getallen[0] + getallen[1] + getallen[2] + getallen[3],
    ) >= 0 ||
    (aantalOpgaven > 3 &&
      getallen[0] + getallen[1] + getallen[2] + getallen[3] == 24)
  );
  //check:
  // - zijn er voldoende oplossingen, ofwel, is ie eenvoudig genoeg?
  // - is deze flippo al gemaakt? Dan niet nog een keer
  // - alleen bij de eerste drie mag de som van de cijfers 24 zijn. Daarna is dat te eenvoudig

  //gemaakte opgaven opslaan
  gemaakteOpgaven[aantalOpgaven] =
    "" + getallen[0] + getallen[1] + getallen[2] + getallen[3];
  aantalOpgaven++;

  shuffle(getallen); //volgorde weer door elkaar gooien zodat niet telkens het kleinste getal boven staat;
  for (var i = 0; i < 4; i++) {
    gebruikt[i] = false;
  }
  vorigeKnop = 0;
  gestart = true;

  return { getallen, solutions };
}

// pass [a, b, c, d]
// use local solutions
// return []solutions
function calculate(g) {
  let num_solutions = 0;
  let solutions = new Array();
  for (var i = 0; i < 24; i++) {
    var p = g[parseInt(volgordes[i].substring(0, 1))];
    var q = g[parseInt(volgordes[i].substring(1, 2))];
    var r = g[parseInt(volgordes[i].substring(2, 3))];
    var s = g[parseInt(volgordes[i].substring(3, 4))];
    for (var k1 = 0; k1 < 4; k1++) {
      for (var k2 = 0; k2 < 4; k2++) {
        for (var k3 = 0; k3 < 4; k3++) {
          var o1 = operatie[k1];
          var o2 = operatie[k2];
          var o3 = operatie[k3];
          //(((a#b)#c)#d)
          if (
            Math.abs(bereken(bereken(bereken(p, q, o1), r, o2), s, o3) - 24) <=
            0.01
          ) {
            solutions[num_solutions] =
              "((" + p + o1 + q + ")" + o2 + r + ")" + o3 + s;
            num_solutions++;
          }
          //((a#(b#c))#d)
          if (
            Math.abs(bereken(bereken(p, bereken(q, r, o2), o1), s, o3) - 24) <=
            0.01
          ) {
            solutions[num_solutions] =
              "(" + p + o1 + "(" + q + o2 + r + "))" + o3 + s;
            num_solutions++;
          }
          //((a#b)#(c#d))
          if (
            Math.abs(bereken(bereken(p, q, o1), bereken(r, s, o3), o2) - 24) <=
            0.01
          ) {
            solutions[num_solutions] =
              "(" + p + o1 + q + ")" + o2 + "(" + r + o3 + s + ")";
            num_solutions++;
          }
          //(a#((b#c)#d))
          if (
            Math.abs(bereken(p, bereken(bereken(q, r, o2), s, o3), o1) - 24) <=
            0.01
          ) {
            solutions[num_solutions] =
              p + o1 + "((" + q + o2 + r + ")" + o3 + s + ")";
            num_solutions++;
          }
          //(a#(b#(c#d)))
          if (
            Math.abs(bereken(p, bereken(q, bereken(r, s, o3), o2), o1) - 24) <=
            0.01
          ) {
            solutions[num_solutions] =
              p + o1 + "(" + q + o2 + "(" + r + o3 + s + "))";
            num_solutions++;
          }
          //dubbele items verwijderen uit de solutions-array
          if (num_solutions > 1) {
            for (var ii = 0; ii < num_solutions; ii++) {
              for (var j = ii + 1; j < num_solutions; j++) {
                if (solutions[j] == solutions[ii]) {
                  for (var k = j; k < num_solutions; k++) {
                    solutions[k] = solutions[k + 1];
                  }
                  num_solutions--;
                  j--;
                }
              }
            }
          }
        }
      }
    }
  }
  return solutions;
}

function bereken(a, b, operatie) {
  var x = 0;
  if (operatie == "+") x = a + b;
  if (operatie == "-") x = a - b;
  if (operatie == "*") x = a * b;
  if (operatie == "/") x = a / b;
  return x;
}

function shuffle(array) {
  var m = array.length,
    t,
    i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}
