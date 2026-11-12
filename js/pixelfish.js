/* Relay Story Live · 픽셀 그림 (게임용)
   - 푸앙이(중앙대학교 마스코트, 교육용 사용 허락을 받았어요) 5가지 모습
   - 물고기 15종, 움직이는 낚시터 3곳
   그림은 모두 이 파일의 글자 지도로 그려요. 이미지 파일이 필요 없어요.
   글자 지도를 다시 만들 때: 글자 하나 = 픽셀 하나, "."은 투명, 나머지 글자는 PAL(또는 물고기의 pal) 색이에요. */
(function (g) {
  "use strict";
  /* 고해상도 낚시터 그림 (assets/px/p*.png). 다 받아지면 낚시터를 2배 촘촘하게 그려요 */
  const HDN = ["psky0", "pwater0", "pfar0", "pschool", "pcherry1", "pcherry2", "pbank0", "plily", "plilyf", "psky1", "pwater1", "psun1", "pisland", "pbank1", "pcloud1", "pcloud1b", "psky2", "pwater2", "pcity2", "pmoon", "pbank2", "prock"];
  const HDB = (typeof document !== "undefined" && document.currentScript && document.currentScript.src.replace(/js\/pixelfish\.js.*$/, "")) || "";
  let HDI = null, HDok = false;
  function loadHD() {
    if (HDI || typeof Image === "undefined") return;
    HDI = {}; let left = HDN.length;
    HDN.forEach((n) => { const im = new Image(); im.onload = im.onerror = () => { if (--left === 0) HDok = HDN.every((k) => HDI[k].naturalWidth > 0); }; im.src = HDB + "assets/px/" + n + ".png"; HDI[n] = im; });
  }
  const PAL = {"o": "#1d2f5c", "b": "#74c4ee", "d": "#4b9fd6", "w": "#ffffff", "t": "#dcc196", "T": "#b8986a", "p": "#f5c3d3", "P": "#e58fb9", "k": "#0f1a33", "y": "#ffd84a", "Y": "#e0a020", "r": "#8a5a2b"};
  /* 푸앙이 (중앙대학교 마스코트, 교육용 사용 허락을 받았어요): 32×36 */
  const PUANG = {
    stand: [
      "........o.o..........o.o........",
      ".......ototo........ototo.......",
      ".......ototo........ototo.......",
      "........ottto......ottto........",
      ".........ooto......otoo.........",
      "..........oto......oto..........",
      "..........oto.ooo..oto..........",
      ".....oo...oooobbboooo....oo.....",
      "....obbooobbbbbbbbbbboo.obbo....",
      "....obbobbwbbbbbbbbbbbbobbbo....",
      "....obobbwbbbbbbbbbbbbbbobbo....",
      ".....obbwbbbbbbbbbbbbbbbboo.....",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      "....obbbbbwkbbbbbbbbwkbbbbo.....",
      "..ooobbbbbkkbbbbbbbbkkbbbdo.oo..",
      ".o.oobbbbbkkbbbbbbbbkkbbbdo.o.o.",
      ".o...obbbbbbbbbddbbbbbbbbo....o.",
      "..o..opppbbobbbbbbbbobbppp...o..",
      "...ooopppbbboooooooobbbpppooo...",
      ".......obbbbbwbbbbwbbbdo........",
      "........obbbbbbbbbbbbdo.....oo..",
      ".........ooobbbbbbbooo.....oPPo.",
      "........ooooooooooooo.oo..oPPpo.",
      ".......obbobbbbbbbbbbobbo.oPpPo.",
      ".......obbobbwwwwwbbbobbo.oPPPo.",
      ".......obbobwwwwwwwbbobbo..ooo..",
      ".......obbobwwwwwwwbbobbo..obo..",
      ".......obbowwwwwwwwwbobbooobo...",
      "........oobwwwwwwwwwbbooobbo....",
      ".........obbwwwwwwwbbooobbo.....",
      "..........oobwwwwwbooobboo......",
      "..........obooooooobbooo........",
      "..........obbbo..obbbo..........",
      "..........ooooo..ooooo..........",
      "................................",
    ],
    fish: [
      "........o.o..........o.o........",
      ".......ototo........ototo.......",
      ".......ototo........ototo.......",
      "........ottto......ottto........",
      ".........ooto......otoo.........",
      "..........oto......oto..........",
      "..........oto.ooo..oto..........",
      ".....oo...oooobbboooo....oo.....",
      "....obbooobbbbbbbbbbboo.obbo....",
      "....obbobbwbbbbbbbbbbbbobbbo....",
      "....obobbwbbbbbbbbbbbbbbobbo....",
      ".....obbwbbbbbbbbbbbbbbbboo.....",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      "....obbbbbwkbbbbbbbbwkbbbbo.....",
      "..ooobbbbbkkbbbbbbbbkkbbbdo.oo..",
      ".o.oobbbbbkkbbbbbbbbkkbbbdo.o.o.",
      ".o...obbbbbbbbbddbbbbbbbbo....o.",
      "..o..opppbbobbbbbbbbobbppp...o..",
      "...ooopppbbboooooooobbbpppooo...",
      ".......obbbbbwbbbbwbbbdo........",
      "........obbbbbbbbbbbbdo.....oo..",
      ".........ooobbbbbbbooo.....oPPo.",
      "........ooooooooooooooooo.oPPpo.",
      ".......obbobbbbbbbbbobbbbooPpPo.",
      ".......obbobbwwwwwboobbbbooPPPo.",
      ".......obbobwwwwwwwbooooo..ooo..",
      ".......obbobwwwwwwwbbooo...obo..",
      "........oobwwwwwwwwwbbo..oobo...",
      "........obbwwwwwwwwwbbo.obbo....",
      ".........obbwwwwwwwbbooobbo.....",
      "..........oobwwwwwbooobboo......",
      "..........obooooooobbooo........",
      "..........obbbo..obbbo..........",
      "..........ooooo..ooooo..........",
      "................................",
    ],
    blink: [
      "........o.o..........o.o........",
      ".......ototo........ototo.......",
      ".......ototo........ototo.......",
      "........ottto......ottto........",
      ".........ooto......otoo.........",
      "..........oto......oto..........",
      "..........oto.ooo..oto..........",
      ".....oo...oooobbboooo....oo.....",
      "....obbooobbbbbbbbbbboo.obbo....",
      "....obbobbwbbbbbbbbbbbbobbbo....",
      "....obobbwbbbbbbbbbbbbbbobbo....",
      ".....obbwbbbbbbbbbbbbbbbboo.....",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      "....obbbbbbbbbbbbbbbbbbbbbo.....",
      "..ooobbbbbbbbbbbbbbbbbbbbdo.oo..",
      ".o.oobbbbbkkbbbbbbbbkkbbbdo.o.o.",
      ".o...obbbbbbbbbddbbbbbbbbo....o.",
      "..o..opppbbobbbbbbbbobbppp...o..",
      "...ooopppbbboooooooobbbpppooo...",
      ".......obbbbbwbbbbwbbbdo........",
      "........obbbbbbbbbbbbdo.....oo..",
      ".........ooobbbbbbbooo.....oPPo.",
      "........ooooooooooooooooo.oPPpo.",
      ".......obbobbbbbbbbbobbbbooPpPo.",
      ".......obbobbwwwwwboobbbbooPPPo.",
      ".......obbobwwwwwwwbooooo..ooo..",
      ".......obbobwwwwwwwbbooo...obo..",
      "........oobwwwwwwwwwbbo..oobo...",
      "........obbwwwwwwwwwbbo.obbo....",
      ".........obbwwwwwwwbbooobbo.....",
      "..........oobwwwwwbooobboo......",
      "..........obooooooobbooo........",
      "..........obbbo..obbbo..........",
      "..........ooooo..ooooo..........",
      "................................",
    ],
    wow: [
      "........o.o..........o.o........",
      ".......ototo........ototo.......",
      ".......ototo........ototo.......",
      "........ottto......ottto........",
      ".........ooto......otoo.........",
      "..........oto......oto..........",
      "..........oto.ooo..oto..........",
      ".....oo...oooobbboooo....oo.....",
      "....obbooobbbbbbbbbbboo.obbo....",
      "....obbobbwbbbbbbbbbbbbobbbo....",
      "....obobbwbbbbbbbbbbbbbbobbo....",
      ".....obbwbbbbbbbbbbbbbbbboo.....",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      ".....obbbwwkbbbbbbbwwkbbbo......",
      "....obbbbkkkbbbbbbbkkkbbbbo.....",
      "..ooobbbbkkkbbbbbbbkkkbbbdo.oo..",
      ".o.oobbbbkkkbbbbbbbkkkbbbdo.o.o.",
      ".o...obbbbbobbbddbbbobbbbo....o.",
      "..o..opppbbboooooooobbbppp...o..",
      "...ooopppbbbbwPPPPwbbbbpppooo...",
      ".......obbbbbboooobbbbdo........",
      "........obbbbbbbbbbbbdo.....oo..",
      ".........ooobbbbbbbooo.....oPPo.",
      "........ooooooooooooooooo.oPPpo.",
      ".......obbobbbbbbbbbobbbbooPpPo.",
      ".......obbobbwwwwwboobbbbooPPPo.",
      ".......obbobwwwwwwwbooooo..ooo..",
      ".......obbobwwwwwwwbbooo...obo..",
      "........oobwwwwwwwwwbbo..oobo...",
      "........obbwwwwwwwwwbbo.obbo....",
      ".........obbwwwwwwwbbooobbo.....",
      "..........oobwwwwwbooobboo......",
      "..........obooooooobbooo........",
      "..........obbbo..obbbo..........",
      "..........ooooo..ooooo..........",
      "................................",
    ],
    cheer: [
      "........o.o..........o.o........",
      ".......ototo........ototo.......",
      ".......ototo........ototo.......",
      "........ottto......ottto........",
      ".........ooto......otoo.........",
      "..........oto......oto..........",
      "..........oto.ooo..oto..........",
      ".....oo...oooobbboooo....oo.....",
      "....obbooobbbbbbbbbbboo.obbo....",
      "....obbobbwbbbbbbbbbbbbobbbo....",
      "....obobbwbbbbbbbbbbbbbbobbo....",
      ".....obbwbbbbbbbbbbbbbbbboo.....",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      ".....obbbbbbbbbbbbbbbbbbbo......",
      "....obbbbbbbbbbbbbbbbbbbbbo.....",
      "..ooobbbbbkkbbbbbbbbkkbbbdo.oo..",
      ".o.oobbbbkbbkbbbbbbkbbkbbdo.o.o.",
      ".o...obbbbbobbbddbbbobbbbo....o.",
      "..o..opppbbboooooooobbbppp...o..",
      "...ooopppbbbbwPPPPwbbbbpppooo...",
      ".......obbbbbboooobbbbdo........",
      "...oo...obbbbbbbbbbbbdo....ooo..",
      "..obboo..ooobbbbbbbooo...oobboo.",
      "...obbboo.ooooooooooo..oobbbopo.",
      "....obbbboobbbbbbbbbboobbbbopPo.",
      ".....oobbbobbwwwwwbbbobbbooPPPo.",
      ".......ooobbwwwwwwwbbbooo..ooo..",
      "........obbbwwwwwwwbbbo....obo..",
      "........obbwwwwwwwwwbbo..oobo...",
      "........obbwwwwwwwwwbbo.obbo....",
      ".........obbwwwwwwwbbooobbo.....",
      "..........oobwwwwwbooobboo......",
      "..........obooooooobbooo........",
      "..........obbbo..obbbo..........",
      "..........ooooo..ooooo..........",
      "................................",
    ],
    /* 달리기용 옆모습 (34×34): run1·run2 번갈아, jump, hurt */
    run1: [
      ".........o..o....o..o.............",
      "........otooto..otooto............",
      ".........otto...ototo.............",
      "..........oto....oto..............",
      "...........oto....oto.............",
      "............otooooooo.............",
      "...........ooobbbbbbboo...........",
      ".....oooo.obwbbbbbbbbbboo.........",
      ".....obboobwbbbbbbbbbbbbbo........",
      ".....obbobwbbbbbbbbbbbbbbbo.......",
      "......oobbbbbbbbbbbbbbbbbbo.......",
      ".......obbbbbbbbbbbbbbbbbbbo......",
      "......obbbbbbbbbbwkbbbbbwkbo......",
      "......obbbbbbbbbbkkbbbbbkkbo..o...",
      ".....ooddbbbbbbbbkkbbbbbkkbo.o.o..",
      "....o.ooddbbbbbbbbbbbddbbbbo...o..",
      "....o..oddbbbpppbobbbbbbbbpp..o...",
      ".ooooo..oddbbpppbbooooooooppoo....",
      ".oPPo.oooddbbbbbbbbwbbbbwo........",
      ".oPpo....ooddbbbbbbbbbbbo.........",
      ".oooo......oodbbbbbbbooo..........",
      "....o.......ooooooooo.............",
      "..oobo....oobbbbbbbboooo..........",
      "..obbbo..obbobbbwwwwbobbo.........",
      "...obbbooobbobbwwwwwobbbbo........",
      "....obbbbobbobbwwwwwwoooo.........",
      ".....obbbboobbbwwwwwww............",
      "......ooooobbbbwwwwwwo............",
      ".........oooobbbwwwwo.............",
      "........obbbooooooobbo............",
      "........obbbo....obbbbo...........",
      ".......ooooo.....obbbbbo..........",
      "..................oooooo..........",
      "..................................",
    ],
    run2: [
      ".........o..o....o..o.............",
      "........otooto..otooto............",
      ".........otto...ototo.............",
      "..........oto....oto..............",
      "...........oto....oto.............",
      "............otooooooo.............",
      "...........ooobbbbbbboo...........",
      ".....oooo.obwbbbbbbbbbboo.........",
      ".....obboobwbbbbbbbbbbbbbo........",
      ".....obbobwbbbbbbbbbbbbbbbo.......",
      "......oobbbbbbbbbbbbbbbbbbo.......",
      ".......obbbbbbbbbbbbbbbbbbbo......",
      "......obbbbbbbbbbwkbbbbbwkbo......",
      "......obbbbbbbbbbkkbbbbbkkbo..o...",
      ".....ooddbbbbbbbbkkbbbbbkkbo.o.o..",
      "....o.ooddbbbbbbbbbbbddbbbbo...o..",
      "....o..oddbbbpppbobbbbbbbbpp..o...",
      ".ooooo..oddbbpppbbooooooooppoo....",
      ".oPPo.oooddbbbbbbbbwbbbbwo........",
      ".oPpo....ooddbbbbbbbbbbbo.........",
      ".oooo......oodbbbbbbbooo..........",
      "....o.......ooooooooo.............",
      "..oobo..ooooobbbbbbboo............",
      "..obbbo.obbbobbbwwwooo............",
      "...obbboooooobbwwwwoboo...........",
      "....obbbbobbbbbwwwwoboo...........",
      ".....obbbbobbbbwwwwobo............",
      "......ooooobbbbwwwwwoo............",
      "...........oobbbwwwwo.............",
      ".............ooooooo..............",
      ".............obbobboo.............",
      ".............obbboo...............",
      ".............ooooo................",
      "..................................",
    ],
    jump: [
      ".........o..o....o..o.............",
      "........otooto..otooto............",
      ".........otto...ototo.............",
      "..........oto....oto..............",
      "...........oto....oto.............",
      "............otooooooo.............",
      "...........ooobbbbbbboo...........",
      ".....oooo.obwbbbbbbbbbboo.........",
      ".....obboobwbbbbbbbbbbbbbo........",
      ".....obbobwbbbbbbbbbbbbbbbo.......",
      "......oobbbbbbbbbbbbbbbbbbo.......",
      ".......obbbbbbbbbbbbbbbbbbbo......",
      "......obbbbbbbbbbwkbbbbbwkbo......",
      "......obbbbbbbbbbkkbbbbbkkbo..o...",
      ".....ooddbbbbbbbbkkbbbbbkkbo.o.o..",
      "....o.ooddbbbbbbbbbbbddbbbbo...o..",
      "....o..oddbbbpppbbbbbbbbbbpp..o...",
      ".ooooo..oddbbpppbbooooooooppoo....",
      ".oPPo.oooddbbbbbbbbwPPPooo........",
      ".oPpo....ooddbbbbbbbbbobbo........",
      ".oooo......oodbbbbbbbobbo.........",
      "....o.......ooooooooobbo..........",
      "..oobo....oobbbbbbbbooo...........",
      "..obbbo...obbbbbwwwwbo............",
      "...obbbooobbbbbwwwwwwbo...........",
      "....obbbbobbbbbwwwwwwwo...........",
      ".....obbbbobbbbwwwwwww............",
      "......ooooobbbbwwwwwwo............",
      ".........oboobbbwwwwobo...........",
      ".........ooo.ooooooooo............",
      "..................................",
      "..................................",
      "..................................",
      "..................................",
    ],
    hurt: [
      ".........o..o....o..o.............",
      "........otooto..otooto............",
      ".........otto...ototo.............",
      "..........oto....oto..............",
      "...........oto....oto.............",
      "............otooooooo.............",
      "...........ooobbbbbbboo...........",
      ".....oooo.obwbbbbbbbbbboo.........",
      ".....obboobwbbbbbbbbbbbbbo........",
      ".....obbobwbbbbbbbbbbbbbbbo.......",
      "......oobbbbbbbbbbbbbbbbbbo.......",
      ".......obbbbbbbbbbbbbbbbbbbo......",
      "......obbbbbbbbbkbkbbbbkbkbo......",
      "......obbbbbbbbbbkbbbbbbkbbo..o...",
      ".....ooddbbbbbbbkbkbbbbkbkbo.o.o..",
      "....o.ooddbbbbbbbbbbbddbbbbo...o..",
      "....o..oddbbbpppbobbbbbbbbpp..o...",
      ".ooooo..oddbbpppbbooooooooppoo....",
      ".oPPo.oooddbbbbbbbbwbbbbwo........",
      ".oPpo....ooddbbbbbbbbbbbo.........",
      ".oooo......oodbbbbbbbooo..........",
      "....o.......ooooooooo.............",
      "..oobo....oobbbbbbbboo............",
      "..obbbo..obbobbbwwwwbo............",
      "...obbbooobbobbwwwwwwbo...........",
      "....obbbbobbobbwwwwwwwo...........",
      ".....obbbboobbbwwwwwww............",
      "......ooooobbbbwwwwwwo............",
      "...........oobbbwwwwo.............",
      "...........oboooooobo.............",
      "...........obbo..obbo.............",
      "...........obbo..obbbo............",
      "...........oooo..ooooo............",
      "..................................",
    ],
  };
  /* 물고기 15종 (낚시터 3곳 × 등급 5단계, engine.js FISH.ponds 순서): 26×16, 머리가 왼쪽 */
  const FISH = [
    { id: "minnow", pal: {"s": "#a9c7d6", "S": "#6f97ad"}, rows: [
      "..........................",
      "..........................",
      ".......ooooo..............",
      ".......oSSSSo.............",
      "......ooooSSo......o......",
      "....oossssooo....ooSo.....",
      "...oswkssssssooooSSSo.....",
      "...oskkSsssssssoSSSo......",
      "...osssSsssssssoSSSo......",
      "...owwwSwwwwwooooSSSo.....",
      "....oowwSSooo....ooSo.....",
      "......oooo.........o......",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "puffy", pal: {"y": "#ffd84a"}, rows: [
      "..........................",
      "..........................",
      "..........ooo.............",
      "........ooyyyoo...........",
      ".......oyyyyyyyo..........",
      "......oywyyyyyyyo....o....",
      "......oykyykyyyyo..oo.....",
      ".....oyyyyyyyyyyyooyo.....",
      ".....oyyyyyyyyyyyooyo.....",
      "......oyyoPyyyyyo..oo.....",
      "......owwwwwwwwwo....o....",
      ".......owwwwwwwo..........",
      "........oowwwoo...........",
      "..........ooo.............",
      "..........................",
      "..........................",
    ] },
    { id: "trout", pal: {"g": "#8fbf6a", "G": "#5a8f42"}, rows: [
      "..........................",
      "........ooo...............",
      ".......oGGGoo.............",
      ".......ooGGGo.............",
      "...ooooggooooo.......ooo..",
      "..oggggggGggGgoo...ooGGo..",
      ".oggwkgggggggggGoooGGGo...",
      ".oggkkPGPPPPPPPPPPoGGGo...",
      ".ogggPPGPPPPPPPPPPoGGGo...",
      ".ogggggGggggggGgoooGGGo...",
      "..owwwwwGGwGwwoo...ooGGo..",
      "...oooowwooooo.......ooo..",
      ".......oo.................",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "turtle", pal: {"g": "#8fd07a", "G": "#4c9a52", "h": "#6fbf6a"}, rows: [
      "..........................",
      "..........................",
      "..........ooyoo...........",
      "..........opPPo...........",
      ".........ooopooo..........",
      ".......ooGGhoGGhoo........",
      "...ooooGGGhGGGhGGGo.......",
      "..owgoGGGhGGGhGGGhGo......",
      ".ogkgoGGhGGGhGGGhGGoo.....",
      "..oggoGhGGGhGGGhGGGogo....",
      "...ooohGGGhGGGhGGGhoo.....",
      ".....oooooooooooooooo.....",
      "......oggo.....oggo.......",
      ".......oo.......oo........",
      "..........................",
      "..........................",
    ] },
    { id: "carp", pal: {}, rows: [
      "..........................",
      "..........................",
      "....o.o.oo................",
      "....yoyoyYooo.............",
      "...oYYYYYoYYo.............",
      "....oooooooooo.......ooo..",
      "..ooyyyyyyyyyooo....oYYo..",
      ".oyywkyyyyyywyyyo.ooYYYo..",
      ".oyykkyYywyyyyyyyooYYYo...",
      ".oyyyyyYyyyyyywyyyoYYo....",
      ".oyyyyyYyyyyyyyyyooYYYo...",
      ".owwwwwwYYwwwwwwo.ooYYYo..",
      "..oowwwwwwwwwooo....oYYo..",
      "....ooooooooo........ooo..",
      "..........................",
      "..........................",
    ] },
    { id: "bream", pal: {"r": "#ee7a8a", "R": "#c4475e"}, rows: [
      "........ooo...............",
      ".......oRRRoo.............",
      ".......ooRRRo.............",
      "....ooorrooooo.......ooo..",
      "..oorrrrrrrrroo.....oRRo..",
      "..orrrrrrrrrrrroo.ooRRRo..",
      ".orrwkrrrrrrrrrrroRRRRo...",
      ".orrkkrRrrrrrrrrrroRRRo...",
      ".orrrrrRrrrrrrrrrroRRRo...",
      ".orrrrrRrrrrrrrrroRRRRo...",
      "..opppppRRpppppoo.ooRRRo..",
      "..oopppppppppoo.....oRRo..",
      "....oooppoooo........ooo..",
      ".......oo.................",
      "..........................",
      "..........................",
    ] },
    { id: "spiky", pal: {"v": "#b799e8", "V": "#7d5bc4"}, rows: [
      "...........o..............",
      ".......o.......o..........",
      "..........ooo.............",
      "........oovvvoo...........",
      "....o..ovvvvVvvo..o.......",
      "......ovwvvvvvvVo....o....",
      "......ovkvvkvvvvo..oo.....",
      ".....ovVvvvvvvVvvoovo.....",
      "...o.ovvvvVvvvvvvoooo.....",
      "......ovvoPvvVvvo..oo.....",
      "......owwwwwwwwwo....o....",
      "....o..owwwwwwwo..o.......",
      "........oowwwoo...........",
      "..........ooo.............",
      ".......o.......o..........",
      "...........o..............",
    ] },
    { id: "clown", pal: {"n": "#ff8a2a", "N": "#d45a10"}, rows: [
      "..........................",
      "........ooooo.............",
      ".......oNNNNo.............",
      ".....ooooooNNo........o...",
      "...ooowwonnooo......ooNo..",
      "..onnowwonnowwoo...oNNNo..",
      ".onnwkwwonnowwonoooNNNo...",
      ".onnkkwNonnowwonnnoNNNo...",
      ".onnnowNonnowwonnnoNNNo...",
      ".onnnowNonnowwonoooNNNo...",
      "..onnowwNNnowwoo...oNNNo..",
      "...ooowwonnooo......ooNo..",
      ".....oooooo...........o...",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "octopus", pal: {"r": "#ef5a5a"}, rows: [
      "..........................",
      ".........ooooooo..........",
      ".......oorrrrrrroo........",
      "......orrpprrrrrrro.......",
      "......orpppprrrrrro.......",
      ".....orrrpprrrrrrrro......",
      ".....orrrrrrrrrrrrro......",
      ".....orrrwkrrrrwkrro......",
      "......orrkkrrrrkkroo......",
      "......oprrrroorrropo......",
      "......o.oorrrrroooo.......",
      ".....oo...ooooo.ooo.......",
      ".....oo...ooo...ooo.......",
      ".....o....oo....oo........",
      "..........oo....oo........",
      "..........................",
    ] },
    { id: "shark", pal: {"c": "#9fe8f0", "C": "#4fbfd0"}, rows: [
      "..........................",
      "............o.............",
      "...........wCo............",
      "..........oCCo..........o.",
      "........oooooo.........oo.",
      "....oooocccccooo......oo..",
      "...ocwccccccccwcooo..oCo..",
      "..occkcccccccccccccooCCo..",
      ".occcccccoccccccccccoCo...",
      "..owwwwwwwowwwwwwwwoooCo..",
      "...oooowwwwwwwwwooo...oo..",
      "....wowooooooooo.......o..",
      "........................o.",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "comet", pal: {"c": "#9fd8ff", "C": "#5fa8e8"}, rows: [
      "..........................",
      ".....o....................",
      ".....oooooo...............",
      "....oCCCCCo...............",
      "...ooooooCo.....ooo.......",
      "..occccccooo..ooCCCo......",
      ".ocwkcccccccooCCCCoY......",
      ".ockkCcccccccoCCCoyYYY....",
      ".occcCcccccccoCCCoyyYYY...",
      ".occcCccccccooCCCCoYYY....",
      "..owwwCCwooo..ooCCCo......",
      "...oooooo.......ooo.......",
      "..........................",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "squid", pal: {"m": "#f3e7a0"}, rows: [
      "............o.............",
      "...........omo............",
      "..........omwmo.o.........",
      ".......o.omwmmmooo........",
      "......ooommmmwmmomo.......",
      "....ooooommmmmmmoooo......",
      "........ommmmmmmo.........",
      "........owkmmmmwk.........",
      "........okkmmmmkk.........",
      "........poooooooop........",
      "........o.ooo.ooo.........",
      ".......oo.ooo.ooo.........",
      ".......o..oo..oo..........",
      ".......o...o...o..........",
      ".......o...o...o..........",
      "..........................",
    ] },
    { id: "ray", pal: {"v": "#a77be0", "V": "#7a4fc0"}, rows: [
      "..........................",
      "..........................",
      "........ooo...............",
      ".......ovvvoo.............",
      "......ovvvvvvo............",
      ".....ovvwvvwyvo...........",
      "....ovvvkvykvvvo..........",
      "...ovvvvyvvvvvvvo.........",
      "...ovVyvvvvvvvVo.........o",
      "....ovvvvoovvvo...oooooooo",
      ".....ovvvvvvvo............",
      "......oovvvyo.............",
      "........oooo..............",
      "..........................",
      "..........................",
      "..........................",
    ] },
    { id: "whale", pal: {"n": "#3b4fa8", "N": "#283a85", "c": "#9fb4ff"}, rows: [
      ".....w.w..................",
      "......w...................",
      "......w...................",
      ".......ooooooooo..........",
      "....ooonnnnnnnnnooo....o..",
      "...onnnnnnwnnnnnnwno..oo..",
      "..onnnnnnnnnnnnnnnnnooo...",
      ".onnnwnnwnnnnnwnnnnnnoo...",
      ".onnnknnnnnnnnnnnnnnnoo...",
      ".onnnnnnnnnnnnnnnnnnnooo..",
      "..occccccccccccccccco...o.",
      "...oocococococococoo......",
      "....ooocccccccccooo.......",
      ".......ooooooooo..........",
      "..........................",
      "..........................",
    ] },
    { id: "dragon", pal: {"v": "#3f7fe0"}, rows: [
      "..oyo...oyo...............",
      ".oyyo...oyyo..............",
      "..ooyo.oyoo....w........w.",
      "...ooooooo................",
      "..ovvvvvvvo.......y..y....",
      ".ovvvvvvvvvo....yooooo...o",
      ".ovvwvvvwvvo....ovyvvvo.oo",
      ".ovvkvvvkvvo.yoovvvooovoPo",
      ".opvvvvvvvpo.ovyvvo...ovoo",
      ".oovvooovvooovvvvo.....ooo",
      "o..oowowoovvovvvo.........",
      "o.....ovvvvvovvo..........",
      ".o.....ooyvovoo...........",
      ".........oooo........w....",
      ".............w............",
      "..........................",
    ] },
  ];
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const css = (c, a) => (a == null ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`);
  const lerp = (a, b, f) => a.map((v, k) => Math.round(v + (b[k] - v) * f));
  const rnd = (n) => { const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453; return x - Math.floor(x); };
  const cache = {};
  function make(rows, pal) {
    const h = rows.length, w = rows[0].length, c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d"), im = x.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
      const ch = rows[y][i]; if (ch === ".") continue;
      const col = hex(pal[ch] || PAL[ch] || "#ff00ff"), o = (y * w + i) * 4;
      im.data[o] = col[0]; im.data[o + 1] = col[1]; im.data[o + 2] = col[2]; im.data[o + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    return c;
  }
  const puang = (pose) => cache["p" + pose] || (cache["p" + pose] = make(PUANG[pose] || PUANG.stand, PAL));
  const fishIdx = (pond, tier) => Math.max(0, Math.min(14, (pond | 0) * 5 + (tier | 0)));
  const fish = (pond, tier) => { const i = fishIdx(pond, tier); return cache["f" + i] || (cache["f" + i] = make(FISH[i].rows, FISH[i].pal)); };
  function scaled(c, s) {
    const o = document.createElement("canvas"); o.width = c.width * s; o.height = c.height * s;
    const x = o.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, o.width, o.height);
    return o.toDataURL();
  }
  const fishURL = (pond, tier) => { const k = "uf" + fishIdx(pond, tier); return cache[k] || (cache[k] = scaled(fish(pond, tier), 4)); };
  const puangURL = (pose) => { const k = "up" + pose; return cache[k] || (cache[k] = scaled(puang(pose), 4)); };
  /* <img> 태그 문자열: 높이(px)만 정하면 비율대로 커져요 */
  const fishImg = (pond, tier, h, cls) => `<img class="pxi ${cls || ""}" src="${fishURL(pond, tier)}" style="height:${h}px;width:${Math.round((h * 26) / 16)}px" alt="">`;
  /* 화면에 넣는 푸앙이 그림: 푸앙런 푸앙이(assets/px, 64×88)를 써요 */
  const HD_POSES = ["run0", "run1", "run2", "run3", "jump", "hurt", "stand", "blink", "wow", "cheer", "fish"];
  const puangImg = (pose, h, cls) => `<img class="pxi ${cls || ""}" src="${HDB}assets/px/${HD_POSES.includes(pose) ? pose : "stand"}.png" style="height:${h}px;width:auto" alt="푸앙이">`;

  /* ---------- 움직이는 낚시터: 100줄 높이의 작은 그림을 크게 늘려서 보여 줘요 ---------- */
  const LH = 100, HZ = 34, GY = 65; /* 화면 높이, 수평선, 푸앙이가 서는 땅 */
  /* 간판용 아주 작은 글자 (가로 3~4, 세로 5) */
  const TINY = { S: ["111", "100", "111", "001", "111"], I: ["111", "010", "010", "010", "111"], N: ["1001", "1101", "1011", "1001", "1001"], E: ["111", "100", "111", "100", "111"],
    O: ["111", "101", "101", "101", "111"], C: ["111", "100", "100", "100", "111"], A: ["010", "101", "111", "101", "101"], U: ["101", "101", "101", "101", "111"], M: ["10001", "11011", "10101", "10001", "10001"], " ": ["00", "00", "00", "00", "00"] };
  const tinyW = (str) => str.split("").reduce((a, ch) => a + (TINY[ch] || TINY[" "])[0].length + 1, -1);
  const B4 = [[0, 2], [3, 1]];
  const edgeAt = (pond, j) => (pond === 1 ? 52 : (pond === 2 ? 47 : 45) + (j - GY) * 0.32);
  function pondColors(i) {
    const P = g.RSLEngine && g.RSLEngine.FISH && g.RSLEngine.FISH.ponds[i];
    return P ? { s: P.sky.map(hex), w: P.water.map(hex) } : { s: [hex("#bfe6ff"), hex("#e8f6ff")], w: [hex("#7cc8f0"), hex("#2f7fc0")] };
  }
  function buildBg(LW, pond) {
    const c = document.createElement("canvas"); c.width = LW; c.height = LH;
    const x = c.getContext("2d"), im = x.createImageData(LW, LH), D = im.data, C = pondColors(pond);
    const set = (i, j, col) => { i = Math.round(i); j = Math.round(j); if (i < 0 || j < 0 || i >= LW || j >= LH) return; const o = (j * LW + i) * 4; D[o] = col[0]; D[o + 1] = col[1]; D[o + 2] = col[2]; D[o + 3] = 255; };
    const grad = (i, j, a, b, t) => { const N = 5, k = Math.max(0, Math.min(N - 1.0001, t * (N - 1))), lo = Math.floor(k); set(i, j, lerp(a, b, (lo + (k - lo > (B4[j & 1][i & 1] + 0.5) / 4 ? 1 : 0)) / (N - 1))); };
    const disc = (cx, cy, r, col, onlyAbove) => { for (let j = Math.floor(cy - r); j <= cy + r; j++) for (let i = Math.floor(cx - r); i <= cx + r; i++) if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r && (!onlyAbove || j < onlyAbove)) set(i, j, col); };
    for (let j = 0; j < LH; j++) for (let i = 0; i < LW; i++) {
      if (j < HZ) grad(i, j, C.s[0], C.s[1], j / HZ);
      else grad(i, j, C.w[0], C.w[1], (j - HZ) / (LH - HZ));
    }
    const text = (str, x0, y0, col) => { let cx = Math.round(x0); str.split("").forEach((ch) => { const gl = TINY[ch] || TINY[" "]; gl.forEach((r, j) => r.split("").forEach((b, i) => b === "1" && set(cx + i, y0 + j, col))); cx += gl[0].length + 1; }); };
    const box = (x0, y0, w, h, fillC, lineC) => { for (let j = y0; j < y0 + h; j++) for (let i = x0; i < x0 + w; i++) set(i, j, lineC && (j === y0 || j === y0 + h - 1 || i === x0 || i === x0 + w - 1) ? lineC : fillC); };
    const tree = (tx, ty, a, b) => { for (let k = 0; k < 4; k++) set(tx, ty + 6 + k, hex("#7a4a24")); [[0, 0, 4.2], [-3, 3, 3.4], [3, 3, 3.4]].forEach(([dx, dy, r]) => disc(tx + dx, ty + dy + 1, r, hex(a))); for (let n = 0; n < 9; n++) set(tx - 4 + rnd(n + tx) * 8, ty - 2 + rnd(n + tx + 5) * 8, hex(b)); };
    if (pond === 0) {
      /* 신서중: 언덕 앞에 시계탑이 있는 학교 건물과 벚나무 */
      disc(LW - 16, 10, 6.5, hex("#ffd84a")); disc(LW - 17, 9, 4, hex("#fff1a6"));
      for (let i = 0; i < LW; i++) { const h = 9 + 2.6 * Math.sin(i / 13) + 1.4 * Math.sin(i / 5.1 + 1); for (let j = Math.round(HZ - h); j < HZ; j++) set(i, j, j > HZ - 4 ? hex("#79c165") : hex("#9ad884")); }
      const bx = Math.round(Math.max(78, LW * 0.64)), wall = hex("#f3e6c8"), edge = hex("#8a6a4a"), win = hex("#7fb2e0"), roof = hex("#b5523b");
      box(bx - 30, 17, 61, 17, wall, edge);
      for (let i = bx - 31; i <= bx + 31; i++) { set(i, 16, roof); set(i, 17, roof); }
      for (let i = bx - 27; i <= bx + 26; i += 6) { if (Math.abs(i + 1 - bx) > 15) box(i, 20, 4, 4, win, edge); if (Math.abs(i + 1 - bx) > 5) box(i, 26, 4, 4, win, edge); }
      box(bx - 4, 27, 9, 7, hex("#5a7fa8"), edge); for (let j = 28; j < 34; j++) set(bx, j, edge);
      box(bx - 6, 6, 13, 11, wall, edge);
      for (let k = 0; k < 4; k++) for (let i = bx - 6 + k; i <= bx + 6 - k; i++) set(i, 5 - k, roof);
      disc(bx + 0.5, 11, 3.6, hex("#ffffff")); set(bx, 9, edge); set(bx, 10, edge); set(bx, 11, edge); set(bx + 1, 11, edge); set(bx + 2, 11, edge);
      const tw = tinyW("SINSEO"); box(bx - Math.ceil(tw / 2) - 2, 18, tw + 4, 8, hex("#1c479a"), hex("#14233d")); text("SINSEO", bx - Math.ceil(tw / 2), 19, hex("#ffffff"));
      tree(bx - 40, 21, "#f6b8cf", "#e58fb9"); tree(bx + 40, 22, "#f6b8cf", "#e58fb9"); if (LW > 200) tree(bx - 55, 23, "#8fd07a", "#5fae47");
      for (let i = 0; i < LW; i++) set(i, HZ - 1, (i >> 1) % 2 ? hex("#cfcfcf") : hex("#9a9a9a"));
      for (let i = 0; i < LW; i++) set(i, HZ, hex("#d8f0ff"));
      [[0.47, 84, true], [0.9, 92, false], [0.7, 97, false]].forEach(([f, cy, flower]) => {
        const cx = LW * f;
        for (let j = cy - 3; j <= cy + 3; j++) for (let i = cx - 7; i <= cx + 7; i++) {
          const d = ((i + 0.5 - cx) / 6.5) ** 2 + ((j + 0.5 - cy) / 2.3) ** 2;
          if (d <= 1 && !(i > cx && Math.abs(j + 0.5 - cy) < 0.8)) set(i, j, d > 0.62 ? hex("#3d7f3a") : hex("#63b552"));
        }
        if (flower) { set(cx - 2, cy - 3, hex("#e58fb9")); set(cx - 1, cy - 4, hex("#f5c3d3")); set(cx, cy - 3, hex("#e58fb9")); set(cx - 1, cy - 3, hex("#ffd84a")); }
      });
      for (let j = GY; j < LH; j++) {
        const e = edgeAt(0, j);
        for (let i = 0; i < e; i++) set(i, j, j < GY + 3 ? ((i * 7 + j) % 5 === 0 ? hex("#5fae47") : hex("#7ccf5a")) : (i + j) % 2 && j % 3 ? hex("#8a5a33") : hex("#9c6b3e"));
        set(e, j, hex("#5c3b1e"));
      }
      for (let i = 0; i < 46; i++) if (i % 3 === 0) set(i, GY - 1, hex("#7ccf5a"));
      [[47, 9], [49, 12], [51, 8], [53, 11]].forEach(([rx, rh]) => { for (let k = 0; k < rh; k++) set(rx + (k > rh - 3 ? 0 : 0), GY + 4 - k, hex("#4f8f3a")); set(rx, GY + 4 - rh, hex("#7a4a24")); set(rx, GY + 5 - rh, hex("#7a4a24")); });
    }
    if (pond === 1) {
      const sx = LW * 0.76;
      disc(sx, HZ, 13, hex("#ffae4f"), HZ); disc(sx, HZ, 9, hex("#ffd27a"), HZ);
      const ix = LW * 0.34;
      for (let i = -12; i <= 12; i++) { const h = Math.round(3.2 * Math.cos((i / 12) * 1.5)); for (let j = HZ - h; j < HZ; j++) set(ix + i, j, hex("#e0b070")); }
      for (let k = 0; k < 8; k++) set(ix + 2 + (k > 5 ? 1 : 0), HZ - 3 - k, hex("#8a5a2b"));
      [[-4, 1], [-3, 0], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, 0], [4, 1], [5, 2], [-5, 2], [0, 0], [1, 0], [2, 0]].forEach(([a, b]) => set(ix + 3 + a, HZ - 12 + b, hex("#3f9a5a")));
      for (let i = 0; i < LW; i++) set(i, HZ, hex("#fff1dc"));
      for (let j = GY; j < GY + 4; j++) for (let i = 0; i < 52; i++) set(i, j, j === GY ? hex("#e0a868") : j === GY + 3 ? hex("#6b4423") : i % 7 === 6 ? hex("#8a5a2b") : hex("#c48a52"));
      [5, 24, 45].forEach((px) => { for (let j = GY + 4; j < LH; j++) for (let i = px; i < px + 3; i++) set(i, j, i === px ? hex("#5a3a1a") : hex("#7a4a24")); });
      for (let j = GY + 4; j < LH; j++) for (let i = 0; i < 52; i++) if ((i + j) % 2 === 0 && j < GY + 7) set(i, j, lerp(C.w[1], [0, 0, 0], 0.25));
    }
    if (pond === 2) {
      for (let n = 0; n < 46; n++) { const sx = rnd(n) * LW, sy = rnd(n + 99) * (HZ - 6); set(sx, sy, n % 3 ? hex("#ffffff") : hex("#cfc6ff")); }
      const mx = LW * 0.82; disc(mx, 8, 5.5, hex("#fff3b0")); [[-2, -1], [1, 2], [2, -2], [-1, 1]].forEach(([a, b]) => set(mx + a, 8 + b, hex("#e8d890")));
      /* 중앙대 캠퍼스: 불 켜진 건물들, 꼭대기에 CAU 간판 */
      const dark = hex("#16244f"), lit = hex("#ffd86b"), dim = hex("#2c3d78");
      let i0 = 0, n = 0;
      while (i0 < LW) {
        const w = 10 + Math.round(rnd(n + 3) * 12), h = 8 + Math.round(rnd(n + 9) * 14), top = HZ - h;
        box(i0, top, w, h, dark);
        for (let j = top + 2; j < HZ - 1; j += 3) for (let i = i0 + 2; i < i0 + w - 2; i += 3) set(i, j, rnd(i * 7 + j) > 0.45 ? lit : dim);
        i0 += w + 1 + Math.round(rnd(n + 5) * 3); n++;
      }
      const cx = Math.round(LW * 0.6); box(cx - 9, HZ - 26, 19, 26, hex("#1b2c63")); for (let j = HZ - 22; j < HZ - 1; j += 3) for (let i = cx - 7; i < cx + 8; i += 3) set(i, j, rnd(i * 3 + j) > 0.35 ? lit : dim);
      box(cx - 8, HZ - 32, 17, 7, hex("#2c67be"), hex("#ffffff")); text("CAU", cx - 5, HZ - 31, hex("#ffffff"));
      for (let n = 0; n < 26; n++) { const sx = rnd(n + 7) * LW, sy = HZ + 3 + rnd(n + 31) * (LH - HZ - 5); if (sx > 56) set(sx, sy, hex("#8f84e0")); }
      for (let j = GY; j < LH; j++) {
        const e = edgeAt(2, j);
        for (let i = 0; i < e; i++) set(i, j + (j === GY ? Math.round(Math.sin(i / 3)) : 0), j < GY + 2 ? hex("#7a6fb0") : (i * 3 + j * 5) % 11 === 0 ? hex("#3c3466") : hex("#5a4f8a"));
        set(e, j, hex("#2a2450"));
      }
      [[8, GY + 6], [30, GY + 12], [40, GY + 4], [16, GY + 20]].forEach(([a, b]) => { set(a, b, hex("#7ff0ff")); set(a + 1, b - 1, hex("#c8ffff")); set(a + 1, b, hex("#7ff0ff")); set(a, b - 1, hex("#3fb8d8")); });
    }
    x.putImageData(im, 0, 0);
    if (pond === 2) {
      /* 청룡연못 한가운데 바위 위의 청룡상 */
      const sx = LW - 24;
      [[-9, 9, 0], [-11, 11, 1], [-11, 11, 2], [-10, 10, 3], [-8, 8, 4]].forEach(([a, b, dy]) => { x.fillStyle = dy === 0 ? "#9aa3c8" : dy < 3 ? "#5b6390" : "#3d4470"; x.fillRect(sx + a, HZ + 1 + dy, b - a, 1); });
      x.drawImage(fish(2, 4), sx - 13, HZ - 13);
    }
    return c;
  }
  function Pond(cv) {
    this.cv = cv; this.x = cv.getContext("2d"); this.st = { pond: 0, mode: "idle", tier: 0 }; this.since = performance.now();
    this.sh = [0, 1, 2, 3].map((i) => ({ f: rnd(i + 1), y: 0.25 + rnd(i + 7) * 0.65, v: (0.0012 + rnd(i + 3) * 0.0016) * (i % 2 ? 1 : -1) }));
    this.bg = null; this.bgKey = ""; this.last = 0; loadHD();
    const loop = (t) => { if (!this.cv.isConnected) return; if (t - this.last > 80 && !document.hidden) { this.last = t; try { this.draw(t); } catch (e) {} } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  Pond.prototype.set = function (st) {
    if (st.mode !== this.st.mode || st.pond !== this.st.pond) this.since = performance.now();
    this.st = Object.assign({}, st);
  };
  Pond.prototype.draw = function (t) {
    if (HDok && g.PXA && g.PXA.ok) return this.drawHD(t);
    const cv = this.cv, cw = cv.clientWidth || 300, ch = cv.clientHeight || 100;
    const LW = Math.max(120, Math.min(340, Math.round((LH * cw) / ch))), st = this.st, pond = st.pond | 0, mode = st.mode, age = t - this.since;
    if (cv.width !== LW || cv.height !== LH) { cv.width = LW; cv.height = LH; }
    const key = LW + "|" + pond;
    if (this.bgKey !== key) { this.bg = buildBg(LW, pond); this.bgKey = key; }
    const x = this.x, C = pondColors(pond);
    const R = (i, j, w, h, col) => { x.fillStyle = col; x.fillRect(Math.round(i), Math.round(j), w, h); };
    const line = (x0, y0, x1, y1, col) => { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; x.fillStyle = col; for (let n = 0; n < 400; n++) { x.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
    x.imageSmoothingEnabled = false;
    x.drawImage(this.bg, 0, 0);
    const water0 = Math.ceil(edgeAt(pond, GY)) + 6, bx = Math.round(Math.max(water0 + 26, LW * 0.64)), by = 74;
    /* 하늘과 물의 움직임 */
    if (pond === 0) {
      [[0, 7, 0.0025], [0.55, 15, 0.0016]].forEach(([o, cy, v]) => { const cx = (((o + t * v * 0.01) % 1) * (LW + 40)) - 20; R(cx, cy, 14, 3, "#ffffff"); R(cx + 3, cy - 2, 7, 2, "#ffffff"); R(cx + 2, cy + 3, 10, 1, "#e3f3ff"); });
    }
    if (pond === 1) {
      const sx = LW * 0.76, ph = Math.floor(t / 420) % 2;
      for (let k = 0; k < 9; k++) { const w = 18 - k * 2; if (w > 1) R(sx - w / 2 + ((k + ph) % 2 ? 1 : -1), HZ + 2 + k * 2, w, 1, "rgba(255,214,140,.75)"); }
      [[0.2, 9, 0.004], [0.6, 15, 0.003]].forEach(([o, cy, v]) => { const cx = ((o + t * v * 0.01) % 1) * (LW + 20) - 10, f = Math.floor(t / 300) % 2; R(cx, cy + f, 2, 1, "#4a3a5a"); R(cx + 2, cy + 1 - f, 1, 1, "#4a3a5a"); R(cx + 3, cy + f, 2, 1, "#4a3a5a"); });
    }
    if (pond === 2) {
      for (let n = 0; n < 8; n++) { if (Math.sin(t / 500 + n * 1.7) > 0.6) { const sx = Math.round(rnd(n) * LW), sy = Math.round(rnd(n + 99) * (HZ - 6)); R(sx - 1, sy, 3, 1, "#ffffff"); R(sx, sy - 1, 1, 3, "#ffffff"); } }
      const mx = LW * 0.82, ph = Math.floor(t / 450) % 2;
      for (let k = 0; k < 8; k++) R(mx - 3 + ((k + ph) % 2 ? 1 : -1), HZ + 3 + k * 3, 6 - (k > 4 ? 2 : 0), 1, "rgba(255,243,176,.55)");
    }
    for (let n = 0; n < 9; n++) { if (Math.sin(t / 650 + n * 2.3) > 0.35) { const sx = water0 + rnd(n + 50) * (LW - water0 - 6), sy = HZ + 4 + rnd(n + 70) * (LH - HZ - 8); R(sx, sy, 2 + (n % 3), 1, "rgba(255,255,255,.45)"); } }
    /* 물속 물고기 그림자 */
    x.fillStyle = "rgba(10,20,60,.22)";
    this.sh.forEach((s, n) => {
      s.f += s.v; if (s.f > 1.08) s.f = -0.08; if (s.f < -0.08) s.f = 1.08;
      let sx = water0 + s.f * (LW - water0), sy = HZ + 8 + s.y * (LH - HZ - 12);
      if (n === 0 && (mode === "wait" || mode === "bite")) { const k = mode === "bite" ? 1 : Math.min(1, age / 2500); sx = sx + (bx - 4 - sx) * k; sy = sy + (by + 4 - sy) * k; }
      x.fillRect(Math.round(sx) - 3, Math.round(sy), 7, 2); x.fillRect(Math.round(sx) - 2, Math.round(sy) - 1, 5, 1); x.fillRect(Math.round(sx) + 4, Math.round(sy) - 1, 2, 4);
    });
    /* 푸앙이 */
    const shake = mode === "bite" ? (Math.floor(t / 60) % 2 ? 1 : -1) : 0;
    const jump = mode === "caught" ? [0, -2, -4, -5, -4, -2, 0, 0][Math.floor(age / 70) % 8] * (age < 2400 ? 1 : 0) : 0;
    const blink = mode !== "bite" && t % 3600 < 140;
    const pose = mode === "caught" ? "cheer" : mode === "bite" ? "wow" : st.over ? "stand" : blink ? "blink" : "fish";
    const px0 = 8 + shake, py0 = GY - 35 + jump;
    x.drawImage(puang(pose), px0, py0);
    /* 낚싯대와 낚싯줄 */
    if (!st.over) {
      const hx = px0 + 25, hy = py0 + 25;
      const tip = mode === "caught" ? [hx + 8, hy - 27] : mode === "wait" ? [hx + 22, hy - 16] : mode === "bite" ? [hx + 21, hy - 9 + (Math.floor(t / 70) % 2)] : [hx + 11, hy - 25];
      line(hx - 2, hy + 2, hx + (tip[0] - hx) * 0.22, hy + (tip[1] - hy) * 0.22, "#4a2e14");
      line(hx + (tip[0] - hx) * 0.22, hy + (tip[1] - hy) * 0.22, tip[0], tip[1], "#9a6630");
      const lc = "rgba(255,255,255,.85)";
      if (mode === "wait" || mode === "bite") {
        const bob = mode === "wait" ? (Math.floor(t / 520) % 2) : 3;
        const sag = mode === "wait" ? 6 : 1;
        for (let k = 0; k <= 60; k++) { const u = k / 60, lx = (1 - u) * (1 - u) * tip[0] + 2 * u * (1 - u) * ((tip[0] + bx) / 2) + u * u * (bx + 1), ly = (1 - u) * (1 - u) * tip[1] + 2 * u * (1 - u) * (Math.max(tip[1], by) + sag) + u * u * (by - 3 + bob); R(lx, ly, 1, 1, lc); }
        if (mode === "wait") {
          for (let k = 0; k < 2; k++) { const a = ((age + k * 800) % 1600) / 1600, r = 2 + a * 9; x.globalAlpha = 1 - a; for (let q = 0; q < 28; q++) { const an = (q / 28) * Math.PI * 2; R(bx + 1 + Math.cos(an) * r, by + 1 + Math.sin(an) * r * 0.32, 1, 1, "#ffffff"); } x.globalAlpha = 1; }
          R(bx + 1, by - 5 + bob, 1, 2, "#1d2f5c"); R(bx, by - 3 + bob, 3, 2, "#ff3b30"); R(bx, by - 1 + bob, 3, 2, "#ffffff"); R(bx - 1, by + 1, 5, 1, "rgba(255,255,255,.6)");
        } else {
          R(bx, by + 1, 3, 1, "#ff3b30");
          for (let q = 0; q < 10; q++) { const an = rnd(q + Math.floor(t / 90)) * Math.PI, r = 3 + rnd(q * 3 + Math.floor(t / 90)) * 6; R(bx + 1 + Math.cos(an) * r, by - Math.sin(an) * r * 0.8, 1, 1, "#ffffff"); }
          /* 머리 위 느낌표 말풍선 */
          const qx = px0 + 27, qy = py0 - 7;
          R(qx, qy, 9, 11, "#1d2f5c"); R(qx + 1, qy + 1, 7, 9, "#ffffff"); R(qx + 2, qy + 11, 2, 2, "#1d2f5c");
          R(qx + 3, qy + 2, 3, 5, "#ff3b30"); R(qx + 3, qy + 8, 3, 1, "#ff3b30");
        }
      } else if (mode === "caught") {
        const f = fish(st.pondOf != null ? st.pondOf : pond, st.tier), sw = Math.round(Math.sin(t / 160));
        line(tip[0], tip[1], tip[0] + sw, tip[1] + 6, lc);
        x.drawImage(f, tip[0] + sw - 4, tip[1] + 4);
        if ((st.tier | 0) >= 2) for (let q = 0; q < 6; q++) { if (Math.sin(t / 180 + q * 1.9) > 0.2) { const a = (q / 6) * Math.PI * 2 + t / 900, sx = tip[0] + 9 + Math.cos(a) * 17, sy = tip[1] + 12 + Math.sin(a) * 10; R(sx - 1, sy, 3, 1, (st.tier | 0) >= 4 ? "#ffd84a" : "#ffffff"); R(sx, sy - 1, 1, 3, (st.tier | 0) >= 4 ? "#ffd84a" : "#ffffff"); } }
        if (age < 900) { const a = age / 900, r = 3 + a * 12; x.globalAlpha = 1 - a; for (let q = 0; q < 30; q++) { const an = (q / 30) * Math.PI * 2; R(bx + 1 + Math.cos(an) * r, by + 1 + Math.sin(an) * r * 0.32, 1, 1, "#ffffff"); } x.globalAlpha = 1; }
      } else {
        line(tip[0], tip[1], tip[0], tip[1] + 10, lc);
        R(tip[0], tip[1] + 9, 1, 1, "#1d2f5c"); R(tip[0] - 1, tip[1] + 10, 3, 2, "#ff3b30"); R(tip[0] - 1, tip[1] + 12, 3, 1, "#ffffff");
      }
    }
  };
  /* ---------- 고해상도 낚시터: 같은 자리(100줄)를 2배 촘촘한 그림(200줄)으로 ---------- */
  Pond.prototype.bgHD = function (W, pond, LW) {
    const I = HDI, P = g.PXA.IM, HZd = HZ * 2;
    const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = LH * 2; const x = c.getContext("2d"); x.imageSmoothingEnabled = false; return [c, x]; };
    const tile = (x, im, y, off) => { const w = im.width; for (let sx = -((((off || 0) % w) + w) % w); sx < W; sx += w) x.drawImage(im, sx, y); };
    /* A: 하늘 (해·달 포함) */
    const [A, a] = mk();
    tile(a, I["psky" + pond], 0);
    if (pond === 0) a.drawImage(P.sun, W - 118, -96);
    if (pond === 1) a.drawImage(I.psun1, Math.round(W * 0.76 - I.psun1.width / 2), HZd - I.psun1.height);
    if (pond === 2) a.drawImage(I.pmoon, Math.round(W * 0.82 - 16), 2);
    /* B: 먼 풍경 + 물 + 물 위 장식 (구름보다 앞) */
    const [B, b] = mk();
    if (pond === 0) {
      tile(b, I.pfar0, HZd - I.pfar0.height, 40);
      const sx = Math.round(Math.max(150, W * 0.64) - 50);
      b.drawImage(I.pcherry2, sx - 24, HZd - 30); b.drawImage(I.pcherry1, sx + 96, HZd - 30);
      b.drawImage(I.pschool, sx, HZd - 58);
      if (W > 420) b.drawImage(I.pcherry1, sx - 52, HZd - 28);
    }
    if (pond === 1) b.drawImage(I.pisland, Math.round(W * 0.34 - 43), HZd - I.pisland.height + 2);
    if (pond === 2) tile(b, I.pcity2, HZd - I.pcity2.height, 262 - Math.round(W * 0.58)); /* CAU 간판 빌딩이 가운데 오른쪽에 */
    tile(b, I["pwater" + pond], HZd);
    b.fillStyle = pond === 0 ? "#e6f6ff" : pond === 1 ? "#fff1dc" : "#6a70c0"; b.fillRect(0, HZd, W, 1);
    if (pond === 0) for (let i = 0; i < W; i += 4) { b.fillStyle = (i >> 2) % 2 ? "#c9d3dc" : "#9aa7b3"; b.fillRect(i, HZd - 2, 4, 2); }
    if (pond === 2) {
      const rx = W - 48;
      b.drawImage(I.prock, rx - 28, HZd - 6);
      b.drawImage(fish(2, 4), rx - 26, HZd - 34, 52, 32);
    }
    return [A, B];
  };
  Pond.prototype.drawHD = function (t) {
    const cv = this.cv, cw = cv.clientWidth || 300, ch = cv.clientHeight || 100;
    const LW = Math.max(120, Math.min(340, Math.round((LH * cw) / ch))), W = LW * 2, H = LH * 2, HZd = HZ * 2, GYd = GY * 2;
    const st = this.st, pond = st.pond | 0, mode = st.mode, age = t - this.since, I = HDI, P = g.PXA.IM;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const key = "hd|" + W + "|" + pond;
    if (this.bgKey !== key) { this.bg = this.bgHD(W, pond, LW); this.bgKey = key; }
    const x = this.x;
    x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false; x.globalAlpha = 1;
    const R = (i, j, w, h, col) => { x.fillStyle = col; x.fillRect(Math.round(i), Math.round(j), w, h); };
    const line = (x0, y0, x1, y1, col, th) => { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; x.fillStyle = col; for (let n = 0; n < 800; n++) { x.fillRect(x0, y0, th || 1, th || 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
    x.drawImage(this.bg[0], 0, 0);
    /* 하늘 움직임: 구름·별·갈매기 */
    const drift = (im, p, v, y) => { const span = W + im.width + 20, cx = (((p * span + t * v) % span) + span) % span - im.width; x.drawImage(im, Math.round(cx), y); };
    if (pond === 0) { drift(P.cloud2, 0.1, 0.004, 4); drift(P.cloud4, 0.55, 0.007, 22); }
    if (pond === 1) {
      drift(I.pcloud1, 0.15, 0.003, 8); drift(I.pcloud1b, 0.6, 0.005, 26);
      [[0.2, 18, 0.009], [0.62, 30, 0.007]].forEach(([o, cy, v]) => { const cx = ((o * (W + 40) + t * v) % (W + 40)) - 20, f = Math.floor(t / 260) % 2; R(cx, cy + f, 3, 1, "#3a2a50"); R(cx + 3, cy + 1 - f, 2, 1, "#3a2a50"); R(cx + 5, cy + f, 3, 1, "#3a2a50"); });
    }
    if (pond === 2) for (let n = 0; n < 34; n++) {
      const sx = Math.round(rnd(n) * W), sy = Math.round(2 + rnd(n + 99) * (HZd - 40)), tw = Math.sin(t / 520 + n * 1.7);
      if (tw > 0.55) { R(sx - 1, sy, 3, 1, "#ffffff"); R(sx, sy - 1, 1, 3, "#ffffff"); } else R(sx, sy, 1, 1, n % 3 ? "#c8d0ff" : "#ffffff");
    }
    x.drawImage(this.bg[1], 0, 0);
    /* 물빛: 해·달 그림자와 반짝이 */
    if (pond === 1 || pond === 2) {
      const sx = W * (pond === 1 ? 0.76 : 0.82), ph = Math.floor(t / 420) % 2;
      for (let k = 0; k < 12; k++) { const w = Math.max(2, (pond === 1 ? 46 : 18) - k * (pond === 1 ? 4 : 1.4)); R(sx - w / 2 + ((k + ph) % 2 ? 2 : -2), HZd + 3 + k * 4, Math.round(w), 1, pond === 1 ? "rgba(255,226,160,.8)" : "rgba(255,243,176,.6)"); }
    }
    const water0 = Math.ceil(edgeAt(pond, GY)) + 6, bxL = Math.round(Math.max(water0 + 26, LW * 0.64)), byL = 74, bx = bxL * 2, by = byL * 2;
    for (let n = 0; n < 12; n++) { if (Math.sin(t / 650 + n * 2.3) > 0.35) { const sx = water0 * 2 + rnd(n + 50) * (W - water0 * 2 - 12), sy = HZd + 8 + rnd(n + 70) * (H - HZd - 16); R(sx, sy, 3 + (n % 4) * 2, 1, "rgba(255,255,255,.5)"); } }
    /* 물속 물고기 그림자 */
    x.fillStyle = "rgba(10,20,60,.2)";
    this.sh.forEach((s, n) => {
      s.f += s.v; if (s.f > 1.08) s.f = -0.08; if (s.f < -0.08) s.f = 1.08;
      let sx = water0 + s.f * (LW - water0), sy = HZ + 8 + s.y * (LH - HZ - 12);
      if (n === 0 && (mode === "wait" || mode === "bite")) { const k = mode === "bite" ? 1 : Math.min(1, age / 2500); sx = sx + (bxL - 4 - sx) * k; sy = sy + (byL + 4 - sy) * k; }
      const X = Math.round(sx * 2), Y = Math.round(sy * 2), d = s.v > 0 ? 1 : -1;
      x.fillRect(X - 7, Y, 14, 4); x.fillRect(X - 5, Y - 1, 10, 6); x.fillRect(X - 3, Y - 2, 6, 8); x.fillRect(X + 8 * -d - (d < 0 ? 0 : 3), Y - 2, 3, 8);
    });
    if (pond === 0) [[0.47, 168, "plilyf"], [0.9, 184, "plily"], [0.7, 194, "plily"]].forEach(([f, cy, n]) => x.drawImage(I[n], Math.round(W * f - 15), cy - 8 + (Math.floor(t / 900 + f * 7) % 2)));
    x.drawImage(I["pbank" + pond], 0, GYd - 24);
    /* 푸앙이 (고해상도) */
    const shake = mode === "bite" ? (Math.floor(t / 60) % 2 ? 2 : -2) : 0;
    const jump = mode === "caught" ? [0, -4, -8, -10, -8, -4, 0, 0][Math.floor(age / 70) % 8] * (age < 2400 ? 1 : 0) : 0;
    const blink = mode !== "bite" && t % 3600 < 140;
    const pose = mode === "caught" ? "cheer" : mode === "bite" ? "wow" : st.over ? "stand" : blink ? "blink" : "fish";
    const PI = P[pose] || P.stand, px0 = 14 + shake, py0 = GYd - PI.height + jump; /* 발바닥은 그림 아래에서 4칸 위 */
    R(px0 + 20, GYd - 2, 30, 3, "rgba(20,40,20,.25)");
    x.drawImage(PI, px0, py0);
    /* 낚싯대와 낚싯줄 */
    if (!st.over) {
      const up = pose === "cheer" || pose === "wow", hx = px0 + (up ? 56 : 55), hy = py0 + (up ? 47 : 56); /* 낚싯대를 쥔 앞손 */
      const tip = mode === "caught" ? [hx + 14, hy - 56] : mode === "wait" ? [hx + 46, hy - 34] : mode === "bite" ? [hx + 44, hy - 18 + (Math.floor(t / 70) % 2) * 2] : [hx + 24, hy - 52];
      const mx = hx + (tip[0] - hx) * 0.24, my = hy + (tip[1] - hy) * 0.24;
      line(hx - 3, hy + 4, mx, my, "#4a2e14", 3);
      line(mx, my, tip[0], tip[1], "#8a5a2b", 2); line(mx, my - 1, tip[0], tip[1] - 1, "#c8925a", 1);
      R(hx - 2, hy - 1, 4, 4, "#1d2f5c"); R(mx - 1, my - 1, 3, 3, "#d0d6e0");
      const lc = "rgba(255,255,255,.9)";
      if (mode === "wait" || mode === "bite") {
        const bob = mode === "wait" ? (Math.floor(t / 520) % 2) * 2 : 5, sag = mode === "wait" ? 14 : 2;
        for (let k = 0; k <= 140; k++) { const u = k / 140, lx = (1 - u) * (1 - u) * tip[0] + 2 * u * (1 - u) * ((tip[0] + bx) / 2) + u * u * bx, ly = (1 - u) * (1 - u) * tip[1] + 2 * u * (1 - u) * (Math.max(tip[1], by) + sag) + u * u * (by - 10 + bob); R(lx, ly, 1, 1, lc); }
        if (mode === "wait") {
          for (let k = 0; k < 2; k++) { const a = ((age + k * 800) % 1600) / 1600, r = 4 + a * 20; x.globalAlpha = 1 - a; for (let q = 0; q < 56; q++) { const an = (q / 56) * Math.PI * 2; R(bx + Math.cos(an) * r, by + 1 + Math.sin(an) * r * 0.32, 1, 1, "#ffffff"); } x.globalAlpha = 1; }
          R(bx - 1, by - 13 + bob, 2, 4, "#1d2f5c"); R(bx - 3, by - 9 + bob, 6, 4, "#ff3b30"); R(bx - 2, by - 9 + bob, 2, 1, "#ff8a80"); R(bx - 3, by - 5 + bob, 6, 4, "#ffffff"); R(bx - 4, by - 1, 8, 1, "rgba(255,255,255,.6)");
        } else {
          R(bx - 3, by + 1, 6, 2, "#ff3b30");
          for (let q = 0; q < 16; q++) { const an = rnd(q + Math.floor(t / 90)) * Math.PI, r = 6 + rnd(q * 3 + Math.floor(t / 90)) * 12; R(bx + Math.cos(an) * r, by - Math.sin(an) * r * 0.8, 2, 2, "#ffffff"); }
          const qx = px0 + 46, qy = py0 - 4;
          R(qx, qy, 16, 20, "#1d2f5c"); R(qx + 2, qy + 2, 12, 16, "#ffffff"); R(qx + 3, qy + 20, 4, 4, "#1d2f5c");
          R(qx + 6, qy + 4, 4, 8, "#ff3b30"); R(qx + 6, qy + 14, 4, 2, "#ff3b30");
        }
      } else if (mode === "caught") {
        const f = fish(st.pondOf != null ? st.pondOf : pond, st.tier), sw = Math.round(Math.sin(t / 160) * 2);
        line(tip[0], tip[1], tip[0] + sw, tip[1] + 12, lc, 1);
        x.drawImage(f, tip[0] + sw - 8, tip[1] + 8, f.width * 2, f.height * 2);
        if ((st.tier | 0) >= 2) for (let q = 0; q < 6; q++) { if (Math.sin(t / 180 + q * 1.9) > 0.2) { const a = (q / 6) * Math.PI * 2 + t / 900, sx = tip[0] + 18 + Math.cos(a) * 34, sy = tip[1] + 24 + Math.sin(a) * 20, c = (st.tier | 0) >= 4 ? "#ffd84a" : "#ffffff"; R(sx - 2, sy, 5, 1, c); R(sx, sy - 2, 1, 5, c); } }
        if (age < 900) { const a = age / 900, r = 6 + a * 24; x.globalAlpha = 1 - a; for (let q = 0; q < 60; q++) { const an = (q / 60) * Math.PI * 2; R(bx + Math.cos(an) * r, by + 1 + Math.sin(an) * r * 0.32, 1, 1, "#ffffff"); } x.globalAlpha = 1; }
      } else {
        line(tip[0], tip[1], tip[0], tip[1] + 20, lc, 1);
        R(tip[0] - 1, tip[1] + 17, 2, 3, "#1d2f5c"); R(tip[0] - 2, tip[1] + 20, 5, 3, "#ff3b30"); R(tip[0] - 2, tip[1] + 23, 5, 2, "#ffffff");
      }
    }
  };
  g.PX = { PAL, PUANG, FISH, puang, fish, fishURL, puangURL, fishImg, puangImg, pond: (cv) => new Pond(cv) };
})(typeof window !== "undefined" ? window : globalThis);
