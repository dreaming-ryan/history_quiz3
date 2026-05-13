/**
 * history_stats.js — history_quiz.html의 QUESTIONS 배열을 파싱하여
 * 회차·단원 통계를 계산하고 콜백으로 반환합니다.
 *
 * 데이터 단일 소스: history_quiz.html
 * 사용처: index.html, history_by_round.html, history_by_subject.html,
 *         history_random_quiz.html
 *
 * 사용 예:
 *   HistoryStats.load(stats => {
 *     console.log(stats.totalQ);          // 총 문항 수
 *     console.log(stats.totalRounds);     // 총 회차 수
 *     console.log(stats.totalSubjects);   // 총 단원 수
 *     console.log(stats.rounds);          // [77, 76, 75, ...]
 *     console.log(stats.subjectCounts);   // { 1: 30, 2: 50, ... }
 *     console.log(stats.roundCounts);     // { 77: 50, 76: 50, ... }
 *     console.log(stats.roundRangeText);  // "68~77회"
 *   });
 */
(function () {
  'use strict';

  // 단원 번호 → 이름 매핑 (history_quiz.html의 SUBJECT_NAME과 동일)
  const SUBJECT_NAME = {
    1: "고대국가",
    2: "삼국시대",
    3: "고려시대",
    4: "조선시대",
    5: "개화시대",
    6: "일제강점기",
    7: "근현대사"
  };

  // 단원별 간단 설명·아이콘
  const SUBJECT_META = {
    1: { icon: "🏺", desc: "선사·청동기·고조선·삼국 형성기 — 신석기 혁명·고인돌·고대 국가의 출발" },
    2: { icon: "🛕", desc: "삼국 항쟁·통일신라·발해 — 영토 확장과 불교 문화의 융성" },
    3: { icon: "🏯", desc: "후삼국 통일부터 무신정권·몽골 항쟁·공민왕까지 — 문벌·무신·권문세족" },
    4: { icon: "👑", desc: "조선 건국·세종·임진왜란·붕당정치·실학 — 유교 문치주의 사회의 변천" },
    5: { icon: "🚂", desc: "흥선대원군·강화도 조약·갑신·갑오·독립협회·대한제국 — 자주근대화 모색기" },
    6: { icon: "🇯🇵", desc: "1910 경술국치~1945 광복 — 무단·문화·민족말살 통치와 항일 무장 투쟁" },
    7: { icon: "🇰🇷", desc: "광복·정부수립·6·25·민주화·통일 노력 — 분단과 산업화·민주화 한국 현대사" }
  };

  function loadStats(callback) {
    fetch('history_quiz.html')
      .then(r => r.text())
      .then(html => {
        const arrMatch = html.match(/const QUESTIONS\s*=\s*(\[[\s\S]*?\])\s*;/);
        if (!arrMatch) {
          console.error('history_stats.js: QUESTIONS 배열 추출 실패');
          return;
        }
        const fnBody = 'return ' + arrMatch[1] + ';';
        let questions;
        try {
          questions = (new Function(fnBody))();
        } catch (e) {
          console.error('history_stats.js: QUESTIONS 평가 실패', e);
          return;
        }

        const totalQ = questions.length;

        const roundSet = new Set();
        const roundCounts = {};
        const subjectCounts = {};

        questions.forEach(q => {
          if (q.round != null) {
            roundSet.add(q.round);
            roundCounts[q.round] = (roundCounts[q.round] || 0) + 1;
          }
          if (q.subject != null) {
            subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
          }
        });

        // 회차는 내림차순 정렬 (newest first)
        const rounds = [...roundSet].sort((a, b) => Number(b) - Number(a));
        const totalRounds = rounds.length;
        const totalSubjects = Object.keys(subjectCounts).length;

        // 회차 범위 텍스트 (오름차순으로 ~ 표기)
        const roundRangeText = rounds.length
          ? `${rounds[rounds.length - 1]}~${rounds[0]}회`
          : '';

        callback({
          totalQ,
          totalRounds,
          totalSubjects,
          rounds,
          roundCounts,
          subjectCounts,
          subjectNames: SUBJECT_NAME,
          subjectMeta: SUBJECT_META,
          roundRangeText,
          questions
        });
      })
      .catch(err => console.error('history_stats.js fetch 오류:', err));
  }

  function fmtComma(n) {
    return Number(n).toLocaleString('ko-KR');
  }

  window.HistoryStats = {
    load: loadStats,
    fmtComma: fmtComma,
    SUBJECT_NAME: SUBJECT_NAME,
    SUBJECT_META: SUBJECT_META
  };
})();
