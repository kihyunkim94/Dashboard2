import { useState, useEffect } from "react";
import {
  Briefcase,
  User,
  Clock,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ── 데이터 ─────────────────────────────────────────────
// 구글캘린더(KH working / personal schedule) 오늘자 일정 — 단일 소스
const allEvents = [
  { id: 1, calendar: "work", time: "08:00 - 09:00", type: "할일", title: "CN8 어퍼트림 치수측정 (D)", desc: "쿼더런트커버부 측정 — LH 1.0mm, RH 1.5mm 틈새 발생 확인" },
  { id: 2, calendar: "work", time: "08:30 - 09:30", type: "회의", title: "CN8 P2 3차 품확설명회 (HMC)", desc: "개선품 설명회, 양호 판정 — 리어어퍼가니쉬 하단 수축 재점검 필요" },
  { id: 3, calendar: "work", time: "09:30 - 11:30", type: "할일", title: "26년 상반기 사업계획 진척보고", desc: "사업계획 PPT 기준 진행현황 정리, 오늘(6/19) 마감" },
  { id: 4, calendar: "work", time: "11:00 - 12:00", type: "할일", title: "주간보고서 작성", desc: "팀 주간 업무 진행상황 정리" },
  { id: 5, calendar: "work", time: "13:00 - 16:00", type: "평가", title: "CN8 부품협력사 PSO3 평가 (ITW AK)", desc: "협력사 현장 평가 진행" },
  { id: 6, calendar: "work", time: "16:30", type: "송부", title: "CN8 T3 부품검사성적서 송부", desc: "HMC 품관3부 앞 외관·치수 검사성적서 회신" },
  { id: 7, calendar: "personal", time: "21:00 - 23:00", type: "공부", title: "경지사 2차 (경영과학)", desc: "의사결정나무 · AHP · EVSI/베이즈정리 심화" },
  { id: 8, calendar: "personal", time: "21:00 - 22:00", type: "할일", title: "블로그 글 올리기", desc: "정기 포스팅 작성 및 업로드" },
];

const todayMustDo = allEvents.filter((e) => e.type === "할일");
const todayWorkEvents = allEvents.filter((e) => e.calendar === "work" && e.type !== "할일");
const tomorrowWorkEvents = []; // 6/20(토) 업무 캘린더 일정 없음
const personalEvents = allEvents.filter((e) => e.calendar === "personal" && e.type !== "할일");

// 이번달 업무 진행현황 — 제목 끝 태그(-D/-C/-NA)로 상태 분류
function classifyStatus(title) {
  if (title.endsWith("-D")) return "완료";
  if (title.endsWith("-NA")) return "완료(미참석)";
  if (title.endsWith("-C")) return "취소";
  return "진행중·예정";
}
const monthlyTitles = [
  "[공유]CN8 PV2 신뢰성시험시작 (6/1~23)", "[정보]CN8 P2 3LOT (6/8~12),30대(HMC)", "[정보]CN8 P2 2LOT (6/15~20),23대(HMC)",
  "[할일] GPC교육신청-D", "[할일]GPC교육완료-D", "[평가]CN8 도어트림 보호랩 내열노화성시험의뢰-D", "[평가]CN8 T2 서연이화 납품분 전진품질검사(카이엠)-D",
  "[할일] GPC교육시작-D", "[할일]CN8 부품사 PSO2평가시트 완료-D", "[투입]CN8 T3 투입(HMC)", "[할일]CN8 EU PPWR 규제 포장재현황 송부 T 개발-D",
  "[평가]CN8 4차 칼라평가(HMC)-SH-NA", "[평가]CN8 IMG어퍼트림 성형품 검사", "[회의]CN8 PLT회의-D", "[할일]CN8 부품협력사 APQP문서 접수 F 세지솔로텍, 태화",
  "[평가]CN8 P2 3LOT 전진검사(일정확인)?", "[정보]CN8 P2 2LOT (6/1~5),31대(HMC)-D", "[회의]CN8 도어트림 협력사 후공정 실시에 따른 후속업무회의-C",
  "[회의]NE1 PE-X & XV1 도어트림 월간개발회의-D", "[할일]CN8 도어트림제품 해외발송(모비스)", "[회의]MS300-57 TFT 회의(HMC)-D", "[할일]전체 개발차종 일정 정리 BY 엑셀",
  "[할일]CN8 T2 검사성적서 송부 T 자동차 품관3부-D", "[회의]CN8 P2 1차 품확설명회(HMC)-D", "[보고]주간업무보고(HD)-D", "[할일]직무능력향상방안 작성 및 송부 T 정팀장-D",
  "[출장]부산공장", "[평가]CN8 T2 1호차 투입, 역진단(HMC)-SH-D", "[출장]부산공장", "[평가]CN8 리어암레스트 사출TO(세지솔로텍)-SH-NA",
  "[평가]CN8 리어 어퍼트림 사출(창용금형)-NA", "[회의]CN8 부품품질 개선회의-D", "[회의]CN8 양산초기품질확보방안 협의W 카이엠-D", "[평가]CN8 조립라인 양산능력평가-D",
  "[할일]CN8 외관보증카메라 운영내용 송부 T 카이엠 생산기술팀-D", "[정보]CN8 T3 14대 생산", "[회의]NE1 PE-X PLT 회의-D", "[고객]CN8 파트너스위크 회의(HMC)-D",
  "[회의]CN8 암레스트 감싸기 방안 협의-D", "[할일]과거차문제점 TQMS 등록 (CN8 인사이드핸들 이음)-D", "[회의]CN8 칼라평가 대책협의(카이엠)-D",
  "[할일]CN8 BIW 이동 (장안→부산공장)", "[접수]NE1-X 도어트림 검사구 수정견적서 접수 F 킴텍솔로션", "[평가]CN8 부품협력사 PSO3평가(ITW AK)",
  "[할일]NE1 완제품 검사구 수정여부 검토-D", "[회의]팀회의-D", "[회의]CN8 P2 2차 품확설명회(HMC)-SH-D", "[할일] KAIS PPAP Template 제정",
  "[할일]주간보고서작성", "[할일]주간보고서작성-D", "[할일]주간보고서작성-D", "[평가]CN8 도어트림 보호랩 내열노화성시험결과-D",
  "[할일]공정능력평가 지침서 개정보고서(직무향상) 작성", "[할일]주간보고서작성", "[할일]CN8부품사 ISIR서류 작성(태화, 세지솔로텍)",
  "[평가]CN8 조립시 무드램프 이탈여부 검증", "[평가]CN8 PSO3평가(조립라인)", "[평가]CN8 PSO3평가(사출라인)", "[평가]CN8 PSO3평가(IMG라인)",
  "[할일]CN8 양산승인요청서 저장-D", "[정보]CN8 장안공장 사출라인 시운전", "[평가]CN8 5차 칼라평가(HMC)", "[교육]고객사 투명윤리 및 카이스 윤리교육-D",
  "[회의]트래닛 방문-D", "[회의]CN8 PLT회의(카이엠)-D", "[평가]CN8 부품협력사PSO3평가(태화)-D", "[회의]NE1 PE-X PLT회의-NA", "[회의]XV1 품질 디자인리뷰",
  "[할일]26년 상반기 사업계획 진척현황 보고", "[평가]CN8 부품협력사PSO3평가(세지솔로텍)-D", "[평가]CN8 부품협력사PSO3평가(무등기업)-D",
  "[할일]26년 사업계획(상반기)리뷰", "[할일]NE PE-X 시작검사의뢰예정일 송부 T HMC 시작바디팀", "[출장]부산공장", "[할일]CN8 어퍼트림 성형품 쿼더런트커버부 치수측정-D",
  "[회의]CN8 P2 3차 품확설명회(HMC)-SH-D", "[송부]CN8 T3 부품검사성적서 송부 T HMC 품관3부-카이엠",
];
const monthlyStats = monthlyTitles.reduce(
  (acc, t) => { const s = classifyStatus(t); acc[s] = (acc[s] || 0) + 1; return acc; },
  { 완료: 0, "완료(미참석)": 0, 취소: 0, "진행중·예정": 0 }
);
const monthlyTotal = monthlyTitles.length;
const monthlyCompletionRate = Math.round(((monthlyStats["완료"] + monthlyStats["완료(미참석)"]) / monthlyTotal) * 100);

// 개인캘린더(KH personal schedule) [공부] 태그 6월 전체 — 업무 진행현황과 동일한 분류 로직 재사용
const personalStudyTitles = [
  "[공부]경지사2차(품질경영)-D", "[공부]경지사2차(품질경영)-C", "[공부]경지사2차(경영과학)", "[공부]경지사2차(경영과학)",
  "[공부]경지사2차(품질경영)-D", "[공부]경지사2차-복습(품질경영)", "[공부]경지사2차-복습(품질경영)", "[공부]경지사2차-복습(품질경영)",
  "[공부]경지사2차-복습(생산관리)", "[공부]경지사2차-복습(생산관리)", "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D",
  "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(경영과학)", "[공부]경지사2차(경영과학)",
  "[공부]경지사2차-복습(품질경영)", "[공부]경지사2차-복습(품질경영)", "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D",
  "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D", "[공부]경지사2차(생산관리)-D",
  "[공부]경지사2차(경영과학)-D", "[공부]경영지도사2차 원서접수-D", "[공부]경지사2차(경영과학)-D", "[공부]경지사2차(경영과학)-C",
  "[공부]경지사2차(경영과학)-C", "[공부]경지사2차(경영과학)-D",
];
const personalStudyStats = personalStudyTitles.reduce(
  (acc, t) => { const s = classifyStatus(t); acc[s] = (acc[s] || 0) + 1; return acc; },
  { 완료: 0, "완료(미참석)": 0, 취소: 0, "진행중·예정": 0 }
);
const personalStudyTotal = personalStudyTitles.length;
const personalStudyRate = Math.round((personalStudyStats["완료"] / personalStudyTotal) * 100);
const STATUS_DOT = { 진행중: "#5B9BD5", 준비중: "#A8A29E", 실기준비: "#5B9BD5", 불합격: "#D9706B", 포기: "#52525B" };
const personalPlanItems = [
  { name: "경영지도사(생산관리)", status: "진행중", next: "7/11(토) 2차 시험" },
  { name: "직업능력훈련교사", status: "준비중", next: "7/20~24 신중년4차 접수" },
  { name: "이용사기능사", status: "준비중", next: "8/24~27 필기원서접수" },
  { name: "지게차운전기능사", status: "실기준비", next: "학원 등록 필요" },
  { name: "소방설비기사(기계)", status: "불합격", next: "7/20 3회 접수 검토" },
  { name: "GPC 품질직무전문가", status: "불합격", next: "2027년 재도전" },
  { name: "제빵기능사", status: "포기", next: "—" },
];
const personalTodayTodos = todayMustDo
  .filter((e) => e.calendar === "personal")
  .map((e) => e.title);
// 이번주(6/19~25) 개인계획 관련 할 일
const personalWeekTodos = [
  { text: "직업능력훈련교사 신중년 4차 서류 준비", due: "7/19까지" },
  { text: "소방설비기사 3회 재도전 여부 결정", due: "7/20까지" },
  { text: "지게차 실기 학원 등록", due: "이번주 내" },
];

const personalPlanTodos = [
  "직업능력훈련교사 신중년 4차 서류 준비",
  "7/20~24 신중년 4차 원서접수",
  "소방설비기사 3회 재도전 여부 결정",
  "지게차 실기 학원 등록",
];

// 개발차종 단계별 일정표 — 구글캘린더 [정보] 태그 기반
// 각 차종별 단계(시작/P1/P2/M/SOP) 날짜, 비고
const STAGE_COLUMNS = ["시작", "P1", "P2", "M", "SOP"];
const vehicleStages = [
  { model: "CN8", 시작: "2026.1.15", P1: "2026.3.20", P2: "2026.5.25", M: "2026.6.16", SOP: "2026.8.10", 비고: "도어트림 칼라평가 이슈 진행중" },
  { model: "NE1 PE-X", 시작: "2026.2.1", P1: "2026.4.15", P2: "2026.6.11", M: "2026.7.20", SOP: "2026.9.30", 비고: "내외작 구분 검토중" },
  { model: "XV1", 시작: "2026.3.1", P1: "2026.5.10", P2: "2026.6.22", M: "2026.8.5", SOP: "2026.10.15", 비고: "품질 디자인리뷰 예정" },
  { model: "NE PE-X", 시작: "2026.4.1", P1: "2026.6.29", P2: "2026.8.15", M: "2026.9.20", SOP: "2026.11.30", 비고: "시작검사 협력사 일정 조율중" },
];

// 오늘 날짜 기준 완료/진행중/예정 판정 ("YYYY.M.D" 문자열 → Date)
const TODAY = new Date(2026, 5, 19); // 2026-06-19
function parseYMD(ymd) {
  const [y, m, d] = ymd.split(".").map(Number);
  return new Date(y, m - 1, d);
}
function cellStatus(ymd) {
  const date = parseYMD(ymd);
  const diffDays = Math.round((date - TODAY) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "완료";
  if (diffDays <= 14) return "진행중";
  return "예정";
}
function formatShort(ymd) {
  const [y, m, d] = ymd.split(".");
  return `${y}.${m}/${d}`;
}
function currentStageLabel(v) {
  let result = "시작전";
  for (const col of STAGE_COLUMNS) {
    const status = cellStatus(v[col]);
    if (status === "완료") result = `${col} 완료`;
    else if (status === "진행중") return `${col} 진행중`;
    else break; // 예정 단계부터는 더 볼 필요 없음
  }
  return result;
}


const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
function dateLabelOf(date) {
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAY_KR[date.getDay()]})`;
}
const TODAY_DATE = new Date(2026, 5, 19);
const TOMORROW_DATE = new Date(2026, 5, 20);

const weatherByCity = { seoul: { temp: 26 }, newyork: { temp: 19 } };

// ── 작은 컴포넌트 ───────────────────────────────────────
function DdayBadge({ title }) {
  if (!title || !title.toUpperCase().includes("D-DAY")) return null;
  return (
    <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 bg-rose-500/15 text-rose-400">
      D-DAY
    </span>
  );
}

function WorldClock({ label, timeZone, temp }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayLabel = days[new Date(now.toLocaleString("en-US", { timeZone })).getDay()];
  const timeLabel = now.toLocaleTimeString("ko-KR", { timeZone, hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] text-stone-500">{label}</span>
      <span className="text-sm font-medium text-stone-200 tabular-nums">{timeLabel}</span>
      <span className="text-[11px] text-stone-500">{dayLabel}요일 · {temp}°</span>
    </div>
  );
}

// 일정 한 줄 — 색은 업무/개인 점 하나로만 구분, 나머지는 무채색 텍스트
function EventLine({ ev, accent }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-none">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-stone-200 truncate">
            <span className="text-stone-500 mr-1">[{ev.type}]</span>
            {ev.title}
          </span>
          <span className="text-[10px] text-stone-500 tabular-nums whitespace-nowrap">{ev.time}</span>
        </div>
      </div>
    </div>
  );
}

// 접고 펼치는 일정 섹션
function CollapsibleSection({ icon: Icon, label, dateLabel, accent, events, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
      >
        <Icon size={13} className="text-stone-400" />
        <span className="text-[12px] font-medium text-stone-300">{label}</span>
        {dateLabel && <span className="text-[10px] text-stone-500">· {dateLabel}</span>}
        <span className="text-[10px] text-stone-500">{events.length}건</span>
        <span className="ml-auto text-stone-500">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0">
          {events.length === 0 ? (
            <p className="text-[12px] text-stone-500 py-2">일정 없음</p>
          ) : (
            events.map((ev) => <EventLine key={ev.id} ev={ev} accent={accent} />)
          )}
        </div>
      )}
    </section>
  );
}

// 오늘 해야 할 일 — 유일하게 강조색(amber)을 쓰는 영역
const STATUS_BG = {
  완료: "bg-emerald-500/30",
  진행중: "bg-amber-500/30",
  예정: "bg-transparent",
};

function StageCell({ date }) {
  const status = cellStatus(date);
  return (
    <td className={`py-2.5 px-2 text-center ${STATUS_BG[status]}`}>
      <span className="text-[12px] text-stone-200 tabular-nums">{formatShort(date)}</span>
    </td>
  );
}

function DevModelTable() {
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-stone-300">개발차종 일정표</span>
        <div className="flex items-center gap-3 text-[10.5px] text-stone-500">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/30" />완료</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500/30" />진행중</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm border border-stone-600" />예정</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-white/5">
              <th rowSpan={2} className="text-[11px] text-stone-500 font-medium text-left py-2 pr-3 align-bottom">차종</th>
              <th colSpan={STAGE_COLUMNS.length} className="text-[11px] text-stone-400 font-medium py-1.5 text-center border-b border-white/5">
                개발단계
              </th>
              <th rowSpan={2} className="text-[11px] text-stone-500 font-medium text-left py-2 pl-3 align-bottom">비고</th>
            </tr>
            <tr className="border-b border-white/10">
              {STAGE_COLUMNS.map((c) => (
                <th key={c} className="text-[11px] text-stone-500 font-medium py-1.5">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicleStages.map((v, i) => (
              <tr key={i} className="border-b border-white/5 last:border-none">
                <td className="text-[13.5px] text-stone-200 font-medium py-2.5 pr-3 whitespace-nowrap">
                  {v.model}
                </td>
                {STAGE_COLUMNS.map((c) => (
                  <StageCell key={c} date={v[c]} />
                ))}
                <td className="py-2.5 pl-3">
                  <span className="text-[12.5px] text-stone-200 font-medium">{currentStageLabel(v)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10.5px] text-stone-600 mt-3">
        구글캘린더에 [정보]차종 단계 형식으로 기입하면 자동 반영 예정 · 지금은 예시 데이터 (기준일 2026.6.19)
      </p>
    </section>
  );
}

function MustDoCard() {
  return (
    <section className="rounded-xl bg-stone-900/70 border border-amber-400/20 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px] font-semibold text-amber-300">오늘 해야 할 일</span>
        <span className="text-[10px] text-stone-500">{todayMustDo.length}건</span>
      </div>
      <div className="flex flex-col gap-2">
        {todayMustDo.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-[12px] text-stone-100 flex-1 min-w-0 truncate">
              {item.title}
              <span className="text-[10px] text-stone-500 ml-1">
                {item.calendar === "work" ? "업무" : "개인"}
              </span>
            </span>
            <span className="text-[10px] text-stone-500 tabular-nums shrink-0">{item.time}</span>
            <DdayBadge title={item.title} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PersonalStudyCard() {
  const items = [
    { label: "완료", value: personalStudyStats["완료"] },
    { label: "취소", value: personalStudyStats["취소"] },
    { label: "진행중·예정", value: personalStudyStats["진행중·예정"] },
  ];
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-stone-300">이번 달 공부 진행현황 (경영지도사)</span>
        <span className="text-[10px] text-stone-500">총 {personalStudyTotal}건</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-semibold text-stone-100 tabular-nums">{personalStudyRate}%</span>
        <span className="text-[11px] text-stone-500">완료율</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden flex mb-3">
        <div style={{ width: `${(personalStudyStats["완료"] / personalStudyTotal) * 100}%` }} className="bg-sky-400/70" />
        <div style={{ width: `${(personalStudyStats["취소"] / personalStudyTotal) * 100}%` }} className="bg-stone-700" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm font-semibold text-stone-100 tabular-nums">{it.value}</span>
            <span className="text-[10px] text-stone-500 text-center mt-0.5">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MonthlyProgressCard() {
  const items = [
    { label: "완료", value: monthlyStats["완료"] },
    { label: "완료(미참석)", value: monthlyStats["완료(미참석)"] },
    { label: "취소", value: monthlyStats["취소"] },
    { label: "진행중·예정", value: monthlyStats["진행중·예정"] },
  ];
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-stone-300">이번 달 업무 진행현황</span>
        <span className="text-[11px] text-stone-500">총 {monthlyTotal}건</span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-semibold text-stone-100 tabular-nums">{monthlyCompletionRate}%</span>
        <span className="text-[11.5px] text-stone-500">완료율</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-800 overflow-hidden flex mb-3">
        <div style={{ width: `${(monthlyStats["완료"] / monthlyTotal) * 100}%` }} className="bg-stone-300" />
        <div style={{ width: `${(monthlyStats["완료(미참석)"] / monthlyTotal) * 100}%` }} className="bg-stone-500" />
        <div style={{ width: `${(monthlyStats["취소"] / monthlyTotal) * 100}%` }} className="bg-stone-700" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm font-semibold text-stone-100 tabular-nums">{it.value}</span>
            <span className="text-[10px] text-stone-500 text-center mt-0.5">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TodoListCard({ title, items, emptyText }) {
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-stone-300">{title}</span>
        <span className="text-[10px] text-stone-500">{items.length}건</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[12px] text-stone-500 py-1">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((t, i) => {
            const text = typeof t === "string" ? t : t.text;
            const due = typeof t === "string" ? null : t.due;
            return (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-stone-500 shrink-0" />
                  <p className="text-[12px] text-stone-300 leading-snug">{text}</p>
                </div>
                {due && <span className="text-[10px] text-amber-300/80 shrink-0 whitespace-nowrap">{due}</span>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PersonalPlanTable() {
  const activeItems = personalPlanItems.filter(
    (it) => it.status !== "불합격" && it.status !== "포기"
  );
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-stone-300">개인계획 일정표 (2026)</span>
        <span className="text-[10px] text-stone-500">진행중 {activeItems.length}건</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[420px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-[10px] text-stone-500 font-medium text-left py-2 pr-2 w-8">No</th>
              <th className="text-[10px] text-stone-500 font-medium text-left py-2 pr-3">항목</th>
              <th className="text-[10px] text-stone-500 font-medium text-left py-2 pr-3">목표일</th>
              <th className="text-[10px] text-stone-500 font-medium text-left py-2">진행사항</th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((it, i) => (
              <tr key={i} className="border-b border-white/5 last:border-none">
                <td className="text-[11px] text-stone-500 py-2 pr-2">{i + 1}</td>
                <td className="text-[12px] text-stone-200 font-medium py-2 pr-3 whitespace-nowrap">{it.name}</td>
                <td className="text-[11px] text-stone-400 py-2 pr-3">{it.next}</td>
                <td className="py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[it.status] }} />
                    <span className="text-[11px] text-stone-300">{it.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function PersonalPlanCard() {
  return (
    <section className="rounded-xl bg-stone-900/50 border border-white/5 px-4 py-4">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap size={14} className="text-stone-400" />
        <span className="text-[13px] font-medium text-stone-300">2026 개인계획 (노션)</span>
        <span className="text-[11px] text-stone-500 ml-auto">자격증 {personalPlanItems.length}건</span>
      </div>
      <div>
        {personalPlanItems.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-none">
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[it.status] }} />
            <span className="text-[13.5px] text-stone-200 flex-1 min-w-0 truncate">{it.name}</span>
            <span className="text-[11px] text-stone-500 shrink-0">{it.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-[11px] text-stone-500 mb-1.5">지금 확인·결정해야 할 것</p>
        {personalPlanTodos.map((t, i) => (
          <p key={i} className="text-[12px] text-stone-400 leading-relaxed">· {t}</p>
        ))}
      </div>
    </section>
  );
}

// ── 메인 ───────────────────────────────────────────────
export default function Dashboard() {
  const [today] = useState(() => {
    const d = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  });

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-100">
      <div className="w-full max-w-6xl mx-auto px-4 pt-8">
        <header className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold tracking-tight">{today}</h1>
            <div className="flex items-center gap-1 text-stone-500 text-[11px]">
              <Clock size={12} />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <WorldClock label="한국" timeZone="Asia/Seoul" temp={weatherByCity.seoul.temp} />
            <WorldClock label="미국" timeZone="America/New_York" temp={weatherByCity.newyork.temp} />
          </div>
        </header>
      </div>

      {/* 타임라인은 화면 폭을 최대한 활용 (가로 모드 권장) */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px]">🏢</span>
          <span className="text-[12px] font-semibold text-amber-300 tracking-wide">업무</span>
          <div className="flex-1 h-px bg-amber-400/20" />
        </div>
        <DevModelTable />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 pb-8 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          <MonthlyProgressCard />
          <MustDoCard />
          <CollapsibleSection icon={Briefcase} label="오늘 업무일정" dateLabel={dateLabelOf(TODAY_DATE)} accent="#E8A33D" events={todayWorkEvents} defaultOpen />
          <CollapsibleSection icon={Briefcase} label="내일 업무일정" dateLabel={dateLabelOf(TOMORROW_DATE)} accent="#C77DD6" events={tomorrowWorkEvents} defaultOpen />
        </div>

        <div className="flex items-center gap-2 mt-6 mb-3">
          <span className="text-[13px]">👤</span>
          <span className="text-[12px] font-semibold text-sky-300 tracking-wide">개인</span>
          <div className="flex-1 h-px bg-sky-400/20" />
        </div>

        <div className="mt-1">
          <PersonalPlanTable />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <TodoListCard title="오늘 해야 할 일 (개인)" items={personalTodayTodos} emptyText="오늘 개인 할 일 없음" />
          <TodoListCard title="이번주 해야 할 일 (개인계획)" items={personalWeekTodos} emptyText="이번주 할 일 없음" />
        </div>
      </div>
    </div>
  );
}
