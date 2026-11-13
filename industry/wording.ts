// 독자가 보는 글에서 본 사이트가 쓰지 않는 표현. 각 항목은 찾을 패턴과 바꿀 방식입니다 (예: [/대박|역대급/u, "과장된 표현 대신 실제로 무슨 일이 있었는지 직접 쓰십시오"]).
// 작성 단계에서 한국어 제목·요약·추천 이유를 쓴 뒤 하나씩 검사하고, 쓰인 곳만 모델에게 한 번만 고치게 합니다 (packages/backend/src/editorial/
// analyze.ts의 mendWording). 한눈에 판단할 수 있는 표현만 나열하십시오. 확신이 서지 않는 것은 넣지 마십시오. 그렇지 않으면 정상적인 단어를 오변형합니다. 비어 있으면 검사하지 않습니다.

export const READER_WORDING: ReadonlyArray<readonly [RegExp, string]> = [];
