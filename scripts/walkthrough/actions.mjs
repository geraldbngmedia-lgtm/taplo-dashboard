export async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function stamp(startedAt) {
  return Date.now() - startedAt;
}

export async function ensureCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("taplo-demo-cursor")) return;
    const style = document.createElement("style");
    style.textContent = `
      html, body, * { cursor: none !important; }
      #taplo-demo-cursor {
        position: fixed;
        z-index: 2147483647;
        width: 16px;
        height: 16px;
        margin-left: -3px;
        margin-top: -3px;
        pointer-events: none;
        border-radius: 50%;
        border: 2px solid #2a211b;
        background: rgba(255, 122, 92, 0.92);
        box-shadow: 0 0 0 5px rgba(255, 122, 92, 0.22);
        left: 40px;
        top: 40px;
      }
    `;
    document.head.appendChild(style);
    const el = document.createElement("div");
    el.id = "taplo-demo-cursor";
    document.body.appendChild(el);
  });
}

export async function setCursor(page, x, y) {
  await page.evaluate(
    ({ x, y }) => {
      const el = document.getElementById("taplo-demo-cursor");
      if (!el) return;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    },
    { x, y },
  );
}

export async function moveTo(page, locator) {
  await locator.waitFor({ state: "visible", timeout: 20_000 });
  const box = await locator.boundingBox();
  if (!box) throw new Error("No bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(box.height / 2, 18);
  const from = await page.evaluate(() => {
    const el = document.getElementById("taplo-demo-cursor");
    return {
      x: el ? Number.parseFloat(el.style.left) || 40 : 40,
      y: el ? Number.parseFloat(el.style.top) || 40 : 40,
    };
  });
  const steps = 26;
  for (let i = 1; i <= steps; i++) {
    const t = 1 - (1 - i / steps) ** 3;
    const nx = from.x + (x - from.x) * t;
    const ny = from.y + (y - from.y) * t;
    await page.mouse.move(nx, ny);
    await setCursor(page, nx, ny);
    await sleep(14);
  }
  return { x, y };
}

export async function moveClick(page, locator, events, startedAt) {
  await moveTo(page, locator);
  await sleep(180);
  events.push({ t: stamp(startedAt), kind: "click" });
  await page.mouse.down();
  await sleep(70);
  await page.mouse.up();
  await sleep(160);
}

export async function typeSlow(page, locator, text, events, startedAt) {
  await moveClick(page, locator, events, startedAt);
  await locator.click();
  for (const char of text) {
    events.push({ t: stamp(startedAt), kind: "key" });
    await page.keyboard.type(char, { delay: 0 });
    await sleep(48);
  }
}

export async function reactSelect(page, selector, value) {
  await page.evaluate(
    ({ selector, value }) => {
      const el = document.querySelector(selector);
      if (!(el instanceof HTMLSelectElement)) return;
      const proto = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
      proto?.set?.call(el, value);
      const key = Object.getOwnPropertyNames(el).find((name) => name.startsWith("__reactProps$"));
      const onChange = key ? el[key]?.onChange : undefined;
      if (typeof onChange === "function") {
        onChange({ target: { value }, currentTarget: el, preventDefault() {}, stopPropagation() {} });
      } else {
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    { selector, value },
  );
}

export async function reactCheck(page, selector) {
  await page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLInputElement)) return;
    const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "checked");
    proto?.set?.call(el, true);
    const key = Object.getOwnPropertyNames(el).find((name) => name.startsWith("__reactProps$"));
    const onChange = key ? el[key]?.onChange : undefined;
    if (typeof onChange === "function") {
      onChange({
        target: { checked: true },
        currentTarget: el,
        preventDefault() {},
        stopPropagation() {},
      });
    } else {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, selector);
}

export async function zoomOn(page, locator) {
  const box = await locator.boundingBox();
  if (!box) return;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const root = document.documentElement;
      root.style.transition = "transform 420ms ease";
      root.style.transformOrigin = `${x}px ${y}px`;
      root.style.transform = "scale(1.32)";
    },
    { x, y },
  );
  await sleep(1300);
  await page.evaluate(() => {
    document.documentElement.style.transform = "scale(1)";
  });
  await sleep(450);
}

