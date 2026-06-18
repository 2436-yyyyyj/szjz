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
  { page: 1, title: "封面", categoryId: "cover", image: "./assets/catalog/pages/page-01.jpg" },
  { page: 2, title: "两轮车系列", categoryId: "two", start: 1, end: 12, image: "./assets/catalog/pages/page-02.jpg" },
  { page: 3, title: "两轮车系列", categoryId: "two", start: 13, end: 24, image: "./assets/catalog/pages/page-03.jpg" },
  { page: 4, title: "两轮车系列", categoryId: "two", start: 25, end: 36, image: "./assets/catalog/pages/page-04.jpg" },
  { page: 5, title: "两轮车系列", categoryId: "two", start: 37, end: 49, image: "./assets/catalog/pages/page-05.jpg" },
  { page: 6, title: "两轮车系列", categoryId: "two", start: 50, end: 61, image: "./assets/catalog/pages/page-06.jpg" },
  { page: 7, title: "两轮车系列", categoryId: "two", start: 62, end: 73, image: "./assets/catalog/pages/page-07.jpg" },
  { page: 8, title: "三轮车系列", categoryId: "three", start: 74, end: 88, image: "./assets/catalog/pages/page-08.jpg" },
  { page: 9, title: "三轮车系列", categoryId: "three", start: 89, end: 104, image: "./assets/catalog/pages/page-09.jpg" },
  { page: 10, title: "总成系列", categoryId: "assembly", start: 105, end: 121, image: "./assets/catalog/pages/page-10.jpg" },
  { page: 11, title: "总成系列", categoryId: "assembly", start: 122, end: 138, image: "./assets/catalog/pages/page-11.jpg" },
  { page: 12, title: "其它配件系列", categoryId: "parts", start: 139, end: 151, image: "./assets/catalog/pages/page-12.jpg" }
];

const PAGE_SIZE = 24;
const telHref = `tel:${company.phone}`;

let activeCategory = "all";
let activePageIndex = 1;
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
          image: productImagePath(number)
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

  const shown = visible.slice(0, visibleLimit);
  grid.innerHTML = shown.map((product) => `
    <button class="product-card${product.code === selectedCode ? " is-selected" : ""}" type="button" data-product="${product.code}">
      <img class="product-image" src="${product.image}" alt="${product.code} ${product.categoryName}" loading="lazy" decoding="async" fetchpriority="low">
      <span class="card-body">
        <strong>${product.code}</strong>
        <span>${product.categoryName} · 第 ${product.page} 页</span>
      </span>
    </button>
  `).join("");

  const loadMore = $("loadMore");
  if (loadMore) {
    loadMore.hidden = visible.length <= shown.length;
    loadMore.textContent = `继续显示更多型号（${shown.length}/${visible.length}）`;
  }

  updateDetail(selectedCode);
}

function updateDetail(code) {
  const product = products.find((item) => item.code === code) || products[0];
  if (!product) return;
  selectedCode = product.code;
  activePageIndex = pages.findIndex((page) => page.page === product.page);

  const detailImage = $("detailImage");
  if (detailImage && detailImage.getAttribute("src") !== product.image) {
    detailImage.src = product.image;
    detailImage.alt = `${product.code} ${product.categoryName}`;
  }

  $("detailCategory").textContent = product.categoryName;
  $("detailCode").textContent = product.code;
  $("detailSource").textContent = `来源：第 ${product.page} 页 · ${product.pageTitle}`;
  setSelectedCard();
}

function renderPageRail() {
  const rail = $("pageRail");
  if (!rail) return;
  rail.innerHTML = pages.map((page, index) => `
    <button class="page-thumb" type="button" data-open-page="${index}">
      <img src="${page.image}" alt="${page.title}" loading="lazy" decoding="async">
      <span>第 ${page.page} 页</span>
    </button>
  `).join("");
}

function openSourcePage(index = activePageIndex) {
  const page = pages[index] || pages[1];
  activePageIndex = pages.indexOf(page);
  $("dialogTitle").textContent = page.title;
  $("dialogMeta").textContent = `第 ${page.page} 页`;
  $("dialogImage").src = page.image;
  $("dialogImage").alt = page.title;
  $("sourceDialog").showModal();
}

function movePage(direction) {
  const next = (activePageIndex + direction + pages.length) % pages.length;
  openSourcePage(next);
}

function closeDialog() {
  const dialog = $("sourceDialog");
  if (dialog?.open) dialog.close();
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
  if (image) {
    image.addEventListener("error", () => {
      if (!image.dataset.triedFallback) {
        image.dataset.triedFallback = "1";
        image.src = "./assets/brand/splash.jpg";
      }
    }, { once: true });
  }

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

  splash.addEventListener("click", enter);
  splash.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") enter();
  });
  splashTimer = window.setTimeout(enter, 5000);
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
      return;
    }

    const pageIndex = target.closest("[data-open-page]")?.dataset.openPage;
    if (pageIndex !== undefined) {
      openSourcePage(Number(pageIndex));
      return;
    }

    const action = target.closest("[data-action]")?.dataset.action;
    if (action === "copy-contact") {
      await copyText(contactText());
    } else if (action === "copy-inquiry") {
      await copyText(inquiryText());
    } else if (action === "open-source-page") {
      openSourcePage(activePageIndex);
    } else if (action === "close-dialog") {
      closeDialog();
    } else if (action === "prev-page") {
      movePage(-1);
    } else if (action === "next-page") {
      movePage(1);
    }
  });

  $("modelSearch")?.addEventListener("input", resetAndRender);
  $("loadMore")?.addEventListener("click", () => {
    visibleLimit += PAGE_SIZE;
    renderProducts();
  });

  $("sourceDialog")?.addEventListener("click", (event) => {
    if (event.target === $("sourceDialog")) closeDialog();
  });

  document.addEventListener("keydown", (event) => {
    const dialog = $("sourceDialog");
    if (!dialog?.open) return;
    if (event.key === "ArrowLeft") movePage(-1);
    if (event.key === "ArrowRight") movePage(1);
    if (event.key === "Escape") closeDialog();
  });
}

function registerCacheCleaner() {
  if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) return;
  navigator.serviceWorker.register("./sw.js?v=20260618").catch(() => {});
}

initSplash();
renderSeriesNav();
renderPageRail();
renderProducts();
bindEvents();
registerCacheCleaner();
