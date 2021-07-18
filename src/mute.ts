import { request } from "./background";
import { TitleState } from "./TitleState";

export function addMute(state: TitleState): void {
  const group = document.querySelector(".btn_group")!;
  const li = document.createElement("li");
  group.appendChild(li);

  const div = document.createElement("div");
  li.appendChild(div);
  div.style.margin = "8px";

  const input = document.createElement("input");
  div.appendChild(input);
  input.type = "checkbox";
  input.id = "mute";
  input.name = "mute";
  if (state.length == 0) {
    input.disabled = true;
  }
  if (state.mute) {
    input.checked = true;
  }
  input.addEventListener("change", async (e) => {
    const target = e.currentTarget as HTMLInputElement;
    await request("set-mute", {
      tier: state.tier,
      titleId: state.titleId,
      mute: target.checked,
    });
  });

  const label = document.createElement("label");
  div.appendChild(label);
  label.style.marginLeft = "4px";
  label.htmlFor = "mute";
  label.innerText = "Mute";
}
