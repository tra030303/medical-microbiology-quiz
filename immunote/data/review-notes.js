// 문항별 보조 검토 의견입니다. 849문항 전체의 의학적 검증 완료를 뜻하지 않습니다.
// 원본 답안은 originalAnswers로 보존하고, 이 객체만으로 채점 정답을 바꾸지 않습니다.
export const ASSISTANT_REVIEWS = {
  "past-1-1-2025-12": {
    "status": "correction",
    "originalAnswers": [
      1
    ],
    "suggestedAnswers": [
      2
    ],
    "summary": "답안표의 ①은 오기로 보이며, 정의에 맞는 답은 ② Incubation period입니다.",
    "rationale": "감염부터 임상 증상 발생까지는 잠복기(incubation period)입니다. 감염부터 전염력이 생길 때까지는 잠재기(latent period)이고, convalescent period는 회복기에 해당합니다. 2023년 95번·2020년 2번의 동일 문항 및 병인론 강의 9–11쪽과 대조하면 ②가 타당합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "병인론 강의 PDF 9–11쪽"
      },
      {
        "label": "족보_1 PDF 4쪽 본문·102쪽 답안표 및 다른 연도 동일 문항"
      }
    ]
  },
  "past-1-6-2023-97": {
    "status": "correction",
    "originalAnswers": [
      5
    ],
    "summary": "ETA를 대표적인 초항원으로 외우는 것은 부적절하며, 선지에 적절한 정답이 없을 가능성이 큽니다.",
    "rationale": "ETA의 확립된 주된 작용은 desmoglein-1을 절단하는 serine protease 작용입니다. 과거 ETA의 초항원성에 대한 보고가 있었지만, 재조합 독소를 이용한 후속 연구는 이를 지지하지 않았습니다. 황색포도알균의 대표적인 초항원은 TSST-1과 여러 enterotoxin인데 이 보기에는 없습니다. 원답 ⑤를 다른 번호로 임의 교체하지 않고 문항 오류 가능성으로 남깁니다. 새로 첨부한 포도알균 강의 PDF 9–10쪽도 ET를 초항원 항목의 연속 문맥에 배치합니다. 강의의 분류와 ETA의 확립된 주된 작용기전은 구분해서 학습하세요.",
    "confidence": "높음",
    "reviewedAt": "2026-11-04",
    "references": [
      {
        "label": "포도알균_김범준 교수님 강의 PDF 9–10쪽: 초항원 항목과 ET의 연속 배치"
      },
      {
        "label": "Recombinant S. aureus exfoliative toxins are not bacterial superantigens",
        "url": "https://journals.asm.org/doi/10.1128/iai.68.5.3048-3052.2000"
      },
      {
        "label": "ETA의 desmoglein-1 절단 기전 연구",
        "url": "https://pubmed.ncbi.nlm.nih.gov/11062541/"
      }
    ]
  },
  "past-1-6-2020-18": {
    "status": "correction",
    "originalAnswers": [
      5
    ],
    "summary": "ETA의 초항원 분류에는 문제가 있으며, 주된 기전은 desmoglein-1 절단입니다.",
    "rationale": "원답 ⑤ ETA는 피부의 desmoglein-1에 작용하는 serine protease로 이해해야 합니다. ETA를 전형적인 초항원으로 분류하는 것은 후속 실험 결과와 맞지 않습니다. TSST-1·staphylococcal enterotoxin이 보기에서 빠져 있어, 제시된 선지 중 새 정답을 단정하기 어렵습니다. 새로 첨부한 포도알균 강의 PDF 9–10쪽도 ET를 초항원 항목의 연속 문맥에 배치합니다. 강의의 분류와 ETA의 확립된 주된 작용기전은 구분해서 학습하세요.",
    "confidence": "높음",
    "reviewedAt": "2026-11-04",
    "references": [
      {
        "label": "포도알균_김범준 교수님 강의 PDF 9–10쪽: 초항원 항목과 ET의 연속 배치"
      },
      {
        "label": "Recombinant S. aureus exfoliative toxins are not bacterial superantigens",
        "url": "https://journals.asm.org/doi/10.1128/iai.68.5.3048-3052.2000"
      },
      {
        "label": "ETA의 desmoglein-1 절단 기전 연구",
        "url": "https://pubmed.ncbi.nlm.nih.gov/11062541/"
      }
    ]
  },
  "past-1-18-2023-29": {
    "status": "correction",
    "originalAnswers": [
      4,
      5
    ],
    "suggestedAnswers": [
      5
    ],
    "summary": "접합백신의 예로는 ⑤ 수막염균이 적절합니다. ④ 백일해를 같은 방식으로 묶는 것은 부적절합니다.",
    "rationale": "MenACWY 접합백신은 수막염균의 협막 다당을 운반 단백질에 결합한 백신입니다. 반면 통상적인 무세포 백일해 백신은 pertussis toxoid 등 선택된 단백 항원을 사용하며, 협막 다당-단백 접합백신의 예가 아닙니다. 혼합백신에 다른 세균의 접합백신 성분이 들어 있다는 사실과 백일해 항원 자체의 유형을 구별해야 합니다. 원본의 복수 인정답 ④·⑤ 중 질문의 기전에 직접 맞는 것은 ⑤입니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "CDC: Meningococcal vaccination information for health care providers",
        "url": "https://www.cdc.gov/vaccines/hcp/by-disease/mening.html"
      },
      {
        "label": "WHO: Acellular pertussis vaccine recommendations",
        "url": "https://cdn.who.int/media/docs/default-source/biologicals/vaccine-standardization/pertussis/trs_979_annex_4.pdf"
      }
    ]
  },
  "past-1-3-2022-11": {
    "status": "ambiguous",
    "originalAnswers": [
      1
    ],
    "summary": "원답 ①의 방향은 맞지만, ④ 역시 임상적으로 타당하게 읽힐 여지가 있습니다.",
    "rationale": "코인두 면봉은 위쪽이 아니라 입천장과 평행하게 뒤쪽으로 진행합니다. 다만 소아에게 해부학적 크기와 채취 부위에 적절한 면봉을 선택한다는 ④의 취지도 일반적으로 타당합니다. 따라서 단일 최선답으로 ①을 고르도록 한 원문과, 다른 선지의 임상적 타당성은 구분해서 이해하는 편이 좋습니다. ④를 무조건 틀린 채취 원칙으로 암기하지 마세요.",
    "confidence": "중간",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "진단 강의 PDF 43–47쪽"
      },
      {
        "label": "CDC: Clinical specimen collection—NP swab direction and mini-tip swabs",
        "url": "https://www.cdc.gov/covid/hcp/clinical-care/clinical-specimen-guidelines.html"
      }
    ]
  },
  "past-1-3-2023-65": {
    "status": "ambiguous",
    "originalAnswers": [
      4
    ],
    "summary": "④는 강의에서 설명한 검사실 작업 흐름으로 읽되, 모든 동정법의 절대적 필요조건으로 일반화하지 마세요.",
    "rationale": "검체 도말과 배양 집락의 그람염색을 함께 활용하는 것은 일반적인 검사실 흐름입니다. 그러나 “동정에는 적어도 두 번이 반드시 필요하다”는 문구를 모든 검사법에 적용되는 원리로 확장하면 지나칩니다. 검사실·검체·동정 방법에 따라 과정이 달라질 수 있습니다. 그람염색은 형태와 숙주 반응을 빠르게 보여주지만 최종 동정·감수성 결과 자체와 동일하지 않다는 개념을 우선 학습하세요.",
    "confidence": "중간",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "족보 2023년 진단 65번"
      },
      {
        "label": "치료원칙 강의 PDF 10–13쪽·진단 강의 PDF 18–24쪽"
      }
    ]
  },
  "past-1-3-2022-35": {
    "status": "historical",
    "originalAnswers": [
      3
    ],
    "summary": "2022년 당시의 국내 확진 인정 기준을 묻는 문항입니다.",
    "rationale": "원답은 신속항원검사와 실시간 RT-PCR의 조합인 ③입니다. 이는 해당 연도의 정책·검사 운영 문맥에 속하므로 현재의 확진 인정 기준으로 그대로 외우면 안 됩니다. 검사법의 표적과 원리를 구분해서 공부하세요. 원문의 “RT-OCR”은 “RT-PCR”의 오기로 보입니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "족보 2022년 진단 35번 및 답안표"
      },
      {
        "label": "진단 강의 PDF 46–52쪽: 바이러스 검출법"
      }
    ]
  },
  "past-1-3-2020-3": {
    "status": "historical",
    "originalAnswers": [
      3
    ],
    "summary": "“가장 널리 이용된다”는 2020년 당시의 상황에 대한 답입니다.",
    "rationale": "원답 ③ 실시간 RT-PCR은 이 기출의 연도와 검사 상황에 맞추어 해석해야 합니다. 검사 이용 빈도와 행정적 인정 기준은 시기에 따라 달라질 수 있습니다. RT-PCR은 RNA를 역전사한 뒤 핵산을 증폭하는 검사라는 원리를 학습의 기준으로 삼으세요.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "족보 2020년 진단 3번 및 답안표"
      },
      {
        "label": "진단 강의 PDF 46–52쪽"
      }
    ]
  },
  "past-1-13-2022-81": {
    "status": "ambiguous",
    "originalAnswers": [
      2
    ],
    "summary": "②는 의도된 답으로 보이지만, “액틴을 분해한다”는 분자기전 표현은 부정확합니다.",
    "rationale": "C. difficile의 TcdA·TcdB는 주로 Rho 계열 GTPase를 glucosylation하여 불활성화하고, 그 결과 액틴 세포골격이 붕괴하게 합니다. 독소가 액틴 단백질 자체를 직접 절단하는 것으로 이해하면 안 됩니다. 이 문항의 다른 선지들도 독소·마비 양상 등을 뒤바꾸고 있어 ②가 출제 의도로 보이나, 정확한 기전은 별도로 구분해야 합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "Toxin A의 Rho 단백질 glucosylation 원저",
        "url": "https://pubmed.ncbi.nlm.nih.gov/7775453/"
      },
      {
        "label": "TcdB의 Rho GTPase glucosylation 기전 연구",
        "url": "https://pubmed.ncbi.nlm.nih.gov/36038138/"
      }
    ]
  },
  "past-1-15-2022-64": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "summary": "원답 ⑤ 외에, NTM 전체를 신속발육균으로 쓰는 ③도 일반화하면 틀립니다.",
    "rationale": "NTM은 하나의 균종이 아니라 여러 균종을 포함하는 범주입니다. MAC·M. kansasii·M. xenopi처럼 느리게 자라는 균과 M. abscessus처럼 빠르게 자라는 균이 모두 포함됩니다. 문항의 smooth/rough·GPL·cording 설명은 특히 M. abscessus의 맥락과 관련이 있으므로 이를 NTM 전체의 성질로 외우면 안 됩니다. 전체 NTM을 대상으로 읽으면 단일정답성이 흔들립니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "ATS/ERS/ESCMID/IDSA NTM 진료지침: slowly/rapidly growing species 구분",
        "url": "https://www.idsociety.org/practice-guideline/nontuberculous-mycobacterial-ntm-diseases/"
      }
    ]
  },
  "past-1-15-2021-40": {
    "status": "ambiguous",
    "originalAnswers": [
      4
    ],
    "summary": "문항의 M. abscessus 맥락과 NTM 전체에 대한 설명이 섞여 있습니다.",
    "rationale": "원답은 ④이지만, ③의 “비결핵 항산균은 생장속도가 빠르다”는 설명은 NTM 전체에 대해 성립하지 않습니다. NTM에는 느리게 자라는 MAC 등도 포함됩니다. M. abscessus의 표현형과 감염 모델에 관한 설명을 NTM의 보편적 특징으로 확대하지 말고, 해당 균종을 전제한 강의 설명인지 확인하는 것이 좋습니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "ATS/ERS/ESCMID/IDSA NTM 진료지침",
        "url": "https://www.idsociety.org/practice-guideline/nontuberculous-mycobacterial-ntm-diseases/"
      }
    ]
  },
  "past-1-15-2025-9": {
    "status": "ambiguous",
    "originalAnswers": [],
    "summary": "정답표가 확인되지 않았고, NTM 전체와 M. abscessus의 특성이 혼용되어 있습니다.",
    "rationale": "③처럼 NTM 전체를 신속발육균으로 묶을 수 없습니다. ⑤의 smooth/GPL 설명도 특정 균종의 표현형 문맥을 확인해야 합니다. 원본 답안이 누락된 상태에서 하나의 정답을 추정해 채우기보다, 문제에서 NTM이 M. abscessus를 뜻하도록 제한되었는지 강의와 대조할 필요가 있습니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "ATS/ERS/ESCMID/IDSA NTM 진료지침",
        "url": "https://www.idsociety.org/practice-guideline/nontuberculous-mycobacterial-ntm-diseases/"
      }
    ]
  },
  "past-1-10-2025-89": {
    "status": "ambiguous",
    "originalAnswers": [
      2,
      3
    ],
    "summary": "보체 회피와 직접 부착이라는 서로 다른 기능을 한 문장으로 묶어 해석이 모호합니다.",
    "rationale": "협막 K 항원은 보체·포식작용을 포함한 숙주 방어 회피와 연결되고, 숙주세포에 대한 직접 부착에서는 fimbriae/pili의 역할이 중요합니다. O 항원은 LPS의 다당 부분으로 구별해야 합니다. 특정 협막이나 표면 구조가 부착에도 기여할 수 있지만, 모든 균주에서 K 또는 O 항원 하나가 제시된 두 기능을 대표한다고 일반화하기는 어렵습니다. 원본에서 ②·③이 함께 인정된 사실과 항원별 대표 기능을 나누어 학습하세요.",
    "confidence": "중간",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "Medical Microbiology: Bacterial Pathogenesis",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK8526/"
      },
      {
        "label": "Essentials of Glycobiology: K antigens와 capsule의 숙주 방어 회피",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK1945/"
      }
    ]
  },
  "past-1-33-2025-51": {
    "status": "ambiguous",
    "originalAnswers": [
      1,
      3
    ],
    "summary": "①은 배양세포의 바이러스 증식 기전, ③은 제조 방식 전환의 임상적 이점이라는 서로 다른 수준의 설명입니다.",
    "rationale": "Vero 세포는 type I interferon 유전자군의 결실로 바이러스 증식에 유리한 성질을 보입니다. 한편 뇌조직 유래 백신에서 세포배양 백신으로 전환한 이점은 최종 제품의 안전성 평가와 관련된 별도 문제입니다. Vero 세포를 쓴다는 사실만으로 모든 백신의 부작용 감소가 자동 보장된다고 해석하지 마세요. 원본의 복수 인정답 ①·③은 질문 범위가 넓었던 결과로 이해할 수 있습니다.",
    "confidence": "중간",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "Vero 세포 유전체의 type I interferon 유전자군 결실 원저",
        "url": "https://pubmed.ncbi.nlm.nih.gov/25267831/"
      },
      {
        "label": "CDC ACIP: Japanese encephalitis vaccines",
        "url": "https://www.cdc.gov/mmwr/volumes/68/rr/rr6802a1.htm"
      }
    ]
  },
  "past-1-13-2023-8": {
    "status": "historical",
    "originalAnswers": [
      3
    ],
    "summary": "원답 ③의 배양 단독 확진 문제와, ②의 과거 치료 표현은 구분해서 보세요.",
    "rationale": "C. difficile을 배양했다는 사실만으로 독소에 의한 활동성 감염을 확진할 수 없다는 것이 원답 ③의 핵심입니다. 다만 ②를 현재의 중증도와 무관한 우선 치료 원칙으로 외우면 안 됩니다. IDSA/SHEA 지침은 성인 초기 CDI에서 fidaxomicin을 선호하고 경구 vancomycin을 대안으로 제시하며, metronidazole의 역할은 제한적입니다. 과거 증례의 처방과 현재 지침을 분리해 학습하세요.",
    "confidence": "높음",
    "reviewedAt": "2026-11-03",
    "references": [
      {
        "label": "IDSA/SHEA 2021 CDI focused update",
        "url": "https://www.idsociety.org/practice-guideline/clostridioides-difficile-2021-focused-update/"
      },
      {
        "label": "IDSA/SHEA 2017 CDI guideline",
        "url": "https://www.idsociety.org/practice-guideline/clostridium-difficile"
      }
    ]
  },
  "past-1-7-2020-14": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "summary": "원답은 ⑤이지만, ③ HSV-1도 성접촉으로 전파될 수 있어 질문의 범위가 모호합니다.",
    "rationale": "Trichomonas vaginalis는 대표적인 성매개 병원체로 원답 ⑤에 해당합니다. 그러나 HSV-1도 구강-생식기 접촉 등을 통해 생식기 감염을 유발할 수 있습니다. 질문이 단순히 “성적 접촉을 통해 전파되는 병원체”를 묻고 있으므로 ③을 성접촉 전파가 불가능한 보기로 암기하면 부정확합니다. 감염병리 강의의 HSV-1 구순·HSV-2 음부 호발 부위 구분은 전파 가능성의 절대적 구분이 아닙니다. WHO의 2020년 설명에도 같은 전파 경로가 제시되어 있습니다. 원답과 채점 기준은 유지하고, 단일정답성이 약하다는 점을 별도로 안내합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-04",
    "references": [
      {
        "label": "감염병리 수정.pdf 28·80·90쪽 및 족보 2020년 감염병리 14번"
      },
      {
        "label": "CDC: About Genital Herpes — HSV-1의 구강성교를 통한 생식기 전파",
        "url": "https://www.cdc.gov/herpes/about/"
      },
      {
        "label": "WHO 2020-05-01: Herpes infection and oral-to-genital transmission",
        "url": "https://www.who.int/news/item/01-05-2020-massive-proportion-world-population-living-with-herpes-infection"
      }
    ]
  },
  "past-1-11-2021-22": {
    "status": "correction",
    "originalAnswers": [
      1
    ],
    "suggestedAnswers": [
      2
    ],
    "summary": "답안표의 ① Enterobacter는 오기로 보이며, 이 문항의 기전에 맞는 답은 ② Shigella입니다.",
    "rationale": "단백질 합성을 억제하는 Shiga 독소와 출혈성 설사를 연결한 문항입니다. 장내세균 일반특징 강의 16쪽은 Shiga 독소의 단백질 합성 억제와 Shigella·장출혈성 대장균을 연결합니다. 특히 S. dysenteriae 1형이 대표적이며, 보기에서는 ② Shigella가 이에 해당합니다. 같은 보기와 문장을 사용하는 2020년 23번의 원답도 ②인 반면 2021년 답안표만 ①로 되어 있어 답안 오기 가능성이 높습니다. 원본 답안과 채점 기준은 보존하고 교정 제안만 별도로 표시합니다. 원문의 “hemolytic diarrhea”는 혈변을 뜻하는 문맥으로 읽되, 출혈성 설사와 HUS의 용혈성 빈혈은 구분해 학습하세요.",
    "confidence": "높음",
    "reviewedAt": "2026-11-05",
    "references": [
      {
        "label": "10_장내세균일반특징_강의자료.pdf 16쪽: Shiga toxin과 단백질 합성 억제"
      },
      {
        "label": "감염과 면역 족보_1.pdf 18쪽 동일 문항 및 104쪽 2021년·2020년 답안표 직접 대조"
      },
      {
        "label": "S. dysenteriae 1 Shiga toxin의 단백질 합성 억제 원저",
        "url": "https://pubmed.ncbi.nlm.nih.gov/3334156/"
      },
      {
        "label": "Shiga toxin의 28S rRNA N-glycosidase 기전 원저",
        "url": "https://pubmed.ncbi.nlm.nih.gov/3276522/"
      }
    ]
  },
  "past-1-12-2021-37": {
    "status": "correction",
    "originalAnswers": [
      5
    ],
    "suggestedAnswers": [
      3
    ],
    "summary": "답안표의 ⑤는 임상·보기와 맞지 않으며, 제시된 보기 중 ③ C. jejuni가 가장 타당합니다. 다만 18시간 잠복기는 비전형적입니다.",
    "rationale": "원족보 PDF 20쪽 본문과 105쪽 답안표를 직접 대조하면 원답은 ⑤ C. diphtheriae로 되어 있습니다. 닭고기 관련 식사, 복통·미열·혈변, 대변에서 원인균 동정이라는 조합은 보기 중 ③ C. jejuni가 가장 잘 설명합니다. C. diphtheriae의 전형적 호흡기·피부 감염상과 맞지 않아 답안표 오기 가능성이 높습니다. 다만 식사 18시간 뒤 발생은 CDC의 C. jejuni 전형 잠복기 2–5일보다 짧으므로 시간 단서까지 매끈한 문항으로 해석하지 않습니다. 원문의 짧은 잠복기 때문에 다른 식중독 감별도 필요하나 원답 ⑤를 지지하지는 않습니다. 원본 정답·채점 키는 보존하고 별도 교정 제안만 표시합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-05",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf PDF 20쪽 본문·105쪽 답안표 직접 렌더 확인"
      },
      {
        "label": "감염과면역12-콜레라 캄필로박터 수도모나스_2026.pdf / PDF 20–22쪽: C. jejuni 노출·염증성 장염·잠복기"
      },
      {
        "label": "CDC Campylobacter 임상개요: 전형2–5일·가금류·혈성설사",
        "url": "https://www.cdc.gov/campylobacter/hcp/clinical-overview/index.html"
      },
      {
        "label": "CDC Diphtheria 임상 양상",
        "url": "https://www.cdc.gov/diphtheria/hcp/clinical-signs/index.html"
      }
    ]
  },
  "past-1-12-2023-30": {
    "status": "ambiguous",
    "originalAnswers": [
      4
    ],
    "summary": "원답 ④ 여행력은 보존하되, 간경변·발열·하지 수포성 병변에서는 ⑤ 음식 섭취력과 ③ 외상·해수 노출력도 핵심 질문입니다.",
    "rationale": "원족보 PDF 19쪽 본문·하지 수포 사진과 105쪽 답안표를 직접 확인했습니다. 원답은 ④ 여행력입니다. 간경변 환자의 발열과 수포성 하지 병변은 V. vulnificus 감염을 감별해야 하는 소견으로, 생굴 등 날해산물 섭취와 해수·기수에 노출된 상처를 모두 물어야 합니다. 따라서 ⑤ 음식 섭취력이나 ③ 외상력을 원인균 추정과 무관한 오답으로 외우면 부정확합니다. 사진과 짧은 본문만으로 원인균을 확진하거나 감염 경로를 하나로 정할 수 없고 여행력도 다른 감별에 도움이 될 수 있으므로, 새 정답을 하나로 확정하지 않고 단일정답성의 모호함을 안내합니다. 원본 정답·채점 키는 변경하지 않습니다.",
    "confidence": "중간",
    "reviewedAt": "2026-11-05",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf PDF 19쪽 본문·수포사진 및105쪽 답안표 직접 렌더 확인"
      },
      {
        "label": "감염과면역12-콜레라 캄필로박터 수도모나스_2026.pdf / PDF 11–13·16–17쪽: V. vulnificus 고위험군·노출·괴사성 감염"
      },
      {
        "label": "CDC Vibriosis 임상개요: 간질환·패혈증·수포·음식 및 상처 노출",
        "url": "https://www.cdc.gov/vibrio/hcp/clinical-overview/"
      }
    ]
  },
  "past-1-12-2022-70": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "summary": "의도된 정답은 ⑤이지만, ②의 “절대 산소균”도 모든 조건의 무산소 성장 불가능으로 외우면 부정확합니다.",
    "rationale": "원족보 PDF 20쪽 본문과 105쪽 답안표의 원답 ⑤를 직접 확인했습니다. 녹농균은 MacConkey에서 lactose 비발효성이므로 분홍색 발효 집락이라는 ⑤의 진술은 명백히 틀려 이 문항의 의도된 정답입니다. 그러나 ② obligate aerobe를 문자 그대로 산소가 없으면 어떤 조건에서도 성장하지 못한다는 뜻으로 읽으면 엄밀하지 않습니다. 2026년 콜레라·캄필로박터·수도모나스 강의 PDF 32쪽은 주로 호기성 호흡을 하되 질산염 등으로 혐기성 호흡이 가능함을 명시하고, 원저에서도 질산염 최종 전자수용체를 이용한 무산소 조건이 확인됩니다. 과거 문항의 단순화와 정확한 대사 가능성을 구별하여 안내하고 원본 정답·채점 키는 ⑤로 보존합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-05",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf PDF 20쪽 본문·105쪽 답안표 직접 렌더 확인"
      },
      {
        "label": "감염과면역12-콜레라 캄필로박터 수도모나스_2026.pdf / PDF 32쪽: 비발효성·lactose 비발효·질산염 이용 혐기성 호흡"
      },
      {
        "label": "질산염을 최종 전자수용체로 이용한 무산소 조건 원저",
        "url": "https://pubmed.ncbi.nlm.nih.gov/8955420/"
      }
    ]
  },
  "past-1-16-2025-86": {
    "status": "ambiguous",
    "originalAnswers": [
      4
    ],
    "summary": "정답 ④의 기전은 맞지만, 본문의 “전사(translation)”는 “번역(translation)”으로 읽어야 합니다.",
    "rationale": "원문은 “전사”라고 쓰면서 괄호에 translation을 병기합니다. 전사는 DNA에서 RNA를 만드는 transcription이고, 번역은 mRNA를 바탕으로 단백질을 만드는 translation입니다. 디프테리아 독소의 C domain은 NAD⁺를 이용해 EF-2를 ADP-ribosylation하여 단백질 합성의 신장 단계를 억제합니다. 따라서 이 문항은 RNA 전사를 억제하는 기전이 아니라 번역을 억제하는 기전을 묻는 것으로 해석해야 합니다. 원답 ④와 채점 기준은 그대로 보존합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-06",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf / PDF 25쪽 2025년 86번 원문 이미지·106쪽 답안표"
      },
      {
        "label": "[261106_05]코리네박테리움, 노카르디아(염진기)_변준서v1.pdf / PDF p11–13: EF-2와 단백질 번역 억제"
      },
      {
        "label": "NCBI Medical Microbiology: Corynebacterium Diphtheriae — EF-2 ADP-ribosylation and protein synthesis inhibition",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK7971/"
      }
    ]
  },
  "past-1-15-2022-78": {
    "status": "historical",
    "originalAnswers": [
      4
    ],
    "summary": "원답 ④ kanamycin은 과거 2차 주사제 분류의 답입니다. 현행 MDR/RR-TB 처방 원칙과 구분하세요.",
    "rationale": "이 문항의 원답은 ④ kanamycin으로, 문항이 사용한 과거 1차/2차 약제 분류를 묻는 것으로 읽을 수 있습니다. 이는 2022년의 최신 처방 권고까지 정확히 반영한다는 뜻은 아닙니다. WHO 2026 통합지침 제2판의 권고 B3.2는 MDR/RR-TB 장기요법에 kanamycin과 capreomycin을 포함하지 않도록 권고합니다. 따라서 이 기출을 현재 내성 결핵에 kanamycin을 우선 추가한다는 뜻으로 외우면 부정확합니다. 실제 약제 선택은 감수성과 치료 적격성 등에 따라 결정합니다. 원본 정답과 채점 키 ④는 보존하고, 과거 분류와 현재 치료 원칙을 별도로 안내합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-06",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf / PDF 25쪽 2022년 78번·105쪽 답안표: 원답 ④"
      },
      {
        "label": "[261106_03] 마이코박테리움(염진기)_ 서현오v1.pdf / PDF 26·50쪽: 과거 약제 분류·기출"
      },
      {
        "label": "WHO consolidated guidelines on tuberculosis, 2nd edition (2026), Module 4, Chapter 2, B3.2: kanamycin/capreomycin 제외",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK625333/"
      }
    ]
  },
  "past-1-18-2025-24": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "summary": "원답 ⑤는 타당하지만, 본문의 ‘항식세포 작용을 억제’는 ‘식세포 작용을 억제’로 읽어야 합니다.",
    "rationale": "실제 원문 스캔에는 ‘항식세포 작용을 억제하며’라고 되어 있습니다. Hib의 PRP 협막은 식세포 작용에 의한 제거를 피하게 하므로 ‘식세포 작용을 억제한다’ 또는 ‘항식세포 작용을 나타낸다’가 맞습니다. ‘항식세포 작용을 억제한다’를 문자 그대로 읽으면 기능이 반대로 전달됩니다. 문항이 의도한 주요 독력인자이자 백신 표적은 ⑤ PRP capsule로 타당하므로 원답·채점키는 유지하고 표현의 오류만 구별해 학습합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-09",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf / PDF 29쪽 2025년 24번 원문 이미지·106쪽 답안표"
      },
      {
        "label": "감염과면역18_헤모필루스, 보르데텔라, 나이세리아 2026.pdf / PDF p9–10: PRP 협막의 식균 회피·혈류 생존"
      },
      {
        "label": "CDC Pink Book: Hib PRP 협막과 항협막 항체의 보호",
        "url": "https://www.cdc.gov/pinkbook/hcp/table-of-contents/chapter-8-haemophilus-influenzae.html"
      }
    ]
  },
  "past-1-19-2025-77": {
    "status": "historical",
    "originalAnswers": [
      1,
      3
    ],
    "summary": "원문에서 ①·③을 인정한 답안은 유지합니다. ④의 ‘흔하게 gas-liquid chromatography를 사용’한다는 표현은 과거 동정법 설명과 현대 임상진단을 구분해 읽어야 합니다.",
    "rationale": "강의 PDF p12는 지방산 조성을 이용한 동정 특성을 소개합니다. 이를 현재 임상에서 흔히 시행하는 표준 진단이라는 뜻으로 일반화하면 부정확합니다. CDC의 현재 안내는 L. pneumophila serogroup 1 요항원검사와 하부 호흡기 검체의 배양 또는 분자검사를 함께 활용하도록 권고합니다. 균의 성상·동정법과 환자의 진단 전략은 구분해서 학습하세요. 이 의견은 원문 인정답 ①·③을 변경하거나 새 정답을 추가하지 않습니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-09",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf · PDF31쪽 · 답안107쪽(①·③ 인정)"
      },
      {
        "label": "[251106_05] 레지오넬라, 리스테리아, 바실루스(석승혁)_정동민v1.pdf · PDF12쪽(지방산 동정 특성)"
      },
      {
        "label": "CDC Laboratory Testing for Legionella (2026-05-13)",
        "url": "https://www.cdc.gov/legionella/php/laboratories/"
      }
    ]
  },
  "past-1-19-2022-72": {
    "status": "ambiguous",
    "originalAnswers": [
      1
    ],
    "summary": "탄저균이라는 원답은 유지하되, 생검에서 ‘포자를 포함’한다는 문구를 전형적인 생체 조직 소견으로 암기하지 않도록 주의가 필요합니다.",
    "rationale": "B. anthracis는 살아 있는 숙주 조직에서 주로 협막성 영양형으로 관찰되며, 아포는 주로 환경·배양 상태와 관련됩니다. 채취 뒤 외부 환경에 노출되는 등 검체 상태에 따라 관찰 양상이 달라질 수 있어, 조직 내 아포를 탄저의 필수 동정 소견으로 일반화하면 부정확합니다. 이 문항에서는 가축 접촉, 검은 가피, 큰 사슬형 막대균이라는 전체 맥락이 탄저균을 지지합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-09",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf · PDF32쪽 본문·답안107쪽"
      },
      {
        "label": "[251106_05] 레지오넬라, 리스테리아, 바실루스(석승혁)_정동민v1.pdf · PDF35–36쪽(기본 형태)"
      },
      {
        "label": "Hawaii Department of Health, B. anthracis microscopic characteristics",
        "url": "https://health.hawaii.gov/statelab/ba/"
      }
    ]
  },
  "past-1-19-2021-33": {
    "status": "ambiguous",
    "originalAnswers": [
      2
    ],
    "summary": "탄저균이라는 원답은 유지하되, 생검에서 ‘포자를 포함’한다는 문구를 전형적인 생체 조직 소견으로 암기하지 않도록 주의가 필요합니다.",
    "rationale": "B. anthracis는 살아 있는 숙주 조직에서 주로 협막성 영양형으로 관찰되며, 아포는 주로 환경·배양 상태와 관련됩니다. 채취 뒤 외부 환경에 노출되는 등 검체 상태에 따라 관찰 양상이 달라질 수 있어, 조직 내 아포를 탄저의 필수 동정 소견으로 일반화하면 부정확합니다. 이 문항에서는 가축 접촉, 검은 가피, 큰 사슬형 막대균이라는 전체 맥락이 탄저균을 지지합니다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-09",
    "references": [
      {
        "label": "감염과 면역 족보_1.pdf · PDF32쪽 본문·답안107쪽"
      },
      {
        "label": "[251106_05] 레지오넬라, 리스테리아, 바실루스(석승혁)_정동민v1.pdf · PDF35–36쪽(기본 형태)"
      },
      {
        "label": "Hawaii Department of Health, B. anthracis microscopic characteristics",
        "url": "https://health.hawaii.gov/statelab/ba/"
      }
    ]
  },
  "past-1-20-2022-26": {
    "status": "correction",
    "originalAnswers": [
      4
    ],
    "suggestedAnswers": [
      2
    ],
    "summary": "β-lactamase/penicillinase에 의한 내성은 항생제 파괴(②)이며, 원답 ④ 표적 결합 방해와 일치하지 않는다.",
    "rationale": "원문 이미지에는 β-lactamase 또는 penicillinase 생성과 선택지 ② 항생제 파괴, ④ 항생제의 target 결합 방해가 분명히 보인다. β-lactamase는 β-lactam ring을 가수분해해 약물을 불활성화한다. 현재 강의 PDF 물리 p20–21 및 동일 취지 2021년 46번 원답②와도 일치한다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-10",
    "references": [
      {
        "label": "[261109_03]항생제 약리학의 기본 원리_항생제 내성 PDF physical p20–21"
      },
      {
        "label": "CDC About Antimicrobial Resistance: enzyme-mediated drug destruction",
        "url": "https://www.cdc.gov/antimicrobial-resistance/about/"
      }
    ]
  },
  "past-1-20-2021-45": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "suggestedAnswers": [
      3,
      5
    ],
    "summary": "원답 ⑤ 외 ③도 의학적으로 타당하여 단일 정답 문항의 불완전성 가능성이 있다.",
    "rationale": "원문 두 이미지에서 ③은 항생제 내성이 입원 기간 연장·의료비·사망률 증가를 초래한다는 일반 설명이며 WHO의 AMR 건강·의료체계 영향과 부합한다. ⑤는 원인균이 불명확할 때 초기 광범위 항균제를 사용할 수 있다는 조건부 가능성으로 타당하다. ⑤만 채점되는 원답은 보존하고, ③까지 타당하다는 학습용 검토 첨언을 권고한다. ①의 항생제 사용만이 발생 원인이라는 단정, ②의 독성 증가 일반화, ④의 가능한 저용량 권장은 타당하지 않다.",
    "confidence": "높음",
    "reviewedAt": "2026-11-10",
    "references": [
      {
        "label": "WHO Antimicrobial resistance: mortality, hospital stay and health-care costs",
        "url": "https://www.who.int/news-room/fact-sheets/detail/antimicrobial-resistance"
      },
      {
        "label": "WHO AMR health topic: prolonged hospital stays and health-care costs",
        "url": "https://www.who.int/health-topics/antimicrobial-resistance"
      },
      {
        "label": "[261109_03]항생제 약리학의 기본 원리_항생제 내성 PDF physical p11–12; 2021년 45번 원문 두 이미지"
      }
    ]
  },
  "past-1-22-2022-40": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "suggestedAnswers": [],
    "summary": "매개체가 명시되지 않아 예방 방법의 해석에 주의가 필요합니다.",
    "rationale": "원답 ⑤는 유지합니다. 반복 고열이라는 임상상만으로 몸니 매개 재귀열과 진드기 매개 재귀열을 확정하기는 어렵습니다. 몸니 매개 재귀열을 의도했다면 몸·의복·침구의 위생 관리가 핵심입니다. 그러나 이 문항에는 2021년 유사 문항의 “몸을 자주 씻는다” 보기가 없고, ②도 “성관계를 금지한다”로 다릅니다. ⑤ 긴 옷은 진드기 노출을 줄이는 방법으로 설명할 수 있으므로, 매개체의 문맥이 없는 상태에서 확정적인 대체 정답을 제시하지 않습니다.",
    "confidence": "중간",
    "reviewedAt": "2026-11-10",
    "references": [
      {
        "label": "20261110_감염과면역22_김현제_SNU-LIT_최종.pdf / PDF p.10,11,12,25"
      },
      {
        "label": "About Louse-borne Relapsing Fever",
        "url": "https://www.cdc.gov/relapsing-fever/about/about-lbrf.html"
      }
    ]
  },
  "past-1-22-2023-49": {
    "status": "ambiguous",
    "originalAnswers": [
      5
    ],
    "suggestedAnswers": [],
    "summary": "⑤의 검사 역할뿐 아니라 ③의 3기 매독 정의도 엄밀하지 않습니다.",
    "rationale": "원답 ⑤는 유지합니다. 전통적 검사 흐름은 RPR/VDRL 같은 비트레포네마 검사 후 트레포네마 검사이므로 ⑤는 그 역할을 뒤바꾼 출제 의도로 해석됩니다. 현대에는 자동화 트레포네마 검사로 시작하는 역순 알고리즘도 있지만, FTA-ABS 선별·VDRL 단독 확진을 일반화하는 근거는 아닙니다. 또한 ③의 “3기=전신 장기에 균이 퍼진 상태”라는 표현은 2기의 전신 파종과 3기의 고무종·심혈관 등 후기 장기 손상을 구분하지 않아 부정확합니다. 신경매독은 어느 병기에도 가능합니다. 단일 오답형 문항의 모호함을 표시하며 확정적인 복수 정답을 추가하지 않습니다.",
    "confidence": "중간",
    "reviewedAt": "2026-11-10",
    "references": [
      {
        "label": "20261110_감염과면역22_김현제_SNU-LIT_최종.pdf / PDF p.6,7,8,25"
      },
      {
        "label": "About Syphilis",
        "url": "https://www.cdc.gov/syphilis/about/index.html"
      },
      {
        "label": "Syphilis — STI Treatment Guidelines",
        "url": "https://www.cdc.gov/std/treatment-guidelines/syphilis.htm"
      }
    ]
  },
  "past-1-24-2020-7": {
    "status": "ambiguous",
    "originalAnswers": [
      4
    ],
    "suggestedAnswers": [],
    "summary": "④ doxycycline은 출제 의도와 현재 우선 치료에 맞지만, ⑤ tetracycline과의 구별 문구가 충분하지 않습니다.",
    "rationale": "원답 ④는 유지합니다. 원문 사진의 가피·가을철 야외활동은 쯔쯔가무시증을 시사하고, doxycycline은 현재 권고되는 대표 치료제입니다. 다만 강의 p.33은 tetracycline도 치료 목록에 함께 적고 원문 ⑤에도 같은 이름이 있어, 단순히 “치료제는?”이라고만 물으면 약물명·계열명 해석에 따라 보기가 중복될 여지가 있습니다. ⑤를 자동으로 복수 정답에 추가하지 않고, 우선 권고 약제를 묻는 출제 의도와 문구의 모호함을 구분해 학습하도록 첨언합니다.",
    "confidence": "중간",
    "reviewedAt": "2026-11-10",
    "references": [
      {
        "label": "[261110_03] 리케치아(조남혁)_신유빈v1.pdf / PDF p.12, 33"
      },
      {
        "label": "CDC Clinical Overview of Scrub Typhus: doxycycline treatment",
        "url": "https://www.cdc.gov/typhus/hcp/clinical-overview/clinical-overview-of-scrub-typhus.html"
      }
    ]
  }
};
