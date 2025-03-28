export interface BeatData {
  audioFile: string;
  beatName: string;
  beatDate: string;
  beatKey: string;
  beatProducer: string;
  beatPerMin: number | null;
}

export const beatsData: BeatData[] = [
  // 1. 2021/JUNE 2021/KYOTO.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2021/JUNE%202021/KYOTO.mp3",
    beatName: "KYOTO",
    beatDate: "JUNE 2021",
    beatKey: "",
    beatProducer: "Xae Neptune",
    beatPerMin: null,
  },
  // 2. 2021/OCT 2021/FIRST CLASS.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2021/OCT%202021/FIRST%20CLASS.mp3",
    beatName: "FIRST CLASS",
    beatDate: "OCT 2021",
    beatKey: "",
    beatProducer: "Xae Neptune",
    beatPerMin: null,
  },
  // 3. 2021/OCT 2021/GRIMY.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2021/OCT%202021/GRIMY.mp3",
    beatName: "GRIMY",
    beatDate: "OCT 2021",
    beatKey: "",
    beatProducer: "Xae Neptune",
    beatPerMin: null,
  },
  // 4. 2022/APRIL 2022/LURKING (ayybmo x Cloud).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/LURKING%20(ayybmo%20x%20Cloud).mp3",
    beatName: "LURKING",
    beatDate: "APRIL 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo x Cloud",
    beatPerMin: null,
  },
  // 5. 2022/APRIL 2022/Xae Neptune  - ViBE 140 (F# major) - Serum.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/Xae%20Neptune%20%20-%20ViBE%20140%20(F%23%20major)%20-%20Serum.mp3",
    beatName: "ViBE",
    beatDate: "APRIL 2022",
    beatKey: "F# major",
    beatProducer: "Xae Neptune",
    beatPerMin: 140,
  },
  // 6. 2022/APRIL 2022/Xae Neptune  x Yvksel x Xcessive - Purifier 158 (F minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/Xae%20Neptune%20%20x%20Yvksel%20x%20Xcessive%20-%20Purifier%20158%20(F%20minor).mp3",
    beatName: "Purifier",
    beatDate: "APRIL 2022",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x Yvksel x Xcessive",
    beatPerMin: 158,
  },
  // 7. 2022/APRIL 2022/Xae Neptune x Dinero Tarantino - 180 (Db major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/Xae%20Neptune%20x%20Dinero%20Tarantino%20-%20180%20(Db%20major).mp3",
    beatName: "180",
    beatDate: "APRIL 2022",
    beatKey: "Db major",
    beatProducer: "Xae Neptune x Dinero Tarantino",
    beatPerMin: 180,
  },
  // 8. 2022/APRIL 2022/Xae Neptune x Loaded - Thoughts Of Her 124 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/Xae%20Neptune%20x%20Loaded%20-%20Thoughts%20Of%20Her%20124%20(E%20minor).mp3",
    beatName: "Thoughts Of Her",
    beatDate: "APRIL 2022",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x Loaded",
    beatPerMin: 124,
  },
  // 9. 2022/APRIL 2022/Xae Neptune x ayybmo - momo 141 - Eb minor.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/APRIL%202022/Xae%20Neptune%20x%20ayybmo%20-%20momo%20141%20-%20Eb%20minor.mp3",
    beatName: "momo",
    beatDate: "APRIL 2022",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 141,
  },
  // 10. 2022/AUG 2022/Xae Neptune x 80.ymar - Sin 144 (D minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%2080.ymar%20-%20Sin%20144%20(D%20minor).mp3",
    beatName: "Sin",
    beatDate: "AUG 2022",
    beatKey: "D minor",
    beatProducer: "Xae Neptune x 80.ymar",
    beatPerMin: 144,
  },
  // 11. 2022/AUG 2022/Xae Neptune x DB! - Red Ritalin 164 (Eb minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20DB!%20-%20Red%20Ritalin%20164%20(Eb%20minor).mp3",
    beatName: "Red Ritalin",
    beatDate: "AUG 2022",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 164,
  },
  // 12. 2022/AUG 2022/Xae Neptune x Nate - Forensics 140 (E major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20Nate%20-%20Forensics%20140%20(E%20major).mp3",
    beatName: "Forensics",
    beatDate: "AUG 2022",
    beatKey: "E major",
    beatProducer: "Xae Neptune x Nate",
    beatPerMin: 140,
  },
  // 13. 2022/AUG 2022/Xae Neptune x Nate - Shells 158 (C# major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20Nate%20-%20Shells%20158%20(C%23%20major).mp3",
    beatName: "Shells",
    beatDate: "AUG 2022",
    beatKey: "C# major",
    beatProducer: "Xae Neptune x Nate",
    beatPerMin: 158,
  },
  // 14. 2022/AUG 2022/Xae Neptune x TCW Tre - Rewind 127 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20TCW%20Tre%20-%20Rewind%20127%20(E%20minor).mp3",
    beatName: "Rewind",
    beatDate: "AUG 2022",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x TCW Tre",
    beatPerMin: 127,
  },
  // 15. 2022/AUG 2022/Xae Neptune x ayybmo - Dirtydiana 143 (B major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20ayybmo%20-%20Dirtydiana%20143%20(B%20major).mp3",
    beatName: "Dirtydiana",
    beatDate: "AUG 2022",
    beatKey: "B major",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 143,
  },
  // 16. 2022/DEC 2022/Xae Neptune x Bryceunknwn x y2tnb - Grace 137 (F minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/DEC%202022/Xae%20Neptune%20x%20Bryceunknwn%20x%20y2tnb%20-%20Grace%20137%20(F%20minor).mp3",
    beatName: "Grace",
    beatDate: "DEC 2022",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x Bryceunknwn x y2tnb",
    beatPerMin: 137,
  },
  // 17. 2022/FEB 2022/XAE x CHEF9THEGOD - 144 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/FEB%202022/XAE%20x%20CHEF9THEGOD%20-%20144%20bpm.mp3",
    beatName: "144 bpm",
    beatDate: "FEB 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x CHEF9THEGOD",
    beatPerMin: 144,
  },
  // 18. 2022/FEB 2022/XAE x CHEF9THEGOD - 152 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/FEB%202022/XAE%20x%20CHEF9THEGOD%20-%20152%20bpm.mp3",
    beatName: "152 bpm",
    beatDate: "FEB 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x CHEF9THEGOD",
    beatPerMin: 152,
  },
  // 19. 2022/FEB 2022/XAE x LOADED - 152 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/FEB%202022/XAE%20x%20LOADED%20-%20152%20bpm.mp3",
    beatName: "152 bpm",
    beatDate: "FEB 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x LOADED",
    beatPerMin: 152,
  },
  // 20. 2022/FEB 2022/XAE x starboyrob x Synthetic - 140 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/FEB%202022/XAE%20x%20starboyrob%20x%20Synthetic%20-%20140%20bpm.mp3",
    beatName: "140 bpm",
    beatDate: "FEB 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x starboyrob x Synthetic",
    beatPerMin: 140,
  },
  // 21. 2022/JAN 2022/SOUTHWEST.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JAN%202022/SOUTHWEST.mp3",
    beatName: "SOUTHWEST",
    beatDate: "JAN 2022",
    beatKey: "",
    beatProducer: "Xae Neptune",
    beatPerMin: null,
  },
  // 22. 2022/JAN 2022/Xae Neptune x Cloud x DB! - 152 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JAN%202022/Xae%20Neptune%20x%20Cloud%20x%20DB!%20-%20152%20bpm.mp3",
    beatName: "152 bpm",
    beatDate: "JAN 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x Cloud x DB!",
    beatPerMin: 152,
  },
  // 23. 2022/JAN 2022/Xae Neptune x ayybmo - 146 BPM.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JAN%202022/Xae%20Neptune%20x%20ayybmo%20-%20146%20BPM.mp3",
    beatName: "146 BPM",
    beatDate: "JAN 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 146,
  },
  // 24. 2022/JAN 2022/Xae Neptune x ayybmo - 149 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JAN%202022/Xae%20Neptune%20x%20ayybmo%20-%20149%20bpm.mp3",
    beatName: "149 bpm",
    beatDate: "JAN 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 149,
  },
  // 25. 2022/JULY 2022/Xae Neptune x DB! - Find You 150 (G minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20DB!%20-%20Find%20You%20150%20(G%20minor).mp3",
    beatName: "Find You",
    beatDate: "JULY 2022",
    beatKey: "G minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 150,
  },
  // 26. 2022/JULY 2022/Xae Neptune x DB! - Trust 154 (F# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20DB!%20-%20Trust%20154%20(F%23%20minor).mp3",
    beatName: "Trust",
    beatDate: "JULY 2022",
    beatKey: "F# minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 154,
  },
  // 27. 2022/JULY 2022/Xae Neptune x Nate - Fall Down 151 (G minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20Nate%20-%20Fall%20Down%20151%20(G%20minor).mp3",
    beatName: "Fall Down",
    beatDate: "JULY 2022",
    beatKey: "G minor",
    beatProducer: "Xae Neptune x Nate",
    beatPerMin: 151,
  },
  // 28. 2022/JULY 2022/Xae Neptune x Rich James - Me&You 125 (Eb major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20Rich%20James%20-%20Me%26You%20125%20(Eb%20major).mp3",
    beatName: "Me&You",
    beatDate: "JULY 2022",
    beatKey: "Eb major",
    beatProducer: "Xae Neptune x Rich James",
    beatPerMin: 125,
  },
  // 29. 2022/JULY 2022/Xae Neptune x ZachWeTrust - Portal 129 (C minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20ZachWeTrust%20-%20Portal%20129%20(C%20minor).mp3",
    beatName: "Portal",
    beatDate: "JULY 2022",
    beatKey: "C minor",
    beatProducer: "Xae Neptune x ZachWeTrust",
    beatPerMin: 129,
  },
  // 30. 2022/JULY 2022/Xae Neptune x ayybmo - fifteen 141 (B minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JULY%202022/Xae%20Neptune%20x%20ayybmo%20-%20fifteen%20141%20(B%20minor).mp3",
    beatName: "fifteen",
    beatDate: "JULY 2022",
    beatKey: "B minor",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 141,
  },
  // 31. 2022/JUNE 2022/XAE x CHEF9THEGOD - 139 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/XAE%20x%20CHEF9THEGOD%20-%20139%20bpm.mp3",
    beatName: "139 bpm",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x CHEF9THEGOD",
    beatPerMin: 139,
  },
  // 32. 2022/JUNE 2022/Xae Neptune - currents 152 (F# major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20-%20currents%20152%20(F%23%20major).mp3",
    beatName: "currents",
    beatDate: "JUNE 2022",
    beatKey: "F# major",
    beatProducer: "Xae Neptune",
    beatPerMin: 152,
  },
  // 33. 2022/JUNE 2022/Xae Neptune x Exuising - !Dont Play 170 (C# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20Exuising%20-%20!Dont%20Play%20170%20(C%23%20minor).mp3",
    beatName: "!Dont Play",
    beatDate: "JUNE 2022",
    beatKey: "C# minor",
    beatProducer: "Xae Neptune x Exuising",
    beatPerMin: 170,
  },
  // 34. 2022/JUNE 2022/Xae Neptune x Loaded x Hittah - Crash Dummy 141 (C# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20Loaded%20x%20Hittah%20-%20Crash%20Dummy%20141%20(C%23%20minor).mp3",
    beatName: "Crash Dummy",
    beatDate: "JUNE 2022",
    beatKey: "C# minor",
    beatProducer: "Xae Neptune x Loaded x Hittah",
    beatPerMin: 141,
  },
  // 35. 2022/JUNE 2022/Xae Neptune x Starboyrob x 80.ymar - creator 140.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20Starboyrob%20x%2080.ymar%20-%20creator%20140.mp3",
    beatName: "creator",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x Starboyrob x 80.ymar",
    beatPerMin: 140,
  },
  // 36. 2022/JUNE 2022/Xae Neptune x Vxin - cucumber 130 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20Vxin%20-%20cucumber%20130%20bpm.mp3",
    beatName: "cucumber",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x Vxin",
    beatPerMin: 130,
  },
  // 37. 2022/JUNE 2022/Xae Neptune x ayybmo - _spinners v2 146 bpm.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20ayybmo%20-%20_spinners%20v2%20146%20bpm.mp3",
    beatName: "_spinners v2",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 146,
  },
  // 38. 2022/JUNE 2022/Xae Neptune x ayybmo - floater 143.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20ayybmo%20-%20floater%20143.mp3",
    beatName: "floater",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 143,
  },
  // 39. 2022/JUNE 2022/Xae Neptune x ayybmo - lucy 141.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20ayybmo%20-%20lucy%20141.mp3",
    beatName: "lucy",
    beatDate: "JUNE 2022",
    beatKey: "",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 141,
  },
  // 40. 2022/JUNE 2022/Xae Neptune x primegokrazy - duplex! 139 (Eb minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/JUNE%202022/Xae%20Neptune%20x%20primegokrazy%20-%20duplex!%20139%20(Eb%20minor).mp3",
    beatName: "duplex!",
    beatDate: "JUNE 2022",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x primegokrazy",
    beatPerMin: 139,
  },
  // 41. 2022/NOV 2022/Xae Neptune x DB! - Into Your Heart 127 (G minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/NOV%202022/Xae%20Neptune%20x%20DB!%20-%20Into%20Your%20Heart%20127%20(G%20minor).mp3",
    beatName: "Into Your Heart",
    beatDate: "NOV 2022",
    beatKey: "G minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 127,
  },
  // 42. 2022/NOV 2022/Xae Neptune x DB! - Jordan Poole 122 (Db major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/NOV%202022/Xae%20Neptune%20x%20DB!%20-%20Jordan%20Poole%20122%20(Db%20major).mp3",
    beatName: "Jordan Poole",
    beatDate: "NOV 2022",
    beatKey: "Db major",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 122,
  },
  // 43. 2022/NOV 2022/Xae Neptune x North of Ikari - mayfield 134 (F minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/NOV%202022/Xae%20Neptune%20x%20North%20of%20Ikari%20-%20mayfield%20134%20(F%20minor).mp3",
    beatName: "mayfield",
    beatDate: "NOV 2022",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x North of Ikari",
    beatPerMin: 134,
  },
  // 44. 2022/NOV 2022/Xae Neptune x Rich James - Me&You 125 (Eb major) v2.mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/NOV%202022/Xae%20Neptune%20x%20Rich%20James%20-%20Me&You%20125%20(Eb%20major)%20v2.mp3",
    beatName: "Me&You",
    beatDate: "NOV 2022",
    beatKey: "Eb major",
    beatProducer: "Xae Neptune x Rich James",
    beatPerMin: 125,
  },
  // 45. 2022/NOV 2022/Xae Neptune x ayybmo - artlu 126 (G major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/NOV%202022/Xae%20Neptune%20x%20ayybmo%20-%20artlu%20126%20(G%20major).mp3",
    beatName: "artlu",
    beatDate: "NOV 2022",
    beatKey: "G major",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 126,
  },
  // 46. 2022/OCT 2022/Xae Neptune  x inuyasha - ERGONOMICS 130 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/OCT%202022/Xae%20Neptune%20%20x%20inuyasha%20-%20ERGONOMICS%20130%20(E%20minor).mp3",
    beatName: "ERGONOMICS",
    beatDate: "OCT 2022",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 130,
  },
  // 47. 2022/OCT 2022/Xae Neptune x Rich James - Me&You 125 (Eb major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/OCT%202022/Xae%20Neptune%20x%20Rich%20James%20-%20Me&You%20125%20(Eb%20major).mp3",
    beatName: "Me&You",
    beatDate: "OCT 2022",
    beatKey: "Eb major",
    beatProducer: "Xae Neptune x Rich James",
    beatPerMin: 125,
  },
  // 48. 2022/OCT 2022/Xae Neptune x Yung Sensai - Heaven 127 (C# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/OCT%202022/Xae%20Neptune%20x%20Yung%20Sensai%20-%20Heaven%20127%20(C%23%20minor).mp3",
    beatName: "Heaven",
    beatDate: "OCT 2022",
    beatKey: "C# minor",
    beatProducer: "Xae Neptune x Yung Sensai",
    beatPerMin: 127,
  },
  // 49. 2022/OCT 2022/Xae Neptune x inuyasha - DELAYED FIXTURE 135 (G# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/OCT%202022/Xae%20Neptune%20x%20inuyasha%20-%20DELAYED%20FIXTURE%20135%20(G%23%20minor).mp3",
    beatName: "DELAYED FIXTURE",
    beatDate: "OCT 2022",
    beatKey: "G# minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 135,
  },
  // 50. 2022/SEPT 2022/Xae Neptune x CHEF9THEGOD - summoningdemons 134 (C major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/SEPT%202022/Xae%20Neptune%20x%20CHEF9THEGOD%20-%20summoningdemons%20134%20(C%20major).mp3",
    beatName: "summoningdemons",
    beatDate: "SEPT 2022",
    beatKey: "C major",
    beatProducer: "Xae Neptune x CHEF9THEGOD",
    beatPerMin: 134,
  },
  // 51. 2022/SEPT 2022/Xae Neptune x primegokrazy - Lone 140 (D minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/SEPT%202022/Xae%20Neptune%20x%20primegokrazy%20-%20Lone%20140%20(D%20minor).mp3",
    beatName: "Lone",
    beatDate: "SEPT 2022",
    beatKey: "D minor",
    beatProducer: "Xae Neptune x primegokrazy",
    beatPerMin: 140,
  },
  // 52. 2022/SEPT 2022/Xae Neptune x whiteslime - Language 161 (D# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/SEPT%202022/Xae%20Neptune%20x%20whiteslime%20-%20Language%20161%20(D%23%20minor).mp3",
    beatName: "Language",
    beatDate: "SEPT 2022",
    beatKey: "D# minor",
    beatProducer: "Xae Neptune x whiteslime",
    beatPerMin: 161,
  },
  // 53. 2023/R&B PACK (Connect Zero)/Xae Neptune x DB! x 6jugg - Bad Bad Bad 98 (B minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2023/R&B%20PACK%20(Connect%20Zero)/Xae%20Neptune%20x%20DB!%20x%206jugg%20-%20Bad%20Bad%20Bad%2098%20(B%20minor).mp3",
    beatName: "Bad Bad Bad",
    beatDate: "2023/R&B PACK (Connect Zero)",
    beatKey: "B minor",
    beatProducer: "Xae Neptune x DB! x 6jugg",
    beatPerMin: 98,
  },
  // 54. 2023/R&B PACK (Connect Zero)/Xae Neptune x Loaded x Hittah - Charisma 85 (Ab minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2023/R&B%20PACK%20(Connect%20Zero)/Xae%20Neptune%20x%20Loaded%20x%20Hittah%20-%20Charisma%2085%20(Ab%20minor).mp3",
    beatName: "Charisma",
    beatDate: "2023/R&B PACK (Connect Zero)",
    beatKey: "Ab minor",
    beatProducer: "Xae Neptune x Loaded x Hittah",
    beatPerMin: 85,
  },
  // 55. 2024/APR 2024/Xae Neptune x inuyasha - two bands 135 (A major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/APR%202024/Xae%20Neptune%20x%20inuyasha%20-%20two%20bands%20135%20(A%20major).mp3",
    beatName: "two bands",
    beatDate: "APR 2024",
    beatKey: "A major",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 135,
  },
  // 56. 2024/AUG 2024/Xae Neptune x Hitgirl x Bosley - sunshower 140 (C major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/AUG%202024/Xae%20Neptune%20x%20Hitgirl%20x%20Bosley%20-%20sunshower%20140%20(C%20major).mp3",
    beatName: "sunshower",
    beatDate: "AUG 2024",
    beatKey: "C major",
    beatProducer: "Xae Neptune x Hitgirl x Bosley",
    beatPerMin: 140,
  },
  // 57. 2024/AUG 2024/Xae Neptune x VGS Midnight x Gabe Lucas - GAMES 146 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/AUG%202024/Xae%20Neptune%20x%20VGS%20Midnight%20x%20Gabe%20Lucas%20-%20GAMES%20146%20(E%20minor).mp3",
    beatName: "GAMES",
    beatDate: "AUG 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x VGS Midnight x Gabe Lucas",
    beatPerMin: 146,
  },
  // 58. 2024/AUG 2024/Xae Neptune x inuyasha - BABYMONEY 150 (B major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/AUG%202024/Xae%20Neptune%20x%20inuyasha%20-%20BABYMONEY%20150%20(B%20major).mp3",
    beatName: "BABYMONEY",
    beatDate: "AUG 2024",
    beatKey: "B major",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 150,
  },
  // 59. 2024/FEB 2024/Xae Neptune x DB! -purplepink 160 (A minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20DB!%20-purplepink%20160%20(A%20minor).mp3",
    beatName: "purplepink",
    beatDate: "FEB 2024",
    beatKey: "A minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 160,
  },
  // 60. 2024/FEB 2024/Xae Neptune x DB! x 6jugg x beniano - SURVIVAL 152 (B major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20DB!%20x%206jugg%20x%20beniano%20-%20SURVIVAL%20152%20(B%20major).mp3",
    beatName: "SURVIVAL",
    beatDate: "FEB 2024",
    beatKey: "B major",
    beatProducer: "Xae Neptune x DB! x 6jugg x beniano",
    beatPerMin: 152,
  },
  // 61. 2024/FEB 2024/Xae Neptune x DB! x Cloud - NOSLEEP 140 (Eb minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20DB!%20x%20Cloud%20-%20NOSLEEP%20140%20(Eb%20minor).mp3",
    beatName: "NOSLEEP",
    beatDate: "FEB 2024",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x DB! x Cloud",
    beatPerMin: 140,
  },
  // 62. 2024/FEB 2024/Xae Neptune x DB! x Evince x Lily Kaplan - withoutyou 148 (D minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20DB!%20x%20Evince%20x%20Lily%20Kaplan%20-%20withoutyou%20148%20(D%20minor).mp3",
    beatName: "withoutyou",
    beatDate: "FEB 2024",
    beatKey: "D minor",
    beatProducer: "Xae Neptune x DB! x Evince x Lily Kaplan",
    beatPerMin: 148,
  },
  // 63. 2024/FEB 2024/Xae Neptune x Smoke Fusion - LEFTRIGHT 121 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20Smoke%20Fusion%20-%20LEFTRIGHT%20121%20(E%20minor).mp3",
    beatName: "LEFTRIGHT",
    beatDate: "FEB 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x Smoke Fusion",
    beatPerMin: 121,
  },
  // 64. 2024/FEB 2024/Xae Neptune x Supah Mario - ATLANTIS 140 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20Supah%20Mario%20-%20ATLANTIS%20140%20(E%20minor).mp3",
    beatName: "ATLANTIS",
    beatDate: "FEB 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x Supah Mario",
    beatPerMin: 140,
  },
  // 65. 2024/FEB 2024/Xae Neptune x VGS Midnight x iconic2o2 - hacks 142 (Db minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20VGS%20Midnight%20x%20iconic2o2%20-%20hacks%20142%20(Db%20minor).mp3",
    beatName: "hacks",
    beatDate: "FEB 2024",
    beatKey: "Db minor",
    beatProducer: "Xae Neptune x VGS Midnight x iconic2o2",
    beatPerMin: 142,
  },
  // 66. 2024/FEB 2024/Xae Neptune x VGS Midnight x obmus1c - GOLDTEETH 161 (Db minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20VGS%20Midnight%20x%20obmus1c%20-%20GOLDTEETH%20161%20(Db%20minor).mp3",
    beatName: "GOLDTEETH",
    beatDate: "FEB 2024",
    beatKey: "Db minor",
    beatProducer: "Xae Neptune x VGS Midnight x obmus1c",
    beatPerMin: 161,
  },
  // 67. 2024/FEB 2024/Xae Neptune x inuyasha - 3D 157 (F minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20inuyasha%20-%203D%20157%20(F%20minor).mp3",
    beatName: "3D",
    beatDate: "FEB 2024",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 157,
  },
  // 68. 2024/FEB 2024/Xae Neptune x primegokrazy - mechanism 138 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/FEB%202024/Xae%20Neptune%20x%20primegokrazy%20-%20mechanism%20138%20(E%20minor).mp3",
    beatName: "mechanism",
    beatDate: "FEB 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x primegokrazy",
    beatPerMin: 138,
  },
  // 69. 2024/JAN 2024/Xae Neptune x Supah Mario - DRONE GANG SHIT 141 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/JAN%202024/Xae%20Neptune%20x%20Supah%20Mario%20-%20DRONE%20GANG%20SHIT%20141%20(E%20minor).mp3",
    beatName: "DRONE GANG SHIT",
    beatDate: "JAN 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x Supah Mario",
    beatPerMin: 141,
  },
  // 70. 2024/JAN 2024/Xae Neptune x inuyasha - EDEN 120 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/JAN%202024/Xae%20Neptune%20x%20inuyasha%20-%20EDEN%20120%20(E%20minor).mp3",
    beatName: "EDEN",
    beatDate: "JAN 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 120,
  },
  // 71. 2024/JAN 2024/Xae Neptune x inuyasha - SATURN 130 (F# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/JAN%202024/Xae%20Neptune%20x%20inuyasha%20-%20SATURN%20130%20(F%23%20minor).mp3",
    beatName: "SATURN",
    beatDate: "JAN 2024",
    beatKey: "F# minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 130,
  },
  // 72. 2024/MAR 2024/Xae Neptune - BHAN 150 (F minor) [SAMPLE]..mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20-%20BHAN%20150%20(F%20minor)%20[SAMPLE]..mp3",
    beatName: "BHAN",
    beatDate: "MAR 2024",
    beatKey: "F minor",
    beatProducer: "Xae Neptune",
    beatPerMin: 150,
  },
  // 73. 2024/MAR 2024/Xae Neptune x Nate B x kicookedit - CVS 150 (D minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20Nate%20B%20x%20kicookedit%20-%20CVS%20150%20(D%20minor).mp3",
    beatName: "CVS",
    beatDate: "MAR 2024",
    beatKey: "D minor",
    beatProducer: "Xae Neptune x Nate B x kicookedit",
    beatPerMin: 150,
  },
  // 74. 2024/MAR 2024/Xae Neptune x Smoke Fusion - isabella 120 (C minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20Smoke%20Fusion%20-%20isabella%20120%20(C%20minor).mp3",
    beatName: "isabella",
    beatDate: "MAR 2024",
    beatKey: "C minor",
    beatProducer: "Xae Neptune x Smoke Fusion",
    beatPerMin: 120,
  },
  // 75. 2024/MAR 2024/Xae Neptune x VGS MIdnight x mullinmadeit - Runnin 148 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20VGS%20MIdnight%20x%20mullinmadeit%20-%20Runnin%20148%20(E%20minor).mp3",
    beatName: "Runnin",
    beatDate: "MAR 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x VGS MIdnight x mullinmadeit",
    beatPerMin: 148,
  },
  // 76. 2024/MAR 2024/Xae Neptune x inuyasha - ARPEGGIO 135 (A minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20inuyasha%20-%20ARPEGGIO%20135%20(A%20minor).mp3",
    beatName: "ARPEGGIO",
    beatDate: "MAR 2024",
    beatKey: "A minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 135,
  },
  // 77. 2024/MAR 2024/Xae Neptune x inuyasha - membrane 135 (B major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20inuyasha%20-%20membrane%20135%20(B%20major).mp3",
    beatName: "membrane",
    beatDate: "MAR 2024",
    beatKey: "B major",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 135,
  },
  // 78. 2024/MAR 2024/Xae Neptune x inuyasha - ultraviolet 140 (A# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20inuyasha%20-%20ultraviolet%20140%20(A%23%20minor).mp3",
    beatName: "ultraviolet",
    beatDate: "MAR 2024",
    beatKey: "A# minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 140,
  },
  // 79. 2024/MAR 2024/Xae Neptune x inuyasha - worst quality 130 (E minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAR%202024/Xae%20Neptune%20x%20inuyasha%20-%20worst%20quality%20130%20(E%20minor).mp3",
    beatName: "worst quality",
    beatDate: "MAR 2024",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 130,
  },
  // 80. 2024/MAY 2024/Xae Neptune - BEATS 4 DEBBI 161 (A# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAY%202024/Xae%20Neptune%20-%20BEATS%204%20DEBBI%20161%20(A%23%20minor).mp3",
    beatName: "BEATS 4 DEBBI",
    beatDate: "MAY 2024",
    beatKey: "A# minor",
    beatProducer: "Xae Neptune",
    beatPerMin: 161,
  },
  // 81. 2024/MAY 2024/Xae Neptune x Umys - 2xHomixide (F major).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAY%202024/Xae%20Neptune%20x%20Umys%20-%202xHomixide%20(F%20major).mp3",
    beatName: "2xHomixide",
    beatDate: "MAY 2024",
    beatKey: "F major",
    beatProducer: "Xae Neptune x Umys",
    beatPerMin: null,
  },
  // 82. 2024/MAY 2024/Xae Neptune x Umys x Harz - deep 140 (Eb minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAY%202024/Xae%20Neptune%20x%20Umys%20x%20Harz%20-%20deep%20140%20(Eb%20minor).mp3",
    beatName: "deep",
    beatDate: "MAY 2024",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x Umys x Harz",
    beatPerMin: 140,
  },
  // 83. 2024/MAY 2024/Xae Neptune x VGS Midnight x LMC x Indyah - Slowly 144 (G# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/MAY%202024/Xae%20Neptune%20x%20VGS%20Midnight%20x%20LMC%20x%20Indyah%20-%20Slowly%20144%20(G%23%20minor).mp3",
    beatName: "Slowly",
    beatDate: "MAY 2024",
    beatKey: "G# minor",
    beatProducer: "Xae Neptune x VGS Midnight x LMC x Indyah",
    beatPerMin: 144,
  },
  // 84. 2024/SEP 2024/Xae x DB! x 6jugg - RUNAWAY 140 ( G# minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP%202024/Xae%20x%20DB!%20x%206jugg%20-%20RUNAWAY%20140%20(%20G#%20minor).mp3",
    beatName: "RUNAWAY",
    beatDate: "SEP 2024",
    beatKey: "G# minor",
    beatProducer: "Xae Neptune x DB! x 6jugg",
    beatPerMin: 140,
  },
  // 85. 2024/SEP 2024/Xae x VGS Midnight x beatsbylmc - doumissme 126 (C minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP%202024/Xae%20x%20VGS%20Midnight%20x%20beatsbylmc%20-%20doumissme%20126%20(C%20minor).mp3",
    beatName: "doumissme",
    beatDate: "SEP 2024",
    beatKey: "C minor",
    beatProducer: "Xae Neptune x VGS Midnight x beatsbylmc",
    beatPerMin: 126,
  },
  // 86. 2024/SEP 2024/Xae x inuyasha - blackdragon 135 (C minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP%202024/Xae%20x%20inuyasha%20-%20blackdragon%20135%20(C%20minor).mp3",
    beatName: "blackdragon",
    beatDate: "SEP 2024",
    beatKey: "C minor",
    beatProducer: "Xae Neptune x inuyasha",
    beatPerMin: 135,
  },
  // 87. 2024/SEP 2024/Xae x its2ezzy - rainfall 145 (F minor).mp3
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2024/SEP%202024/Xae%20x%20its2ezzy%20-%20rainfall%20145%20(F%20minor).mp3",
    beatName: "rainfall",
    beatDate: "SEP 2024",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x its2ezzy",
    beatPerMin: 145,
  },
  // 88. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2021/JUNE%202021/.DS_Store
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20Nate%20-%20Shells%20158%20(C%23%20major).wav",
    beatName: "Shells",
    beatDate: "AUG 2022",
    beatKey: "C# major",
    beatProducer: "Xae Neptune x Nate",
    beatPerMin: 158,
  },
  // 89. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20TCW%20Tre%20-%20Rewind%20127%20(E%20minor).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20TCW%20Tre%20-%20Rewind%20127%20(E%20minor).wav",
    beatName: "Rewind",
    beatDate: "AUG 2022",
    beatKey: "E minor",
    beatProducer: "Xae Neptune x TCW Tre",
    beatPerMin: 127,
  },
  // 90. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20ayybmo%20-%20Dirtydiana%20143%20(B%20major).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20ayybmo%20-%20Dirtydiana%20143%20(B%20major).wav",
    beatName: "Dirtydiana",
    beatDate: "AUG 2022",
    beatKey: "B major",
    beatProducer: "Xae Neptune x ayybmo",
    beatPerMin: 143,
  },
  // 91. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/DEC%202022/Xae%20Neptune%20x%20Bryceunknwn%20x%20y2tnb%20-%20Grace%20137%20(F%20minor).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/DEC%202022/Xae%20Neptune%20x%20Bryceunknwn%20x%20y2tnb%20-%20Grace%20137%20(F%20minor).wav",
    beatName: "Grace",
    beatDate: "DEC 2022",
    beatKey: "F minor",
    beatProducer: "Xae Neptune x Bryceunknwn x y2tnb",
    beatPerMin: 137,
  },
  // 92. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%2080.ymar%20-%20Sin%20144%20(D%20minor).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%2080.ymar%20-%20Sin%20144%20(D%20minor).wav",
    beatName: "Sin",
    beatDate: "AUG 2022",
    beatKey: "D minor",
    beatProducer: "Xae Neptune x 80.ymar",
    beatPerMin: 144,
  },
  // 93. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20DB!%20-%20Red%20Ritalin%20164%20(Eb%20minor).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20DB!%20-%20Red%20Ritalin%20164%20(Eb%20minor).wav",
    beatName: "Red Ritalin",
    beatDate: "AUG 2022",
    beatKey: "Eb minor",
    beatProducer: "Xae Neptune x DB!",
    beatPerMin: 164,
  },
  // 94. https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20Nate%20-%20Forensics%20140%20(E%20major).wav
  {
    audioFile:
      "https://xaeneptune.s3.us-east-2.amazonaws.com/beats/2022/AUG%202022/Xae%20Neptune%20x%20Nate%20-%20Forensics%20140%20(E%20major).wav",
    beatName: "Forensics",
    beatDate: "AUG 2022",
    beatKey: "E major",
    beatProducer: "Xae Neptune x Nate",
    beatPerMin: 140,
  },
];
