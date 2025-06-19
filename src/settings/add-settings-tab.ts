import * as o from "obsidian";
import { globalState } from "../global-state";
import { createSettingsTab } from "./create-settings-tab";
import { getSettings } from "./init-settings";

const cleanNumericVal = (text: o.TextComponent, value: string) => {
	const parsedVal = parseInt(value, 10) || 0;
	text.setValue(value ? String(parsedVal) : value);
	return parsedVal;
};

export const addSettingsTab = () => {
	const settings = getSettings();
	const { plugin } = globalState;

	plugin.addSettingTab(
		createSettingsTab(plugin, ({ containerEl }) => {
			new o.Setting(containerEl)
				.setName("Password")
				.setDesc("Lock screen password.")
				.addText((text) =>
					text.setValue(settings.password).onChange(async (value) => {
						settings.password = value;
						await plugin.saveData(settings);
					})
				);

			if (o.Platform.isDesktopApp) {
				new o.Setting(containerEl)
					.setName("Delay before showing lock screen (Desktop)")
					// 【修改 1】把描述从 "seconds" 改成 "minutes"
					.setDesc(
						"After the window loses focus, wait this many minutes before showing the lock screen."
					)
					.addText((text) =>
						text
							// 【修改 2】显示逻辑：毫秒变分钟 (除以 60000)
							.setValue(
								String(settings.timeoutWindowBlur / 60000)
							)
							.onChange(async (value) => {
								const parsedVal = cleanNumericVal(text, value);
								// 【修改 3】保存逻辑：分钟变毫秒 (乘以 60000)
								settings.timeoutWindowBlur = parsedVal * 60000;
								await plugin.saveData(settings);
							})
					);
			} else {
				// 移动端的逻辑也一并修改
				const setting = new o.Setting(containerEl)
					.setName("Delay before showing lock screen (Mobile)")
					// 【修改 4】把描述从 "seconds" 改成 "minutes"
					.setDesc(
						"Show the lock screen after this many minutes without interaction."
					)
					.addText((text) =>
						text
							// 【修改 5】显示逻辑：毫秒变分钟 (除以 60000)
							.setValue(
								String(settings.timeoutInteraction / 60000)
							)
							.onChange(async (value) => {
								const parsedVal = cleanNumericVal(text, value);
								// 【修改 6】保存逻辑：分钟变毫秒 (乘以 60000)，同时保留最低5秒的限制
								settings.timeoutInteraction = Math.max(
									parsedVal * 60000,
									5000 // 最低限制仍为5000毫秒 (5秒)
								);
								await plugin.saveData(settings);
							})
					);

				const msgEl = setting.descEl.createEl("span");
				msgEl.classList.add("mod-warning");
				// 【修改 7】修改警告信息
				msgEl.innerText =
					" Values lower than 5s can make the app unusable and will therefore default to 5s instead.";
			}
		})
	);
};
