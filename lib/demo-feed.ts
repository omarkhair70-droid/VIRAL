export type FeedStatus = "active" | "thinking" | "redirected" | "rejected" | "completed" | "new";

export type FeedItem = {
  id: string;
  type: "offer" | "rejected" | "redirected" | "completed" | "new";
  status: FeedStatus;
  offeredItem?: string;
  wantedItem?: string;
  sender?: string;
  receiver?: string;
  title: string;
  note: string;
};

export const demoFeedItems: FeedItem[] = [
  {
    id: "offer-1",
    type: "offer",
    status: "thinking",
    offeredItem: "جاكيت جلد",
    wantedItem: "مخدة فايبر",
    sender: "محمود",
    receiver: "سلمى",
    title: "محمود شايف إن جاكيت الجلد بتاعه يستاهل مخدة فايبر عند سلمى.",
    note: "الحالة: سلمى لسه بتفكر."
  },
  {
    id: "rejected-1",
    type: "rejected",
    status: "rejected",
    offeredItem: "نباتة كبيرة",
    wantedItem: "كرسي مكتب",
    sender: "منى",
    title: "العرض ما ظبطش المرة دي.",
    note: "النباتة لسه في السوق وممكن تجيب عرض تاني."
  },
  {
    id: "redirected-1",
    type: "redirected",
    status: "redirected",
    offeredItem: "أسياخ كفتة",
    wantedItem: "مخدة فايبر",
    sender: "يوسف",
    receiver: "سلمى",
    title: "سلمى ماقفلتش الباب.",
    note: "الأسياخ مش مناسبة للمخدة، بس فتحت احتمال على أباجورة."
  },
  {
    id: "completed-1",
    type: "completed",
    status: "completed",
    offeredItem: "كتب قديمة",
    wantedItem: "نباتات",
    title: "تمت: كتب قديمة ↔ نباتات",
    note: "الاتنين خرجوا من الرف وراحوا لمكان أحسن."
  },
  {
    id: "new-1",
    type: "new",
    status: "new",
    offeredItem: "كاميرا قديمة",
    sender: "هبة",
    title: "نزلت حاجة جديدة: كاميرا قديمة",
    note: "صاحبتها كاتبة: عندي حاجات في بالي، بس فاجئني."
  },
  {
    id: "offer-2",
    type: "offer",
    status: "active",
    offeredItem: "أباجورة نحاس",
    wantedItem: "سماعة قديمة",
    sender: "يوسف",
    receiver: "طارق",
    title: "يوسف شايف إن الأباجورة بتاعته تستاهل سماعة قديمة.",
    note: "الحالة: صاحب السماعة فتح باب تاني."
  }
];

export const completedSwapExamples = [
  {
    id: "c1",
    swap: "سفرة ↔ مروحة + ساعة",
    note: "السفرة كانت مركونة بقالها سنة. المروحة اتحركت في يومين."
  },
  {
    id: "c2",
    swap: "جاكيت جلد ↔ شباك قديم",
    note: "هو كان محتاج الشباك لمشروع، وهي كانت عايزة الجاكيت من أول ما شافته."
  },
  {
    id: "c3",
    swap: "كتب قديمة ↔ نباتات",
    note: "الاتنين خرجوا من الرف وراحوا لمكان أحسن."
  }
];
