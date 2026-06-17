const data = window.QR_WEBPAGE_DATA || {};
const pages = data.pages || [];
const categories = data.categories || [];
const phone = data.phone || "13722608009";
const telHref = `tel:${phone}`;
const toast = document.querySelector("#toast");

let activeCategory = "all";
let selectedProduct = null;
let activePageIndex = 1;
let toastTimer;
let splashTimer;

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = byId(id);
  if (element && value) element.textContent = value;
}

function setHref(id, value) {
  const element = byId(id);
  if (element && value) element.href = value;
}

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function initSplashScreen() {
  const splash = byId("splashScreen");
  if (!splash) {
    document.body.classList.remove("is-splash-active");
    return;
  }

  const enterSite = () => {
    if (splash.classList.contains("is-hidden")) return;
    window.clearTimeout(splashTimer);
    splash.classList.add("is-hidden");
    document.body.classList.remove("is-splash-active");
    window.setTimeout(() => splash.remove(), 460);
  };

  splash.addEventListener("click", (event) => {
    event.stopPropagation();
    enterSite();
  });

  splash.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    enterSite();
  });

  splashTimer = window.setTimeout(enterSite, 5000);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
    showToast(message);
  }
}

function modelRange(page) {
  const matches = [...page.modelRange.matchAll(/SZ-(\d{3})/g)].map((match) => Number(match[1]));
  return {
    start: matches[0] || 0,
    end: matches[1] || matches[0] || 0
  };
}

function modelCode(number) {
  return `SZ-${String(number).padStart(3, "0")}`;
}

function modelNumber(value) {
  const match = value.toLowerCase().match(/(?:sz-?)?0*(\d{1,3})/);
  return match ? Number(match[1]) : null;
}

function categoryById(id) {
  return categories.find((category) => category.id === id);
}

function productImagePath(code, number) {
  const folder = number <= 100 ? "products_1" : "products_2";
  return `./assets/${folder}/${code}.jpg`;
}

function buildProducts() {
  return pages
    .filter((page) => page.categoryId !== "cover")
    .flatMap((page) => {
      const range = modelRange(page);
      const category = categoryById(page.categoryId);
      const products = [];

      for (let number = range.start; number <= range.end; number += 1) {
        const code = modelCode(number);
        products.push({
          code,
          number,
          categoryId: page.categoryId,
          categoryName: page.categoryName,
          categoryNumber: category?.number || "",
          page: page.page,
          pageTitle: page.title,
          pageImage: page.image,
          image: data.productImages?.[code] || productImagePath(code, number)
        });
      }

      return products;
    });
}

const products = buildProducts();

function hydrateStaticContent() {
  setText("navBrand", data.brandName);
  setText("navCompany", data.companyName);
  setText("locationLabel", data.locationLabel);
  setText("brandName", data.brandName);
  setText("englishName", data.englishName);
  setText("years", data.years);
  setText("productTotal", `${products.length} 型号`);
  setText("contactName", data.contactName);
  setText("phoneLink", data.phone);
  setText("faxText", data.fax);
  setText("emailText", data.email);
  setText("stickyCall", `电话咨询 ${data.phone}`);

  setHref("topCall", telHref);
  setHref("phoneLink", telHref);
  setHref("detailCall", telHref);
  setHref("stickyCall", telHref);

  document.title = `${data.brandName}产品目录`;
}

function renderSeriesNav() {
  const nav = byId("seriesNav");
  if (!nav) return;

  const allCount = products.length;
  const items = [
    { id: "all", number: "ALL", name: "全部型号", range: "SZ-001 至 SZ-151", count: allCount },
    ...categories.map((category) => ({
      id: category.id,
      number: category.number,
      name: category.name,
      range: category.range,
      count: products.filter((product) => product.categoryId === category.id).length
    }))
  ];

  nav.innerHTML = items
    .map(
      (item) => `
        <button class="series-button${item.id === activeCategory ? " is-active" : ""}" type="button" data-category="${item.id}">
          <span class="num">${item.number}</span>
          <span>
            <strong>${item.name}</strong>
            <small>${item.range}</small>
          </span>
          <span class="count">${item.count}</span>
        </button>
      `
    )
    .join("");
}

function productMatches(product, query) {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const numeric = modelNumber(trimmed);
  if (numeric) return product.number === numeric;
  const haystack = `${product.code} ${product.categoryName} ${product.pageTitle}`.toLowerCase();
  return haystack.includes(trimmed.toLowerCase());
}

function filteredProducts() {
  const query = byId("modelSearch")?.value || "";
  const hasQuery = query.trim().length > 0;
  return products.filter((product) => {
    const categoryMatches = hasQuery || activeCategory === "all" || product.categoryId === activeCategory;
    return categoryMatches && productMatches(product, query);
  });
}

function renderProducts() {
  const grid = byId("productGrid");
  if (!grid) return;

  const visible = filteredProducts();
  const selectedCode = selectedProduct?.code;
  const hasQuery = Boolean(byId("modelSearch")?.value.trim());
  const categoryLabel = hasQuery
    ? "全系列搜索"
    : activeCategory === "all"
      ? "全部系列"
      : categoryById(activeCategory)?.name;

  setText("activeFilterLabel", categoryLabel);
  setText("resultCount", `${visible.length} 个型号`);

  const empty = byId("emptyState");
  if (empty) empty.hidden = visible.length !== 0;

  grid.innerHTML = visible
    .map(
      (product) => `
        <button class="product-card${product.code === selectedCode ? " is-selected" : ""}" type="button" data-product="${product.code}">
          <img src="${product.image}" alt="${product.code} ${product.categoryName}" loading="lazy">
          <span class="card-body">
            <strong>${product.code}</strong>
            <span>${product.categoryName} · 第 ${product.page} 页</span>
          </span>
        </button>
      `
    )
    .join("");
}

function renderPageRail() {
  const rail = byId("pageRail");
  if (!rail) return;
  rail.innerHTML = pages
    .map(
      (page, index) => {
        const thumb = page.thumb || page.image;
        return `
        <button class="page-thumb" type="button" data-open-page="${index}">
          <img src="${thumb}" data-fallback-src="${page.image}" alt="${page.title}" loading="lazy">
          <span>第 ${page.page} 页</span>
        </button>
      `;
      }
    )
    .join("");

  rail.querySelectorAll("img[data-fallback-src]").forEach((image) => {
    image.addEventListener("error", () => {
      const fallback = image.dataset.fallbackSrc;
      if (fallback && image.getAttribute("src") !== fallback) {
        image.src = fallback;
      }
    }, { once: true });
  });
}

function selectProduct(code) {
  const product = products.find((item) => item.code === code) || products[0];
  if (!product) return;
  selectedProduct = product;
  activePageIndex = pages.findIndex((page) => page.page === product.page);

  const detailImage = byId("detailImage");
  if (detailImage) {
    detailImage.src = product.image;
    detailImage.alt = `${product.code} ${product.categoryName}`;
  }

  setText("detailCategory", product.categoryName);
  setText("detailCode", product.code);
  setText("detailSource", `来源：第 ${product.page} 页 · ${product.pageTitle}`);
  setText("stickyCode", product.code);
  renderProducts();
}

function inquiryText(product = selectedProduct) {
  const target = product || products[0];
  return [
    `您好，我想咨询神州减震器产品。`,
    `型号：${target.code}`,
    `系列：${target.categoryName}`,
    `来源页：第 ${target.page} 页`,
    `联系人：${data.contactName}`,
    `手机：${data.phone}`
  ].join("\n");
}

function contactText() {
  return [
    data.companyName,
    `品牌：${data.brandName}`,
    `联系人：${data.contactName}`,
    `手机：${data.phone}`,
    `传真：${data.fax}`,
    `邮箱：${data.email}`
  ].join("\n");
}

function openSourcePage(index = activePageIndex) {
  const dialog = byId("sourceDialog");
  const page = pages[index];
  if (!dialog || !page) return;
  activePageIndex = index;

  setText("dialogTitle", page.title);
  setText("dialogMeta", `第 ${page.page} 页 · ${page.categoryName} · ${page.modelRange}`);

  const image = byId("dialogImage");
  if (image) {
    image.src = page.image;
    image.alt = page.title;
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function movePage(direction) {
  const next = (activePageIndex + direction + pages.length) % pages.length;
  openSourcePage(next);
}

function closeDialog() {
  const dialog = byId("sourceDialog");
  if (dialog?.open) dialog.close();
}

async function handleAction(action) {
  if (action === "copy-contact") {
    await copyText(contactText(), "联系信息已复制");
  } else if (action === "copy-inquiry") {
    await copyText(inquiryText(), "咨询内容已复制");
  } else if (action === "open-source-page") {
    openSourcePage(activePageIndex);
  } else if (action === "close-dialog") {
    closeDialog();
  } else if (action === "prev-page") {
    movePage(-1);
  } else if (action === "next-page") {
    movePage(1);
  }
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const category = target.closest("[data-category]")?.dataset.category;
    if (category) {
      activeCategory = category;
      renderSeriesNav();
      renderProducts();
      return;
    }

    const productCode = target.closest("[data-product]")?.dataset.product;
    if (productCode) {
      selectProduct(productCode);
      return;
    }

    const pageIndex = target.closest("[data-open-page]")?.dataset.openPage;
    if (pageIndex !== undefined) {
      openSourcePage(Number(pageIndex));
      return;
    }

    const action = target.closest("[data-action]")?.dataset.action;
    if (action) {
      await handleAction(action);
    }
  });

  byId("modelSearch")?.addEventListener("input", () => {
    const visible = filteredProducts();
    if (visible.length) {
      selectProduct(visible[0].code);
    } else {
      renderProducts();
    }
  });

  byId("sourceDialog")?.addEventListener("click", (event) => {
    if (event.target === byId("sourceDialog")) closeDialog();
  });

  document.addEventListener("keydown", (event) => {
    const dialog = byId("sourceDialog");
    if (!dialog?.open) return;
    if (event.key === "ArrowLeft") movePage(-1);
    if (event.key === "ArrowRight") movePage(1);
  });
}

function registerOfflineCache() {
  if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) return;

  if (data.enableOfflineCache) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
    return;
  }

  navigator.serviceWorker.getRegistrations?.().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });

  if ("caches" in window) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key.startsWith("shenzhou-catalog"))
        .forEach((key) => caches.delete(key));
    });
  }
}

initSplashScreen();
hydrateStaticContent();
renderSeriesNav();
renderPageRail();
selectProduct("SZ-001");
bindEvents();
registerOfflineCache();
