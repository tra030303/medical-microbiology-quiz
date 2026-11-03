# 면역노트

감염과 면역 족보의 강의 분류에 맞춘 문제은행입니다. 족보 849문항과 응용·심화 20문항을 별도 은행으로 제공합니다.

사이트: https://tra030303.github.io/medical-microbiology-quiz/immunote/

이 채팅에 새 자료를 첨부하고 업데이트를 요청하면 assistant가 검토하여 같은 주소에 반영합니다. 게시 절차는 `CHAT_UPDATES.md`에 있습니다.

- 분류별 학습, 학습 모드와 시험 모드, 채점과 해설
- 오답 노트, 북마크, 학습 기록
- JSON, TXT, Markdown, CSV 문제 가져오기 및 미리보기
- 분류와 정답 확인, 중복 문제 방지
- 브라우저 자동 저장, 문제·기록 백업과 복원

## 작업 소스 실행

의존성 설치 없이 Node.js와 Python으로 실행합니다.

```sh
npm run build
npm run dev
```

로컬 주소: `http://127.0.0.1:4173`

```sh
npm test
```

## 문제 추가

사이트의 JSON 또는 Markdown 양식을 내려받을 수 있습니다. JSON의 `answer`는 1부터 시작하는 정답 번호입니다. `category`는 `pathogenesis`, `diagnosis`, `treatment` 등의 ID 또는 족보 강의명입니다. 전체 분류는 `data/categories.js`에 있습니다. 보기와 정답은 가져오기 미리보기에서 확인합니다. 정답을 자동 생성하거나 추측하지 않습니다.

CSV 헤더 예시:

```csv
category,title,stem,option1,option2,option3,option4,option5,answer,explanation,source,difficulty
```

사이트 내 가져오기는 이 브라우저에만 문제를 추가하는 보조 기능입니다. 모든 기기에 게시하려면 이 채팅에서 자료 검토와 업데이트를 요청합니다.

## 저장

문제와 기록은 현재 브라우저의 localStorage에 저장되며 서버나 다른 기기와 자동 동기화되지 않습니다. 기기를 바꾸거나 브라우저 데이터를 지우기 전 사이트에서 백업 파일을 내려받으세요. 백업 복원은 현재 데이터를 대체합니다.

## 자료

기본 문제는 대화에서 검토한 2026년 병인론·진단·치료원칙 강의록과 2020~2025 기출을 바탕으로 만든 응용·심화문항입니다. 원본 강의록·족보 PDF 파일은 사이트에 포함하지 않습니다. Pretendard의 라이선스는 `src/Pretendard-LICENSE.txt`에 있습니다.

## 족보 기출과 만든 문제 분리

- `data/past-questions.js`: 원문 기출 849문항. 828문항은 원본 답안과 연결되며, 21문항은 답안표 누락·번호 불일치로 자동 채점에서 제외합니다. 확인 필요 문항도 원문을 보고 정답을 직접 등록할 수 있습니다.
- `data/questions.js`: 기존 응용·심화 20문항. `origin`에 기출 응용이 포함되어 있어도 `generated` 문제은행에 속합니다.
- 문제은행은 `bank: past | generated`로 구분합니다. 기존 업로드 데이터에 bank가 없으면 만든 문제로 유지합니다.
- 각 문제은행의 전체 섞어 풀기는 해당 종류에서만 무작위로 뽑으며, 보기 순서와 정답 대응은 바꾸지 않습니다. 오답·북마크·학습 기록도 선택한 문제은행에 한정합니다.
- 원본 문항의 그림과 표를 문항별 WebP로 보존합니다. 명시적인 모두 고르기와 복수정답 인정은 서로 다른 방식으로 채점합니다.
- 본문에 같은 문항이 중복된 경우 한 번만 수록합니다. 원문에 번호·도입부가 없는 문항 조각은 독립 채점 문항으로 추정하여 추가하지 않습니다.
- `python scripts/export-standalone.py`로 그림·폰트를 포함한 한 개의 오프라인 HTML 파일을 생성합니다.

## 기존 공개 저장소에 게시

`node scripts/build-github-static.mjs`로 만든 `outputs/github-static/` 내용을 `tra030303/medical-microbiology-quiz`의 `immunote/`에 반영합니다. 원격에 게시된 간소화 패키지는 `npm run build`로 같은 정적 결과물을 만들며, 전체 작업 소스의 테스트·오프라인 내보내기 도구는 포함하지 않습니다. 원문 이미지는 필요할 때 불러오는 모듈 묶음에 보존합니다.

`data/review-notes.js`의 AI 검토 의견은 원문 정답과 별도로 표시하며, 추가만으로 채점 정답을 변경하지 않습니다.
