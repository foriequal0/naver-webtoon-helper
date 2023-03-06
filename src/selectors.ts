export async function querySelectorAll(selectors: string) {
  for (;;) {
    const result = document.querySelectorAll<HTMLElement>(selectors);
    if (result.length > 0) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export async function querySelector(selectors: string) {
  for (;;) {
    const result = document.querySelector<HTMLElement>(selectors);
    if (result) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
