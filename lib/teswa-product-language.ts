export type TeswaConditionValue = "almost_new" | "good_used" | "minor_issues" | "needs_repair";

export type TeswaDesireModeValue = "specific" | "flexible" | "surprise";

type TeswaLanguageEntry = {
  label: string;
  helper: string;
};

export const TESWA_CONDITION_LANGUAGE: Record<TeswaConditionValue, TeswaLanguageEntry> = {
  almost_new: {
    label: "جاهزة كما هي",
    helper: "مفيش حاجة مهمة تمنع حد يستمتع بيها فورًا.",
  },
  good_used: {
    label: "فيها أثر استخدام طبيعي",
    helper: "اتستخدمت، ولسه واضحة ومفهومة من غير مفاجآت.",
  },
  minor_issues: {
    label: "فيها ملاحظة لازم تبقى واضحة",
    helper: "قولها بصراحة علشان العرض يبقى على نور.",
  },
  needs_repair: {
    label: "محتاجة حد فاهمها أو يصلّحها",
    helper: "لسه ممكن تِسوى، بس لازم الطرف التاني يعرف حقيقتها.",
  },
};

export const TESWA_DESIRE_MODE_LANGUAGE: Record<TeswaDesireModeValue, TeswaLanguageEntry> = {
  specific: {
    label: "عارف تقريبًا مستني إيه",
    helper: "عندي شيء أو اتجاه محدد في بالي.",
  },
  flexible: {
    label: "عندي اتجاه… بس الباب مفتوح",
    helper: "فيه ذوق عام، لكن الاقتراحات المناسبة مرحّب بيها.",
  },
  surprise: {
    label: "ورّوني… يمكن تفاجئوني",
    helper: "مش مقفول على حاجة بعينها؛ خلّي الناس تقول دي تِسوى إيه عندهم.",
  },
};

export function getTeswaConditionLabel(value: TeswaConditionValue) {
  return TESWA_CONDITION_LANGUAGE[value].label;
}

export function getTeswaDesireModeLabel(value: TeswaDesireModeValue) {
  return TESWA_DESIRE_MODE_LANGUAGE[value].label;
}
