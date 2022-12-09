import { exportStates, importStates } from "../states/operations";

const inputImport = document.getElementById("import") as HTMLInputElement;
inputImport.addEventListener("change", async (fileEvent) => {
  const file = (fileEvent.target as HTMLInputElement).files![0];
  const count = await importStates(await file.text());
  alert(`${count} 개 작품 불러오기 성공`);
});

const inputExport = document.getElementById("export") as HTMLInputElement;
inputExport.addEventListener("click", async () => {
  const json = await exportStates();
  const anchor = document.createElement("a");
  anchor.href = "data:application/json;charset=utf-8," + encodeURIComponent(json);
  anchor.target = "_blank";
  anchor.download = `naver-webtoon-helper-export-${Date.now()}.json`;
  anchor.click();
});
