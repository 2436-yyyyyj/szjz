const company = {
  name: "河北大城东阜神州减震器厂",
  brand: "神州减震器",
  contact: "杨礼荣",
  phone: "13722608009",
  fax: "0316-5810489",
  email: "519767397@qq.com"
};

const categories = [
  { id: "two", number: "01", name: "两轮车系列", range: "SZ-001 至 SZ-073" },
  { id: "three", number: "02", name: "三轮车系列", range: "SZ-074 至 SZ-104" },
  { id: "assembly", number: "03", name: "总成系列", range: "SZ-105 至 SZ-138" },
  { id: "parts", number: "04", name: "其它配件系列", range: "SZ-139 至 SZ-151" }
];

const pages = [
  { page: 1, title: "封面", categoryId: "cover" },
  { page: 2, title: "两轮车系列", categoryId: "two", start: 1, end: 12 },
  { page: 3, title: "两轮车系列", categoryId: "two", start: 13, end: 24 },
  { page: 4, title: "两轮车系列", categoryId: "two", start: 25, end: 36 },
  { page: 5, title: "两轮车系列", categoryId: "two", start: 37, end: 49 },
  { page: 6, title: "两轮车系列", categoryId: "two", start: 50, end: 61 },
  { page: 7, title: "两轮车系列", categoryId: "two", start: 62, end: 73 },
  { page: 8, title: "三轮车系列", categoryId: "three", start: 74, end: 88 },
  { page: 9, title: "三轮车系列", categoryId: "three", start: 89, end: 104 },
  { page: 10, title: "总成系列", categoryId: "assembly", start: 105, end: 121 },
  { page: 11, title: "总成系列", categoryId: "assembly", start: 122, end: 138 },
  { page: 12, title: "其它配件系列", categoryId: "parts", start: 139, end: 151 }
];

const PAGE_SIZE = 151;
const telHref = `tel:${company.phone}`;

let activeCategory = "all";
let selectedCode = "SZ-001";
let visibleLimit = PAGE_SIZE;
let splashTimer;

const $ = (id) => document.getElementById(id);

function codeOf(number) {
  return `SZ-${String(number).padStart(3, "0")}`;
}

function numberFromInput(value) {
  const match = value.toLowerCase().match(/(?:sz-?)?0*(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

function categoryById(id) {
  return categories.find((item) => item.id === id);
}

function productImagePath(number) {
  const folder = number <= 100 ? "products_1" : "products_2";
  return `./assets/${folder}/${codeOf(number)}.webp`;
}

function productFallbackPath(number) {
  const folder = number <= 100 ? "products_1" : "products_2";
  return `./assets/${folder}/${codeOf(number)}.jpg`;
}

function buildProducts() {
  const items = [];
  pages
    .filter((page) => page.categoryId !== "cover")
    .forEach((page) => {
      const category = categoryById(page.categoryId);
      for (let number = page.start; number <= page.end; number += 1) {
        items.push({
          code: codeOf(number),
          number,
          categoryId: page.categoryId,
          categoryName: category?.name || page.title,
          page: page.page,
          pageTitle: page.title,
          image: productImagePath(number),
          fallback: productFallbackPath(number)
        });
      }
    });
  return items;
}

const products = buildProducts();

function productMatches(product, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  const number = numberFromInput(value);
  return (
    product.code.toLowerCase().includes(value) ||
    product.categoryName.toLowerCase().includes(value) ||
    (number !== null && product.number === number)
  );
}

function filteredProducts() {
  const query = $("modelSearch")?.value || "";
  const hasQuery = query.trim().length > 0;
  return products.filter((product) => {
    const categoryMatches = hasQuery || activeCategory === "all" || product.categoryId === activeCategory;
    return categoryMatches && productMatches(product, query);
  });
}

function renderSeriesNav() {
  const nav = $("seriesNav");
  if (!nav) return;
  const items = [
    { id: "all", number: "ALL", name: "全部型号", range: "SZ-001 至 SZ-151", count: products.length },
    ...categories.map((category) => ({
      ...category,
      count: products.filter((product) => product.categoryId === category.id).length
    }))
  ];

  nav.innerHTML = items.map((item) => `
    <button class="series-button${item.id === activeCategory ? " is-active" : ""}" type="button" data-category="${item.id}">
      <span class="num">${item.number}</span>
      <span>
        <strong>${item.name}</strong>
        <small>${item.range}</small>
      </span>
      <em>${item.count}</em>
    </button>
  `).join("");
}

function setSelectedCard() {
  document.querySelectorAll(".product-card.is-selected").forEach((card) => {
    card.classList.remove("is-selected");
  });
  const current = document.querySelector(`[data-product="${selectedCode}"]`);
  current?.classList.add("is-selected");
}

function renderProducts() {
  const grid = $("productGrid");
  if (!grid) return;

  const visible = filteredProducts();
  const hasQuery = Boolean($("modelSearch")?.value.trim());
  const categoryLabel = hasQuery
    ? "全系列搜索"
    : activeCategory === "all"
      ? "全部系列"
      : categoryById(activeCategory)?.name || "全部系列";

  if (visible.length && !visible.some((product) => product.code === selectedCode)) {
    selectedCode = visible[0].code;
  }

  $("activeFilterLabel").textContent = categoryLabel;
  $("resultCount").textContent = `${visible.length} 个型号`;
  $("emptyState").hidden = visible.length !== 0;

  const shown = visible;
  grid.innerHTML = shown.map((product, index) => `
    <button class="product-card${product.code === selectedCode ? " is-selected" : ""}" type="button" data-product="${product.code}">
      <img class="product-image" src="${product.image}" data-fallback-src="${product.fallback}" alt="${product.code} ${product.categoryName}" loading="${index < 24 ? "eager" : "lazy"}" decoding="async" fetchpriority="${index < 8 ? "high" : "auto"}">
      <span class="card-body">
        <strong>${product.code}</strong>
        <span>${product.categoryName}</span>
      </span>
    </button>
  `).join("");

  const loadMore = $("loadMore");
  if (loadMore) {
    loadMore.hidden = true;
  }

  updateDetail(selectedCode);
}

function preloadProductImage(product) {
  const image = new Image();
  image.src = product.image;
  image.onerror = () => {
    const fallback = new Image();
    fallback.src = product.fallback;
  };
}

function updateDetail(code) {
  const product = products.find((item) => item.code === code) || products[0];
  if (!product) return;
  selectedCode = product.code;
  preloadProductImage(product);
  const detailImage = $("detailImage");
  if (detailImage && detailImage.getAttribute("src") !== product.image) {
    detailImage.dataset.fallbackUsed = "";
    detailImage.dataset.fallbackSrc = product.fallback;
    detailImage.loading = "eager";
    detailImage.fetchPriority = "high";
    detailImage.src = product.image;
    detailImage.alt = `${product.code} ${product.categoryName}`;
  } else if (detailImage) {
    detailImage.dataset.fallbackSrc = product.fallback;
    detailImage.alt = `${product.code} ${product.categoryName}`;
  }

  $("detailCategory").textContent = product.categoryName;
  $("detailCode").textContent = product.code;
  setSelectedCard();
}

function scrollDetailIntoView() {
  if (!window.matchMedia("(max-width: 820px)").matches) return;
  $("detailImage")?.closest(".detail-panel")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function contactText() {
  return [
    company.name,
    `联系人：${company.contact}`,
    `手机：${company.phone}`,
    `传真：${company.fax}`,
    `邮箱：${company.email}`
  ].join("\n");
}

function inquiryText() {
  const product = products.find((item) => item.code === selectedCode) || products[0];
  return [
    "您好，我想咨询神州减震器产品。",
    `型号：${product.code}`,
    `系列：${product.categoryName}`,
    `联系人：${company.contact}`,
    `手机：${company.phone}`
  ].join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function initSplash() {
  const splash = $("splashScreen");
  const image = $("splashImage");
  if (!splash) {
    document.body.classList.remove("is-splash-active");
    return;
  }

  const enter = () => {
    if (splash.classList.contains("is-hidden")) return;
    window.clearTimeout(splashTimer);
    splash.classList.add("is-hidden");
    document.body.classList.remove("is-splash-active");
    window.setTimeout(() => splash.remove(), 460);
  };

  const startAutoEnter = () => {
    if (splash.classList.contains("is-hidden")) return;
    window.clearTimeout(splashTimer);
    splashTimer = window.setTimeout(enter, 5000);
  };

  splash.addEventListener("click", enter);
  splash.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") enter();
  });

  if (image && !image.complete) {
    image.addEventListener("load", startAutoEnter, { once: true });
    image.addEventListener("error", startAutoEnter, { once: true });
    splashTimer = window.setTimeout(enter, 8500);
  } else {
    startAutoEnter();
  }
}

function bindImageFallbacks() {
  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    const fallback = image.dataset.fallbackSrc;
    if (!fallback || image.dataset.fallbackUsed === "1") return;
    image.dataset.fallbackUsed = "1";
    image.src = fallback;
  }, true);
}

function resetAndRender() {
  visibleLimit = PAGE_SIZE;
  renderProducts();
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const category = target.closest("[data-category]")?.dataset.category;
    if (category) {
      activeCategory = category;
      renderSeriesNav();
      resetAndRender();
      return;
    }

    const productCode = target.closest("[data-product]")?.dataset.product;
    if (productCode) {
      updateDetail(productCode);
      scrollDetailIntoView();
      return;
    }

    const action = target.closest("[data-action]")?.dataset.action;
    if (action === "copy-contact") {
      await copyText(contactText());
    } else if (action === "copy-inquiry") {
      await copyText(inquiryText());
    }
  });

  $("modelSearch")?.addEventListener("input", resetAndRender);
  $("loadMore")?.addEventListener("click", () => {
    visibleLimit += PAGE_SIZE;
    renderProducts();
  });
}

function registerCacheCleaner() {
  if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) return;
  navigator.serviceWorker.register("./sw.js?v=20260619-cover-products").catch(() => {});
}

bindImageFallbacks();
initSplash();
renderSeriesNav();
renderProducts();
bindEvents();
registerCacheCleaner();
