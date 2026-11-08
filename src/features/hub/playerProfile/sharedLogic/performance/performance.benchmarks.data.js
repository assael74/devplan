// src/features/hub/playerProfile/sharedLogic/performance/performance.benchmarks.data.js

// Cached percentiles from the supplied workbook, sheet 'תקן עמדות', rows 6–53.
export const POSITION_STANDARD = {
  "source": "תקן סטטיסטי אירופי לפי עמדה",
  "period": "2020–2021",
  "baseMinutes": 90,
  "positions": [
    {
      "id": "CD",
      "label": "בלם",
      "metrics": [
        {
          "id": "passesTotal",
          "label": "מסירות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 39.88406559951361,
          "p50": 47.33821340444873,
          "p75": 55.71776483797112,
          "p90": 64.4347538087878,
          "observations": 1062,
          "sourceRow": 6
        },
        {
          "id": "passesSuccessRate",
          "label": "דיוק מסירות",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.84,
          "p50": 0.87,
          "p75": 0.9,
          "p90": 0.92,
          "observations": 1062,
          "sourceRow": 7
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 2.6404787178708196,
          "p50": 3.275686136523575,
          "p75": 3.964559272929317,
          "p90": 4.778816421982591,
          "observations": 1062,
          "sourceRow": 8
        },
        {
          "id": "interceptions",
          "label": "חטיפות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 5.851695180658208,
          "p50": 6.501033377237748,
          "p75": 7.320215802058003,
          "p90": 8.155009098175263,
          "observations": 1062,
          "sourceRow": 9
        },
        {
          "id": "tacklesTotal",
          "label": "תיקולים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.8419361289938463,
          "p50": 2.335866947267208,
          "p75": 2.8994276043102274,
          "p90": 3.4797614344846535,
          "observations": 1062,
          "sourceRow": 10
        },
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.29130458302981577,
          "p50": 0.5215169246722464,
          "p75": 0.8620138478223394,
          "p90": 1.352904177927577,
          "observations": 1062,
          "sourceRow": 11
        }
      ]
    },
    {
      "id": "DM",
      "label": "קשר אחורי",
      "metrics": [
        {
          "id": "passesTotal",
          "label": "מסירות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 37.99315310274021,
          "p50": 45.36244477576445,
          "p75": 53.53942805509426,
          "p90": 61.34342651707679,
          "observations": 826,
          "sourceRow": 12
        },
        {
          "id": "passesSuccessRate",
          "label": "דיוק מסירות",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.82,
          "p50": 0.85,
          "p75": 0.88,
          "p90": 0.9,
          "observations": 826,
          "sourceRow": 13
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 3.9655382177032923,
          "p50": 4.827594081110705,
          "p75": 5.7958115745195435,
          "p90": 6.7415534260047725,
          "observations": 826,
          "sourceRow": 14
        },
        {
          "id": "interceptions",
          "label": "חטיפות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 4.066512462235649,
          "p50": 4.861181756052746,
          "p75": 5.752966303163768,
          "p90": 6.702342258156259,
          "observations": 826,
          "sourceRow": 15
        },
        {
          "id": "tacklesTotal",
          "label": "תיקולים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 3.3640782085227015,
          "p50": 3.97175747524511,
          "p75": 4.764886985978191,
          "p90": 5.483456059204441,
          "observations": 826,
          "sourceRow": 16
        },
        {
          "id": "keyPassesTotal",
          "label": "מסירות מפתח",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.23746111677800225,
          "p50": 0.40411634988974066,
          "p75": 0.6571025872127163,
          "p90": 0.959431532160986,
          "observations": 826,
          "sourceRow": 17
        }
      ]
    },
    {
      "id": "CM",
      "label": "קשר מרכזי",
      "metrics": [
        {
          "id": "passesTotal",
          "label": "מסירות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 32.87070854638422,
          "p50": 39.34210526315789,
          "p75": 46.341948310139166,
          "p90": 57.59051634804876,
          "observations": 525,
          "sourceRow": 18
        },
        {
          "id": "passesSuccessRate",
          "label": "דיוק מסירות",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.77,
          "p50": 0.8,
          "p75": 0.84,
          "p90": 0.87,
          "observations": 525,
          "sourceRow": 19
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 5.928601784955377,
          "p50": 7.068682221491948,
          "p75": 8.332311465358675,
          "p90": 9.469126466753586,
          "observations": 525,
          "sourceRow": 20
        },
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.9398752127056156,
          "p50": 2.935153583617747,
          "p75": 4.120040691759918,
          "p90": 5.463712991178247,
          "observations": 525,
          "sourceRow": 21
        },
        {
          "id": "keyPassesTotal",
          "label": "מסירות מפתח",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.6633906633906634,
          "p50": 0.9189925119128659,
          "p75": 1.3102409638554218,
          "p90": 1.803295002211411,
          "observations": 525,
          "sourceRow": 22
        },
        {
          "id": null,
          "label": "יצירת מצבים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.536779324055666,
          "p50": 0.7345739471106758,
          "p75": 1.0633727175080558,
          "p90": 1.425896514252278,
          "observations": 525,
          "sourceRow": 23
        }
      ]
    },
    {
      "id": "RD",
      "label": "מגן ימני",
      "metrics": [
        {
          "id": "passesTotal",
          "label": "מסירות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 41.93711787584039,
          "p50": 47.020086177236756,
          "p75": 53.45902961152287,
          "p90": 61.95236376258244,
          "observations": 380,
          "sourceRow": 24
        },
        {
          "id": "passesSuccessRate",
          "label": "דיוק מסירות",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.78,
          "p50": 0.81,
          "p75": 0.84,
          "p90": 0.87,
          "observations": 380,
          "sourceRow": 25
        },
        {
          "id": "tacklesTotal",
          "label": "תיקולים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 2.8125,
          "p50": 3.371783790971345,
          "p75": 4.124470953476245,
          "p90": 4.874366389986788,
          "observations": 380,
          "sourceRow": 26
        },
        {
          "id": "interceptions",
          "label": "חטיפות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 4.435794784727588,
          "p50": 5.170176266587584,
          "p75": 5.808251815080767,
          "p90": 6.529106541772433,
          "observations": 380,
          "sourceRow": 27
        },
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.2368568488937977,
          "p50": 1.9155337540328308,
          "p75": 2.629380953763338,
          "p90": 3.6684790142472083,
          "observations": 380,
          "sourceRow": 28
        },
        {
          "id": "crossesTotal",
          "label": "הרמות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.5431874398185776,
          "p50": 2.1523752235112807,
          "p75": 2.95564038832481,
          "p90": 3.49533426936535,
          "observations": 380,
          "sourceRow": 29
        }
      ]
    },
    {
      "id": "LD",
      "label": "מגן שמאלי",
      "metrics": [
        {
          "id": "passesTotal",
          "label": "מסירות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 43.48859801356018,
          "p50": 48.65898058252427,
          "p75": 54.407721811653985,
          "p90": 62.30769230769231,
          "observations": 351,
          "sourceRow": 30
        },
        {
          "id": "passesSuccessRate",
          "label": "דיוק מסירות",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.78,
          "p50": 0.8,
          "p75": 0.835,
          "p90": 0.86,
          "observations": 351,
          "sourceRow": 31
        },
        {
          "id": "tacklesTotal",
          "label": "תיקולים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 2.7069030178647298,
          "p50": 3.283922462941847,
          "p75": 3.826909672962337,
          "p90": 4.438964241676942,
          "observations": 351,
          "sourceRow": 32
        },
        {
          "id": "interceptions",
          "label": "חטיפות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 4.28150035612339,
          "p50": 4.949733885274985,
          "p75": 5.638450732729372,
          "p90": 6.34515570934256,
          "observations": 351,
          "sourceRow": 33
        },
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.389802805376926,
          "p50": 2.0737327188940093,
          "p75": 2.956850286916695,
          "p90": 3.6792452830188678,
          "observations": 351,
          "sourceRow": 34
        },
        {
          "id": "crossesTotal",
          "label": "הרמות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.7806602264489548,
          "p50": 2.3988153998025665,
          "p75": 3.115290068829892,
          "p90": 3.6754966887417218,
          "observations": 351,
          "sourceRow": 35
        }
      ]
    },
    {
      "id": "RM",
      "label": "קיצוני ימני",
      "metrics": [
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 2.661650072523336,
          "p50": 3.958642720541886,
          "p75": 5.4268221282915405,
          "p90": 6.87651569186876,
          "observations": 410,
          "sourceRow": 36
        },
        {
          "id": "dribblesSuccessRate",
          "label": "הצלחה בכדרור",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.49,
          "p50": 0.55,
          "p75": 0.6,
          "p90": 0.6510000000000002,
          "observations": 410,
          "sourceRow": 37
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 6.778107191316147,
          "p50": 7.934502378809309,
          "p75": 9.016712714212245,
          "p90": 10.133037337829021,
          "observations": 410,
          "sourceRow": 38
        },
        {
          "id": "keyPassesTotal",
          "label": "מסירות מפתח",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.6622221469232854,
          "p50": 0.938349215551288,
          "p75": 1.2565241990936507,
          "p90": 1.7629078759497208,
          "observations": 410,
          "sourceRow": 39
        },
        {
          "id": "crossesTotal",
          "label": "הרמות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.3957355746918991,
          "p50": 2.0236824898335204,
          "p75": 2.8696253416424247,
          "p90": 3.8001045491267256,
          "observations": 410,
          "sourceRow": 40
        },
        {
          "id": "shotsTotal",
          "label": "בעיטות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.9447494724954679,
          "p50": 1.4882098025017552,
          "p75": 2.048182944455916,
          "p90": 2.5258275507361634,
          "observations": 410,
          "sourceRow": 41
        }
      ]
    },
    {
      "id": "LM",
      "label": "קיצוני שמאלי",
      "metrics": [
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 2.8888940391211646,
          "p50": 4.1485525603737665,
          "p75": 5.748370651757511,
          "p90": 6.955045451073256,
          "observations": 434,
          "sourceRow": 42
        },
        {
          "id": "dribblesSuccessRate",
          "label": "הצלחה בכדרור",
          "isRate": true,
          "lowerIsBetter": false,
          "p25": 0.5,
          "p50": 0.55,
          "p75": 0.61,
          "p90": 0.66,
          "observations": 434,
          "sourceRow": 43
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 6.697985449876967,
          "p50": 7.839993238283549,
          "p75": 8.857977338043348,
          "p90": 10.002350099321779,
          "observations": 434,
          "sourceRow": 44
        },
        {
          "id": "keyPassesTotal",
          "label": "מסירות מפתח",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.6790770975037018,
          "p50": 0.9624838218391352,
          "p75": 1.2486587982832618,
          "p90": 1.5625005713951365,
          "observations": 434,
          "sourceRow": 45
        },
        {
          "id": "crossesTotal",
          "label": "הרמות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.1957107881963374,
          "p50": 1.810554221082874,
          "p75": 2.6318992137426367,
          "p90": 3.6507007191591367,
          "observations": 434,
          "sourceRow": 46
        },
        {
          "id": "shotsTotal",
          "label": "בעיטות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.0939288483550567,
          "p50": 1.5394119494644833,
          "p75": 2.0912906206684125,
          "p90": 2.603564830653438,
          "observations": 434,
          "sourceRow": 47
        }
      ]
    },
    {
      "id": "F",
      "label": "חלוץ",
      "metrics": [
        {
          "id": "shotsTotal",
          "label": "בעיטות",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.7134091630892971,
          "p50": 2.1271008403361344,
          "p75": 2.48046232450479,
          "p90": 3.038793103448276,
          "observations": 611,
          "sourceRow": 48
        },
        {
          "id": "shotsOnTarget",
          "label": "בעיטות למסגרת",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.7309652205910342,
          "p50": 0.9678746327130265,
          "p75": 1.1920729781398056,
          "p90": 1.4644067796610167,
          "observations": 611,
          "sourceRow": 49
        },
        {
          "id": "keyPassesTotal",
          "label": "מסירות מפתח",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.5103974313962495,
          "p50": 0.709838107098381,
          "p75": 1.0267087493566986,
          "p90": 1.354515050167224,
          "observations": 611,
          "sourceRow": 50
        },
        {
          "id": "dribblesTotal",
          "label": "כדרורים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 1.723287830273996,
          "p50": 2.511013215859031,
          "p75": 3.636676329155645,
          "p90": 4.929328621908128,
          "observations": 611,
          "sourceRow": 51
        },
        {
          "id": "ballLoss",
          "label": "איבודים",
          "isRate": false,
          "lowerIsBetter": true,
          "p25": 8.518579283604183,
          "p50": 9.928057553956833,
          "p75": 11.258174605874697,
          "p90": 12.6201448321264,
          "observations": 611,
          "sourceRow": 52
        },
        {
          "id": null,
          "label": "בישולים",
          "isRate": false,
          "lowerIsBetter": false,
          "p25": 0.05627826229758183,
          "p50": 0.10434782608695652,
          "p75": 0.1717234600262123,
          "p90": 0.2617801047120419,
          "observations": 611,
          "sourceRow": 53
        }
      ]
    }
  ]
}
